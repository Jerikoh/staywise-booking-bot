import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { generateAvailabilityMessage, generateReservationMessage } from "@/utils/whatsappMessageGenerator";
import { calculateStayPrice, calculatePromotion, formatCurrency } from "@/utils/priceCalculator";

interface ReservationCalculatorProps {
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  selectedUnitIds: string[];
}

export const ReservationCalculator = ({
  startDate,
  endDate,
  adults,
  children,
  selectedUnitIds,
}: ReservationCalculatorProps) => {
  const [selectedServices, setSelectedServices] = useState<Record<string, { adults: number; children: number }>>({}); 
  const [selectedReservationUnits, setSelectedReservationUnits] = useState<Set<string>>(new Set());
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [showReservation, setShowReservation] = useState(false);
  const [messageType, setMessageType] = useState<"availability" | "reservation">("availability");

  const nights = differenceInDays(new Date(endDate), new Date(startDate));

  const { data: units } = useQuery({
    queryKey: ["selected_units", selectedUnitIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodation_units")
        .select("*, unit_prices(price_per_night, tariff_period_id, tariff_periods(*))")
        .in("id", selectedUnitIds);
      if (error) throw error;
      return data;
    },
    enabled: selectedUnitIds.length > 0,
  });

  const { data: services } = useQuery({
    queryKey: ["additional_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("additional_services")
        .select("*, service_prices(*)");
      if (error) throw error;
      return data;
    },
  });

  const { data: promotions } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: periods } = useQuery({
    queryKey: ["tariff_periods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tariff_periods").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleGenerateAvailability = async () => {
    if (!units || !services || !promotions || !periods) return;

    const formattedUnits = units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      pricePerNight: unit.unit_prices?.[0]?.price_per_night || 0,
    }));

    const formattedServices = services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      adultPrice: service.service_prices?.[0]?.adult_price || 0,
      childPrice: service.service_prices?.[0]?.child_price,
      perDay: service.service_prices?.[0]?.per_day || true,
    }));

    const formattedPromotions = promotions.map((promo) => ({
      minNights: promo.min_nights,
      discountPercentage: promo.discount_percentage,
      description: promo.description,
    }));

    const depositPercentage = periods[0]?.deposit_percentage || 50;

    const message = await generateAvailabilityMessage(
      format(new Date(startDate), "dd/MM", { locale: es }),
      format(new Date(endDate), "dd/MM", { locale: es }),
      nights,
      { adults, children },
      formattedUnits,
      formattedServices,
      formattedPromotions,
      depositPercentage
    );

    setGeneratedMessage(message);
    setShowReservation(false);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({ title: "Mensaje copiado al portapapeles" });
  };

  const handleSendWhatsApp = () => {
    const encodedMessage = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleGenerateReservation = async () => {
    if (!units || !services || !promotions || !periods) return;

    const reservationUnits = units
      .filter((unit) => selectedReservationUnits.has(unit.id))
      .map((unit) => {
        const priceCalc = calculateStayPrice(
          startDate,
          endDate,
          unit.id,
          unit.unit_prices?.map(up => ({
            unit_id: unit.id,
            price_per_night: up.price_per_night,
            tariff_period_id: up.tariff_period_id,
          })) || [],
          periods.map(p => ({
            id: p.id,
            name: p.name,
            start_date: p.start_date,
            end_date: p.end_date,
            degree: p.degree,
            deposit_percentage: p.deposit_percentage,
          }))
        );

        const promotion = calculatePromotion(
          nights,
          promotions.map(p => ({
            min_nights: p.min_nights,
            discount_percentage: p.discount_percentage,
            tariff_period_id: p.tariff_period_id,
          }))
        );

        const subtotal = priceCalc.total;
        const discountedSubtotal = promotion ? subtotal * (1 - promotion.percentage / 100) : subtotal;

        return {
          name: unit.name,
          nights,
          pricePerNight: priceCalc.total / nights,
          subtotal: discountedSubtotal,
          hasDiscount: !!promotion,
          discountPercentage: promotion?.percentage,
        };
      });

    const reservationServices = Object.entries(selectedServices).map(([serviceId, quantities]) => {
      const service = services.find(s => s.id === serviceId);
      if (!service) return null;

      const servicePrice = service.service_prices?.[0];
      const adultPrice = servicePrice?.adult_price || 0;
      const childPrice = servicePrice?.child_price || adultPrice;
      const perDay = servicePrice?.per_day || true;
      const days = perDay ? nights : 1;

      const subtotal = (quantities.adults * adultPrice + quantities.children * childPrice) * days;

      return {
        name: service.name,
        adults: quantities.adults,
        children: quantities.children,
        days,
        pricePerPerson: adultPrice,
        subtotal,
      };
    }).filter(Boolean);

    const total = reservationUnits.reduce((sum, u) => sum + u.subtotal, 0) +
      reservationServices.reduce((sum, s) => sum + (s?.subtotal || 0), 0);

    const depositPercentage = periods[0]?.deposit_percentage || 50;
    const deposit = total * (depositPercentage / 100);

    const message = await generateReservationMessage(
      format(new Date(startDate), "dd/MM", { locale: es }),
      format(new Date(endDate), "dd/MM", { locale: es }),
      nights,
      { adults, children },
      reservationUnits,
      reservationServices as any[],
      total,
      deposit
    );

    setGeneratedMessage(message);
    setMessageType("reservation");
  };

  const handleProceedToReservation = () => {
    setShowReservation(true);
    setSelectedReservationUnits(new Set(selectedUnitIds));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {showReservation ? "Calcular reserva" : "Generar mensaje de disponibilidad"}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fechas:</span>
              <p className="font-medium">
                {format(new Date(startDate), "dd/MM/yyyy")} -{" "}
                {format(new Date(endDate), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Noches:</span>
              <p className="font-medium">{nights}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Huéspedes:</span>
              <p className="font-medium">
                {adults} adultos{children > 0 && `, ${children} niños`}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Unidades seleccionadas:</span>
              <p className="font-medium">{selectedUnitIds.length}</p>
            </div>
          </div>

          {!showReservation ? (
            <Button onClick={handleGenerateAvailability} className="w-full">
              Generar mensaje de disponibilidad
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Unidades a reservar</Label>
                <div className="space-y-2">
                  {units?.map((unit) => (
                    <div key={unit.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`unit-${unit.id}`}
                        checked={selectedReservationUnits.has(unit.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedReservationUnits);
                          if (checked) {
                            newSet.add(unit.id);
                          } else {
                            newSet.delete(unit.id);
                          }
                          setSelectedReservationUnits(newSet);
                        }}
                      />
                      <Label htmlFor={`unit-${unit.id}`} className="cursor-pointer">
                        {unit.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Servicios adicionales</Label>
                <div className="space-y-3">
                  {services?.map((service) => (
                    <div key={service.id} className="border rounded-lg p-3 space-y-2">
                      <Label className="font-medium">{service.name}</Label>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`service-${service.id}-adults`} className="text-sm">
                            Adultos
                          </Label>
                          <Input
                            id={`service-${service.id}-adults`}
                            type="number"
                            min="0"
                            value={selectedServices[service.id]?.adults || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setSelectedServices((prev) => ({
                                ...prev,
                                [service.id]: {
                                  adults: value,
                                  children: prev[service.id]?.children || 0,
                                },
                              }));
                            }}
                          />
                        </div>
                        {service.requires_children_pricing && (
                          <div>
                            <Label htmlFor={`service-${service.id}-children`} className="text-sm">
                              Niños
                            </Label>
                            <Input
                              id={`service-${service.id}-children`}
                              type="number"
                              min="0"
                              value={selectedServices[service.id]?.children || 0}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setSelectedServices((prev) => ({
                                  ...prev,
                                  [service.id]: {
                                    adults: prev[service.id]?.adults || 0,
                                    children: value,
                                  },
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerateReservation} className="w-full">
                Generar mensaje de reserva
              </Button>
            </div>
          )}
        </div>
      </Card>

      {generatedMessage && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Mensaje de {messageType === "availability" ? "disponibilidad" : "reserva"}
            </h3>
            <div className="flex gap-2">
              {messageType === "availability" && (
                <Button variant="outline" size="sm" onClick={handleProceedToReservation}>
                  Proceder a reserva
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyMessage}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="default" size="sm" onClick={handleSendWhatsApp}>
                <Send className="h-4 w-4 mr-2" />
                Enviar por WhatsApp
              </Button>
            </div>
          </div>
          <Textarea
            value={generatedMessage}
            readOnly
            className="font-mono text-sm min-h-[300px]"
          />
        </Card>
      )}
    </div>
  );
};

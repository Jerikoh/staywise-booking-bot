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
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [showReservation, setShowReservation] = useState(false);

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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generar mensaje de disponibilidad</h3>
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

          <Button onClick={handleGenerateAvailability} className="w-full">
            Generar mensaje de disponibilidad
          </Button>
        </div>
      </Card>

      {generatedMessage && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mensaje generado</h3>
            <div className="flex gap-2">
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

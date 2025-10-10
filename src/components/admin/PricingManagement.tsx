import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const PricingManagement = () => {
  const queryClient = useQueryClient();
  const [savingCell, setSavingCell] = useState<string | null>(null);

  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ["tariff_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tariff_periods")
        .select("*")
        .order("start_date");
      if (error) throw error;
      return data;
    },
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ["accommodation_units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodation_units")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["additional_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("additional_services")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: unitPrices, isLoading: unitPricesLoading } = useQuery({
    queryKey: ["unit_prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_prices")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: servicePrices, isLoading: servicePricesLoading } = useQuery({
    queryKey: ["service_prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_prices")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const updateUnitPriceMutation = useMutation({
    mutationFn: async ({ unitId, periodId, price }: { unitId: string; periodId: string; price: number }) => {
      const existing = unitPrices?.find(
        (up) => up.unit_id === unitId && up.tariff_period_id === periodId
      );

      if (existing) {
        const { error } = await supabase
          .from("unit_prices")
          .update({ price_per_night: price })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("unit_prices")
          .insert([{ unit_id: unitId, tariff_period_id: periodId, price_per_night: price }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit_prices"] });
      toast({ title: "Precio actualizado" });
    },
    onError: () => {
      toast({ title: "Error al actualizar precio", variant: "destructive" });
    },
    onSettled: () => {
      setSavingCell(null);
    },
  });

  const updateServicePriceMutation = useMutation({
    mutationFn: async ({ 
      serviceId, 
      periodId, 
      adultPrice, 
      childPrice,
      perDay 
    }: { 
      serviceId: string; 
      periodId: string; 
      adultPrice: number;
      childPrice: number | null;
      perDay: boolean;
    }) => {
      const existing = servicePrices?.find(
        (sp) => sp.service_id === serviceId && sp.tariff_period_id === periodId
      );

      if (existing) {
        const { error } = await supabase
          .from("service_prices")
          .update({ adult_price: adultPrice, child_price: childPrice, per_day: perDay })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_prices")
          .insert([{ 
            service_id: serviceId, 
            tariff_period_id: periodId, 
            adult_price: adultPrice,
            child_price: childPrice,
            per_day: perDay
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_prices"] });
      toast({ title: "Precio actualizado" });
    },
    onError: () => {
      toast({ title: "Error al actualizar precio", variant: "destructive" });
    },
    onSettled: () => {
      setSavingCell(null);
    },
  });

  const getUnitPrice = (unitId: string, periodId: string) => {
    return unitPrices?.find(
      (up) => up.unit_id === unitId && up.tariff_period_id === periodId
    )?.price_per_night || "";
  };

  const getServicePrice = (serviceId: string, periodId: string) => {
    return servicePrices?.find(
      (sp) => sp.service_id === serviceId && sp.tariff_period_id === periodId
    );
  };

  const handleUnitPriceChange = (unitId: string, periodId: string, value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      const cellKey = `unit-${unitId}-${periodId}`;
      setSavingCell(cellKey);
      updateUnitPriceMutation.mutate({ unitId, periodId, price });
    }
  };

  const handleServicePriceChange = (
    serviceId: string, 
    periodId: string, 
    field: 'adult' | 'child',
    value: string
  ) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      const existing = getServicePrice(serviceId, periodId);
      const cellKey = `service-${serviceId}-${periodId}-${field}`;
      setSavingCell(cellKey);
      
      updateServicePriceMutation.mutate({
        serviceId,
        periodId,
        adultPrice: field === 'adult' ? price : (existing?.adult_price || 0),
        childPrice: field === 'child' ? price : existing?.child_price,
        perDay: existing?.per_day ?? true
      });
    }
  };

  const isLoading = periodsLoading || unitsLoading || servicesLoading || unitPricesLoading || servicePricesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!periods || periods.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Primero debe crear períodos tarifarios en la pestaña "Períodos"
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="units" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="units">Precios de Unidades</TabsTrigger>
          <TabsTrigger value="services">Precios de Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Precios por Noche de Unidades</h3>
            {!units || units.length === 0 ? (
              <p className="text-muted-foreground">
                No hay unidades creadas. Créelas en la pestaña "Unidades"
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Unidad</TableHead>
                      {periods.map((period) => (
                        <TableHead key={period.id} className="min-w-[120px]">
                          <div className="flex flex-col">
                            <span>{period.name}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {period.degree === "first" ? "Prioridad 1" : "Prioridad 2"}
                            </span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.name}</TableCell>
                        {periods.map((period) => {
                          const cellKey = `unit-${unit.id}-${period.id}`;
                          const isSaving = savingCell === cellKey;
                          return (
                            <TableCell key={period.id}>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0"
                                  value={getUnitPrice(unit.id, period.id)}
                                  onChange={(e) => handleUnitPriceChange(unit.id, period.id, e.target.value)}
                                  disabled={isSaving}
                                  className="w-full"
                                />
                                {isSaving && (
                                  <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin" />
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Precios de Servicios Adicionales</h3>
            {!services || services.length === 0 ? (
              <p className="text-muted-foreground">
                No hay servicios creados. Créelos en la pestaña "Servicios"
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Servicio</TableHead>
                      {periods.map((period) => (
                        <TableHead key={period.id} className="min-w-[240px]">
                          <div className="flex flex-col">
                            <span>{period.name}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              Adulto / Niño
                            </span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div>
                            {service.name}
                            {service.requires_children_pricing && (
                              <span className="block text-xs text-muted-foreground">
                                Precio niños diferenciado
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {periods.map((period) => {
                          const cellKeyAdult = `service-${service.id}-${period.id}-adult`;
                          const cellKeyChild = `service-${service.id}-${period.id}-child`;
                          const isSavingAdult = savingCell === cellKeyAdult;
                          const isSavingChild = savingCell === cellKeyChild;
                          const servicePrice = getServicePrice(service.id, period.id);
                          
                          return (
                            <TableCell key={period.id}>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Adulto"
                                    value={servicePrice?.adult_price || ""}
                                    onChange={(e) => handleServicePriceChange(service.id, period.id, 'adult', e.target.value)}
                                    disabled={isSavingAdult}
                                    className="w-full"
                                  />
                                  {isSavingAdult && (
                                    <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin" />
                                  )}
                                </div>
                                {service.requires_children_pricing && (
                                  <div className="relative flex-1">
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Niño"
                                      value={servicePrice?.child_price || ""}
                                      onChange={(e) => handleServicePriceChange(service.id, period.id, 'child', e.target.value)}
                                      disabled={isSavingChild}
                                      className="w-full"
                                    />
                                    {isSavingChild && (
                                      <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

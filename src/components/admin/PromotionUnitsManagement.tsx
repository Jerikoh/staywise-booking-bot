import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const PromotionUnitsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>("");

  const { data: promotions } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("min_nights");
      if (error) throw error;
      return data;
    },
  });

  const { data: units } = useQuery({
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

  const { data: promotionUnits } = useQuery({
    queryKey: ["promotion_units", selectedPromotionId],
    queryFn: async () => {
      if (!selectedPromotionId) return [];
      const { data, error } = await supabase
        .from("promotion_units")
        .select("*")
        .eq("promotion_id", selectedPromotionId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPromotionId,
  });

  const togglePromotionUnitMutation = useMutation({
    mutationFn: async ({
      unitId,
      isApplied,
    }: {
      unitId: string;
      isApplied: boolean;
    }) => {
      if (isApplied) {
        // Remove unit from promotion
        const { error } = await supabase
          .from("promotion_units")
          .delete()
          .eq("promotion_id", selectedPromotionId)
          .eq("unit_id", unitId);
        if (error) throw error;
      } else {
        // Add unit to promotion
        const { error } = await supabase.from("promotion_units").insert({
          promotion_id: selectedPromotionId,
          unit_id: unitId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion_units"] });
      toast({
        title: "Actualizado",
        description: "Unidades de la promoción actualizadas correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const isUnitInPromotion = (unitId: string) => {
    return promotionUnits?.some((pu) => pu.unit_id === unitId) || false;
  };

  const selectedPromotion = promotions?.find((p) => p.id === selectedPromotionId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unidades Aplicables por Promoción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Seleccionar Promoción</Label>
          <Select
            value={selectedPromotionId}
            onValueChange={setSelectedPromotionId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una promoción" />
            </SelectTrigger>
            <SelectContent>
              {promotions?.map((promotion) => (
                <SelectItem key={promotion.id} value={promotion.id}>
                  {promotion.min_nights} noches - {promotion.discount_percentage}
                  % desc.
                  {promotion.description && ` - ${promotion.description}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPromotionId && selectedPromotion && (
          <div className="space-y-2">
            <Label>
              Unidades donde aplica esta promoción (
              {selectedPromotion.discount_percentage}% de descuento):
            </Label>
            <div className="space-y-2 border rounded-lg p-4">
              {units?.map((unit) => {
                const isApplied = isUnitInPromotion(unit.id);
                return (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`promo-unit-${unit.id}`}
                      checked={isApplied}
                      onCheckedChange={() =>
                        togglePromotionUnitMutation.mutate({
                          unitId: unit.id,
                          isApplied,
                        })
                      }
                    />
                    <Label
                      htmlFor={`promo-unit-${unit.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {unit.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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

export const PeriodExclusionsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  const { data: periods } = useQuery({
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

  const { data: exclusions } = useQuery({
    queryKey: ["period_excluded_units", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return [];
      const { data, error } = await supabase
        .from("period_excluded_units")
        .select("*")
        .eq("tariff_period_id", selectedPeriodId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPeriodId,
  });

  const toggleExclusionMutation = useMutation({
    mutationFn: async ({
      unitId,
      isExcluded,
    }: {
      unitId: string;
      isExcluded: boolean;
    }) => {
      if (isExcluded) {
        // Remove exclusion
        const { error } = await supabase
          .from("period_excluded_units")
          .delete()
          .eq("tariff_period_id", selectedPeriodId)
          .eq("unit_id", unitId);
        if (error) throw error;
      } else {
        // Add exclusion
        const { error } = await supabase
          .from("period_excluded_units")
          .insert({
            tariff_period_id: selectedPeriodId,
            unit_id: unitId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["period_excluded_units"] });
      toast({
        title: "Actualizado",
        description: "Exclusión de unidad actualizada correctamente.",
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

  const isUnitExcluded = (unitId: string) => {
    return exclusions?.some((e) => e.unit_id === unitId) || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unidades Excluidas por Período</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Seleccionar Período Tarifario</Label>
          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un período" />
            </SelectTrigger>
            <SelectContent>
              {periods?.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPeriodId && (
          <div className="space-y-2">
            <Label>Unidades excluidas de este período:</Label>
            <div className="space-y-2 border rounded-lg p-4">
              {units?.map((unit) => {
                const isExcluded = isUnitExcluded(unit.id);
                return (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${unit.id}`}
                      checked={isExcluded}
                      onCheckedChange={() =>
                        toggleExclusionMutation.mutate({
                          unitId: unit.id,
                          isExcluded,
                        })
                      }
                    />
                    <Label
                      htmlFor={`unit-${unit.id}`}
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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BedDouble, Dog, Baby } from "lucide-react";
import { QueryData } from "@/components/QueryForm";

interface AvailableUnitsProps {
  queryData: QueryData;
  onUnitsSelected: (unitIds: string[]) => void;
}

export const AvailableUnits = ({ queryData, onUnitsSelected }: AvailableUnitsProps) => {
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());

  const { data: units, isLoading } = useQuery({
    queryKey: ["available_units", queryData],
    queryFn: async () => {
      const firstGuest = queryData.guests[0];
      const totalGuests = firstGuest.adults + firstGuest.children;

      let query = supabase
        .from("accommodation_units")
        .select("*, unit_prices(price_per_night, tariff_periods(*))")
        .gte("max_capacity", totalGuests);

      if (firstGuest.children > 0) {
        query = query.eq("allows_children", true);
      }

      if (firstGuest.hasPets) {
        query = query.eq("allows_pets", true);
      }

      if (firstGuest.bedType !== "any") {
        const bedTypeMap = { double: "matrimonial", single: "simple" };
        const mappedBedType = bedTypeMap[firstGuest.bedType as keyof typeof bedTypeMap];
        query = query.or(`bed_type.eq.${mappedBedType},bed_type.eq.combinable`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleUnitToggle = (unitId: string) => {
    const newSelected = new Set(selectedUnits);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedUnits(newSelected);
    onUnitsSelected(Array.from(newSelected));
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Buscando unidades disponibles...</p>;
  }

  if (!units || units.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No hay unidades disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron unidades que cumplan con los requisitos especificados.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Unidades disponibles ({units.length})
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecciona las unidades que están realmente disponibles
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {units.map((unit) => (
          <Card
            key={unit.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedUnits.has(unit.id)
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => handleUnitToggle(unit.id)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedUnits.has(unit.id)}
                onCheckedChange={() => handleUnitToggle(unit.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">{unit.name}</h4>
                {unit.description && (
                  <p className="text-sm text-muted-foreground mb-3">{unit.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {unit.min_capacity}-{unit.max_capacity}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <BedDouble className="h-3 w-3" />
                    {unit.bed_type === "matrimonial"
                      ? "Matrimonial"
                      : unit.bed_type === "simple"
                      ? "Simples"
                      : "Combinable"}
                  </Badge>
                  {unit.allows_children && (
                    <Badge variant="secondary" className="gap-1">
                      <Baby className="h-3 w-3" />
                      Niños
                    </Badge>
                  )}
                  {unit.allows_pets && (
                    <Badge variant="secondary" className="gap-1">
                      <Dog className="h-3 w-3" />
                      Mascotas
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

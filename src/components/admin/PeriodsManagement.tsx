import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export const PeriodsManagement = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    degree: "second" as "first" | "second",
    deposit_percentage: 50,
    is_blocked: false,
  });

  const { data: periods, isLoading } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("tariff_periods").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariff_periods"] });
      toast({ title: "Período creado exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al crear período", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("tariff_periods")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariff_periods"] });
      toast({ title: "Período actualizado exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar período", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tariff_periods")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariff_periods"] });
      toast({ title: "Período eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar período", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (period: any) => {
    setFormData({
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      degree: period.degree,
      deposit_percentage: period.deposit_percentage,
      is_blocked: period.is_blocked || false,
    });
    setEditingId(period.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
      degree: "second",
      deposit_percentage: 50,
      is_blocked: false,
    });
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Editar Período" : "Nuevo Período"}
          </h3>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: Primavera 2024"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha fin *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Prioridad *</Label>
              <Select
                value={formData.degree}
                onValueChange={(value: "first" | "second") =>
                  setFormData({ ...formData, degree: value })
                }
              >
                <SelectTrigger id="degree">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">Primera (sobrescribe otras)</SelectItem>
                  <SelectItem value="second">Segunda (base)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit_percentage">Porcentaje de seña *</Label>
              <Input
                id="deposit_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.deposit_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, deposit_percentage: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_blocked"
              checked={formData.is_blocked}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_blocked: checked as boolean })
              }
            />
            <Label htmlFor="is_blocked" className="text-sm font-normal cursor-pointer">
              Período bloqueado (sin reservas)
            </Label>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? "Actualizar" : "Crear"} Período
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Períodos Existentes</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : periods && periods.length > 0 ? (
          periods.map((period) => (
            <Card key={period.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{period.name}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        period.degree === "first"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {period.degree === "first" ? "Prioridad 1" : "Prioridad 2"}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {format(new Date(period.start_date), "dd/MM/yyyy")} -{" "}
                      {format(new Date(period.end_date), "dd/MM/yyyy")}
                    </span>
                    <span>Seña: {period.deposit_percentage}%</span>
                    {period.is_blocked && (
                      <span className="text-destructive font-medium">
                        🚫 Bloqueado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(period)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(period.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No hay períodos creados</p>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const PromotionsManagement = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    min_nights: 3,
    discount_percentage: 10,
    description: "",
    tariff_period_id: "",
  });

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*, tariff_periods(name)")
        .order("min_nights");
      if (error) throw error;
      return data;
    },
  });

  const { data: periods } = useQuery({
    queryKey: ["tariff_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tariff_periods")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const submitData = {
        ...data,
        tariff_period_id: data.tariff_period_id || null,
      };
      const { error } = await supabase.from("promotions").insert([submitData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast({ title: "Promoción creada exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al crear promoción", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const submitData = {
        ...data,
        tariff_period_id: data.tariff_period_id || null,
      };
      const { error } = await supabase
        .from("promotions")
        .update(submitData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast({ title: "Promoción actualizada exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar promoción", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast({ title: "Promoción eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar promoción", variant: "destructive" });
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

  const handleEdit = (promotion: any) => {
    setFormData({
      min_nights: promotion.min_nights,
      discount_percentage: promotion.discount_percentage,
      description: promotion.description || "",
      tariff_period_id: promotion.tariff_period_id || "",
    });
    setEditingId(promotion.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      min_nights: 3,
      discount_percentage: 10,
      description: "",
      tariff_period_id: "",
    });
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Editar Promoción" : "Nueva Promoción"}
          </h3>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_nights">Mínimo de noches *</Label>
              <Input
                id="min_nights"
                type="number"
                min="1"
                value={formData.min_nights}
                onChange={(e) =>
                  setFormData({ ...formData, min_nights: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Porcentaje de descuento *</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tariff_period_id">Período tarifario (opcional)</Label>
            <Select
              value={formData.tariff_period_id}
              onValueChange={(value) =>
                setFormData({ ...formData, tariff_period_id: value })
              }
            >
              <SelectTrigger id="tariff_period_id">
                <SelectValue placeholder="Todas las temporadas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las temporadas</SelectItem>
                {periods?.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles adicionales..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? "Actualizar" : "Crear"} Promoción
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Promociones Existentes</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : promotions && promotions.length > 0 ? (
          promotions.map((promotion) => (
            <Card key={promotion.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {promotion.min_nights} noches o más: {promotion.discount_percentage}% de
                    descuento
                  </h4>
                  {promotion.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {promotion.description}
                    </p>
                  )}
                  {promotion.tariff_periods && (
                    <span className="text-xs text-primary mt-2 inline-block">
                      Aplicable a: {promotion.tariff_periods.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promotion)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(promotion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No hay promociones creadas</p>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const UnitsManagement = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_capacity: 1,
    max_capacity: 2,
    allows_children: true,
    allows_pets: false,
    bed_type: "simple",
  });

  const { data: units, isLoading } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("accommodation_units").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodation_units"] });
      toast({ title: "Unidad creada exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al crear unidad", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("accommodation_units")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodation_units"] });
      toast({ title: "Unidad actualizada exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar unidad", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accommodation_units")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodation_units"] });
      toast({ title: "Unidad eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar unidad", variant: "destructive" });
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

  const handleEdit = (unit: any) => {
    setFormData({
      name: unit.name,
      description: unit.description || "",
      min_capacity: unit.min_capacity,
      max_capacity: unit.max_capacity,
      allows_children: unit.allows_children,
      allows_pets: unit.allows_pets,
      bed_type: unit.bed_type || "simple",
    });
    setEditingId(unit.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      min_capacity: 1,
      max_capacity: 2,
      allows_children: true,
      allows_pets: false,
      bed_type: "simple",
    });
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Editar Unidad" : "Nueva Unidad"}
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
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bed_type">Tipo de cama</Label>
              <Select
                value={formData.bed_type}
                onValueChange={(value) => setFormData({ ...formData, bed_type: value })}
              >
                <SelectTrigger id="bed_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Camas simples</SelectItem>
                  <SelectItem value="matrimonial">Cama matrimonial</SelectItem>
                  <SelectItem value="combinable">Combinable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_capacity">Capacidad mínima *</Label>
              <Input
                id="min_capacity"
                type="number"
                min="1"
                value={formData.min_capacity}
                onChange={(e) =>
                  setFormData({ ...formData, min_capacity: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_capacity">Capacidad máxima *</Label>
              <Input
                id="max_capacity"
                type="number"
                min="1"
                value={formData.max_capacity}
                onChange={(e) =>
                  setFormData({ ...formData, max_capacity: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="allows_children"
                checked={formData.allows_children}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allows_children: checked })
                }
              />
              <Label htmlFor="allows_children">Admite niños</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="allows_pets"
                checked={formData.allows_pets}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allows_pets: checked })
                }
              />
              <Label htmlFor="allows_pets">Admite mascotas</Label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? "Actualizar" : "Crear"} Unidad
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Unidades Existentes</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : units && units.length > 0 ? (
          units.map((unit) => (
            <Card key={unit.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{unit.name}</h4>
                  {unit.description && (
                    <p className="text-sm text-muted-foreground mt-1">{unit.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {unit.min_capacity}-{unit.max_capacity} personas
                    </span>
                    <span>Cama: {unit.bed_type}</span>
                    {unit.allows_children && <span>✓ Niños</span>}
                    {unit.allows_pets && <span>✓ Mascotas</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(unit)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(unit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No hay unidades creadas</p>
        )}
      </div>
    </div>
  );
};

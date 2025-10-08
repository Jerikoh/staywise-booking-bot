import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const ServicesManagement = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requires_children_pricing: false,
  });

  const { data: services, isLoading } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("additional_services").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["additional_services"] });
      toast({ title: "Servicio creado exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al crear servicio", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("additional_services")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["additional_services"] });
      toast({ title: "Servicio actualizado exitosamente" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar servicio", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("additional_services")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["additional_services"] });
      toast({ title: "Servicio eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar servicio", variant: "destructive" });
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

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      requires_children_pricing: service.requires_children_pricing,
    });
    setEditingId(service.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      requires_children_pricing: false,
    });
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
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
              placeholder="ej: Desayuno"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles del servicio..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="requires_children_pricing"
              checked={formData.requires_children_pricing}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requires_children_pricing: checked })
              }
            />
            <Label htmlFor="requires_children_pricing">
              Requiere precio diferenciado para niños
            </Label>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? "Actualizar" : "Crear"} Servicio
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Servicios Existentes</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : services && services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{service.name}</h4>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  )}
                  {service.requires_children_pricing && (
                    <span className="text-xs text-primary mt-2 inline-block">
                      Precio niños diferenciado
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No hay servicios creados</p>
        )}
      </div>
    </div>
  );
};

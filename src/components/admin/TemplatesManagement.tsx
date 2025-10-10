import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Pencil, Save, X } from "lucide-react";

export const TemplatesManagement = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["message_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .order("template_type");
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("message_templates")
        .update({ content })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message_templates"] });
      toast({ title: "Plantilla actualizada correctamente" });
      setEditingId(null);
      setEditContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar plantilla",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ id, content: editContent });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando plantillas...</div>;
  }

  const availabilityTemplates = templates?.filter((t) =>
    t.template_type.startsWith("availability_")
  );
  const reservationTemplates = templates?.filter((t) =>
    t.template_type.startsWith("reservation_")
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Plantillas de Mensajes</h2>
        <p className="text-muted-foreground mb-6">
          Edita las plantillas de los mensajes que se comparten con los clientes.
          Usa {"{variable}"} para incluir valores dinámicos.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Mensaje de Disponibilidad</h3>
          <div className="space-y-4">
            {availabilityTemplates?.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Label className="text-base font-semibold">
                        {template.template_type.replace("availability_", "").replace(/_/g, " ")}
                      </Label>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                    {editingId !== template.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template.id, template.content)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {editingId === template.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="font-mono text-sm min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(template.id)}
                          disabled={updateMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
                      {template.content}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Mensaje de Reserva</h3>
          <div className="space-y-4">
            {reservationTemplates?.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Label className="text-base font-semibold">
                        {template.template_type.replace("reservation_", "").replace(/_/g, " ")}
                      </Label>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                    {editingId !== template.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template.id, template.content)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {editingId === template.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="font-mono text-sm min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(template.id)}
                          disabled={updateMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
                      {template.content}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
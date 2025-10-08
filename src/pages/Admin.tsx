import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, Package, Tag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-px w-8 bg-border/50" />
            <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="units" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-muted/50">
            <TabsTrigger value="units" className="gap-2">
              <Building2 className="h-4 w-4" />
              Unidades
            </TabsTrigger>
            <TabsTrigger value="periods" className="gap-2">
              <Calendar className="h-4 w-4" />
              Períodos
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Package className="h-4 w-4" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2">
              <Tag className="h-4 w-4" />
              Promociones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="units">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Unidades de Hospedaje</h2>
              <p className="text-muted-foreground">
                Gestiona las unidades de hospedaje, sus capacidades y características.
              </p>
              {/* TODO: Implementar lista y formulario de unidades */}
            </Card>
          </TabsContent>

          <TabsContent value="periods">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Períodos Tarifarios</h2>
              <p className="text-muted-foreground">
                Define períodos tarifarios con prioridades y porcentajes de seña.
              </p>
              {/* TODO: Implementar lista y formulario de períodos */}
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Servicios Adicionales</h2>
              <p className="text-muted-foreground">
                Configura servicios como desayuno, media pensión, etc.
              </p>
              {/* TODO: Implementar lista y formulario de servicios */}
            </Card>
          </TabsContent>

          <TabsContent value="promotions">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Promociones</h2>
              <p className="text-muted-foreground">
                Define descuentos por cantidad de noches.
              </p>
              {/* TODO: Implementar lista y formulario de promociones */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

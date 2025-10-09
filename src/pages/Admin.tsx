import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, Package, Tag, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UnitsManagement } from "@/components/admin/UnitsManagement";
import { PeriodsManagement } from "@/components/admin/PeriodsManagement";
import { ServicesManagement } from "@/components/admin/ServicesManagement";
import { PromotionsManagement } from "@/components/admin/PromotionsManagement";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
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
            <UnitsManagement />
          </TabsContent>

          <TabsContent value="periods">
            <PeriodsManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

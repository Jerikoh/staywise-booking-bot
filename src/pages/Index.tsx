import { useState } from "react";
import { QueryForm, QueryData } from "@/components/QueryForm";
import { Building2, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AvailableUnits } from "@/components/results/AvailableUnits";
import { ReservationCalculator } from "@/components/results/ReservationCalculator";

const Index = () => {
  const navigate = useNavigate();
  const [queryData, setQueryData] = useState<QueryData | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  const handleQuery = (data: QueryData) => {
    setQueryData(data);
    setSelectedUnitIds([]);
  };

  const handleUnitsSelected = (unitIds: string[]) => {
    setSelectedUnitIds(unitIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-[var(--shadow-elegant)]">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sistema de Reservas</h1>
              <p className="text-xs text-muted-foreground">Gestión hotelera profesional</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-2 border-border/70 hover:border-primary transition-[var(--transition-smooth)]"
          >
            <Settings className="h-4 w-4" />
            Administración
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Consulta de disponibilidad</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Encuentra la{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              mejor opción
            </span>{" "}
            para tus huéspedes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Completa los datos de la consulta y genera automáticamente mensajes profesionales para WhatsApp
          </p>
        </div>

        {/* Query Form */}
        <div className="max-w-3xl mx-auto">
          <QueryForm onSubmit={handleQuery} />
        </div>

        {/* Results */}
        {queryData && (
          <div className="max-w-5xl mx-auto mt-12 space-y-8">
            <AvailableUnits queryData={queryData} onUnitsSelected={handleUnitsSelected} />
            
            {selectedUnitIds.length > 0 && (
              <ReservationCalculator
                startDate={queryData.startDate}
                endDate={queryData.endDate}
                adults={queryData.guests[0].adults}
                children={queryData.guests[0].children}
                selectedUnitIds={selectedUnitIds}
              />
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {[
            {
              icon: Calendar,
              title: "Períodos tarifarios",
              description: "Gestiona tarifas por temporada con prioridades",
            },
            {
              icon: Building2,
              title: "Unidades flexibles",
              description: "Adapta capacidad, camas y restricciones",
            },
            {
              icon: Settings,
              title: "Cálculo automático",
              description: "Descuentos, servicios y seña calculados",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-gradient-to-b from-card to-muted/20 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;

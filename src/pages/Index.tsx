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
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Sistema de Reservas</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Query Form Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Consulta de Disponibilidad</h2>
          </div>
          <QueryForm onSubmit={handleQuery} />
        </div>

        {/* Results Section */}
        {queryData && (
          <div className="space-y-6">
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
      </main>
    </div>
  );
};

export default Index;

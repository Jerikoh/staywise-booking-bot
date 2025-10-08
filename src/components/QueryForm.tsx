import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Baby, PawPrint, Bed } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface QueryData {
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    hasPets: boolean;
    bedType: "double" | "single" | "any";
  }[];
}

interface QueryFormProps {
  onSubmit: (data: QueryData) => void;
}

export const QueryForm = ({ onSubmit }: QueryFormProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hasPets, setHasPets] = useState(false);
  const [bedType, setBedType] = useState<"double" | "single" | "any">("any");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startDate,
      endDate,
      guests: [{ adults, children, hasPets, bedType }],
    });
  };

  return (
    <Card className="p-8 shadow-[var(--shadow-card)] border-border/50 bg-gradient-to-b from-card to-background">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Fecha de ingreso
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="border-border/70 focus:border-primary transition-[var(--transition-smooth)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Fecha de egreso
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
              className="border-border/70 focus:border-primary transition-[var(--transition-smooth)]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="adults" className="flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Adultos
            </Label>
            <Input
              id="adults"
              type="number"
              min="1"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
              required
              className="border-border/70 focus:border-primary transition-[var(--transition-smooth)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="children" className="flex items-center gap-2 text-foreground">
              <Baby className="h-4 w-4 text-primary" />
              Niños
            </Label>
            <Input
              id="children"
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
              className="border-border/70 focus:border-primary transition-[var(--transition-smooth)]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasPets"
              checked={hasPets}
              onChange={(e) => setHasPets(e.target.checked)}
              className="w-5 h-5 rounded border-border/70 text-primary focus:ring-primary"
            />
            <Label htmlFor="hasPets" className="flex items-center gap-2 cursor-pointer text-foreground">
              <PawPrint className="h-4 w-4 text-accent" />
              Viajan con mascotas
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-foreground">
              <Bed className="h-4 w-4 text-primary" />
              Tipo de cama
            </Label>
            <div className="flex gap-4">
              {[
                { value: "any", label: "Sin preferencia" },
                { value: "double", label: "Matrimonial" },
                { value: "single", label: "Simples" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bedType"
                    value={option.value}
                    checked={bedType === option.value}
                    onChange={(e) => setBedType(e.target.value as any)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-[var(--transition-smooth)] shadow-[var(--shadow-elegant)]"
          size="lg"
        >
          Buscar disponibilidad
        </Button>
      </form>
    </Card>
  );
};

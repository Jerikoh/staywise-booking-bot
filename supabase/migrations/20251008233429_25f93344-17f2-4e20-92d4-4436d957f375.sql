-- Sistema de periodos tarifarios
CREATE TYPE tariff_degree AS ENUM ('first', 'second');

-- Tabla de períodos tarifarios
CREATE TABLE tariff_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  degree tariff_degree NOT NULL DEFAULT 'second',
  deposit_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de unidades de hospedaje
CREATE TABLE accommodation_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_capacity INTEGER NOT NULL,
  max_capacity INTEGER NOT NULL,
  allows_children BOOLEAN DEFAULT true,
  allows_pets BOOLEAN DEFAULT false,
  bed_type TEXT, -- 'double', 'single', 'convertible'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de precios de unidades por período tarifario
CREATE TABLE unit_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES accommodation_units(id) ON DELETE CASCADE,
  tariff_period_id UUID REFERENCES tariff_periods(id) ON DELETE CASCADE,
  price_per_night DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(unit_id, tariff_period_id)
);

-- Tabla de servicios adicionales
CREATE TABLE additional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  requires_children_pricing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de precios de servicios por período tarifario
CREATE TABLE service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES additional_services(id) ON DELETE CASCADE,
  tariff_period_id UUID REFERENCES tariff_periods(id) ON DELETE CASCADE,
  adult_price DECIMAL(10,2) NOT NULL,
  child_price DECIMAL(10,2),
  per_day BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, tariff_period_id)
);

-- Tabla de promociones por período tarifario
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tariff_period_id UUID REFERENCES tariff_periods(id) ON DELETE CASCADE,
  min_nights INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE tariff_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (público para lectura, restringido para escritura)
CREATE POLICY "Allow public read on tariff_periods" ON tariff_periods FOR SELECT USING (true);
CREATE POLICY "Allow public read on accommodation_units" ON accommodation_units FOR SELECT USING (true);
CREATE POLICY "Allow public read on unit_prices" ON unit_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read on additional_services" ON additional_services FOR SELECT USING (true);
CREATE POLICY "Allow public read on service_prices" ON service_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read on promotions" ON promotions FOR SELECT USING (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tariff_periods_updated_at BEFORE UPDATE ON tariff_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accommodation_units_updated_at BEFORE UPDATE ON accommodation_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
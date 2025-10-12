-- Add min_nights column to unit_prices (each unit has a min nights requirement per period)
ALTER TABLE public.unit_prices 
ADD COLUMN min_nights integer NOT NULL DEFAULT 1;

-- Add is_blocked column to tariff_periods (to mark periods where no reservations are accepted)
ALTER TABLE public.tariff_periods 
ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Create table to track which units are excluded in each tariff period
CREATE TABLE public.period_excluded_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tariff_period_id uuid REFERENCES public.tariff_periods(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.accommodation_units(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(tariff_period_id, unit_id)
);

-- Enable RLS on period_excluded_units
ALTER TABLE public.period_excluded_units ENABLE ROW LEVEL SECURITY;

-- RLS policies for period_excluded_units
CREATE POLICY "Allow public read on period_excluded_units" 
ON public.period_excluded_units 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert period_excluded_units" 
ON public.period_excluded_units 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update period_excluded_units" 
ON public.period_excluded_units 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete period_excluded_units" 
ON public.period_excluded_units 
FOR DELETE 
USING (true);

-- Create table to track which units each promotion applies to (many-to-many)
CREATE TABLE public.promotion_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.accommodation_units(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(promotion_id, unit_id)
);

-- Enable RLS on promotion_units
ALTER TABLE public.promotion_units ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotion_units
CREATE POLICY "Allow public read on promotion_units" 
ON public.promotion_units 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert promotion_units" 
ON public.promotion_units 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update promotion_units" 
ON public.promotion_units 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete promotion_units" 
ON public.promotion_units 
FOR DELETE 
USING (true);
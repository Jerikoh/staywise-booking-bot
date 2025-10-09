-- Add INSERT, UPDATE, DELETE policies for authenticated users
-- These policies allow authenticated users to manage the hotel configuration

-- Accommodation Units policies
CREATE POLICY "Authenticated users can insert accommodation_units"
ON public.accommodation_units
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accommodation_units"
ON public.accommodation_units
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete accommodation_units"
ON public.accommodation_units
FOR DELETE
TO authenticated
USING (true);

-- Tariff Periods policies
CREATE POLICY "Authenticated users can insert tariff_periods"
ON public.tariff_periods
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tariff_periods"
ON public.tariff_periods
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tariff_periods"
ON public.tariff_periods
FOR DELETE
TO authenticated
USING (true);

-- Additional Services policies
CREATE POLICY "Authenticated users can insert additional_services"
ON public.additional_services
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update additional_services"
ON public.additional_services
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete additional_services"
ON public.additional_services
FOR DELETE
TO authenticated
USING (true);

-- Promotions policies
CREATE POLICY "Authenticated users can insert promotions"
ON public.promotions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update promotions"
ON public.promotions
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete promotions"
ON public.promotions
FOR DELETE
TO authenticated
USING (true);

-- Service Prices policies
CREATE POLICY "Authenticated users can insert service_prices"
ON public.service_prices
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update service_prices"
ON public.service_prices
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete service_prices"
ON public.service_prices
FOR DELETE
TO authenticated
USING (true);

-- Unit Prices policies
CREATE POLICY "Authenticated users can insert unit_prices"
ON public.unit_prices
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update unit_prices"
ON public.unit_prices
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete unit_prices"
ON public.unit_prices
FOR DELETE
TO authenticated
USING (true);
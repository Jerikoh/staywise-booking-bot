-- Create message_templates table
CREATE TABLE public.message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type text NOT NULL UNIQUE,
  content text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Create public policies for message_templates
CREATE POLICY "Allow public read on message_templates" 
ON public.message_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on message_templates" 
ON public.message_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on message_templates" 
ON public.message_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on message_templates" 
ON public.message_templates 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.message_templates (template_type, content, description) VALUES
('availability_header', '✅*{minNights} noches o más {discountPercentage}% de descuento*', 'Encabezado de promoción en mensaje de disponibilidad'),
('availability_guest_info', '_Para {guestText}:_', 'Información de huéspedes'),
('availability_unit', '🟠 {unitName} || {price} / noche', 'Formato de unidad disponible'),
('availability_unit_discount', '🟠 {unitName} || {price} / noche ({discountPercentage}% descuento aplicado)', 'Formato de unidad con descuento'),
('availability_service', '🥐 *{serviceName}* (opcional) _{priceText}{perDayText}_', 'Formato de servicio opcional'),
('availability_footer', '📝 *Modo de reserva*
* Depósito: {depositPercentage}% para confirmar la reserva.
* Medios de pago: aceptamos efectivo, transferencias. Tarjetas, QR y link de pago (*10% de recargo*)', 'Pie de mensaje de disponibilidad'),
('reservation_header', '{startDate} - {endDate} ({guestText})', 'Encabezado de reserva'),
('reservation_units_title', '_Unidades:_', 'Título de sección unidades'),
('reservation_unit', '🟠 {unitName} || {pricePerNight} / noche [{subtotal}]', 'Formato de unidad reservada'),
('reservation_unit_discount', '🟠 {unitName} || {pricePerNight} / noche ({discountPercentage}% descuento aplicado) [{subtotal}]', 'Formato de unidad con descuento'),
('reservation_services_title', '_Servicios:_', 'Título de sección servicios'),
('reservation_service', '⚪ {serviceName} || {pricePerPerson} / persona / día ({guestInfo}) [{subtotal}]', 'Formato de servicio contratado'),
('reservation_total', '*Total:* _{total}_', 'Formato de total'),
('reservation_deposit', '*Seña:* _{deposit}_', 'Formato de seña');
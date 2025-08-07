-- Create unit_options table for managing unit types
CREATE TABLE public.unit_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('purchase', 'inner')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, unit_type)
);

-- Enable Row Level Security
ALTER TABLE public.unit_options ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public select on unit_options" 
ON public.unit_options 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on unit_options" 
ON public.unit_options 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on unit_options" 
ON public.unit_options 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on unit_options" 
ON public.unit_options 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_unit_options_updated_at
BEFORE UPDATE ON public.unit_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default purchase units
INSERT INTO public.unit_options (name, unit_type) VALUES
('CASE', 'purchase'),
('BOX', 'purchase'),
('BAG', 'purchase'),
('CONTAINER', 'purchase');

-- Insert default inner units
INSERT INTO public.unit_options (name, unit_type) VALUES
('BOTTLE', 'inner'),
('LITER', 'inner'),
('CAN', 'inner'),
('PIECE', 'inner'),
('CONTAINER', 'inner'),
('KG', 'inner');
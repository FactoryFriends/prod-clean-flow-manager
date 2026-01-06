-- Create temperature_equipment table for configurable devices per location
CREATE TABLE public.temperature_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100),
  equipment_type VARCHAR(20) NOT NULL CHECK (equipment_type IN ('freezer', 'fridge')),
  min_temp DECIMAL(4,1),
  max_temp DECIMAL(4,1),
  location public.location_type NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create temperature_logs table for daily registrations
CREATE TABLE public.temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location public.location_type NOT NULL,
  equipment_id UUID NOT NULL REFERENCES public.temperature_equipment(id) ON DELETE CASCADE,
  temperature DECIMAL(4,1) NOT NULL,
  is_within_range BOOLEAN NOT NULL,
  recorded_by VARCHAR(10),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(log_date, equipment_id)
);

-- Enable RLS on both tables
ALTER TABLE public.temperature_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for temperature_equipment (read for all authenticated, write for admins)
CREATE POLICY "Authenticated users can view temperature equipment"
  ON public.temperature_equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage temperature equipment"
  ON public.temperature_equipment FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- RLS policies for temperature_logs (all authenticated users can read and write)
CREATE POLICY "Authenticated users can view temperature logs"
  ON public.temperature_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert temperature logs"
  ON public.temperature_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update temperature logs"
  ON public.temperature_logs FOR UPDATE
  TO authenticated
  USING (true);

-- Seed data for ToThai: 6 freezers, 3 fridges
INSERT INTO public.temperature_equipment (code, name, equipment_type, max_temp, location, sort_order) VALUES
  ('D-01', 'Diepvries 1', 'freezer', -18.0, 'tothai', 1),
  ('D-02', 'Diepvries 2', 'freezer', -18.0, 'tothai', 2),
  ('D-03', 'Diepvries 3', 'freezer', -18.0, 'tothai', 3),
  ('D-04', 'Diepvries 4', 'freezer', -18.0, 'tothai', 4),
  ('D-05', 'Diepvries 5', 'freezer', -18.0, 'tothai', 5),
  ('D-06', 'Diepvries 6', 'freezer', -18.0, 'tothai', 6),
  ('F-01', 'Koelkast 1', 'fridge', 7.0, 'tothai', 7),
  ('F-02', 'Koelkast 2', 'fridge', 7.0, 'tothai', 8),
  ('F-03', 'Koelkast 3', 'fridge', 7.0, 'tothai', 9);

-- Seed data for KHIN: 1 freezer, 2 fridges
INSERT INTO public.temperature_equipment (code, name, equipment_type, max_temp, location, sort_order) VALUES
  ('D-01', 'Diepvries 1', 'freezer', -18.0, 'khin', 1),
  ('F-01', 'Koelkast 1', 'fridge', 7.0, 'khin', 2),
  ('F-02', 'Koelkast 2', 'fridge', 7.0, 'khin', 3);

-- Create indexes for performance
CREATE INDEX idx_temperature_logs_date_location ON public.temperature_logs(log_date, location);
CREATE INDEX idx_temperature_equipment_location ON public.temperature_equipment(location, active);
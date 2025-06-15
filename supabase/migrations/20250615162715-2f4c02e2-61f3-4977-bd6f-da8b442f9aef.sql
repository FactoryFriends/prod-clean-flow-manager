
-- Maak een leveranciers (suppliers) masterdata tabel aan
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voeg suppliers masterdata referentie toe aan products (optioneel, mag leeg voor bestaande data)
ALTER TABLE public.products
  ADD COLUMN supplier_id UUID;

-- Zet een constraint: supplier_id mag alleen voorkomen als deze in suppliers bestaat
ALTER TABLE public.products
  ADD CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Migreer bestaande supplier_name naar suppliers
INSERT INTO public.suppliers (name)
SELECT DISTINCT supplier_name FROM public.products WHERE supplier_name IS NOT NULL AND supplier_name <> ''
ON CONFLICT (name) DO NOTHING;

-- Koppel automatisch bestaande producten aan supplier_id via supplier_name (indien gevonden)
UPDATE public.products AS p
SET supplier_id = s.id
FROM public.suppliers AS s
WHERE p.supplier_name = s.name;

-- (Optioneel) Voeg productfiche bestandveld toe aan products indien nog niet aanwezig
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='products' AND column_name='product_fiche_url'
  ) THEN
    ALTER TABLE public.products ADD COLUMN product_fiche_url TEXT;
  END IF;
END$$;

-- (Optioneel) Zet supplier_name voortaan alleen bij externe producten, anders standaard 'TOTHAI PRODUCTION'
UPDATE public.products
SET supplier_name = CASE
  WHEN product_type = 'zelfgemaakt' THEN 'TOTHAI PRODUCTION'
  ELSE supplier_name
END
WHERE supplier_name IS NULL OR supplier_name = '';


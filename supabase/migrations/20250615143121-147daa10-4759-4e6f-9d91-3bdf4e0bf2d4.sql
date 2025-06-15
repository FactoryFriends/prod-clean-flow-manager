
-- Toevoegen van product_type en supplier_name aan products:
ALTER TABLE public.products
  ADD COLUMN product_type TEXT NOT NULL DEFAULT 'zelfgemaakt',
  ADD COLUMN supplier_name TEXT;

-- Voor bestaande records: zet bij alles supplier_name = 'TOTHAI PRODUCTION'
UPDATE public.products
  SET supplier_name = 'TOTHAI PRODUCTION'
  WHERE product_type = 'zelfgemaakt';

-- Maak een CHECK constraint zodat supplier_name verplicht is voor 'extern' product
ALTER TABLE public.products
  ADD CONSTRAINT supplier_name_required_for_extern CHECK (
    (product_type = 'extern' AND supplier_name IS NOT NULL AND supplier_name <> '')
    OR (product_type = 'zelfgemaakt')
  );

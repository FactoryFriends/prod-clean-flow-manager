
-- Ingrediënten aanpassen: kolommen voor "pickbaar" (boolean) + "product_type"
ALTER TABLE public.products
ADD COLUMN pickable boolean NOT NULL DEFAULT false,
ADD COLUMN product_kind text NOT NULL DEFAULT 'zelfgemaakt';

-- Optioneel, maak 'product_kind' future-proof via allowed values:
-- ('zelfgemaakt', 'extern', ...), maar voor nu als text.

-- Eventuele allergenenlijst kan voorlopig in code zolang er geen aparte tabel is.

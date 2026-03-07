

## Fix: Lege Stocklijst door Opgestapelde Draft Dispatches

### Probleem
Er zijn 55 draft dispatch records opgestapeld (oudste van okt 2025). De `useBatchStock` hook trekt hoeveelheden van ALLE draft dispatches af van de voorraad. Dezelfde batches worden meerdere keren gereserveerd, waardoor de berekende stock op 0 uitkomt en de inventarislijst leeg verschijnt.

Voorbeeld: batch Khin Curry heeft 1 package geproduceerd maar 17 gereserveerd door drafts.

### Oplossing (2 stappen)

#### 1. Opruimen oude draft dispatches
Verwijder alle draft dispatch records en hun items. Deze zijn stale/verlaten sessies en hebben geen waarde meer.

- Verwijder dispatch_items waar dispatch_id verwijst naar een draft dispatch
- Verwijder dispatch_records met status 'draft'

#### 2. Automatische cleanup van oude drafts
In `useBatchStock.tsx`: negeer draft dispatches die ouder zijn dan 24 uur. Dit voorkomt dat verlaten sessies de stock permanent blokkeren.

**Technische wijziging** in `useBatchStock.tsx`:
- Voeg een tijdsfilter toe aan de dispatch_items query: alleen drafts van de laatste 24 uur meetellen
- Toevoegen: `.gte("dispatch_records.created_at", new Date(Date.now() - 24*60*60*1000).toISOString())`

Dit lost beide problemen op: de huidige stocklijst wordt direct zichtbaar na cleanup, en toekomstige verlaten drafts blokkeren de stock niet meer na 24 uur.


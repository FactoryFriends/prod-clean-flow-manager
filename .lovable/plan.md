

## Root Cause: Lege Stocklijst

### Probleem

De `useBatchStock` hook haalt eerst **alle** 641 batches op voor locatie "tothai", en probeert dan een tweede query te doen:

```
.in("item_id", batchIds)  // 641 UUIDs in de URL
```

Dit genereert een GET request met **641 UUIDs** in de URL query string (~23.000 karakters). Dit overschrijdt de URL-lengte limiet van PostgREST/Supabase, waardoor de dispatch_items query faalt. Omdat `InventoryBrowser` de error negeert (`const { data: batches } = ...` zonder error handling), wordt `data` `undefined`, en toont de lijst "No items available".

### Oplossing

**Bestand: `src/hooks/useBatchStock.tsx`**

Twee aanpassingen:

1. **Filter batches vooraf op stock > 0** in de eerste query — alleen batches met `packages_produced > 0` ophalen. Dit reduceert het aantal van 641 naar ~182, wat binnen de URL-limiet valt.

2. **Chunk de `.in()` call** als fallback — splits `batchIds` in groepen van max 100 en voer meerdere queries uit, merge de resultaten. Dit voorkomt dat de URL ooit te lang wordt, ook als het aantal groeit.

Concrete wijzigingen:
- Voeg `.gt("packages_produced", 0)` toe aan de eerste batch query (wanneer `inStockOnly` true is)
- Implementeer een `chunkedIn()` helper die de dispatch_items query opsplitst in batches van 100 IDs
- Merge alle dispatch_items resultaten in de `reservedMap`


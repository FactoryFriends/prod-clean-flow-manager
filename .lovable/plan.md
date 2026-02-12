

# Vervallen batches toevoegen aan stocktelling

## Probleem
De stock verification (stocktelling) filtert momenteel vervallen batches weg. Hierdoor verschijnen ze niet in het Excel-template en kunnen ze niet gecontroleerd of afgeschreven worden.

## Oplossing
Vervallen batches met reststock meenemen in de stocktelling, met een duidelijke markering dat ze vervallen zijn.

## Technische aanpassing

### 1. `useBatchStock.tsx` - Filter aanpassen
De huidige filter verwijdert vervallen batches wanneer `inStockOnly = true`. Aanpassing: vervallen batches met stock > 0 WEL meenemen.

**Van:**
```
allBatches.filter((b) => b.packages_in_stock > 0 && b.expiry_date >= today)
```

**Naar:**
```
allBatches.filter((b) => b.packages_in_stock > 0)
```

### 2. `stockVerificationTemplate.ts` - Kolom "Status" toevoegen
Een extra kolom toevoegen die aangeeft of een batch "OK" of "EXPIRED" is, zodat het bij het tellen meteen duidelijk is welke batches vervallen zijn.

### 3. UI - Visuele markering (optioneel)
In de BatchesInStockTable een rode markering tonen voor vervallen batches, zodat ze ook in de app zichtbaar zijn.

## Impact
- Vervallen batches met reststock verschijnen nu in de stocktelling
- Geen bestaande functionaliteit wordt gebroken
- De Production-pagina kan eventueel een aparte filter behouden


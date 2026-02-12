

# Grayscale-vriendelijke markering voor vervallen batches

## Probleem
De huidige rode kleuren (#fee2e2 achtergrond, #dc2626 tekst) zijn niet goed zichtbaar bij zwart-wit afdrukken.

## Oplossing
Vervangen door grayscale-opvallende stijlen:

### In `src/utils/pdf/stockListPrintA4.ts` (regels 242-246):

**Vervallen rijen krijgen:**
- Donkergrijze achtergrond (`#d0d0d0`) - duidelijk zichtbaar contrast met witte rijen
- Vetgedrukte tekst met `*** VERVALLEN ***` prefix bij de productnaam
- Doorstreepte vervaldatum met bold
- Dikkere rand (`border: 2px solid #000`) rond de hele rij

**Van:**
```
background-color: #fee2e2
color: #dc2626; font-weight: bold
⚠️ emoji
```

**Naar:**
```
background-color: #d0d0d0; border: 2px solid #000
font-weight: bold; text-decoration: underline
"*** EXPIRED ***" tekst prefix + "XXX" markering
```

Dit zorgt ervoor dat vervallen batches er bij grayscale print duidelijk uitspringen door:
1. Donkere achtergrond (contrast met witte rijen)
2. Dikke rand
3. Tekstuele markering "*** EXPIRED ***"


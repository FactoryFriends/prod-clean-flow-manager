

## Beveiliging Edit Batch voor Production Users

### Probleem
Production users kunnen via "Edit Batch" het veld `packages_produced` vrij aanpassen naar elk getal (inclusief 0), zonder:
- Een reden op te geven
- Audit trail logging
- Bevestiging of waarschuwing

Alleen admin users krijgen het "Remaining Stock" veld met verplichte reden en audit logging.

### Oplossing

Beperk wat production users kunnen wijzigen in de Edit Batch dialog:

1. **Verwijder de mogelijkheid voor production users om `packages_produced` te wijzigen**
   - Production users mogen alleen chef, vervaldatum en notities aanpassen
   - Het "Number of Packages Produced" veld wordt read-only (alleen weergave, niet bewerkbaar)
   - Stockaanpassingen blijven exclusief voor admins via het "Remaining Stock" veld met verplichte reden

2. **Bestand te wijzigen**: `src/components/EditBatchDialog.tsx`
   - In het `else` blok (non-admin path), verwijder de `packagesProduced` input
   - Toon `packages_produced` als read-only info (net als het product en batch nummer)
   - Bij submit voor production users, gebruik altijd `batch.packages_produced` (ongewijzigd)

### Technische Details

In `EditBatchDialog.tsx`:
- Het blok op regel 155-168 (de `else` branch met het packages input veld) wordt vervangen door een read-only weergave
- In de submit handler (regel 100-115), wordt `packagesToUpdate` altijd `batch.packages_produced` voor non-admins
- De `canSubmit` validatie wordt vereenvoudigd: geen check meer op `packagesProduced` voor non-admins


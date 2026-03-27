

## Plan: Bulk afschrijving verlopen voorraad naar 0

### Wat
Alle verlopen batches met positief saldo in één keer op 0 zetten via een database script, met audit trail per batch.

### Aanpak

1. **Database query uitvoeren** via psql die in één keer:
   - Alle `production_batches` vindt waar `expiry_date < CURRENT_DATE` en `packages_produced + COALESCE(manual_stock_adjustment, 0) > 0`
   - Per batch de `manual_stock_adjustment` berekent zodat het netto saldo exact 0 wordt (rekening houdend met draft dispatch reserveringen)
   - De `manual_stock_adjustment`, `adjusted_by`, `adjustment_reason` en `adjustment_timestamp` update
   - Per batch een `audit_logs` entry insert met actie "stock_adjustment", reden "Stocktelling en oplossen software error", en de oude/nieuwe waarden in metadata

2. **Verificatie**: Na uitvoering een controle-query draaien om te bevestigen dat er geen verlopen batches met positief saldo meer zijn.

### Technisch detail

Het script zal twee stappen bevatten:
- **INSERT** naar `audit_logs` met per batch: oude stock, nieuwe stock (0), reden, en `favv_relevant = true`
- **UPDATE** op `production_batches`: `manual_stock_adjustment` aanpassen zodat `packages_produced + adjustment - reserved = 0`, dus `new_adjustment = reserved - packages_produced`

Reden in audit trail: **"Stocktelling en oplossen software error"**
Staff name: **"System (admin bulk write-off)"**

Geen code-wijzigingen nodig -- dit is een eenmalige data-operatie.


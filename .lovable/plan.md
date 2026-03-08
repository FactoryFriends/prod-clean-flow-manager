

## Fix: Password Reset Link Werkt Niet

### Probleem
De ResetPassword pagina (`src/pages/ResetPassword.tsx`) heeft twee bugs:

1. **Hash fragment niet gelezen**: Supabase stuurt recovery links met een hash fragment (`#access_token=...&type=recovery`), maar de pagina leest alleen query parameters (`?type=recovery`). 
2. **Geen token exchange**: Bij de PKCE flow (query params met `token_hash`) moet eerst `supabase.auth.verifyOtp()` worden aangeroepen om een sessie te starten. Dat gebeurt niet.
3. **Geen sessie = updateUser faalt**: `supabase.auth.updateUser({ password })` vereist een actieve sessie.

### Oplossing

Herschrijf `src/pages/ResetPassword.tsx`:

1. **Luister naar `onAuthStateChange` met `PASSWORD_RECOVERY` event** — dit is de betrouwbare manier. Supabase's JS client detecteert automatisch het hash fragment en triggert een `PASSWORD_RECOVERY` event.

2. **Verwijder de handmatige token/type checks** uit `useEffect` — die zijn onnodig als we het auth event gebruiken.

3. **Flow wordt**:
   - Pagina laadt → Supabase client leest hash fragment automatisch → triggert `PASSWORD_RECOVERY` event
   - Component zet een `ready` state wanneer dit event binnenkomt
   - Gebruiker vult nieuw wachtwoord in → `updateUser({ password })` werkt nu (sessie is actief)
   - Bij PKCE flow (token_hash in query params): roep `verifyOtp({ token_hash, type: 'recovery' })` aan

### Technische Details

**Bestand**: `src/pages/ResetPassword.tsx`

- Voeg `onAuthStateChange` listener toe die luistert naar `PASSWORD_RECOVERY` event
- Voeg fallback toe: als query params `token_hash` en `type=recovery` aanwezig zijn, roep `verifyOtp` aan
- Verwijder de oude `useEffect` die `type`/`token` checkt
- Toon een "Verifying reset link..." state terwijl de sessie wordt opgebouwd
- Na succesvolle password update: sign out en redirect naar `/auth`


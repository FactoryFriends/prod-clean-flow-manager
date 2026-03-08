

## Fix: Password Reset Link Geeft 522 Timeout

### Probleem

De reset email link wijst naar het **sandbox/preview domein** (`a3029fbc-...sandbox.lovable.dev`), niet naar de live app. Dit sandbox domein is niet altijd bereikbaar, wat de Cloudflare 522 timeout veroorzaakt.

De oorzaak: `window.location.origin` wordt gebruikt als redirect URL. Wanneer de reset vanuit de preview wordt aangevraagd, wordt het preview-domein in de link gezet.

### Oplossing

Hardcode de redirect URL naar de gepubliceerde live URL (`https://optithai-manager.lovable.app`).

**Bestanden te wijzigen:**

1. **`src/contexts/AuthContext.tsx`** (regel 88):
   - Vervang `window.location.origin` door `https://optithai-manager.lovable.app`

2. **`src/hooks/useUserManagement.tsx`** (regels waar `window.location.origin` gebruikt wordt voor reset links):
   - Vervang alle `window.location.origin` in reset-gerelateerde functies door `https://optithai-manager.lovable.app`

3. **Supabase Dashboard configuratie** (handmatig door gebruiker):
   - Site URL instellen op `https://optithai-manager.lovable.app`
   - `https://optithai-manager.lovable.app/reset-password` toevoegen aan Redirect URLs

Dit zorgt ervoor dat de reset link altijd naar de werkende live URL wijst, ongeacht vanwaar de reset wordt aangevraagd.


import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event — Supabase auto-parses hash fragments
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setVerifying(false);
      }
    });

    // PKCE flow fallback: token_hash in query params
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (tokenHash && type === "recovery") {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error }) => {
          if (error) {
            setError("Ongeldige of verlopen reset link. Vraag een nieuwe aan.");
            setVerifying(false);
          } else {
            setReady(true);
            setVerifying(false);
          }
        });
    } else {
      // Check if session already exists (hash fragment auto-parsed)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true);
        }
        // Give onAuthStateChange a moment to fire
        setTimeout(() => setVerifying(false), 2000);
      });
    }

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Vul alle velden in.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens lang zijn.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success("Wachtwoord succesvol bijgewerkt!");
      
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err: any) {
      setError(err.message || "Wachtwoord resetten mislukt. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate("/auth");

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Reset link verifiëren...</p>
        </div>
      </div>
    );
  }

  if (!ready && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <Shield className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Ongeldige Reset Link</h1>
          <p className="text-muted-foreground">
            {error || "Deze link is ongeldig of verlopen. Vraag een nieuwe wachtwoord reset aan."}
          </p>
          <Button onClick={handleBackToLogin}>Terug naar Login</Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Wachtwoord Reset Gelukt</h1>
            <p className="text-muted-foreground">Je wachtwoord is succesvol bijgewerkt.</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Je wordt doorgestuurd naar de login pagina...
                </p>
                <Button onClick={handleBackToLogin} className="w-full">
                  Ga naar Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Wachtwoord Resetten</h1>
          <p className="text-muted-foreground">Vul je nieuwe wachtwoord in</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nieuw Wachtwoord</CardTitle>
            <CardDescription>Kies een sterk wachtwoord voor je account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Nieuw Wachtwoord</label>
                <Input id="password" type="password" placeholder="Nieuw wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Bevestig Wachtwoord</label>
                <Input id="confirmPassword" type="password" placeholder="Bevestig wachtwoord" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Bijwerken...</>) : "Wachtwoord Bijwerken"}
              </Button>
              <div className="text-center">
                <Button variant="link" onClick={handleBackToLogin} className="text-sm text-muted-foreground">Terug naar Login</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

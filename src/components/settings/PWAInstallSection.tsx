import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertCircle, CheckCircle2, Smartphone } from "lucide-react";
import { getPlatformInfo } from "@/utils/platform";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallSection() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const platform = getPlatformInfo();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) return;

    setIsInstalling(true);
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === "accepted") {
        setInstallPromptEvent(null);
      }
    } catch (error) {
      console.error("Install error:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Already installed as PWA
  if (platform.isPWA) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            App Geïnstalleerd
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            OptiThai is geïnstalleerd op dit apparaat en werkt als een native app.
          </p>
        </CardContent>
      </Card>
    );
  }

  // iOS instructions (cannot auto-install)
  if (platform.isIOS) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Installeer OptiThai
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Volg deze stappen om OptiThai op je iPhone te installeren:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Open deze pagina in <strong>Safari</strong>
            </li>
            <li>
              Tik onderaan op het <strong>Deel</strong> icoon{" "}
              <span className="inline-flex items-center justify-center w-6 h-6 bg-muted rounded text-xs">
                □↑
              </span>
            </li>
            <li>
              Scroll naar beneden en tik op <strong>"Zet op beginscherm"</strong>
            </li>
            <li>
              Tik rechts bovenaan op <strong>"Voeg toe"</strong>
            </li>
          </ol>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Belangrijk:</strong> Dit werkt alleen in Safari, niet in Chrome of andere browsers op iOS!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Android/Desktop with install button
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Installeer OptiThai
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {installPromptEvent ? (
          <>
            <p className="text-sm text-muted-foreground">
              Installeer OptiThai als app op je apparaat voor snellere toegang en offline functionaliteit.
            </p>
            <Button onClick={handleInstall} disabled={isInstalling}>
              <Download className="mr-2 h-4 w-4" />
              {isInstalling ? "Installeren..." : "App Installeren"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Je kunt OptiThai installeren door te klikken op het installatie-icoon in de adresbalk van je browser.
            </p>
            {platform.isAndroid && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Op Android: tik op het menu (⋮) rechtsboven en kies <strong>"App installeren"</strong> of <strong>"Toevoegen aan startscherm"</strong>.
                </AlertDescription>
              </Alert>
            )}
            {(platform.isWindows || platform.isMac) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Klik op het installatie-icoon (⊕) in de adresbalk van Chrome of Edge.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

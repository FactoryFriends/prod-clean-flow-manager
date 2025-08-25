import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Share } from 'lucide-react';
import { getPlatformInfo, showInstallPrompt } from '@/utils/platform';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [platform, setPlatform] = useState(getPlatformInfo());

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      
      // Only show if not already running as PWA
      if (!platform.isPWA) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show install prompt for iOS users after 3 seconds
    if (platform.isIOS && !platform.isPWA) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [platform]);

  const handleInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setInstallPromptEvent(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed this session or already installed
  if (!showPrompt || platform.isPWA || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  const promptInfo = showInstallPrompt();

  if (!promptInfo.show) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm md:left-auto md:right-4 md:max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{promptInfo.icon}</span>
            <div>
              <CardTitle className="text-base">OptiThai installeren</CardTitle>
              <CardDescription className="text-sm">
                Voor de beste ervaring
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {promptInfo.message}
        </p>
        <div className="flex gap-2">
          {installPromptEvent && (
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Installeren
            </Button>
          )}
          {platform.isIOS && (
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDismiss}>
              <Share className="h-4 w-4 mr-2" />
              Begrepen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
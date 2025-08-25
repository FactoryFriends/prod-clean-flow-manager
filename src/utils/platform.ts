/**
 * Platform detection utilities for OptiThai PWA
 */

export interface PlatformInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  isPWA: boolean;
  isStandalone: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
}

export const getPlatformInfo = (): PlatformInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isWindows = /windows/.test(userAgent);
  const isMac = /macintosh|mac os x/.test(userAgent);
  
  // Check if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Device type detection
  const isMobile = /mobi|android|iphone/.test(userAgent);
  const isTablet = /ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone))/.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  // Touch support
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    isIOS,
    isAndroid,
    isWindows,
    isMac,
    isPWA,
    isStandalone,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice
  };
};

export const showInstallPrompt = () => {
  const platform = getPlatformInfo();
  
  if (platform.isIOS && !platform.isPWA) {
    return {
      show: true,
      message: 'Voeg OptiThai toe aan je beginscherm: tik op het deel-icoon en selecteer "Voeg toe aan beginscherm"',
      icon: '📱'
    };
  }
  
  if ((platform.isAndroid || platform.isWindows) && !platform.isPWA) {
    return {
      show: true,
      message: 'Installeer OptiThai: klik op het installatie-icoon in de adresbalk',
      icon: '💾'
    };
  }
  
  return { show: false, message: '', icon: '' };
};

export const getOptimalViewport = (): string => {
  const platform = getPlatformInfo();
  
  if (platform.isIOS) {
    return 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
  
  return 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
};
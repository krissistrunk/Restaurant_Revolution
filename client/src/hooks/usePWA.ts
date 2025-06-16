import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  updateSW: () => void;
  isOfflineReady: boolean;
}

interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isSupported: boolean;
  isOnline: boolean;
  updateInfo: PWAUpdateInfo;
  installApp: () => Promise<void>;
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
}

export const usePWA = (): PWAState => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo>({
    isUpdateAvailable: false,
    updateSW: () => {},
    isOfflineReady: false,
  });

  useEffect(() => {
    // Check PWA support
    const isPWASupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(isPWASupported);

    // Check if already installed
    const isRunningInPWA = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
    setIsInstalled(isRunningInPWA);

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      setIsInstallable(true);
      
      // Show install prompt after a delay (user engagement)
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Track installation
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed',
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker registration and updates
    if (isPWASupported && import.meta.env.PROD) {
      const wb = new Workbox('/sw.js');

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      wb.addEventListener('waiting', () => {
        setUpdateInfo(prev => ({
          ...prev,
          isUpdateAvailable: true,
          updateSW: () => {
            wb.addEventListener('controlling', () => {
              window.location.reload();
            });
            wb.messageSkipWaiting();
          },
        }));
      });

      wb.addEventListener('offlineReady', () => {
        setUpdateInfo(prev => ({
          ...prev,
          isOfflineReady: true,
        }));
      });

      wb.register();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        
        // Track installation attempt
        if ('gtag' in window) {
          (window as any).gtag('event', 'pwa_install_accepted', {
            event_category: 'PWA',
            event_label: 'Install Prompt Accepted',
          });
        }
      } else {
        console.log('User dismissed the install prompt');
        
        // Track dismissal
        if ('gtag' in window) {
          (window as any).gtag('event', 'pwa_install_dismissed', {
            event_category: 'PWA',
            event_label: 'Install Prompt Dismissed',
          });
        }
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during app installation:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    
    // Track dismissal
    if ('gtag' in window) {
      (window as any).gtag('event', 'pwa_install_prompt_dismissed', {
        event_category: 'PWA',
        event_label: 'Install Banner Dismissed',
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isSupported,
    isOnline,
    updateInfo,
    installApp,
    showInstallPrompt,
    dismissInstallPrompt,
  };
};
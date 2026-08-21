'use client';

import { useEffect } from 'react';

export const StatusBarInit: React.FC = () => {
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        // Prevent webview from drawing under the system status bar
        await StatusBar.setOverlaysWebView({ overlay: false });
        // Set solid dark background (#0F172A) so white time/text is 100% visible on every phone
        await StatusBar.setBackgroundColor({ color: '#0F172A' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Fallback silently if running in pure web browser
      }
    };

    initStatusBar();
  }, []);

  return null;
};

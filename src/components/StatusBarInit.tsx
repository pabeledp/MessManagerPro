'use client';

import { useEffect } from 'react';

export const StatusBarInit: React.FC = () => {
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        // Prevent webview from drawing under the system status bar
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#F1F5F9' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Fallback silently if running in pure web browser
      }
    };

    initStatusBar();
  }, []);

  return null;
};

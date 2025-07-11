// frontend/src/hooks/useStatusBar.js
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setupStatusBar = async () => {
        try {
          // Set status bar to not overlay for proper touch handling
          await StatusBar.setOverlaysWebView({ overlay: true });
          
          // Set dark content (black text) for light backgrounds
          await StatusBar.setStyle({ style: Style.Dark });
          
          // Set blue background color to match app gradient
          await StatusBar.setBackgroundColor({ color: '#eff6ff' });
          
          // Show status bar
          await StatusBar.show();
          
          console.log('Status bar configured');
        } catch (error) {
          console.error('Failed to configure status bar:', error);
        }
      };

      setupStatusBar();
    }
  }, []);
};

export default useStatusBar;
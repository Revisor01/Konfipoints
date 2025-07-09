import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export const useCapacitorKeyboard = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Nur globale Keyboard-Einstellungen - keine DOM-Manipulation
    Keyboard.setScroll({ isDisabled: false });
    Keyboard.setResizeMode({ mode: 'ionic' });

    return () => {
      // Cleanup falls nötig
    };
  }, []);
};
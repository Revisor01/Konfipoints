import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export const useCapacitorKeyboard = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Nichts tun - Layout bleibt komplett unverändert
    const handleKeyboardWillShow = (info) => {
      // Kein Code - Layout bleibt fix
    };

    const handleKeyboardWillHide = () => {
      // Kein Code - Layout bleibt fix
    };

    const handleKeyboardDidShow = (info) => {
      // Kein Code - Layout bleibt fix
    };

    const handleKeyboardDidHide = () => {
      // Kein Code - Layout bleibt fix
    };

    // Event listeners hinzufügen
    Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow);
    Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide);
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

    // Cleanup
    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);
};
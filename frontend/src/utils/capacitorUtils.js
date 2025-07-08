import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

export const isWeb = () => {
  return Capacitor.getPlatform() === 'web';
};

export const checkNativeFeatureSupport = async (featureName) => {
  try {
    switch (featureName) {
      case 'camera':
        if (isNativePlatform()) {
          const { Camera } = await import('@capacitor/camera');
          return !!Camera;
        }
        return false;
        
      case 'push-notifications':
        if (isNativePlatform()) {
          const { PushNotifications } = await import('@capacitor/push-notifications');
          return !!PushNotifications;
        }
        return false;
        
      case 'badge':
        if (isNativePlatform()) {
          try {
            const { Badge } = await import('@capawesome/capacitor-badge');
            const { isSupported } = await Badge.isSupported();
            return isSupported;
          } catch {
            return false;
          }
        }
        return false;
        
      case 'app-state':
        if (isNativePlatform()) {
          const { App } = await import('@capacitor/app');
          return !!App;
        }
        return false;
        
      case 'preferences':
        if (isNativePlatform()) {
          const { Preferences } = await import('@capacitor/preferences');
          return !!Preferences;
        }
        return !!localStorage;
        
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking feature support for ${featureName}:`, error);
    return false;
  }
};

export const getDeviceInfo = async () => {
  try {
    if (isNativePlatform()) {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      return {
        platform: info.platform,
        model: info.model,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
        webViewVersion: info.webViewVersion
      };
    } else {
      return {
        platform: 'web',
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      };
    }
  } catch (error) {
    console.error('Error getting device info:', error);
    return { platform: getPlatform() };
  }
};

export const handleAppStateChange = (callback) => {
  if (!isNativePlatform()) return;
  
  import('@capacitor/app').then(({ App }) => {
    App.addListener('appStateChange', callback);
    
    return () => {
      App.removeAllListeners();
    };
  });
};

export const getAppInfo = async () => {
  try {
    if (isNativePlatform()) {
      const { App } = await import('@capacitor/app');
      const info = await App.getInfo();
      return {
        name: info.name,
        id: info.id,
        build: info.build,
        version: info.version
      };
    } else {
      return {
        name: document.title,
        version: process.env.REACT_APP_VERSION || '1.0.0',
        build: process.env.REACT_APP_BUILD || 'web'
      };
    }
  } catch (error) {
    console.error('Error getting app info:', error);
    return { name: 'Konfi-Punkte', version: '1.0.0' };
  }
};


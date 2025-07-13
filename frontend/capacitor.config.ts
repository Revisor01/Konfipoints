import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.godsapp.konfiquest',
  appName: 'KonfiQuest',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Camera: {
      iosPromptForPermissionOnActivation: true
    },
    Badge: {
      persist: true,
      autoClear: false
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'dark'
    },
    Keyboard: {
      resize: "ionic"
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#eff6ff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    App: {
      launchAutoHide: true
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#eff6ff',
    swipeBackEnabled: true,
    allowsLinkPreview: true,
    scheme: 'konfiquest',
    limitsNavigationsToAppBoundDomains: true,
    scrollEnabled: false
  }
};

export default config;
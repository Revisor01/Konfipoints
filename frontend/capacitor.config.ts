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
      overlaysWebView: true
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
    Share: {
      // Native iOS sharing
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#eff6ff',
    swipeBackEnabled: true,
    allowsLinkPreview: true
  }
};

export default config;
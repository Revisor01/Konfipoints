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
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#ffffff"
    },
    Keyboard: {
      resize: "ionic",
      style: "dark",
      resizeOnFullScreen: true
    },
    Share: {
      // Native iOS sharing
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    swipeBackEnabled: true,
    allowsLinkPreview: false
  }
};

export default config;
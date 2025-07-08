import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const usePushNotifications = (user) => {
  const [pushToken, setPushToken] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const initializePushNotifications = async () => {
      if (!Capacitor.isNativePlatform() || !user) return;

      try {
        const permissionStatus = await PushNotifications.checkPermissions();
        
        if (permissionStatus.receive === 'prompt') {
          const permission = await PushNotifications.requestPermissions();
          if (permission.receive !== 'granted') {
            console.log('Push notification permission denied');
            return;
          }
        } else if (permissionStatus.receive !== 'granted') {
          console.log('Push notification permission not granted');
          return;
        }

        await PushNotifications.register();
        setIsEnabled(true);

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          setPushToken(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });

      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [user]);

  const sendTokenToServer = async (token) => {
    if (!token || !user) return;
    
    try {
      const response = await fetch('/api/push-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('konfi_token')}`
        },
        body: JSON.stringify({
          token,
          user_id: user.id,
          user_type: user.type,
          platform: Capacitor.getPlatform()
        })
      });
      
      if (response.ok) {
        console.log('Push token sent to server successfully');
      }
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  };

  useEffect(() => {
    if (pushToken) {
      sendTokenToServer(pushToken);
    }
  }, [pushToken, user]);

  return {
    pushToken,
    isEnabled,
    sendTokenToServer
  };
};

export default usePushNotifications;
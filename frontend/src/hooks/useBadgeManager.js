import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const useBadgeManager = (user, activityRequests) => {
  useEffect(() => {
    const updateAppBadge = async () => {
      if (user?.type !== 'admin') return;
      
      const pendingRequests = activityRequests?.filter(r => r.status === 'pending').length || 0;
      
      try {
        if (Capacitor.isNativePlatform()) {
          const { Badge } = await import('@capawesome/capacitor-badge');
          
          const { isSupported } = await Badge.isSupported();
          
          if (isSupported) {
            const permissionStatus = await Badge.checkPermissions();
            
            if (permissionStatus.display !== 'granted') {
              await Badge.requestPermissions();
            }
            
            if (pendingRequests > 0) {
              await Badge.set({ count: pendingRequests });
              console.log(`📱 App Badge gesetzt: ${pendingRequests}`);
            } else {
              await Badge.clear();
              console.log('📱 App Badge geleert');
            }
          }
        }
        
        if (pendingRequests > 0) {
          document.title = `(${pendingRequests}) Konfi-Punkte Admin`;
        } else {
          document.title = 'Konfi-Punkte Admin';
        }
        
      } catch (error) {
        console.log('Badge update failed:', error);
        
        if (pendingRequests > 0) {
          document.title = `(${pendingRequests}) Konfi-Punkte Admin`;
        } else {
          document.title = 'Konfi-Punkte Admin';
        }
      }
    };
    
    if (Array.isArray(activityRequests)) {
      updateAppBadge();
    }
  }, [user, activityRequests]);
};

export default useBadgeManager;
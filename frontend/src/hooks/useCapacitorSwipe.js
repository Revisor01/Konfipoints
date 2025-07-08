import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
// import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useCapacitorSwipe = (onSwipeBack, onPullToRefresh) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTracking = false;
    let hasTriggeredHaptic = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      currentY = startY;
      isTracking = true;
      hasTriggeredHaptic = false;
    };

    const handleTouchMove = (e) => {
      if (!isTracking) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      
      // Edge swipe back detection (from left edge) - höhere Schwelle
      if (startX < 30 && diffX > 120 && Math.abs(diffY) < 100) {
        if (!hasTriggeredHaptic) {
          // Haptics.impact({ style: ImpactStyle.Light });
          hasTriggeredHaptic = true;
        }
        e.preventDefault();
      }
      
      // Pull to refresh detection (from top) - höhere Schwelle
      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto, .space-y-4');
      if (scrollContainer && scrollContainer.scrollTop === 0 && diffY > 120 && Math.abs(diffX) < 100) {
        if (!hasTriggeredHaptic) {
          // Haptics.impact({ style: ImpactStyle.Light });
          hasTriggeredHaptic = true;
        }
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isTracking) return;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      
      // Edge swipe back (iOS style) - höhere Schwelle
      if (startX < 30 && diffX > 150 && Math.abs(diffY) < 100) {
        // Haptics.impact({ style: ImpactStyle.Medium });
        if (onSwipeBack) {
          // Scroll to top BEFORE calling swipe back
          const scrollContainer = document.querySelector('.flex-1.overflow-y-auto, .space-y-4');
          if (scrollContainer) {
            scrollContainer.scrollTop = 0;
          }
          window.scrollTo(0, 0);
          
          // Call swipe back after short delay
          setTimeout(() => {
            onSwipeBack();
          }, 50);
        }
      }
      
      // Pull to refresh - höhere Schwelle
      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto, .space-y-4');
      if (scrollContainer && scrollContainer.scrollTop === 0 && diffY > 150 && Math.abs(diffX) < 100) {
        // Haptics.impact({ style: ImpactStyle.Medium });
        if (onPullToRefresh) {
          onPullToRefresh();
        }
      }
      
      isTracking = false;
    };

    // Event listeners hinzufügen
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack, onPullToRefresh]);
};
import { useEffect, useRef, useState } from 'react';

const usePullToRefresh = (onRefresh, threshold = 100, isEnabled = true) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    let startY = 0;
    let currentY = 0;
    let isAtTop = false;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        isAtTop = true;
        startY = e.touches[0].clientY;
        setStartY(startY);
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isAtTop || !isDragging || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(deltaY * 0.5, threshold * 1.5);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (!isAtTop || !isDragging) return;

      setIsDragging(false);
      
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        onRefresh().finally(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        });
      } else {
        setPullDistance(0);
      }
      
      isAtTop = false;
    };

    const handleScroll = () => {
      if (container.scrollTop > 0) {
        isAtTop = false;
        setIsDragging(false);
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [onRefresh, threshold, isEnabled, isDragging, pullDistance, isRefreshing]);

  const refreshIndicatorStyle = {
    transform: `translateY(${pullDistance}px)`,
    opacity: Math.min(pullDistance / threshold, 1)
  };

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    refreshIndicatorStyle,
    shouldShowIndicator: pullDistance > 0 || isRefreshing
  };
};

export default usePullToRefresh;
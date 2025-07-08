import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  height = 'auto',
  showCloseButton = true,
  swipeToClose = true,
  className = '',
  contentClassName = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef(null);
  const overlayRef = useRef(null);

  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'h-1/2',
    full: 'h-full',
    '75vh': 'h-[75vh]',
    '50vh': 'h-[50vh]',
    '25vh': 'h-[25vh]'
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleTouchStart = (e) => {
    if (!swipeToClose) return;
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!swipeToClose || !isDragging) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startY;
    
    if (deltaY > 0) {
      setCurrentY(deltaY);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!swipeToClose || !isDragging) return;
    
    setIsDragging(false);
    
    if (currentY > 100) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
    
    setCurrentY(0);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl transform transition-transform duration-300 ${
          isAnimating ? 'translate-y-full' : 'translate-y-0'
        } ${heightClasses[height]} ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {swipeToClose && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
        
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Schließen"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        <div className={`overflow-y-auto flex-1 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt = '', 
  title = '',
  showControls = true 
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={alt}
            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
              isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
            }`}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            draggable={false}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full"
          aria-label="Schließen"
        >
          <X size={24} />
        </button>

        {title && (
          <div className="absolute top-4 left-4 px-3 py-2 bg-black bg-opacity-50 text-white rounded-lg">
            {title}
          </div>
        )}

        {showControls && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full"
              aria-label="Verkleinern"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={resetTransform}
              className="px-3 py-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full text-sm"
            >
              Reset
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full"
              aria-label="Vergrößern"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full"
              aria-label="Drehen"
            >
              <RotateCw size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
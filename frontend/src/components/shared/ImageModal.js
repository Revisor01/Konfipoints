import React, { useEffect, useState } from 'react';
import { 
  IonModal,
  IonButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonFab
} from '@ionic/react';
import { 
  close, 
  addOutline, 
  removeOutline, 
  refreshOutline 
} from 'ionicons/icons';

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
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
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

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onClose}
      backdropDismiss={true}
      style={{
        '--backdrop-opacity': '0.9',
        '--backdrop-color': 'black'
      }}
    >
      <IonHeader>
        <IonToolbar style={{ '--background': 'rgba(0, 0, 0, 0.8)' }}>
          {title && (
            <IonTitle style={{ color: 'white' }}>{title}</IonTitle>
          )}
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ '--color': 'white' }}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent 
        style={{ 
          '--background': 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <img
            src={imageUrl}
            alt={alt}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s',
              cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'
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

        {showControls && (
          <>
            <IonFab 
              vertical="bottom" 
              horizontal="center" 
              slot="fixed"
              style={{ marginBottom: '20px' }}
            >
              <div style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '24px',
                padding: '8px'
              }}>
                <IonButton
                  onClick={handleZoomOut}
                  fill="clear"
                  style={{
                    '--color': 'white',
                    '--background': 'rgba(255, 255, 255, 0.1)',
                    '--border-radius': '50%',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <IonIcon icon={removeOutline} />
                </IonButton>
                
                <IonButton
                  onClick={resetTransform}
                  fill="clear"
                  style={{
                    '--color': 'white',
                    '--background': 'rgba(255, 255, 255, 0.1)',
                    '--border-radius': '20px',
                    height: '40px',
                    fontSize: '0.875rem'
                  }}
                >
                  Reset
                </IonButton>
                
                <IonButton
                  onClick={handleZoomIn}
                  fill="clear"
                  style={{
                    '--color': 'white',
                    '--background': 'rgba(255, 255, 255, 0.1)',
                    '--border-radius': '50%',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <IonIcon icon={addOutline} />
                </IonButton>
                
                <IonButton
                  onClick={handleRotate}
                  fill="clear"
                  style={{
                    '--color': 'white',
                    '--background': 'rgba(255, 255, 255, 0.1)',
                    '--border-radius': '50%',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <IonIcon icon={refreshOutline} />
                </IonButton>
              </div>
            </IonFab>
          </>
        )}
      </IonContent>
    </IonModal>
  );
};

export default ImageModal;
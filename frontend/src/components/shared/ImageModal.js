import React, { useEffect } from 'react';
import { 
  IonModal,
  IonButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons
} from '@ionic/react';
import { close } from 'ionicons/icons';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt = '', 
  title = ''
}) => {

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
              objectFit: 'contain'
            }}
            draggable={false}
          />
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ImageModal;
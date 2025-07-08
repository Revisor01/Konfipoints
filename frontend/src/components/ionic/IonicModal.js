// frontend/src/components/ionic/IonicModal.js
import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { close } from 'ionicons/icons';

const IonicModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  submitButtonText,
  onSubmit,
  submitDisabled = false,
  loading = false,
  presentingElement
}) => {
  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onClose}
      presentingElement={presentingElement}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={onClose}>
              Abbrechen
            </IonButton>
          </IonButtons>
          {onSubmit && (
            <IonButtons slot="end">
              <IonButton 
                fill="clear" 
                onClick={onSubmit}
                disabled={submitDisabled || loading}
                color="primary"
              >
                {loading ? 'Senden...' : (submitButtonText || 'Senden')}
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {children}
      </IonContent>
    </IonModal>
  );
};

export default IonicModal;
import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from '@ionic/react';

const UniversalModal = ({ 
  dismiss, 
  title, 
  children, 
  submitButtonText,
  onSubmit,
  submitDisabled = false,
  loading = false,
}) => {
  // SUPER SIMPEL wie andereapp - IonPage wrapper
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={dismiss}>
              Abbrechen
            </IonButton>
          </IonButtons>
          {onSubmit && (
            <IonButtons slot="end">
              <IonButton
                onClick={onSubmit}
                disabled={submitDisabled || loading}
              >
                {loading ? 'Senden...' : (submitButtonText || 'Senden')}
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        {children}
      </IonContent>
    </IonPage>
  );
};

export default UniversalModal;
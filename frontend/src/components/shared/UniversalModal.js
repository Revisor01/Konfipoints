// frontend/src/components/shared/UniversalModal.js
import React from 'react';
import {
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
  return (
    <>
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

      <IonContent>
        {children}
      </IonContent>
    </>
  );
};

export default UniversalModal;
import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  useIonActionSheet
} from '@ionic/react';
import { useApp } from '../../../contexts/AppContext';

const KonfiModal = ({ jahrgaenge, onSave, onClose, loading }) => {
  const { setError } = useApp();
  const [presentActionSheet] = useIonActionSheet();
  const [formData, setFormData] = useState({
    name: '',
    jahrgang_id: ''
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.jahrgang_id) {
      setError('Name und Jahrgang sind erforderlich');
      return;
    }

    onSave(formData);
  };

  const selectJahrgang = () => {
    presentActionSheet({
      header: 'Jahrgang wählen',
      buttons: [
        ...jahrgaenge.map(j => ({
          text: j.name,
          handler: () => setFormData({...formData, jahrgang_id: j.id})
        })),
        {
          text: 'Abbrechen',
          role: 'cancel'
        }
      ]
    });
  };

  const selectedJahrgang = jahrgaenge.find(j => j.id === parseInt(formData.jahrgang_id));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Konfi</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              Abbrechen
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.jahrgang_id || loading}
            >
              {loading ? 'Hinzufügen...' : 'Hinzufügen'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name *</IonLabel>
            <IonInput
              value={formData.name}
              onIonInput={(e) => setFormData({...formData, name: e.detail.value})}
              placeholder="Vor- und Nachname"
              inputmode="text"
            />
          </IonItem>

          <IonItem button onClick={selectJahrgang}>
            <IonLabel position="stacked">Jahrgang *</IonLabel>
            <IonLabel>
              {selectedJahrgang ? selectedJahrgang.name : 'Jahrgang wählen...'}
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default KonfiModal;
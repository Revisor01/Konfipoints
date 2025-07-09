// CreatePollModal.js
import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonList,
  IonItemDivider,
  IonReorder,
  IonReorderGroup,
  IonFooter
} from '@ionic/react';
import { close, add, trash } from 'ionicons/icons';

const CreatePollModal = ({ isOpen, onDismiss, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState('');

  const handleSubmit = async () => {
    const validOptions = options.filter(opt => opt.trim());
    
    if (!question.trim()) {
      alert('Frage ist erforderlich');
      return;
    }
    
    if (validOptions.length < 2) {
      alert('Mindestens 2 Antwortoptionen erforderlich');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions,
      multiple_choice: multipleChoice,
      expires_in_hours: expiresInHours ? parseInt(expiresInHours) : null
    };

    try {
      await onSubmit(pollData);
      
      // Reset form only after successful submission
      setQuestion('');
      setOptions(['', '']);
      setMultipleChoice(false);
      setExpiresInHours('');
    } catch (error) {
      console.error('Failed to create poll:', error);
      // Don't reset form on error
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onDismiss}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Umfrage erstellen</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss} fill="clear">
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonList>
          {/* Question */}
          <IonItem>
            <IonLabel position="stacked">Frage *</IonLabel>
            <IonTextarea
              value={question}
              onIonInput={(e) => setQuestion(e.detail.value)}
              placeholder="Was möchten Sie fragen?"
              rows={3}
              autoGrow={true}
            />
          </IonItem>

          <IonItemDivider>
            <IonLabel>Antwortoptionen *</IonLabel>
          </IonItemDivider>

          {/* Options */}
          <IonReorderGroup disabled={false} onIonItemReorder={(e) => {
            const newOptions = [...options];
            const [movedItem] = newOptions.splice(e.detail.from, 1);
            newOptions.splice(e.detail.to, 0, movedItem);
            setOptions(newOptions);
            e.detail.complete();
          }}>
            {options.map((option, index) => (
              <IonReorder key={index}>
                <IonItem>
                  <IonInput
                    value={option}
                    onIonInput={(e) => updateOption(index, e.detail.value)}
                    placeholder={`Option ${index + 1}`}
                    style={{ flex: 1 }}
                  />
                  {options.length > 2 && (
                    <IonButton
                      slot="end"
                      fill="clear"
                      color="danger"
                      onClick={() => removeOption(index)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  )}
                </IonItem>
              </IonReorder>
            ))}
          </IonReorderGroup>

          {/* Add Option Button */}
          {options.length < 10 && (
            <IonItem>
              <IonButton
                fill="clear"
                color="success"
                onClick={addOption}
                style={{ margin: '0 auto' }}
              >
                <IonIcon icon={add} slot="start" />
                Option hinzufügen
              </IonButton>
            </IonItem>
          )}

          <IonItemDivider>
            <IonLabel>Einstellungen</IonLabel>
          </IonItemDivider>

          {/* Multiple Choice Setting */}
          <IonItem>
            <IonLabel>
              <h3>Mehrfachauswahl</h3>
              <p>Teilnehmer können mehrere Optionen wählen</p>
            </IonLabel>
            <IonToggle
              checked={multipleChoice}
              onIonToggle={(e) => setMultipleChoice(e.detail.checked)}
            />
          </IonItem>

          {/* Expiration Setting */}
          <IonItem>
            <IonLabel>Automatisch beenden (optional)</IonLabel>
            <IonSelect
              value={expiresInHours}
              onIonChange={(e) => setExpiresInHours(e.detail.value)}
              placeholder="Nie"
              interface="action-sheet"
            >
              <IonSelectOption value="">Nie</IonSelectOption>
              <IonSelectOption value="1">1 Stunde</IonSelectOption>
              <IonSelectOption value="6">6 Stunden</IonSelectOption>
              <IonSelectOption value="24">1 Tag</IonSelectOption>
              <IonSelectOption value="168">1 Woche</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" color="medium" onClick={onDismiss}>
              Abbrechen
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              fill="solid"
              color="success"
              onClick={handleSubmit}
              disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
            >
              Umfrage erstellen
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreatePollModal;
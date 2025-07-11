import React, { useState, useEffect, useRef } from 'react';
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
} from '@ionic/react';
import { close, add, trash } from 'ionicons/icons';

const CreatePollModal = ({ isOpen, onDismiss, onSubmit, presentingElement }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState('');
  const modal = useRef(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestion('');
      setOptions(['', '']);
      setMultipleChoice(false);
      setExpiresInHours('');
    }
  }, [isOpen]);

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
      modal.current?.dismiss();
    } catch (error) {
      console.error('Failed to create poll:', error);
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
      ref={modal}
      isOpen={isOpen} 
      onDidDismiss={onDismiss}
      presentingElement={undefined}
      // === EINFACHES SCHIEBARES MODAL ===
      breakpoints={[0, 0.75, 1]}
      initialBreakpoint={0.75}
      swipeToClose={true}
      backdropDismiss={false}
      showBackdrop={false}
      canDismiss={true}
      keyboardClose={false}
      // ================================
    >
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontSize: '17px', fontWeight: '600' }}>
            Umfrage erstellen
          </IonTitle>
          <IonButtons slot="start">
            <IonButton 
              onClick={onDismiss} 
              fill="clear"
              style={{ '--color': '#007AFF', fontSize: '17px' }}
            >
              Abbrechen
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={handleSubmit}
              disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
              style={{ 
                '--color': !question.trim() || options.filter(opt => opt.trim()).length < 2 ? '#8E8E93' : '#007AFF',
                fontSize: '17px',
                fontWeight: '600'
              }}
            >
              Erstellen
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonList>
          {/* ... (Modal-Inhalt bleibt gleich) ... */}
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
          {options.map((option, index) => (
            <IonItem key={index}>
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
          ))}

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
    </IonModal>
  );
};

export default CreatePollModal;
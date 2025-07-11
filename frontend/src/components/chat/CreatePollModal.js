import React, { useState, useEffect } from 'react';
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

const CreatePollModal = ({ isOpen, onDismiss, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState('');

  // Improved Modal Body Lock and Keyboard Handling
  useEffect(() => {
    if (isOpen) {
      // Modal ist offen - Body sperren und Viewport stabilisieren
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;
      const originalTop = document.body.style.top;
      const originalHeight = document.body.style.height;
      
      // Aktuelle Scroll-Position speichern
      const scrollY = window.scrollY;
      
      // Viewport stabilisieren - verhindert Zoom/Verschiebung bei Keyboard
      // VORSICHTIG: Nur wenn wirklich nötig, da es Feld-Sprünge verursachen kann
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const originalViewport = viewportMeta?.getAttribute('content');
      // Kommentiert aus, da es Feld-Sprünge verursacht
      // if (viewportMeta) {
      //   viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      // }
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      return () => {
        // Modal geschlossen - alles zurücksetzen
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.height = originalHeight;
        document.body.style.overflow = originalOverflow;
        document.body.classList.remove('modal-open');
        
        // Viewport zurücksetzen (nur wenn es geändert wurde)
        // if (viewportMeta && originalViewport) {
        //   viewportMeta.setAttribute('content', originalViewport);
        // }
        
        // Scroll-Position wiederherstellen
        window.scrollTo(0, scrollY);
      };
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
      
      setQuestion('');
      setOptions(['', '']);
      setMultipleChoice(false);
      setExpiresInHours('');
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
      isOpen={isOpen} 
      onDidDismiss={onDismiss}
      presentingElement={undefined}
      // === WICHTIG: BREAKPOINTS FÜR SCHIEBBARES MODAL VON UNTEN ===
      breakpoints={[0, 0.75, 1]} // 0 = geschlossen, 0.75 = 3/4 hoch, 1 = Vollbild
      initialBreakpoint={0.75}    // Startet bei 3/4 Höhe
      swipeToClose={true}         // Ermöglicht das Schließen durch Wischen
      // ==========================================================
      cssClass="create-poll-modal" // Diese Klasse kann für spezifisches Styling verwendet werden
      backdropDismiss={true}      // Ermöglicht Schließen durch Tippen auf Backdrop
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
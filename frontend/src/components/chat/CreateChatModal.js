// CreateChatModal.js
import React, { useState, useEffect } from 'react';
import { 
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonCheckbox,
  IonSpinner
} from '@ionic/react';
import api from '../../services/api';

const CreateChatModal = ({ 
  onClose, 
  onChatCreated, 
  loading 
}) => {
  const [chatType, setChatType] = useState('direct');
  
  console.log('Current chatType:', chatType); // Debug
  const [chatName, setChatName] = useState('');
  const [selectedJahrgang, setSelectedJahrgang] = useState('');
  const [selectedKonfis, setSelectedKonfis] = useState([]);
  const [jahrgaenge, setJahrgaenge] = useState([]);
  const [konfis, setKonfis] = useState([]);

  useEffect(() => {
    loadJahrgaenge();
    loadKonfis();
  }, []);

  const loadJahrgaenge = async () => {
    try {
      const response = await api.get('/jahrgaenge');
      setJahrgaenge(response.data);
    } catch (err) {
      console.error('Fehler beim Laden der Jahrgänge');
    }
  };

  const loadKonfis = async () => {
    try {
      const response = await api.get('/konfis');
      setKonfis(response.data);
    } catch (err) {
      console.error('Fehler beim Laden der Konfis');
    }
  };

  const handleCreateChat = async () => {
    if (chatType === 'direct' && selectedKonfis.length === 0) {
      console.error('Bitte mindestens einen Teilnehmer auswählen');
      return;
    }

    if (chatType === 'group' && !chatName.trim()) {
      console.error('Bitte einen Gruppennamen eingeben');
      return;
    }

    if (chatType === 'admin_team') {
      // Create admin team chat
      try {
        const chatData = {
          type: 'admin_team',
          name: 'Admin Team',
          participants: []
        };

        await api.post('/chat/rooms', chatData);
        onChatCreated();
      } catch (err) {
        console.error('Fehler beim Erstellen des Admin-Chats:', err);
      }
      return;
    }

    try {
      const chatData = {
        type: chatType,
        name: chatType === 'group' ? chatName : `Chat mit ${selectedKonfis.map(id => konfis.find(k => k.id === id)?.name).join(', ')}`,
        participants: selectedKonfis
      };

      await api.post('/chat/rooms', chatData);
      onChatCreated();
    } catch (err) {
      console.error('Fehler beim Erstellen des Chats:', err);
    }
  };

  const filteredKonfis = konfis.filter(konfi => 
    !selectedJahrgang || konfi.jahrgang_id === parseInt(selectedJahrgang)
  );

  const canCreate = () => {
    if (chatType === 'direct') return selectedKonfis.length > 0;
    if (chatType === 'group') return chatName.trim() && selectedKonfis.length > 0;
    if (chatType === 'admin_team') return true;
    return false;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chat</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onClose} disabled={loading}>
              Abbrechen
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton 
              onClick={handleCreateChat} 
              disabled={loading || !canCreate()}
              strong={true}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Erstellen'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonList>
          {/* Chat Type Selection */}
          <IonItem>
            <IonLabel position="stacked">Chat-Typ *</IonLabel>
            <IonSelect
              value={chatType}
              onIonChange={e => setChatType(e.detail.value)}
              placeholder="Chat-Typ wählen..."
              interface="popover"
            >
              <IonSelectOption value="direct">Direkter Chat</IonSelectOption>
              <IonSelectOption value="group">Gruppenchat</IonSelectOption>
              <IonSelectOption value="admin_team">Admin Team</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Chat Type Description */}
          {chatType && (
            <IonItem lines="none" style={{ '--background': '#f8f9fa' }}>
              <IonLabel>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  margin: '8px 0'
                }}>
                  {chatType === 'direct' && 'Chat mit ausgewählten Konfis'}
                  {chatType === 'group' && 'Privater Chat mit mehreren Teilnehmern'}
                  {chatType === 'admin_team' && 'Chat für alle Admins zum internen Austausch'}
                </p>
              </IonLabel>
            </IonItem>
          )}

          {/* Group Name Input */}
          {chatType === 'group' && (
            <IonItem>
              <IonLabel position="stacked">Gruppenname *</IonLabel>
              <IonInput
                value={chatName}
                onIonInput={(e) => setChatName(e.detail.value)}
                placeholder="z.B. Projektteam"
                clearInput={true}
              />
            </IonItem>
          )}

          {/* Participant Selection */}
          {(chatType === 'direct' || chatType === 'group') && (
            <>
              <IonItem>
                <IonLabel>
                  <h2 style={{ fontWeight: '600', color: '#1f2937' }}>Teilnehmer auswählen *</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {selectedKonfis.length} {selectedKonfis.length === 1 ? 'Teilnehmer' : 'Teilnehmer'} ausgewählt
                  </p>
                </IonLabel>
              </IonItem>
              
              {/* Jahrgang Filter */}
              <IonItem>
                <IonLabel position="stacked">Filter nach Jahrgang</IonLabel>
                <IonSelect 
                  value={selectedJahrgang} 
                  onIonChange={e => setSelectedJahrgang(e.detail.value)}
                  placeholder="Alle Jahrgänge"
                  interface="popover"
                >
                  <IonSelectOption value="">Alle Jahrgänge</IonSelectOption>
                  {jahrgaenge.map(j => (
                    <IonSelectOption key={j.id} value={j.id}>{j.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {/* Konfi List */}
              {filteredKonfis.length > 0 ? (
                filteredKonfis.map(konfi => (
                  <IonItem key={konfi.id}>
                    <IonCheckbox
                      slot="start"
                      checked={selectedKonfis.includes(konfi.id)}
                      onIonChange={(e) => {
                        if (e.detail.checked) {
                          setSelectedKonfis([...selectedKonfis, konfi.id]);
                        } else {
                          setSelectedKonfis(selectedKonfis.filter(id => id !== konfi.id));
                        }
                      }}
                    />
                    <IonLabel>
                      <h3>{konfi.name}</h3>
                      <p style={{ color: '#6b7280' }}>
                        {jahrgaenge.find(j => j.id === konfi.jahrgang_id)?.name || 'Unbekannter Jahrgang'}
                      </p>
                    </IonLabel>
                  </IonItem>
                ))
              ) : (
                <IonItem>
                  <IonLabel>
                    <p style={{ 
                      textAlign: 'center', 
                      color: '#9ca3af', 
                      padding: '2rem 0',
                      fontStyle: 'italic'
                    }}>
                      {selectedJahrgang ? 'Keine Konfis in diesem Jahrgang gefunden' : 'Keine Konfis verfügbar'}
                    </p>
                  </IonLabel>
                </IonItem>
              )}
            </>
          )}

          {/* Admin Team Info */}
          {chatType === 'admin_team' && (
            <IonItem>
              <IonLabel>
                <p style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  padding: '2rem 0',
                  fontStyle: 'italic'
                }}>
                  Erstellt einen Chat für alle Admins zum internen Austausch.
                </p>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default CreateChatModal;
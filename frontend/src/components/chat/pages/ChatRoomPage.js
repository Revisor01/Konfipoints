import React, { useState, useRef } from 'react';
import {
  IonPage,
  IonModal
} from '@ionic/react';
import ChatRoom from '../ChatRoom';
import CreatePollModal from '../CreatePollModal';
import api from '../../../services/api';

const ChatRoomPage = ({ match, location }) => {
  const pageRef = useRef(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const chatRoomRef = useRef(null);

  const handleCreatePoll = async (pollData) => {
    try {
      // Get room ID from ChatRoom component
      const roomId = match?.params?.roomId || window.location.pathname.split('/chat/')[1]?.split('/')[0];
      
      console.log('Creating poll with data:', pollData);
      console.log('Room ID:', roomId);
      
      const response = await api.post(`/chat/rooms/${roomId}/polls`, pollData);
      console.log('Poll created successfully:', response.data);
      
      // Notify ChatRoom to update messages
      if (chatRoomRef.current && chatRoomRef.current.addMessage) {
        chatRoomRef.current.addMessage(response.data);
      }
      
      setShowPollModal(false);
      
    } catch (err) {
      console.error('Poll creation error:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 400) {
        console.error('Fehler beim Erstellen der Umfrage: Ungültige Daten');
      } else if (err.response?.status === 403) {
        console.error('Fehler: Keine Berechtigung zum Erstellen von Umfragen');
      } else {
        console.error('Fehler beim Erstellen der Umfrage. Bitte versuche es erneut.');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Nachricht wirklich löschen?')) return; 

    try {
      await api.delete(`/chat/messages/${messageId}`);
      
      // Notify ChatRoom to remove message
      if (chatRoomRef.current && chatRoomRef.current.removeMessage) {
        chatRoomRef.current.removeMessage(messageId);
      }
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  return (
    <IonPage ref={pageRef}>
      <ChatRoom 
        ref={chatRoomRef}
        match={match} 
        location={location}
        onCreatePoll={() => setShowPollModal(true)}
        onDeleteMessage={handleDeleteMessage}
      />
      
      {/* Poll Modal - exakt wie BadgeModal/KonfiModal Pattern */}
      <IonModal 
        isOpen={showPollModal} 
        onDidDismiss={() => setShowPollModal(false)}
        presentingElement={pageRef.current || undefined}
        canDismiss={true}
        backdropDismiss={true}
      >
        <CreatePollModal
          dismiss={() => setShowPollModal(false)}
          onSubmit={handleCreatePoll}
          isOpen={showPollModal}
        />
      </IonModal>
    </IonPage>
  );
};

export default ChatRoomPage;
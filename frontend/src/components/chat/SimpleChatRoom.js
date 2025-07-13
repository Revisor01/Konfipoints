import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';

const SimpleChatRoom = ({ match, location }) => {
  const { user } = useApp();
  const router = useIonRouter();
  const params = useParams();
  
  // Extract roomId from URL path using multiple methods
  const roomId = params.roomId || match?.params?.roomId || location?.pathname?.split('/chat/')[1]?.split('/')[0];
  console.log('Extracted roomId:', roomId, 'from params:', params, 'match:', match?.params, 'pathname:', location?.pathname);
  
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SimpleChatRoom useEffect:', { roomId, location });
    const routeRoom = location?.state?.room;
    console.log('Route room:', routeRoom);
    
    if (routeRoom) {
      console.log('Using route room:', routeRoom);
      setCurrentRoom(routeRoom);
      loadMessages(routeRoom.id);
    } else if (roomId) {
      console.log('Loading room by ID:', roomId);
      loadRoom();
    } else {
      console.log('No roomId and no route room');
      setLoading(false);
    }
  }, [roomId, location]);

  const loadRoom = async () => {
    try {
      console.log('Loading room, calling /chat/rooms');
      const response = await api.get('/chat/rooms');
      console.log('Rooms response:', response.data);
      const foundRoom = response.data.find(r => r.id === parseInt(roomId));
      console.log('Found room:', foundRoom, 'for roomId:', roomId);
      if (foundRoom) {
        setCurrentRoom(foundRoom);
        loadMessages(foundRoom.id);
      } else {
        console.error('Room not found in list');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading room:', err);
      setLoading(false);
    }
  };

  const loadMessages = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/rooms/${id || roomId}/messages`);
      console.log('Messages loaded:', response.data);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon icon={chevronBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!currentRoom) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon icon={chevronBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Room Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <h2>Chat Room nicht gefunden</h2>
          <p>Room ID: {roomId}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{currentRoom.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': '#f5f5f5' }}>
        <div style={{ 
          padding: '16px 16px 80px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#666'
            }}>
              <p>Keine Nachrichten vorhanden</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwnMessage = msg.user_id === user?.id;
              return (
                <div 
                  key={msg.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: isOwnMessage ? '#007aff' : '#ffffff',
                    color: isOwnMessage ? 'white' : '#000',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    wordBreak: 'break-word'
                  }}>
                    {!isOwnMessage && (
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        {msg.sender_name || 'Unknown'}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content || 'No content'}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '4px',
                      textAlign: isOwnMessage ? 'right' : 'left'
                    }}>
                      {new Date(msg.created_at).toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SimpleChatRoom;
import React, { useState, useEffect, useRef } from 'react';
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
  IonFooter,
  IonItem,
  IonTextarea,
  IonActionSheet,
  IonRefresher,
  IonRefresherContent,
  IonModal
} from '@ionic/react';
import { 
  chevronBack, 
  send, 
  attach, 
  camera, 
  document,
  image,
  barChart,
  chevronDown
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

const CompleteChatRoom = () => {
  const { user } = useApp();
  const router = useIonRouter();
  const params = useParams();
  const contentRef = useRef(null);
  
  const roomId = params.roomId || window.location.pathname.split('/chat/')[1]?.split('/')[0];
  
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    console.log('CompleteChatRoom mounted, roomId:', roomId);
    if (roomId) {
      loadRoom();
      loadMessages();
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const response = await api.get('/chat/rooms');
      const foundRoom = response.data.find(r => r.id === parseInt(roomId));
      if (foundRoom) {
        setCurrentRoom(foundRoom);
      }
    } catch (err) {
      console.error('Error loading room:', err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data || []);
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content: message.trim(),
        message_type: 'text'
      });
      
      setMessages(prev => [...prev, response.data]);
      setMessage('');
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleBack = () => {
    console.log('Back button clicked');
    // Try multiple methods
    try {
      router.goBack();
    } catch (err) {
      console.log('goBack failed, trying push');
      router.push('/admin/chat', 'back');
    }
  };

  const handleRefresh = async (event) => {
    await loadMessages();
    event.detail.complete();
  };

  // Capacitor Functions
  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      if (image.webPath) {
        await uploadFile(image.webPath, 'image');
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const selectPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      if (image.webPath) {
        await uploadFile(image.webPath, 'image');
      }
    } catch (err) {
      console.error('Gallery error:', err);
    }
  };

  const pickFile = async () => {
    try {
      const result = await FilePicker.pickFiles({
        types: ['image/*', 'video/*', 'application/pdf', 'text/*'],
        multiple: false,
        readData: true
      });
      
      if (result.files && result.files[0]) {
        const file = result.files[0];
        await uploadFile(file.data, 'file', file.name, file.mimeType);
      }
    } catch (err) {
      console.error('File picker error:', err);
    }
  };

  const uploadFile = async (fileData, type, fileName, mimeType) => {
    try {
      const formData = new FormData();
      
      if (type === 'image') {
        const response = await fetch(fileData);
        const blob = await response.blob();
        formData.append('file', blob, `image_${Date.now()}.jpg`);
      } else {
        const byteArray = new Uint8Array(fileData);
        const blob = new Blob([byteArray], { type: mimeType });
        formData.append('file', blob, fileName);
      }
      
      const response = await api.post(`/chat/rooms/${roomId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessages(prev => [...prev, response.data]);
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  // Poll Voting Function
  const handleVote = async (pollMessageId, optionIndex) => {
    try {
      const response = await api.post(`/chat/polls/${pollMessageId}/vote`, {
        option_index: optionIndex
      });
      
      // Update the message locally with new vote data
      setMessages(prev => prev.map(msg => 
        msg.id === pollMessageId 
          ? { ...msg, votes: response.data.votes }
          : msg
      ));
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const renderMessage = (msg, idx) => {
    const isOwnMessage = msg.user_id === user?.id;
    
    return (
      <div 
        key={msg.id || idx}
        style={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          marginBottom: '8px',
          padding: '0 16px'
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
          
          {/* Text Content */}
          {msg.message_type === 'text' && (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          )}
          
          {/* Image Content */}
          {msg.message_type === 'image' && (
            <div>
              {msg.content && (
                <div style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              )}
              <img 
                src={`https://konfipoints.godsapp.de/api/chat/files/${msg.file_name}`}
                alt="Shared image"
                style={{
                  maxWidth: '100%',
                  borderRadius: '8px',
                  display: 'block',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedImage(`https://konfipoints.godsapp.de/api/chat/files/${msg.file_name}`);
                  setShowImageModal(true);
                }}
                onError={(e) => {
                  console.error('Image load error:', e);
                  // Fallback to relative URL
                  e.target.src = `${api.defaults.baseURL}/chat/files/${msg.file_name}`;
                }}
              />
            </div>
          )}
          
          {/* File Content */}
          {msg.message_type === 'file' && (
            <div>
              {msg.content && (
                <div style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              )}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const fileUrl = `https://konfipoints.godsapp.de/api/chat/files/${msg.file_name}`;
                  window.open(fileUrl, '_blank');
                }}
              >
                <IonIcon icon={document} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{msg.file_name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {Math.round(msg.file_size / 1024)} KB • Zum Öffnen antippen
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Poll Content */}
          {msg.message_type === 'poll' && (
            <div>
              <div style={{ fontWeight: '600', marginBottom: '12px' }}>
                📊 {msg.question || msg.content}
              </div>
              {(() => {
                try {
                  const options = msg.options ? 
                    (typeof msg.options === 'string' ? JSON.parse(msg.options) : msg.options) 
                    : [];
                  
                  return options.map((option, idx) => {
                    const votes = msg.votes || [];
                    const optionVotes = votes.filter(v => v.option_index === idx).length;
                    const totalVotes = votes.length;
                    const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                    
                    return (
                      <div 
                        key={idx} 
                        style={{
                          marginBottom: '8px',
                          padding: '8px',
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => handleVote(msg.id, idx)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{option}</span>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            {optionVotes} ({percentage}%)
                          </span>
                        </div>
                        <div style={{
                          height: '4px',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          borderRadius: '2px',
                          marginTop: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: '#007aff',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  });
                } catch (err) {
                  console.error('Error parsing poll options:', err, msg.options);
                  return (
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: 'rgba(255,0,0,0.1)', 
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      Umfrage-Optionen können nicht angezeigt werden
                    </div>
                  );
                }
              })()}
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '8px' }}>
                {msg.votes?.length || 0} Stimmen insgesamt
              </div>
            </div>
          )}
          
          <div style={{
            fontSize: '0.7rem',
            opacity: 0.7,
            marginTop: '4px',
            textAlign: isOwnMessage ? 'right' : 'left'
          }}>
            {formatDate(msg.created_at)}
          </div>
        </div>
      </div>
    );
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{currentRoom?.name || `Chat ${roomId}`}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent 
        ref={contentRef}
        style={{ '--background': '#f5f5f5' }}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={chevronDown} />
        </IonRefresher>
        
        <div style={{ 
          paddingTop: '16px',
          paddingBottom: '16px',
          minHeight: '100%'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#666'
            }}>
              <p>Noch keine Nachrichten vorhanden</p>
              <p style={{ fontSize: '0.9rem' }}>Schreibe die erste Nachricht!</p>
            </div>
          ) : (
            messages.map((msg, idx) => renderMessage(msg, idx))
          )}
        </div>
      </IonContent>
      
      <IonFooter>
        <IonToolbar>
          <IonItem lines="none" style={{ '--background': 'transparent' }}>
            <IonButton 
              fill="clear" 
              slot="start"
              onClick={() => setShowActionSheet(true)}
            >
              <IonIcon icon={attach} />
            </IonButton>
            
            <IonTextarea
              value={message}
              onIonInput={(e) => setMessage(e.detail.value)}
              placeholder="Nachricht schreiben..."
              rows={1}
              autoGrow={true}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                '--background': '#f0f0f0',
                '--border-radius': '20px',
                '--padding-start': '16px',
                '--padding-end': '16px',
                margin: '0 8px',
                fontSize: '16px'
              }}
            />
            
            <IonButton 
              fill="clear" 
              slot="end"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <IonIcon icon={send} />
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonFooter>
      
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        buttons={[
          {
            text: 'Foto aufnehmen',
            icon: camera,
            handler: takePicture
          },
          {
            text: 'Bild auswählen',
            icon: image,
            handler: selectPhoto
          },
          {
            text: 'Datei anhängen',
            icon: document,
            handler: pickFile
          },
          ...(user?.type === 'admin' ? [{
            text: 'Umfrage erstellen',
            icon: barChart,
            handler: () => {
              console.log('Poll clicked');
            }
          }] : []),
          {
            text: 'Abbrechen',
            role: 'cancel'
          }
        ]}
      />
      
      {/* Image Fullscreen Modal */}
      <IonModal 
        isOpen={showImageModal} 
        onDidDismiss={() => setShowImageModal(false)}
        style={{ '--background': 'rgba(0,0,0,0.9)' }}
      >
        <IonContent style={{ '--background': 'transparent' }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000
          }}>
            <IonButton 
              fill="clear" 
              onClick={() => setShowImageModal(false)}
              style={{ '--color': 'white' }}
            >
              ✕
            </IonButton>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px'
          }}>
            {selectedImage && (
              <img 
                src={selectedImage}
                alt="Fullscreen view"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default CompleteChatRoom;
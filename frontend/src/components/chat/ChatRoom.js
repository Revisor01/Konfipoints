import React, { useState, useEffect, useRef } from 'react';
import { useIonRouter, isPlatform, useIonViewWillLeave } from '@ionic/react';
// import { useHistory } from 'react-router-dom'; // Wird nicht direkt verwendet, kann entfernt werden

import {
  IonContent,
  IonHeader,
  IonFooter,
  IonTextarea,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonPage,
  IonToolbar,
  IonTitle,
  IonModal,
  IonButtons,
  IonSpinner
} from '@ionic/react';
import { useIonActionSheet } from '@ionic/react';
import { send, attach, camera, document, image, chevronDown, close, barChart } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Keyboard } from '@capacitor/keyboard'; // KeyboardResize nicht mehr nötig
import { Capacitor } from '@capacitor/core';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import MessageBubble from './MessageBubble';
import PollComponent from './PollComponent';
import CreatePollModal from './CreatePollModal';
import { chevronBack, arrowDown } from 'ionicons/icons';

const ChatRoom = ({ room, match, location, onBack }) => {
  const { user } = useApp();
  const router = useIonRouter();
  const [presentActionSheet] = useIonActionSheet();

  const isAdmin = user?.type === 'admin';
  const roomId = match?.params?.roomId || window.location.pathname.split('/chat/')[1]?.split('/')[0];
  const [currentRoom, setCurrentRoom] = useState(room);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [message, setMessage] = useState('');

  const [attachedFileData, setAttachedFileData] = useState(null);
  const [attachedFileObject, setAttachedFileObject] = useState(null);

  const textareaRef = useRef(null);
  const footerRef = useRef(null);
  const contentRef = useRef(null);
  const pageRef = useRef(null);

  useIonViewWillLeave(() => {
    setAttachedFileData(null);
    setAttachedFileObject(null);
    setMessage('');
    console.log('ChatRoom: States beim Verlassen der Ansicht zurückgesetzt.');
    
    // === KOMPLETTER LAYOUT-RESET BEIM VERLASSEN ===
    if (Capacitor.isNativePlatform()) {
      try {
        Keyboard.hide(); // Verstecke Tastatur beim Verlassen
        
        // Reset alle möglichen CSS-Properties die Layout beeinflussen
        if (typeof window !== 'undefined' && window.document) {
          window.document.documentElement.style.setProperty('--keyboard-actual-height', '0px');
          // ENTFERNT: --ion-safe-area-top überschreibung - Ionic soll das automatisch machen
          window.document.body.style.transform = '';
          window.document.body.style.height = '';
          window.document.body.style.position = '';
          window.document.body.style.top = '';
          window.document.body.style.width = '';
          window.document.body.style.overflow = '';
          window.document.body.classList.remove('post-native-action');
        }
        
        // Reset viewport
        if (typeof window !== 'undefined') {
          window.scrollTo(0, 0);
        }
        
        // WICHTIG: Force layout recalculation für Tab-System
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('resize'));
            console.log('ChatRoom: Layout-Reset für Tab-System getriggert');
          }
        }, 50);
        
        console.log('ChatRoom: Kompletter Layout-Reset beim Verlassen durchgeführt.');
      } catch (error) {
        console.error('Fehler beim Layout-Reset:', error);
      }
    }
    // =======================================================
  });

  // === WICHTIG: Keyboard Handling - NUR Listener, KEIN setResizeMode hier ===
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', info => {
        // Die Höhenanpassung des padding-bottom ist jetzt im CSS
        // Hier nur scrollen, wenn die Tastatur erscheint
        setTimeout(() => scrollToBottom("auto"), 150);
      });

      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
        // Hier nichts Spezielles zu tun, da padding-bottom im CSS durch --keyboard-actual-height
        // auf 0 gesetzt wird, und Ionic das automatische Scrollen nach unten handhaben sollte.
      });
      
      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }
  }, []); // Leeres Array, damit es nur einmal beim Mounten/Unmounten läuft
  // =======================================================================

  useEffect(() => {
    console.log('ChatRoom mounted, roomId:', roomId);
    const routeRoom = location?.state?.room;
    if (routeRoom) {
      console.log('Using route room:', routeRoom);
      setCurrentRoom(routeRoom);
    } else if (roomId) {
      console.log('Loading room from API for roomId:', roomId);
      const loadRoom = async () => {
        try {
          const response = await api.get('/chat/rooms');
          const foundRoom = response.data.find(r => r.id === parseInt(roomId));
          console.log('Found room:', foundRoom);
          if (foundRoom) {
            setCurrentRoom(foundRoom);
          }
        } catch (err) {
          console.error('Error loading room:', err);
        }
      };
      loadRoom();
    }
  }, [roomId, location]);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
    }
  }, [currentRoom]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = (behavior = "smooth") => {
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollToBottom(behavior === "smooth" ? 300 : 0);
      }
    }, 100);
  };

  const handleScroll = (e) => {
    const element = e.target;
    const isNearTop = element.scrollTop < 100;
    
    if (isNearTop && hasMore && !loadingMore && messages.length > 0) {
      loadMoreMessages();
    }
  };

  const loadMessages = async (offset = 0) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get(`/chat/rooms/${currentRoom.id}/messages?limit=50&offset=${offset}`);

      if (offset === 0) {
        setMessages(response.data);
      } else {
        setMessages(prev => [...response.data, ...prev]);
      }

      setHasMore(response.data.length === 50);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !attachedFileObject) return;

    try {
      const formData = new FormData();
      if (message.trim()) {
        formData.append('content', message.trim());
      }
      if (attachedFileObject) {
        formData.append('file', attachedFileObject);
      }

      const response = await api.post(`/chat/rooms/${currentRoom.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, response.data]);
      setMessage('');
      setAttachedFileData(null);
      setAttachedFileObject(null);
      scrollToBottom();
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      console.log('Creating poll with data:', pollData);
      console.log('Room ID:', currentRoom.id);
      
      const response = await api.post(`/chat/rooms/${currentRoom.id}/polls`, pollData);
      console.log('Poll created successfully:', response.data);
      
      setMessages(prev => [...prev, response.data]);
      
      setTimeout(() => {
        scrollToBottom();
      }, 300);
      
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

  const [showPollModal, setShowPollModal] = useState(false);

  // NEUE Funktion für ActionSheet mit useIonActionSheet Hook
  const presentAttachmentActionSheet = () => {
    presentActionSheet({
      header: 'Anhang hinzufügen',
      translucent: true,
      buttons: [
        { text: 'Foto aufnehmen', icon: camera, handler: takePicture },
        { text: 'Foto auswählen', icon: image, handler: selectPhoto },
        { text: 'Datei auswählen', icon: document, handler: openNativeFilePicker },
        ...(isAdmin ? [{ text: 'Umfrage erstellen', icon: barChart, handler: presentCreatePollModal }] : []),
        { text: 'Abbrechen', role: 'cancel' }
      ]
    });
  };

  // NEUE Funktion für CreatePollModal - SUPER SIMPEL
  const presentCreatePollModal = () => {
    setShowPollModal(true);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Nachricht wirklich löschen?')) return; 

    try {
      await api.delete(`/chat/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      loadMessages(messages.length);
    }
  };

  const processBlobToFileAndSetStates = async (blob, fileName, mimeType) => {
    const file = new File([blob], fileName, { type: mimeType });
    setAttachedFileObject(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFileData({ name: fileName, type: mimeType, dataUrl: reader.result });
      
      // WICHTIG: Layout nach Bildauswahl korrigieren
      if (Capacitor.isNativePlatform()) {
        setTimeout(() => {
          try {
            // Force Layout-Neuberechnung
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('resize'));
            }
            
            // Reset mögliche Keyboard-States (sicher mit window check)
            if (typeof window !== 'undefined' && window.document) {
              window.document.documentElement.style.setProperty('--keyboard-actual-height', '0px');
              // ENTFERNT: --ion-safe-area-top überschreibung - Ionic soll das automatisch machen
              window.document.body.classList.add('post-native-action');
            }
            
            // Scrolle zum unteren Ende
            if (contentRef.current) {
              contentRef.current.scrollToBottom(300);
            }
            
            console.log('Layout nach Bildauswahl korrigiert');
          } catch (error) {
            console.error('Fehler beim Layout-Reset nach Bildauswahl:', error);
          }
        }, 100);
      }
    };
    reader.readAsDataURL(blob);
  };

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        await processBlobToFileAndSetStates(blob, 'camera-image.jpg', 'image/jpeg');
      }
    } catch (error) {
      console.error('Camera error:', error);
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
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        await processBlobToFileAndSetStates(blob, 'photo.jpg', 'image/jpeg');
      }
    } catch (error) {
      console.error('Photo selection error:', error);
    }
  };

  const openNativeFilePicker = async () => {
    try {
      const result = await FilePicker.pickFiles({
        types: ['image/*', 'video/*', 'application/pdf', 'text/*'],
        multiple: false,
        readData: true
      });

      if (result.files && result.files.length > 0) {
        const pickedFile = result.files[0];
        const fileData = pickedFile.data;
        const response = await fetch(`data:${pickedFile.mimeType};base64,${fileData}`);
        const blob = await response.blob();
        await processBlobToFileAndSetStates(blob, pickedFile.name, pickedFile.mimeType);
      }
    } catch (error) {
      console.error('File picker error:', error);
    }
  };

  const doRefresh = async (event) => {
    await loadMessages();
    event.detail.complete();
  };

  const getRoomTitle = () => {
    if (!currentRoom) return '';
    if (currentRoom.jahrgang_name) return `Jahrgang ${currentRoom.jahrgang_name}`;
    return currentRoom.name;
  };

  const handleBackToChatList = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/admin/chat', 'back', 'replace');
    }
  };

  if (loading || !currentRoom) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBackToChatList}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{getRoomTitle()}</IonTitle>
        </IonToolbar>
      </IonHeader>

    <IonContent
    scrollEvents={true}
    ref={contentRef}
    onIonScroll={handleScroll}
    >
        <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullFactor={0.5} pullMin={100} pullMax={200}>
          <IonRefresherContent
            pullingIcon={chevronDown}
            pullingText="Zum Aktualisieren ziehen"
            refreshingSpinner="circles"
            refreshingText="Nachrichten werden geladen..."
          />
        </IonRefresher>

        {loadingMore && (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            padding: '16px'
          }}>
            <IonSpinner name="crescent" style={{
              margin: '0 auto 8px',
              '--color': '#3b82f6'
            }} />
            <p style={{
              fontSize: '0.875rem',
              margin: '0'
            }}>Lade ältere Nachrichten...</p>
          </div>
        )}

        {!hasMore && messages.length > 50 && (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            padding: '16px'
          }}>
            <p style={{
              fontSize: '0.875rem',
              margin: '0'
            }}>📜 Beginn der Unterhaltung</p>
          </div>
        )}


        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, idx) => {
              const isOwnMessage = msg.user_id === user.id;
              const prevMsg = messages[idx - 1];
              const showSender = !isOwnMessage && (idx === 0 || prevMsg?.user_id !== msg.user_id);
              
              return (
                <div key={msg.id}>
                  {msg.message_type === 'poll' ? (
                    <div style={{ width: '100%' }}>
                      <PollComponent 
                        message={{
                          id: msg.id,
                          question: msg.question || msg.content,
                          options: (() => {
                            if (!msg.options) return [];
                            if (Array.isArray(msg.options)) return msg.options;
                            try {
                              return JSON.parse(msg.options);
                            } catch (e) {
                              console.error('Error parsing poll options:', e, msg.options);
                              return [];
                            }
                          })(),
                          multiple_choice: msg.multiple_choice,
                          expires_at: msg.expires_at,
                          sender_name: msg.sender_name,
                          created_at: msg.created_at,
                          votes: msg.votes || []
                        }}
                        user={user}
                        api={api}
                        isOwnMessage={isOwnMessage}
                        showSender={showSender}
                        formatDate={formatDate}
                        onDelete={isAdmin ? () => handleDeleteMessage(msg.id) : null}
                      />
                    </div>
                  ) : (
                    <MessageBubble
                      message={msg}
                      isOwnMessage={isOwnMessage}
                      showSender={showSender}
                      onDelete={isAdmin ? () => handleDeleteMessage(msg.id) : null}
                      formatDate={formatDate}
                    />
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </IonContent>

      <IonFooter ref={footerRef}>
        <IonToolbar style={{ '--background': '#f8f8f8', padding: '8px 8px', '--min-height': '60px' }}>
          {attachedFileData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: '#f3f4f6',
              margin: '0 auto',
              borderRadius: '8px',
              maxWidth: 'calc(100% - 16px)'
            }}>
              <span style={{
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '240px'
              }}>{attachedFileData.name}</span>
              <IonButton
                onClick={() => {
                  setAttachedFileData(null);
                  setAttachedFileObject(null);
                }}
                fill="clear"
                size="small"
                style={{
                  '--color': '#ef4444',
                  marginLeft: 'auto'
                }}
              >
                <IonIcon icon={close} />
              </IonButton>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px'
          }}>
            <IonButton
              onClick={presentAttachmentActionSheet}
              fill="clear"
              style={{
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
              }}
              aria-label="Anhang hinzufügen"
            >
              <IonIcon icon={attach} />
            </IonButton>

            <IonTextarea
              ref={textareaRef}
              autoGrow={true}
              placeholder="Nachricht schreiben..."
              value={message}
              onIonInput={(e) => setMessage(e.detail.value)}
              onIonFocus={() => {
                setTimeout(() => {
                  if (contentRef.current) {
                    contentRef.current.scrollToBottom(300);
                  }
                }, 300);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              maxlength={1000}
              enterkeyhint="send"
              inputmode="text"
              style={{
                '--background': 'transparent',
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
                width: '100%',
                flex: 1,
              }}
              aria-label="Nachricht eingeben"
            />

            <IonButton
              onClick={handleSendMessage}
              disabled={!message.trim() && !attachedFileObject}
              fill="clear"
              style={{
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
              }}
              aria-label="Nachricht senden"
            >
              <IonIcon slot="icon-only" icon={send} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
      
      {/* Poll Modal */}
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
        />
      </IonModal>
    </IonPage>
  );
};

export default ChatRoom;
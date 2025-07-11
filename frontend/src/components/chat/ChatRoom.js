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
  IonActionSheet,
  IonRefresher,
  IonRefresherContent,
  IonPage,
  IonToolbar,
  IonTitle,
  IonButtons
} from '@ionic/react';
import { send, attach, camera, document, image, chevronDown, close } from 'ionicons/icons';
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
import { ArrowLeft, BarChart3, ArrowDown } from 'lucide-react';

const ChatRoom = ({ room, match, location }) => {
  const { user } = useApp();
  const router = useIonRouter();

  const isAdmin = user?.type === 'admin';
  const roomId = match?.params?.roomId;
  const [currentRoom, setCurrentRoom] = useState(room);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const messagesEndRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [message, setMessage] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [attachedFileData, setAttachedFileData] = useState(null);
  const [attachedFileObject, setAttachedFileObject] = useState(null);

  const textareaRef = useRef(null);
  const footerRef = useRef(null);
  const contentRef = useRef(null);

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
        console.log('Keyboard will show. Scrolling to bottom.');
      });

      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
        // Hier nichts Spezielles zu tun, da padding-bottom im CSS durch --keyboard-actual-height
        // auf 0 gesetzt wird, und Ionic das automatische Scrollen nach unten handhaben sollte.
        console.log('Keyboard will hide.');
      });
      
      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
        console.log('Keyboard listeners removed.');
      };
    }
  }, []); // Leeres Array, damit es nur einmal beim Mounten/Unmounten läuft
  // =======================================================================

  useEffect(() => {
    const routeRoom = location?.state?.room;
    if (routeRoom) {
      setCurrentRoom(routeRoom);
    } else if (!currentRoom && roomId) {
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
      loadRoom();
    }
  }, [roomId, currentRoom, location]);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
    }
  }, [currentRoom]);

  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = (behavior = "smooth") => {
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollToBottom(behavior === "smooth" ? 300 : 0);
      }
    }, 100);
  };

  const handleScroll = (e) => {
    const element = e.target;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    const isNearTop = element.scrollTop < 100;
    
    setShowScrollButton(!isNearBottom && messages.length > 0);
    
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
      setShowCreatePoll(false);
      
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
    router.push('/admin/chat', 'back', 'replace');
  };

  if (loading || !currentRoom) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <IonPage className="chat-room-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBackToChatList}>
              <ArrowLeft className="w-5 h-5" />
            </IonButton>
          </IonButtons>
          <IonTitle>{getRoomTitle()}</IonTitle>
        </IonToolbar>
      </IonHeader>

    <IonContent
    scrollEvents={true}
    ref={contentRef}
    onIonScroll={handleScroll}
    className="app-gradient-background"
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
          <div className="text-center text-gray-400 py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <span className="text-sm">Lade ältere Nachrichten...</span>
          </div>
        )}

        {!hasMore && messages.length > 50 && (
          <div className="text-center text-gray-400 py-4">
            <span className="text-sm">📜 Beginn der Unterhaltung</span>
          </div>
        )}

        {showScrollButton && (
          <button
            onClick={() => {
              scrollToBottom("smooth");
              setShowScrollButton(false);
            }}
            className="fixed bottom-24 right-5 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50"
            aria-label="Nachrichten runter scrollen"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        )}

        <div className="px-4 pb-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isOwnMessage = msg.user_id === user.id;
              const prevMsg = messages[idx - 1];
              const showSender = !isOwnMessage && (idx === 0 || prevMsg?.user_id !== msg.user_id);
              
              return (
                <div key={msg.id}>
                  {msg.message_type === 'poll' ? (
                    <div className="w-full">
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
        <IonToolbar className="chat-input-toolbar" style={{ '--background': '#f8f8f8', padding: '0 8px' }}>
          {attachedFileData && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 mx-auto rounded-lg" style={{ maxWidth: 'calc(100% - 16px)' }}>
              <span className="text-sm truncate max-w-xs">{attachedFileData.name}</span>
              <button
                onClick={() => {
                  setAttachedFileData(null);
                  setAttachedFileObject(null);
                }}
                className="text-red-500 text-sm ml-auto font-semibold"
                aria-label="Anhang entfernen"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 p-1">
            <IonButton
              fill="clear"
              onClick={() => setShowActionSheet(true)}
              className="ion-no-margin attachment-btn"
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
              className="ion-no-margin send-btn"
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

      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header="Anhang hinzufügen"
        buttons={[
          {
            text: 'Foto aufnehmen',
            icon: camera,
            handler: () => {
              takePicture();
              setShowActionSheet(false);
            }
          },
          {
            text: 'Foto auswählen',
            icon: image,
            handler: () => {
              selectPhoto();
              setShowActionSheet(false);
            }
          },
          {
            text: 'Datei auswählen',
            icon: document,
            handler: () => {
              openNativeFilePicker();
              setShowActionSheet(false);
            }
          },
          ...(isAdmin ? [{
            text: 'Umfrage erstellen',
            icon: BarChart3,
            handler: () => {
              setShowCreatePoll(true);
              setShowActionSheet(false);
            }
          }] : []),
          {
            text: 'Abbrechen',
            icon: close,
            role: 'cancel'
          }
        ]}
        cssClass="chat-action-sheet"
      />

      <CreatePollModal
        isOpen={showCreatePoll}
        onDismiss={() => setShowCreatePoll(false)}
        onSubmit={handleCreatePoll}
      />
    </IonPage>
  );
};

export default ChatRoom;
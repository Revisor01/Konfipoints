import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useIonRouter, isPlatform } from '@ionic/react';
import { useHistory } from 'react-router-dom';

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
  IonItem,
  IonTitle,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { send, attach, camera, document, image, videocam, chevronDown, close } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import MessageBubble from './MessageBubble';
import PollComponent from './PollComponent';
import CreatePollModal from './CreatePollModal';
import { ArrowLeft, BarChart3, ArrowDown } from 'lucide-react';

const ChatRoom = ({ room, onBack, nav, isInTab = false, match, location, ...props }) => {
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
  const [attachedFile, setAttachedFile] = useState(null);
  const textareaRef = useRef(null);
  const footerRef = useRef(null); // Ref für den Footer
  const contentRef = useRef(null);


  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const keyboardWillShow = (info) => {
        if (footerRef.current && contentRef.current) {
          const keyboardHeight = info.keyboardHeight;
          const safeAreaBottom = isPlatform('ios') ? 24 : 0;
          const adjustedHeight = Math.max(0, keyboardHeight - safeAreaBottom);
          
          // 1. Bewege den Footer nach oben
          footerRef.current.style.transition = 'transform 0.3s ease-out';
          footerRef.current.style.transform = `translateY(-${adjustedHeight}px)`;
          
          // 2. Gib dem Inhalt unten Platz
          contentRef.current.style.setProperty('--padding-bottom', `${adjustedHeight + 20}px`);
          
          // 3. Scrolle nach unten
          scrollToBottom("auto");
          
          // 4. Stelle sicher, dass die Textarea im Sichtbereich bleibt
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
          }, 350);
        }
      };
      
      const keyboardWillHide = () => {
        if (footerRef.current && contentRef.current) {
          // Setze die Transformationen und Abstände zurück
          footerRef.current.style.transform = 'translateY(0px)';
          contentRef.current.style.removeProperty('--padding-bottom');
        }
      };
      
      const showListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      const hideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
      
      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }
  }, []);

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
    setShowScrollButton(!isNearBottom && messages.length > 0);
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
    if (!message.trim() && !attachedFile) return;

    try {
      const formData = new FormData();
      if (message.trim()) {
        formData.append('content', message.trim());
      }
      if (attachedFile) {
        formData.append('file', attachedFile);
      }

      const response = await api.post(`/chat/rooms/${currentRoom.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, response.data]);
      setMessage('');
      setAttachedFile(null);
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
      
      setShowCreatePoll(false);
      
      // Refresh messages to show new poll
      await loadMessages();
      
      // Scroll to bottom to show new poll
      setTimeout(() => {
        scrollToBottom();
      }, 500);
      
    } catch (err) {
      console.error('Poll creation error:', err);
      console.error('Error details:', err.response?.data);
      
      // Show error to user
      if (err.response?.status === 400) {
        // Use a custom modal or toast instead of alert
        console.error('Fehler beim Erstellen der Umfrage: Ungültige Daten');
      } else if (err.response?.status === 403) {
        console.error('Fehler: Keine Berechtigung zum Erstellen von Umfragen');
      } else {
        console.error('Fehler beim Erstellen der Umfrage. Bitte versuche es erneut.');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // Use a custom modal for confirmation instead of window.confirm
    if (!window.confirm('Nachricht wirklich löschen?')) return; // Placeholder, replace with custom modal

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

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'camera-image.jpg', { type: 'image/jpeg' });
      setAttachedFile(file);
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const selectPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      setAttachedFile(file);
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
        const file = new File([blob], pickedFile.name, { type: pickedFile.mimeType });
        setAttachedFile(file);
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
      <IonHeader className="ion-no-border">
        <IonToolbar className="ion-no-border">
          <div className="px-4 pt-4 pb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToChatList}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white">{getRoomTitle()}</h2>
                    <p className="text-sm text-white/80">
                      {currentRoom.type === 'jahrgang' ? 'Jahrgangs-Chat' :
                        currentRoom.type === 'admin' ? 'Admin-Support' : 'Direktnachricht'}
                    </p>
                  </div>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="bg-white/20 text-white p-3 rounded-lg hover:bg-white/30 transition-colors"
                    title="Umfrage erstellen"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
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
          <div className="text-center text-gray-400 py-2">Lade mehr Nachrichten...</div>
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
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.sender_id === user.id}
                showSender={!msg.isOwnMessage && (idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id)}
                onDelete={isAdmin ? () => handleDeleteMessage(msg.id) : null}
                formatDate={formatDate}
              />
            ))}

            {currentRoom.poll && (
              <PollComponent poll={currentRoom.poll} />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </IonContent>

      <IonFooter ref={footerRef} className="ion-no-border chat-input-footer" style={{ backgroundColor: '#f8f8f8' }}>
        <IonToolbar className="ion-no-border">
          {attachedFile && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 mx-4 mt-2 rounded-lg">
              <span className="text-sm truncate max-w-xs">{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-red-500 text-sm ml-auto font-semibold"
                aria-label="Anhang entfernen"
              >
                ✕
              </button>
            </div>
          )}

          <IonItem lines="none" className="ion-no-padding">
            <IonButton
              slot="start"
              fill="clear"
              onClick={() => setShowActionSheet(true)}
              className="ion-no-margin attachment-btn"
              style={{
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
                '--align-self': 'center',
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
                  if (textareaRef.current) {
                    textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
              }}
              aria-label="Nachricht eingeben"
            />

            <IonButton
              slot="end"
              onClick={handleSendMessage}
              disabled={!message.trim() && !attachedFile}
              fill="clear"
              className="ion-no-margin send-btn"
              style={{
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
                '--align-self': 'center',
              }}
              aria-label="Nachricht senden"
            >
              <IonIcon slot="icon-only" icon={send} />
            </IonButton>
          </IonItem>
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

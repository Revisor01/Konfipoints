// ChatRoom.js - KOMPLETT ERSETZEN
import React, { useState, useEffect, useRef } from 'react';
import { useIonRouter } from '@ionic/react';
import { ArrowLeft, BarChart3, ArrowDown } from 'lucide-react';
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
import { send, attach, camera, document, image, videocam, chevronDown, arrowBack, barChart } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import MessageBubble from './MessageBubble';
import PollComponent from './PollComponent';
import CreatePollModal from './CreatePollModal';

const ChatRoom = ({ room, roomId, onBack, nav, isInTab = false }) => {
  const { user } = useApp();
  const router = useIonRouter();
  const isAdmin = user?.type === 'admin';
  const [currentRoom, setCurrentRoom] = useState(room);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const messagesEndRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Message input state
  const [message, setMessage] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const textareaRef = useRef(null);
  
  // KEIN useCapacitorKeyboard Hook in ChatRoom - lass Ionic das machen

  useEffect(() => {
    if (!currentRoom && roomId) {
      // Load room from API if not provided
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
  }, [roomId, currentRoom]);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
    }
  }, [currentRoom]);

  // Setup native keyboard behavior for iOS
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Enable native keyboard behavior
      Keyboard.setScroll({ isDisabled: false });
      Keyboard.setResizeMode({ mode: 'native' });
    }
    
    return () => {
      // Reset on unmount
      if (Capacitor.isNativePlatform()) {
        Keyboard.setScroll({ isDisabled: false });
        Keyboard.setResizeMode({ mode: 'native' });
      }
    };
  }, []);

  // Auto-scroll when new messages arrive - only if user is at bottom
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    // Scroll to bottom with proper timing
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    setShowScrollButton(false);
  };

  // Check if user has scrolled up to show scroll button
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
      
      // Nach dem Senden zum Ende scrollen
      scrollToBottom();
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      await api.post(`/chat/rooms/${currentRoom.id}/polls`, pollData);
      setShowCreatePoll(false);
      loadMessages();
    } catch (err) {
      console.error('Poll creation error:', err);
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
  
  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      // Convert dataUrl to File object
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
      
      // Convert dataUrl to File object
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
        
        // Convert the picked file to a File object
        const fileData = pickedFile.data; // base64 data
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

  if (loading || !currentRoom) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="ion-no-border">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <IonBackButton
                  defaultHref="/admin/chat"
                  icon={arrowBack}
                  text=""
                  onClick={() => {
                    if (onBack) {
                      onBack();
                    } else if (nav) {
                      nav.pop();
                    } else {
                      // Native navigation back to chat list
                      if (router.canGoBack()) {
                        router.goBack();
                      } else {
                        router.push('/admin/chat', 'back');
                      }
                    }
                  }}
                  className="text-white/90 hover:text-white"
                />
                
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {getRoomTitle()}
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    {currentRoom.type === 'jahrgang' ? 'Jahrgangs-Chat' : 
                     currentRoom.type === 'admin' ? 'Admin-Support' : 'Direktnachricht'}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="bg-white/20 text-white p-3 rounded-lg hover:bg-white/30 transition-colors"
                    title="Umfrage erstellen"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* CONTENT WITH MESSAGES */}
      <IonContent 
        fullscreen 
        scrollEvents={true} 
        onIonScroll={handleScroll} 
        className="chatroom-content ion-padding ion-padding-bottom"
        forceOverscroll={false}
        scrollX={false}
        scrollY={true}
      >
        <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullFactor={0.5} pullMin={100} pullMax={200}>
          <IonRefresherContent
            pullingIcon={chevronDown}
            pullingText="Zum Aktualisieren ziehen"
            refreshingSpinner="circles"
            refreshingText="Nachrichten werden geladen..."
          ></IonRefresherContent>
        </IonRefresher>
        
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50 py-2 px-4 rounded-lg border border-blue-200"
            >
              {loadingMore ? 'Wird geladen...' : 'Ältere Nachrichten laden'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === user.id}
              showSender={!message.isOwnMessage && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id)}
              onDelete={isAdmin ? () => handleDeleteMessage(message.id) : null}
              formatDate={formatDate}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Scroll to Bottom Button - positioned within IonContent */}
        {showScrollButton && (
          <div style={{ position: 'sticky', bottom: '16px', textAlign: 'right', marginTop: '16px' }}>
            <button
              onClick={scrollToBottom}
              className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              style={{ display: 'inline-block' }}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </IonContent>

      {/* FOOTER WITH INPUT - NATIVE KEYBOARD ATTACH */}
      <IonFooter keyboardAttach className="ion-no-border">
        <IonToolbar className="ion-no-border" style={{ '--min-height': '60px', '--padding-top': '8px', '--padding-bottom': '8px' }}>
          {/* File Preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 mx-4 mt-2 rounded-lg">
              <span className="text-sm">{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-red-500 text-sm ml-auto"
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
              className="ion-no-margin"
            >
              <IonIcon icon={attach} />
            </IonButton>
            
            <IonTextarea
              ref={textareaRef}
              autoGrow={true}
              placeholder="Nachricht schreiben..."
              value={message}
              onIonChange={(e) => setMessage(e.detail.value)}
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
            />
            
            <IonButton 
              slot="end"
              onClick={handleSendMessage}
              disabled={!message.trim() && !attachedFile}
              fill="clear"
              className="ion-no-margin"
            >
              <IonIcon slot="icon-only" icon={send} />
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonFooter>

      {/* Action Sheet for Attachments */}
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
            text: 'Aus Galerie wählen',
            icon: image,
            handler: selectPhoto
          },
          {
            text: 'Datei auswählen',
            icon: document,
            handler: openNativeFilePicker
          },
          {
            text: 'Abbrechen',
            role: 'cancel'
          }
        ]}
      />

      {/* Poll Modal */}
      {showCreatePoll && (
        <CreatePollModal
          show={showCreatePoll}
          onClose={() => setShowCreatePoll(false)}
          onSubmit={handleCreatePoll}
        />
      )}
    </IonPage>
  );
};

export default ChatRoom;
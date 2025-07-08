// ChatRoom.js - KOMPLETT ERSETZEN
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
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
  IonPage
} from '@ionic/react';
import { send, attach, camera, document, image, videocam } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import MessageBubble from './MessageBubble';
import PollComponent from './PollComponent';
import CreatePollModal from './CreatePollModal';

const ChatRoom = ({ room, onBack }) => {
  const { user } = useApp();
  const isAdmin = user?.type === 'admin';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const messagesEndRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Message input state
  const [message, setMessage] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (offset = 0) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);
      
      const response = await api.get(`/chat/rooms/${room.id}/messages?limit=50&offset=${offset}`);
      
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
      
      const response = await api.post(`/chat/rooms/${room.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessages(prev => [...prev, response.data]);
      setMessage('');
      setAttachedFile(null);
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      await api.post(`/chat/rooms/${room.id}/polls`, pollData);
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
    if (room.jahrgang_name) return `Jahrgang ${room.jahrgang_name}`;
    return room.name;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <IonPage>
      {/* HEADER */}
      <IonHeader>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-white/80 hover:text-white p-1"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div>
                <h2 className="text-lg font-bold text-white">
                  {getRoomTitle()}
                </h2>
                <p className="text-sm text-white/80">
                  {room.type === 'jahrgang' ? 'Jahrgangs-Chat' : 
                   room.type === 'admin' ? 'Admin-Support' : 'Direktnachricht'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreatePoll(true)}
                  className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                  title="Umfrage erstellen"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </IonHeader>

      {/* CONTENT WITH MESSAGES */}
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullFactor={0.5} pullMin={100} pullMax={200}>
          <IonRefresherContent
            pullingIcon="chevron-down-circle-outline"
            pullingText="Zum Aktualisieren ziehen"
            refreshingSpinner="circles"
            refreshingText="Nachrichten werden geladen..."
          ></IonRefresherContent>
        </IonRefresher>
        
        <div className="p-4">
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
        </div>
      </IonContent>

      {/* FOOTER WITH INPUT - STICKS TO KEYBOARD! */}
      <IonFooter className="ion-no-border">
        <div className="bg-white border-t border-gray-200 p-4">
          {/* File Preview */}
          {attachedFile && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <span className="text-sm">{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-3 bg-gray-50 rounded-2xl p-2">
            <button
              onClick={() => setShowActionSheet(true)}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <IonIcon icon={attach} className="w-6 h-6" />
            </button>
            
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                rows={1}
                maxLength={1000}
                className="w-full resize-none bg-transparent text-gray-900 placeholder-gray-500 border-none outline-none text-base py-2 px-2"
                style={{
                  fontSize: '16px',
                  minHeight: '40px',
                  maxHeight: '120px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() && !attachedFile}
              className="flex-shrink-0 w-7 h-7 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors flex items-center justify-center"
            >
              <IonIcon icon={send} className="w-3 h-3" />
            </button>
          </div>
        </div>
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
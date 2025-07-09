// MessageBubble.js
import React, { useState } from 'react';
import { Download, Eye, Trash2, Reply, MoreVertical, Share as ShareIcon } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { 
  IonModal, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon 
} from '@ionic/react';
import { close } from 'ionicons/icons';
import api, { API_URL } from '../../services/api';

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  showSender, 
  formatDate,
  onDelete,
  onReply 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Get the correct API URL from the global API_URL
  const getFileUrl = (filePath) => {
    const token = localStorage.getItem('konfi_token');
    if (token) {
      return `${API_URL}/chat/files/${filePath}?token=${token}`;
    }
    return `${API_URL}/chat/files/${filePath}`;
  };

  const formatTime = (timeString) => {
    // Parse the date string properly to handle timezone
    const date = new Date(timeString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Ungültige Zeit';
    }
    
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Berlin' // Explicitly set German timezone
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  const downloadFile = async () => {
    try {
      const response = await fetch(getFileUrl(message.file_path));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const shareMessage = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        if (message.message_type === 'image') {
          // For images, share the image URL
          await Share.share({
            title: 'Bild aus KonfiQuest',
            text: message.content || 'Bild geteilt aus KonfiQuest',
            url: getFileUrl(message.file_path)
          });
        } else if (message.message_type === 'file') {
          // For files, share the file info
          await Share.share({
            title: 'Datei aus KonfiQuest',
            text: `${message.file_name} - ${message.content || 'Datei geteilt aus KonfiQuest'}`
          });
        } else {
          // For text messages
          await Share.share({
            title: 'Nachricht aus KonfiQuest',
            text: message.content
          });
        }
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    } else {
      // Web fallback
      if (navigator.share) {
        navigator.share({
          title: 'Nachricht aus KonfiQuest',
          text: message.content
        });
      } else {
        // Copy to clipboard fallback
        navigator.clipboard.writeText(message.content);
        alert('Nachricht in Zwischenablage kopiert');
      }
    }
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setShowActions(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="max-w-xs">
            {imageLoading && (
              <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gray-400">Lädt...</span>
              </div>
            )}
            <img
              src={getFileUrl(message.file_path)}
              alt={message.file_name}
              className={`max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${imageLoading ? 'hidden' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={() => setShowImageModal(true)}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-2 rounded">
                📎
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{message.file_name}</p>
                <p className="text-xs text-gray-500">
                  {(message.file_size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={downloadFile}
                className="text-blue-500 hover:text-blue-700 p-1"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="max-w-sm">
            <video
              controls
              className="w-full rounded-lg"
              preload="metadata"
            >
              <source src={getFileUrl(message.file_path)} />
              Video wird nicht unterstützt
            </video>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div 
        className={`relative max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
        onClick={() => setShowActions(false)}
      >
        {/* Sender Name */}
        {!isOwnMessage && showSender && (
          <p className="text-xs text-gray-600 mb-1 ml-3">
            {message.sender_name}
          </p>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          {renderMessageContent()}
          
          {/* Time */}
          <p className={`text-xs mt-2 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.created_at)}
          </p>

          {/* Actions */}
          {showActions && (
            <div className={`absolute -top-10 ${isOwnMessage ? 'right-0' : 'left-0'} flex gap-1 bg-white shadow-xl rounded-lg p-2 border z-50`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareMessage();
                  setShowActions(false);
                }}
                className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100"
                title="Teilen"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              {onReply && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                    setShowActions(false);
                  }}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100"
                  title="Antworten"
                >
                  <Reply className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(message.id);
                    setShowActions(false);
                  }}
                  className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100"
                  title="Löschen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal for Fullscreen View */}
      {message.message_type === 'image' && (
        <IonModal isOpen={showImageModal} onDidDismiss={() => setShowImageModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{message.file_name}</IonTitle>
              <IonButtons slot="end">
                <IonButton fill="clear" onClick={() => setShowImageModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent class="ion-padding">
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={getFileUrl(message.file_path)} 
                alt={message.file_name}
                className="max-w-full max-h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </IonContent>
        </IonModal>
      )}
    </div>
  );
};

export default MessageBubble;
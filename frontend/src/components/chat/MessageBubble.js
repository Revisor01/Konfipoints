// MessageBubble.js
import React, { useState } from 'react';
import { Download, Eye, Trash2, Reply, MoreVertical, Share as ShareIcon } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import ImageModal from '../shared/ImageModal';
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
    
    return date.toLocaleString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Share API to let user choose what to do
        const fileUrl = getFileUrl(message.file_path);
        await Share.share({
          title: message.file_name,
          text: `Datei: ${message.file_name}`,
          url: fileUrl
        });
      } else {
        // Web platform - direct download
        const response = await fetch(getFileUrl(message.file_path));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = message.file_name || 'download';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      }
    } catch (err) {
      console.error('Download/Share failed:', err);
      
      // Fallback: try to open in new tab
      try {
        const fileUrl = getFileUrl(message.file_path);
        window.open(fileUrl, '_blank');
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
        alert('Datei konnte nicht geöffnet werden');
      }
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
        const fileExtension = message.file_name?.split('.').pop()?.toLowerCase();
        const isPDF = fileExtension === 'pdf';
        
        const getFileIcon = () => {
          switch (fileExtension) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'xls':
            case 'xlsx': return '📊';
            case 'ppt':
            case 'pptx': return '📽️';
            case 'zip':
            case 'rar': return '🗜️';
            case 'mp4':
            case 'avi':
            case 'mov': return '🎥';
            case 'mp3':
            case 'wav': return '🎵';
            default: return '📎';
          }
        };

        const openFile = () => {
          const fileUrl = getFileUrl(message.file_path);
          window.open(fileUrl, '_blank');
        };

        return (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-2 rounded">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{message.file_name}</p>
                <p className="text-xs text-gray-500">
                  {(message.file_size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <div className="flex gap-1">
                {isPDF && (
                  <button
                    onClick={openFile}
                    className="text-green-500 hover:text-green-700 p-1"
                    title="Anzeigen"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={downloadFile}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title={Capacitor.isNativePlatform() ? "Teilen" : "Herunterladen"}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
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
        className={`relative max-w-[85%] ${isOwnMessage ? 'order-1' : 'order-2'}`}
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
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl={getFileUrl(message.file_path)}
          alt={message.file_name}
          title={message.file_name}
          showControls={true}
        />
      )}
    </div>
  );
};

export default MessageBubble;
// MessageBubble.js
import React, { useState } from 'react';
import { 
  IonCard,
  IonButton,
  IonIcon,
  IonSpinner,
  useIonActionSheet
} from '@ionic/react';
import { 
  download, 
  eye, 
  trash, 
  arrowUndo, 
  shareOutline 
} from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import ImageModal from '../shared/ImageModal';
import { API_URL } from '../../services/api';

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  showSender, 
  formatDate,
  onDelete,
  onReply 
}) => {
  const [presentActionSheet] = useIonActionSheet();
  const [imageLoading, setImageLoading] = useState(true);
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

  const presentMessageActions = () => {
    const buttons = [
      {
        text: 'Teilen',
        icon: shareOutline,
        handler: shareMessage
      }
    ];
    
    if (onReply) {
      buttons.push({
        text: 'Antworten',
        icon: arrowUndo,
        handler: () => onReply(message)
      });
    }
    
    if (onDelete) {
      buttons.push({
        text: 'Löschen',
        icon: trash,
        role: 'destructive',
        handler: () => onDelete(message.id)
      });
    }
    
    buttons.push({
      text: 'Abbrechen',
      role: 'cancel'
    });
    
    presentActionSheet({
      header: 'Nachricht',
      buttons
    });
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div style={{ maxWidth: '240px' }}>
            {imageLoading && (
              <div style={{
                width: '100%',
                height: '192px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IonSpinner name="crescent" color="medium" />
              </div>
            )}
            <img
              src={getFileUrl(message.file_path)}
              alt={message.file_name}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                cursor: 'pointer',
                display: imageLoading ? 'none' : 'block'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={() => setShowImageModal(true)}
            />
            {message.content && (
              <p style={{
                marginTop: '8px',
                fontSize: '0.875rem',
                margin: '8px 0 0 0'
              }}>{message.content}</p>
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
          <IonCard style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            maxWidth: '240px',
            margin: '0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '1rem'
              }}>
                {getFileIcon()}
              </div>
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: '0'
                }}>{message.file_name}</p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '2px 0 0 0'
                }}>
                  {(message.file_size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '4px'
              }}>
                {isPDF && (
                  <IonButton
                    onClick={openFile}
                    fill="clear"
                    size="small"
                    style={{ '--color': '#10b981' }}
                  >
                    <IonIcon icon={eye} />
                  </IonButton>
                )}
                <IonButton
                  onClick={downloadFile}
                  fill="clear"
                  size="small"
                  style={{ '--color': '#3b82f6' }}
                >
                  <IonIcon icon={download} />
                </IonButton>
              </div>
            </div>
            {message.content && (
              <p style={{
                marginTop: '8px',
                fontSize: '0.875rem',
                margin: '8px 0 0 0'
              }}>{message.content}</p>
            )}
          </IonCard>
        );

      case 'video':
        return (
          <div style={{ maxWidth: '320px' }}>
            <video
              controls
              style={{
                width: '100%',
                borderRadius: '8px'
              }}
              preload="metadata"
            >
              <source src={getFileUrl(message.file_path)} />
              Video wird nicht unterstützt
            </video>
            {message.content && (
              <p style={{
                marginTop: '8px',
                fontSize: '0.875rem',
                margin: '8px 0 0 0'
              }}>{message.content}</p>
            )}
          </div>
        );

      default:
        return (
          <p style={{
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: '0'
          }}>
            {message.content}
          </p>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      marginBottom: '8px'
    }}>
      <div 
        style={{
          position: 'relative',
          maxWidth: '85%'
        }}
        onClick={presentMessageActions}
      >
        {/* Sender Name */}
        {!isOwnMessage && showSender && (
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '4px',
            marginLeft: '12px',
            margin: '0 0 4px 12px'
          }}>
            {message.sender_name}
          </p>
        )}

        {/* Message Bubble */}
        <IonCard
          style={{
            position: 'relative',
            padding: '12px 16px',
            borderRadius: '16px',
            backgroundColor: isOwnMessage ? '#3b82f6' : '#f3f4f6',
            color: isOwnMessage ? 'white' : '#1f2937',
            borderBottomRightRadius: isOwnMessage ? '4px' : '16px',
            borderBottomLeftRadius: isOwnMessage ? '16px' : '4px',
            margin: '0',
            '--box-shadow': 'none'
          }}
        >
          {renderMessageContent()}
          
          {/* Time */}
          <p style={{
            fontSize: '0.75rem',
            marginTop: '8px',
            color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#6b7280',
            margin: '8px 0 0 0'
          }}>
            {formatTime(message.created_at)}
          </p>
        </IonCard>
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
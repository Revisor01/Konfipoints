// MessageInput.js
import React, { useState, useRef } from 'react';
import { 
  IonButton,
  IonIcon,
  IonTextarea,
  IonCard,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  useIonActionSheet
} from '@ionic/react';
import { 
  send, 
  attach, 
  camera, 
  close, 
  image, 
  document, 
  videocam 
} from 'ionicons/icons';

const MessageInput = ({ onSendMessage, user, room }) => {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [presentActionSheet] = useIonActionSheet();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim() && !attachedFile) return;

    const formData = new FormData();
    if (message.trim()) {
      formData.append('content', message.trim());
    }
    if (attachedFile) {
      formData.append('file', attachedFile);
    }

    await onSendMessage(formData);
    setMessage('');
    setAttachedFile(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (file, type) => {
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('Datei zu groß (max. 10MB)');
        return;
      }
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const presentAttachmentActions = () => {
    presentActionSheet({
      header: 'Anhang hinzufügen',
      buttons: [
        {
          text: 'Bild wählen',
          icon: image,
          handler: () => imageInputRef.current?.click()
        },
        {
          text: 'Video wählen',
          icon: videocam,
          handler: () => videoInputRef.current?.click()
        },
        {
          text: 'Datei wählen',
          icon: document,
          handler: () => fileInputRef.current?.click()
        },
        {
          text: 'Abbrechen',
          role: 'cancel'
        }
      ]
    });
  };

  const getFilePreview = () => {
    if (!attachedFile) return null;

    const isImage = attachedFile.type.startsWith('image/');
    const isVideo = attachedFile.type.startsWith('video/');

    if (isImage) {
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={URL.createObjectURL(attachedFile)}
            alt="Preview"
            style={{
              height: '80px',
              width: '80px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <IonButton
            onClick={removeAttachment}
            fill="solid"
            shape="round"
            size="small"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              '--background': '#ef4444',
              width: '24px',
              height: '24px',
              '--border-radius': '50%'
            }}
          >
            <IonIcon icon={close} style={{ fontSize: '12px' }} />
          </IonButton>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <video
            src={URL.createObjectURL(attachedFile)}
            style={{
              height: '80px',
              width: '80px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            muted
          />
          <IonButton
            onClick={removeAttachment}
            fill="solid"
            shape="round"
            size="small"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              '--background': '#ef4444',
              width: '24px',
              height: '24px',
              '--border-radius': '50%'
            }}
          >
            <IonIcon icon={close} style={{ fontSize: '12px' }} />
          </IonButton>
        </div>
      );
    }

    return (
      <IonCard style={{
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0'
      }}>
        <IonIcon icon={document} style={{ fontSize: '20px', color: '#6b7280' }} />
        <span style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '128px'
        }}>
          {attachedFile.name}
        </span>
        <IonButton
          onClick={removeAttachment}
          fill="clear"
          size="small"
          style={{
            '--color': '#ef4444',
            marginLeft: 'auto'
          }}
        >
          <IonIcon icon={close} />
        </IonButton>
      </IonCard>
    );
  };

  return (
    <div style={{ padding: '16px', backgroundColor: 'white' }}>
      {/* File Preview */}
      {attachedFile && (
        <div style={{ marginBottom: '12px' }}>
          {getFilePreview()}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px'
      }}>
        {/* Attachment Button */}
        <IonButton
          onClick={presentAttachmentActions}
          fill="clear"
          style={{
            '--color': '#6b7280',
            '--background-hover': '#f3f4f6',
            '--border-radius': '50%',
            width: '48px',
            height: '48px'
          }}
        >
          <IonIcon icon={attach} />
        </IonButton>
        
        {/* Message Input */}
        <div style={{ flex: 1 }}>
          <IonTextarea
            value={message}
            onIonInput={(e) => setMessage(e.detail.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nachricht schreiben..."
            autoGrow={true}
            rows={1}
            maxlength={1000}
            style={{
              '--border-color': '#d1d5db',
              '--border-radius': '16px',
              '--background': 'white',
              '--padding-start': '16px',
              '--padding-end': '16px',
              '--padding-top': '12px',
              '--padding-bottom': '12px',
              fontSize: '16px', // Verhindert Zoom auf iOS
              minHeight: '48px'
            }}
          />
        </div>
        
        {/* Send Button */}
        <IonButton
          onClick={handleSend}
          disabled={!message.trim() && !attachedFile}
          fill="solid"
          shape="round"
          style={{
            '--background': '#3b82f6',
            '--background-hover': '#2563eb',
            '--color': 'white',
            width: '48px',
            height: '48px'
          }}
        >
          <IonIcon icon={send} />
        </IonButton>
      </div>
      
      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0], 'image')}
        style={{ display: 'none' }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileSelect(e.target.files[0], 'video')}
        style={{ display: 'none' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={(e) => handleFileSelect(e.target.files[0], 'file')}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MessageInput;
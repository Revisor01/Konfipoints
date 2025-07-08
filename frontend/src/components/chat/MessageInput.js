// MessageInput.js
import React, { useState, useRef } from 'react';
import { Send, Paperclip, Camera, X, Image, FileText, Video } from 'lucide-react';

const MessageInput = ({ onSendMessage, user, room }) => {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
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
    setShowAttachMenu(false);
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
      setShowAttachMenu(false);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const getFilePreview = () => {
    if (!attachedFile) return null;

    const isImage = attachedFile.type.startsWith('image/');
    const isVideo = attachedFile.type.startsWith('video/');

    if (isImage) {
      return (
        <div className="relative inline-block">
          <img
            src={URL.createObjectURL(attachedFile)}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg"
          />
          <button
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="relative inline-block">
          <video
            src={URL.createObjectURL(attachedFile)}
            className="h-20 w-20 object-cover rounded-lg"
            muted
          />
          <button
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium truncate max-w-32">
          {attachedFile.name}
        </span>
        <button
          onClick={removeAttachment}
          className="text-red-500 hover:text-red-700 ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
      <div className="p-4 bg-white">
      {/* File Preview */}
      {attachedFile && (
        <div className="mb-3">
        {getFilePreview()}
        </div>
      )}
      
      <div className="flex items-end gap-3">
      {/* Attachment Menu */}
      <div className="relative">
      <button
      onClick={() => setShowAttachMenu(!showAttachMenu)}
      className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
      >
      <Paperclip className="w-5 h-5" />
      </button>
      
      {showAttachMenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-1 min-w-48">
        <button
        onClick={() => {
          imageInputRef.current?.click();
          setShowAttachMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
        >
        <Image className="w-5 h-5 text-blue-500" />
        Bild wählen
        </button>
        <button
        onClick={() => {
          videoInputRef.current?.click();
          setShowAttachMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
        >
        <Video className="w-5 h-5 text-green-500" />
        Video wählen
        </button>
        <button
        onClick={() => {
          fileInputRef.current?.click();
          setShowAttachMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
        >
        <FileText className="w-5 h-5 text-purple-500" />
        Datei wählen
        </button>
        </div>
      )}
      </div>
      
      {/* Message Input */}
      <div className="flex-1">
      <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Nachricht schreiben..."
      className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      rows="1"
      style={{
        minHeight: '48px',
        maxHeight: '120px',
        overflow: 'auto',
        fontSize: '16px' // Verhindert Zoom auf iOS
      }}
      />
      </div>
      
      {/* Send Button */}
      <button
      onClick={handleSend}
      disabled={!message.trim() && !attachedFile}
      className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      style={{ minHeight: '48px', minWidth: '48px' }}
      >
      <Send className="w-5 h-5" />
      </button>
      </div>
      
      {/* Hidden File Inputs */}
      <input
      ref={imageInputRef}
      type="file"
      accept="image/*"
      onChange={(e) => handleFileSelect(e.target.files[0], 'image')}
      className="hidden"
      />
      <input
      ref={videoInputRef}
      type="file"
      accept="video/*"
      onChange={(e) => handleFileSelect(e.target.files[0], 'video')}
      className="hidden"
      />
      <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      onChange={(e) => handleFileSelect(e.target.files[0], 'file')}
      className="hidden"
      />
      </div>
    );
    };

export default MessageInput;
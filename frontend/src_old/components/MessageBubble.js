// MessageBubble.js
import React, { useState } from 'react';
import { Download, Eye, Trash2, Reply, MoreVertical } from 'lucide-react';

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

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/files/${message.file_path}`);
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
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/files/${message.file_path}`}
              alt={message.file_name}
              className={`max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${imageLoading ? 'hidden' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={() => {
                // Open in full screen
                const img = new Image();
                img.src = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/files/${message.file_path}`;
                const newWindow = window.open();
                newWindow.document.write(`<img src="${img.src}" style="max-width:100%;height:auto;" />`);
              }}
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
              <source src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/files/${message.file_path}`} />
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
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
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
          {showActions && (onDelete || onReply) && (
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 transform -translate-x-full' : 'right-0 transform translate-x-full'} flex gap-1 bg-white shadow-lg rounded-lg p-1`}>
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="text-gray-600 hover:text-blue-600 p-1"
                  title="Antworten"
                >
                  <Reply className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="text-gray-600 hover:text-red-600 p-1"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
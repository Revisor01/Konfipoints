// ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Paperclip, Camera, BarChart3, MoreVertical, Trash2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import PollComponent from './PollComponent';
import CreatePollModal from './CreatePollModal';

const ChatRoom = ({ 
  room, 
  user, 
  api, 
  onBack, 
  showSuccessToast, 
  showErrorToast,
  formatDate,
  isAdmin 
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const messagesEndRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
      showErrorToast('Fehler beim Laden der Nachrichten');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      const response = await api.post(`/chat/rooms/${room.id}/messages`, messageData, {
        headers: messageData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      
      setMessages(prev => [...prev, response.data]);
      showSuccessToast('Nachricht gesendet!');
    } catch (err) {
      showErrorToast('Fehler beim Senden der Nachricht');
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      await api.post(`/chat/rooms/${room.id}/polls`, pollData);
      setShowCreatePoll(false);
      loadMessages(); // Refresh to show new poll
      showSuccessToast('Umfrage erstellt!');
    } catch (err) {
      showErrorToast('Fehler beim Erstellen der Umfrage');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Nachricht wirklich löschen?')) return;
    
    try {
      await api.delete(`/chat/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      showSuccessToast('Nachricht gelöscht');
    } catch (err) {
      showErrorToast('Fehler beim Löschen der Nachricht');
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      loadMessages(messages.length);
    }
  };

  const getRoomTitle = () => {
    if (room.jahrgang_name) return `Jahrgang ${room.jahrgang_name}`;
    return room.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {getRoomTitle()}
              </h2>
              <p className="text-sm text-gray-600">
                {room.type === 'jahrgang' ? 'Jahrgangs-Chat' : 
                 room.type === 'admin' ? 'Admin-Support' : 'Direktnachricht'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreatePoll(true)}
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                title="Umfrage erstellen"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loadingMore ? 'Lade...' : 'Ältere Nachrichten laden'}
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwnMessage = message.user_id === user.id && message.user_type === user.type;
          const showSender = index === 0 || 
            messages[index - 1].user_id !== message.user_id || 
            messages[index - 1].user_type !== message.user_type;

          if (message.message_type === 'poll') {
            return (
              <PollComponent
                key={message.id}
                message={message}
                user={user}
                api={api}
                isOwnMessage={isOwnMessage}
                showSender={showSender}
                formatDate={formatDate}
                onDelete={isAdmin || isOwnMessage ? () => handleDeleteMessage(message.id) : null}
              />
            );
          }

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={isOwnMessage}
              showSender={showSender}
              formatDate={formatDate}
              onDelete={isAdmin || isOwnMessage ? () => handleDeleteMessage(message.id) : null}
            />
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        user={user}
        room={room}
      />

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <CreatePollModal
          show={showCreatePoll}
          onClose={() => setShowCreatePoll(false)}
          onCreatePoll={handleCreatePoll}
          showErrorToast={showErrorToast}
        />
      )}
    </div>
  );
};

export default ChatRoom;
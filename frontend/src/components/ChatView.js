// ChatView.js
import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Plus, Settings, Search, Bell, BellOff } from 'lucide-react';
import ChatRoom from './ChatRoom';
import CreateChatModal from './CreateChatModal';

const ChatView = ({ 
  user, 
  api, 
  showSuccessToast, 
  showErrorToast,
  formatDate,
  isAdmin = false 
}) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showAdminContact, setShowAdminContact] = useState(false);

  useEffect(() => {
    loadRooms();
    loadUnreadCounts();
    // Poll for new messages every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCounts();
      if (selectedRoom) {
        // Refresh current room
        loadRooms();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      setRooms(response.data);
    } catch (err) {
      showErrorToast('Fehler beim Laden der Chats');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const response = await api.get('/chat/unread-counts');
      setUnreadCounts(response.data);
    } catch (err) {
      console.error('Error loading unread counts:', err);
    }
  };

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    
    // Mark as read
    try {
      await api.put(`/chat/rooms/${room.id}/read`);
      // Update unread count locally
      setUnreadCounts(prev => ({
        ...prev,
        [room.id]: 0
      }));
    } catch (err) {
      console.error('Error marking room as read:', err);
    }
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    loadRooms(); // Refresh room list
    loadUnreadCounts();
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.last_message && room.last_message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedRoom) {
    return (
      <ChatRoom
        room={selectedRoom}
        user={user}
        api={api}
        onBack={handleBackToRooms}
        showSuccessToast={showSuccessToast}
        showErrorToast={showErrorToast}
        formatDate={formatDate}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Chat
          </h1>
          
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                title="Neuen Chat erstellen"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Chats durchsuchen..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Chats gefunden</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-500 hover:text-blue-700 mt-2 text-sm"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRooms.map(room => (
              <ChatRoomItem
                key={room.id}
                room={room}
                unreadCount={unreadCounts[room.id] || 0}
                onClick={() => handleRoomSelect(room)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          user={user}
          api={api}
          onChatCreated={() => {
            setShowCreateModal(false);
            loadRooms();
            showSuccessToast('Chat erstellt!');
          }}
          showErrorToast={showErrorToast}
        />
      )}

      {/* Admin Contact Modal */}
      {showAdminContact && (
        <AdminContactModal
          show={showAdminContact}
          onClose={() => setShowAdminContact(false)}
          api={api}
          onSelectAdmin={(roomId) => {
            setShowAdminContact(false);
            // Find and select the room
            const room = rooms.find(r => r.id === roomId);
            if (room) handleRoomSelect(room);
          }}
        />
      )}
    </div>
  );
};

// KORRIGIERTE AdminContactModal mit api prop
const AdminContactModal = ({ show, onClose, api, onSelectAdmin }) => {
  const [admins, setAdmins] = useState([]);
  
  useEffect(() => {
    if (show) {
      api.get('/chat/admins').then(res => setAdmins(res.data));
    }
  }, [show, api]);
  
  const handleSelectAdmin = async (admin) => {
    try {
      const response = await api.post('/chat/direct', {
        target_user_id: admin.id,
        target_user_type: 'admin'
      });
      onSelectAdmin(response.data.room_id);
      onClose();
    } catch (err) {
      console.error('Error creating direct chat:', err);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">Admin kontaktieren</h3>
        <div className="space-y-2">
          {admins.map(admin => (
            <button
              key={admin.id}
              onClick={() => handleSelectAdmin(admin)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-100 border"
            >
              <div className="font-medium">{admin.display_name}</div>
              <div className="text-sm text-gray-600">@{admin.username}</div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
};

// Room Item Component
const ChatRoomItem = ({ room, unreadCount, onClick, formatDate }) => {
  const getRoomIcon = () => {
    if (room.type === 'jahrgang') return '👥';
    if (room.type === 'admin') return '⚙️';
    return '💬';
  };

  const formatLastMessageTime = (timeString) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'Jetzt' : `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d`;
    } else {
      return formatDate(timeString).split(' ')[0]; // Just date
    }
  };

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors bg-white"
    >
      <div className="flex items-center gap-3">
        {/* Room Icon */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
          {getRoomIcon()}
        </div>

        {/* Room Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 truncate">
              {room.jahrgang_name ? `Jahrgang ${room.jahrgang_name}` : room.name}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {room.last_message_time && (
                <span className="text-xs text-gray-500">
                  {formatLastMessageTime(room.last_message_time)}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
          
          {room.last_message && (
            <p className="text-sm text-gray-600 truncate">
              {room.last_message}
            </p>
          )}
          
          {!room.last_message && (
            <p className="text-sm text-gray-400 italic">
              Noch keine Nachrichten
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
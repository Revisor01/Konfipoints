// ChatView.js
import React, { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import { MessageSquare, Users, Plus, Settings, Search, Bell, BellOff, MessageCircle, Clock, UserPlus, Calendar, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import CreateChatModal from './CreateChatModal';
import { ADMIN_NAV_ITEMS } from '../../utils/constants';

const ChatView = ({ onNavigate }) => {
  const { user, setSuccess, setError } = useApp();
  const router = useIonRouter();
  const isAdmin = user?.type === 'admin';
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showAdminContact, setShowAdminContact] = useState(false);
  
  const iconMap = {
    MessageSquare,
    Clock,
    UserPlus,
    Calendar,
    Award,
    Settings
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || MessageSquare;
  };

  useEffect(() => {
    loadRooms();
    loadUnreadCounts();
    // Poll for new messages every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCounts();
      loadRooms();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      setRooms(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Chats');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const response = await api.get('/chat/unread-counts');
      setUnreadCounts(prev => {
        // Preserve local state for rooms that were manually marked as read
        const newCounts = { ...response.data };
        Object.keys(prev).forEach(roomId => {
          if (prev[roomId] === 0) {
            // Keep the local 0 count if user marked it as read
            newCounts[roomId] = 0;
          }
        });
        return newCounts;
      });
    } catch (err) {
      console.error('Error loading unread counts:', err);
    }
  };

  const handleRoomSelect = async (room) => {
    // Mark as read
    try {
      console.log('Marking room as read:', room.id, room.type, room.name);
      await api.put(`/chat/rooms/${room.id}/read`);
      // Update unread count locally
      setUnreadCounts(prev => {
        console.log('Updating unread counts for room:', room.id, 'from', prev[room.id], 'to 0');
        return {
          ...prev,
          [room.id]: 0
        };
      });
    } catch (err) {
      console.error('Error marking room as read:', err);
    }
    
    // Navigate to chat room using router
    router.push(`/chat/${room.id}`, 'forward', { room });
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.last_message && room.last_message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {/* Header Card - Add mb-4 for spacing */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            <h2 className="text-xl font-bold">Chat</h2>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                title="Neuen Chat erstellen"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            
            {!isAdmin && (
              <button
                onClick={() => setShowAdminContact(true)}
                className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                title="Admin kontaktieren"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Chats durchsuchen..."
            className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/60 rounded-lg focus:bg-white/30 transition-colors"
          />
        </div>
      </div>

      {/* Chat Liste */}
      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 px-4">
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
    
    {/* Modals */}
    {showCreateModal && (
      <CreateChatModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChatCreated={() => {
          setShowCreateModal(false);
          loadRooms();
          setSuccess('Chat erstellt!');
        }}
      />
    )}
    
    {showAdminContact && (
      <AdminContactModal
        show={showAdminContact}
        onClose={() => setShowAdminContact(false)}
        onSelectAdmin={(roomId) => {
          setShowAdminContact(false);
          // Find room by ID and navigate
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            router.push(`/chat/${roomId}`, 'forward', { room });
          }
        }}
      />
    )}
    </>
  );
};

const AdminContactModal = ({ show, onClose, onSelectAdmin }) => {
  const [admins, setAdmins] = useState([]);
  
  useEffect(() => {
    if (show) {
      api.get('/chat/admins').then(res => setAdmins(res.data));
    }
  }, [show]);
  
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
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
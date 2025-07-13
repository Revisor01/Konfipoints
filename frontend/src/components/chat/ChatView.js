// ChatView.js
import React, { useState, useEffect } from 'react';
import { 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonBadge,
  IonList,
  IonSearchbar,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonPage,
  useIonRouter
} from '@ionic/react';
import { 
  add, 
  chatbubbles, 
  people, 
  settings, 
  search, 
  notifications, 
  time,
  person,
  calendar,
  trophy
} from 'ionicons/icons';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import CreateChatModal from './CreateChatModal';

const ChatView = ({ onNavigate }) => {
  const { user, setSuccess, setError } = useApp();
  const router = useIonRouter();
  const pageRef = React.useRef(null);
  const isAdmin = user?.type === 'admin';
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showAdminContact, setShowAdminContact] = useState(false);

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
      await api.put(`/chat/rooms/${room.id}/read`);
      // Update unread count locally
      setUnreadCounts(prev => ({
        ...prev,
        [room.id]: 0
      }));
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

  const doRefresh = async (event) => {
    await loadRooms();
    await loadUnreadCounts();
    event.detail.complete();
  };

  return (
    <IonPage ref={pageRef}>
      <IonHeader style={{ '--min-height': '0px' }}>
        <IonToolbar style={{ '--min-height': '0px', '--padding-top': '0px', '--padding-bottom': '0px' }}>
          <IonTitle style={{ display: 'none' }}>Chat</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-gradient-background" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

      {/* Header Card */}
      <IonCard
        style={{
          '--background': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          '--color': 'white',
          margin: '16px',
          borderRadius: '16px',
          width: 'calc(100% - 32px)',
          '--box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}
      >
        <IonCardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IonIcon icon={chatbubbles} style={{ fontSize: '2rem' }} />
              <IonCardTitle style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white'
              }}>
                Chat
              </IonCardTitle>
            </div>
            
            {isAdmin && (
              <IonButton 
                fill="clear" 
                onClick={() => setShowCreateModal(true)}
                style={{
                  '--color': 'white',
                  '--background': 'rgba(255,255,255,0.2)',
                  '--border-radius': '8px',
                  margin: '0'
                }}
              >
                <IonIcon icon={add} style={{ fontSize: '20px' }} />
              </IonButton>
            )}
            
            {!isAdmin && (
              <IonButton 
                fill="clear" 
                onClick={() => setShowAdminContact(true)}
                style={{
                  '--color': 'white',
                  '--background': 'rgba(255,255,255,0.2)',
                  '--border-radius': '8px',
                  width: '40px',
                  height: '40px',
                  margin: '0'
                }}
              >
                <IonIcon icon={chatbubbles} style={{ fontSize: '20px' }} />
              </IonButton>
            )}
          </div>
        </IonCardHeader>
        <IonCardContent>
          <div style={{ 
            '--background': 'rgba(255,255,255,0.2)', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            overflow: 'hidden'
          }}>
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value)}
              placeholder="Chats durchsuchen..."
              showClearButton="focus"
              style={{ 
                '--background': 'transparent',
                '--color': 'white',
                '--placeholder-color': 'rgba(255,255,255,0.7)',
                '--border-radius': '0px',
                '--box-shadow': 'none',
                margin: '0',
                padding: '0'
              }}
            />
          </div>
        </IonCardContent>
      </IonCard>

      {/* Chat Liste */}
      <IonCard style={{
        margin: '16px',
        borderRadius: '12px',
        width: 'calc(100% - 32px)'
      }}>
        <IonCardHeader style={{ paddingBottom: '8px' }}>
          <h3 style={{ 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: '0',
            fontSize: '1.125rem'
          }}>
            Chats ({filteredRooms.length})
          </h3>
        </IonCardHeader>
        
        <div style={{ padding: '0 16px 16px' }}>
          {filteredRooms.map(room => (
            <IonCard 
              key={room.id}
              button
              onClick={() => handleRoomSelect(room)}
              style={{
                '--background': unreadCounts[room.id] > 0 ? '#eff6ff' : '#ffffff',
                '--box-shadow': unreadCounts[room.id] > 0 ? '0 2px 8px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                margin: '0 0 12px 0',
                borderRadius: '16px',
                border: unreadCounts[room.id] > 0 ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {/* Chat Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: room.type === 'jahrgang' ? '#10b981' : room.type === 'group' ? '#8b5cf6' : '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IonIcon 
                    icon={room.type === 'jahrgang' ? people : chatbubbles} 
                    style={{ 
                      fontSize: '24px', 
                      color: 'white' 
                    }} 
                  />
                </div>
                
                {/* Chat Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h2 style={{
                      fontWeight: '600',
                      fontSize: '1.125rem',
                      margin: '0',
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {room.name}
                    </h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                      {room.last_message_at && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatDate(room.last_message_at)}
                        </span>
                      )}
                      {unreadCounts[room.id] > 0 && (
                        <IonBadge 
                          color="primary" 
                          style={{
                            '--background': '#3b82f6',
                            '--color': 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          {unreadCounts[room.id]}
                        </IonBadge>
                      )}
                    </div>
                  </div>
                  
                  {room.last_message && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      margin: '0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.3'
                    }}>
                      {room.last_message}
                    </p>
                  )}
                  
                  {/* Chat Type Badge */}
                  {room.type && (
                    <div style={{ marginTop: '6px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        color: room.type === 'jahrgang' ? '#10b981' : room.type === 'group' ? '#8b5cf6' : '#3b82f6',
                        backgroundColor: room.type === 'jahrgang' ? '#ecfdf5' : room.type === 'group' ? '#f3e8ff' : '#eff6ff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {room.type === 'jahrgang' ? 'Jahrgang' : room.type === 'group' ? 'Gruppe' : 'Chat'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </IonCard>
          ))}
          
          {filteredRooms.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              color: '#9ca3af'
            }}>
              <IonIcon
                icon={chatbubbles}
                style={{
                  fontSize: '4rem',
                  opacity: 0.3,
                  marginBottom: '1rem',
                  display: 'block'
                }}
              />
              <p style={{
                fontSize: '1rem',
                margin: 0,
                fontWeight: '500'
              }}>
                {searchTerm ? 'Keine Chats gefunden' : 'Noch keine Chats vorhanden'}
              </p>
              {searchTerm && (
                <IonButton 
                  fill="clear" 
                  size="small"
                  onClick={() => setSearchTerm('')}
                  style={{ marginTop: '8px' }}
                >
                  Filter zurücksetzen
                </IonButton>
              )}
            </div>
          )}
        </div>
      </IonCard>
    
    {/* Modals */}
    <IonModal 
      isOpen={showCreateModal} 
      onDidDismiss={() => setShowCreateModal(false)}
      presentingElement={pageRef.current || undefined}
      canDismiss={true}
      backdropDismiss={true}
    >
      <CreateChatModal
        onClose={() => setShowCreateModal(false)}
        onChatCreated={() => {
          setShowCreateModal(false);
          loadRooms();
          setSuccess('Chat erstellt!');
        }}
        loading={createLoading}
      />
    </IonModal>
    
    <IonModal 
      isOpen={showAdminContact} 
      onDidDismiss={() => setShowAdminContact(false)}
    >
      <AdminContactModal
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
    </IonModal>
      </IonContent>
    </IonPage>
  );
};

const AdminContactModal = ({ onClose, onSelectAdmin }) => {
  const [admins, setAdmins] = useState([]);
  
  useEffect(() => {
    api.get('/chat/admins').then(res => setAdmins(res.data));
  }, []);
  
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
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin kontaktieren</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>Abbrechen</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {admins.map(admin => (
            <IonItem
              key={admin.id}
              button
              onClick={() => handleSelectAdmin(admin)}
            >
              <IonLabel>
                <h2>{admin.display_name}</h2>
                <p>@{admin.username}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};


export default ChatView;
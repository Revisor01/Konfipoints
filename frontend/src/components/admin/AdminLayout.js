import React, { useState, useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import KonfisView from './KonfisView';
import KonfiDetailView from './KonfiDetailView';
import BadgesView from './BadgesView';
import ActivitiesView from './ActivitiesView';
import MoreView from './MoreView';
import ChatView from '../chat/ChatView';
import { ADMIN_NAV_ITEMS } from '../../utils/constants';
import { useRef } from 'react';
import { useCapacitorKeyboard } from '../../hooks/useCapacitorKeyboard';
import { useCapacitorSwipe } from '../../hooks/useCapacitorSwipe';
import {
  MessageSquare, Clock, UserPlus, Calendar, Award, Settings
} from 'lucide-react';

const AdminLayout = () => {
  const { user, setError } = useApp();
  const [currentView, setCurrentView] = useState('konfis');
  const [loading, setLoading] = useState(true);
  const [selectedKonfi, setSelectedKonfi] = useState(null);
  const [notifications, setNotifications] = useState({});

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

  const [konfis, setKonfis] = useState([]);
  const [activities, setActivities] = useState([]);
  const [jahrgaenge, setJahrgaenge] = useState([]);
  const [badges, setBadges] = useState([]);
  const [settings, setSettings] = useState({});
  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        konfisRes,
        activitiesRes,
        jahrgaengeRes,
        badgesRes,
        settingsRes,
        requestsRes
      ] = await Promise.all([
        api.get('/konfis'),
        api.get('/activities'),
        api.get('/jahrgaenge'),
        api.get('/badges'),
        api.get('/settings'),
        api.get('/activity-requests')
      ]);

      setKonfis(konfisRes.data);
      setActivities(activitiesRes.data);
      setJahrgaenge(jahrgaengeRes.data);
      setBadges(badgesRes.data);
      setSettings(settingsRes.data);
      setRequests(requestsRes.data);

      const pendingRequests = requestsRes.data.filter(r => r.status === 'pending').length;
      setNotifications({ requests: pendingRequests });
    } catch (err) {
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const containerRef = useRef(null);

  useCapacitorKeyboard();
  useCapacitorSwipe(() => {
    if (selectedKonfi) {
      setSelectedKonfi(null);
    }
  }, loadData);

  useEffect(() => {
    loadData();
  }, []);

  const handleViewChange = (view) => {
    if (view === 'konfis' && selectedKonfi) {
      setSelectedKonfi(null);
    }
    
    setCurrentView(view);
    
    // Scroll nur nach oben wenn NICHT im Chat (IonPage)
    if (view !== 'chat') {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
        window.scrollTo(0, 0);
      }, 10);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (selectedKonfi && currentView === 'konfis') {
      return (
        <KonfiDetailView
          konfi={selectedKonfi}
          onBack={() => setSelectedKonfi(null)}
          activities={activities}
          settings={settings}
          onUpdate={loadData}
        />
      );
    }

    switch (currentView) {
      case 'konfis':
        return (
          <KonfisView
            konfis={konfis}
            jahrgaenge={jahrgaenge}
            settings={settings}
            onSelectKonfi={setSelectedKonfi}
            onUpdate={loadData}
          />
        );

      case 'chat':
        return <ChatView onNavigate={handleViewChange} />;

      case 'activities':
        return (
          <ActivitiesView
            activities={activities}
            onUpdate={loadData}
          />
        );

      case 'badges':
        return (
          <BadgesView
            badges={badges}
            activities={activities}
            onUpdate={loadData}
          />
        );

      case 'settings':
        return (
          <MoreView
            settings={settings}
            jahrgaenge={jahrgaenge}
            requests={requests}
            konfis={konfis}
            onUpdate={loadData}
            notifications={notifications}
          />
        );

      default:
        return (
          <KonfisView
            konfis={konfis}
            jahrgaenge={jahrgaenge}
            settings={settings}
            onSelectKonfi={setSelectedKonfi}
            onUpdate={loadData}
          />
        );
    }
  };

  // Chat wird über renderContent() gehandelt - NICHT hier

  // Normale AdminLayout für andere Seiten
  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Fixed Header - nur Status Bar */}
      <div 
        className="fixed top-0 left-0 right-0 bg-white z-50"
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          height: 'env(safe-area-inset-top)'
        }}
      ></div>
      
      {/* Scrollable Content für normale Seiten */}
      <div 
        className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50"
        style={{ 
          marginTop: 'env(safe-area-inset-top)',
          paddingBottom: `calc(83px + env(safe-area-inset-bottom) + 20px)`,
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
        ref={containerRef}
      >
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </div>

      {/* Tab Bar - für alle Seiten */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white shadow z-[70]"
        data-tab-bar="true" 
        style={{ 
          height: `calc(83px + env(safe-area-inset-bottom))`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          borderTop: '0.5px solid #c7c7cc',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(248, 248, 248, 0.92)',
          position: 'fixed'
        }}
      >
        <div 
          className="flex justify-around items-center pt-2 pb-1 px-2"
          style={{
            pointerEvents: 'auto',
            touchAction: 'manipulation'
          }}
        >
          {ADMIN_NAV_ITEMS.map(({ id, label, icon: iconName }) => {
            const Icon = getIconComponent(iconName);
            const isActive = currentView === id;
            const showBadge = id === 'settings' && notifications.requests > 0;

            return (
              <button
                key={id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewChange(id);
                }}
                className={`flex flex-col items-center justify-center px-2 min-w-0 flex-1 relative ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: '49px',
                  padding: '4px 2px',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'block',
                  background: 'transparent'
                }}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-blue-600' : 'text-gray-600'}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 leading-none">
                      {notifications.requests}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium truncate max-w-full leading-tight mt-1 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
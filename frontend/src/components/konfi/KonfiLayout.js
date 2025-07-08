// frontend/src/components/konfi/KonfiLayout.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import KonfiDashboard from './KonfiDashboard';
import KonfiRequests from './KonfiRequests';
import KonfiBadges from './KonfiBadges';
import ChatView from '../chat/ChatView';
import { KONFI_NAV_ITEMS } from '../../utils/constants';
import { useRef } from 'react'; // für containerRef
import { useCapacitorKeyboard } from '../../hooks/useCapacitorKeyboard';
import { useCapacitorSwipe } from '../../hooks/useCapacitorSwipe';
import { 
  BarChart3, Upload, MessageSquare, Award
} from 'lucide-react';

const KonfiLayout = () => {
  const { user, setError } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Icon mapping for navigation
  const iconMap = {
    BarChart3,
    Upload,
    MessageSquare,
    Award
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || MessageSquare;
  };
  
  // Data states
  const [konfiData, setKonfiData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [badges, setBadges] = useState({ earned: [], available: [] });
  const [settings, setSettings] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        konfiRes,
        requestsRes,
        badgesRes,
        settingsRes,
        activitiesRes
      ] = await Promise.all([
        api.get(`/konfis/${user.id}`),
        api.get('/activity-requests'),
        api.get(`/konfis/${user.id}/badges`),
        api.get('/settings'),
        api.get('/activities')
      ]);

      setKonfiData(konfiRes.data);
      setRequests(requestsRes.data);
      setBadges(badgesRes.data);
      setSettings(settingsRes.data);
      setActivities(activitiesRes.data);
    } catch (err) {
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh hook - DISABLED
  const containerRef = useRef(null);
  // Custom pull-to-refresh komplett entfernt - nur natives iOS

  // Capacitor Hooks
  useCapacitorKeyboard();
  useCapacitorSwipe(null, loadData); // Pull-to-refresh wieder aktiviert

  useEffect(() => {
    loadData();
  }, []);

  const handleViewChange = (view) => {
    // Haptic Feedback entfernt
    
    setCurrentView(view);
    
    // Scroll SOFORT nach oben bei Seitenwechsel
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    
    // Nochmal nach kurzer Verzögerung
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }, 10);
  };

  const renderContent = () => {
    if (loading || !konfiData) {
      return <LoadingSpinner />;
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <KonfiDashboard
            konfiData={konfiData}
            badges={badges}
            settings={settings}
            onUpdate={loadData}
          />
        );
      
      case 'requests':
        return (
          <KonfiRequests
            requests={requests}
            activities={activities}
            onUpdate={loadData}
          />
        );
      
      case 'badges':
        return (
          <KonfiBadges
            badges={badges}
            konfiData={konfiData}
          />
        );
      
      case 'chat':
        return <ChatView />;
      
      default:
        return <KonfiDashboard konfiData={konfiData} />;
    }
  };

  const notifications = {
    requests: requests.filter(r => r.status === 'pending').length
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Fixed Header - Status Bar + Konfi Header (kompakt) */}
      <div 
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50"
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          minHeight: 'calc(60px + env(safe-area-inset-top))'
        }}
      >
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-500" />
            <div>
              <button 
                onClick={() => handleViewChange('dashboard')}
                className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors text-left"
              >
                Hallo {user.name}!
              </button>
              <p className="text-xs text-gray-600">Jahrgang: {user.jahrgang}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50"
        style={{ 
          marginTop: 'calc(60px + env(safe-area-inset-top))',
          paddingBottom: `calc(83px + env(safe-area-inset-bottom) + 20px)`,
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
        ref={containerRef}
      >
        <div className="w-full max-w-4xl mx-auto px-4 py-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
      
      {/* Native iOS Tab Bar - WIRKLICH unten */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-[60]"
        style={{
          bottom: '0px !important',
          height: `calc(83px + env(safe-area-inset-bottom))`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          borderTop: '0.5px solid #c7c7cc',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(248, 248, 248, 0.92)',
          position: 'fixed !important'
        }}
      >
        <div className="flex justify-around items-center pt-2 pb-1 px-2">
          {KONFI_NAV_ITEMS.map(({ id, label, icon: iconName }) => {
            const Icon = getIconComponent(iconName);
            const notification = id === 'requests' ? notifications.requests || 0 : 0;
            
            return (
              <button
                key={id}
                onClick={() => handleViewChange(id)}
                onTouchStart={() => {}} // iOS tap delay fix
                className={`flex flex-col items-center justify-center py-1 px-2 min-w-0 flex-1 transition-colors relative ${
                  currentView === id ? 'text-blue-600' : 'text-gray-600'
                }`}
                style={{ 
                  zIndex: 100,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: '49px',
                  minWidth: '50px',
                  position: 'relative'
                }}
              >
                {/* Direct SVG for iOS compatibility */}
                <div className="w-6 h-6 flex items-center justify-center">
                  {iconName === 'BarChart3' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={`${currentView === id ? '#2563eb' : '#6b7280'}`} strokeWidth={currentView === id ? 2.5 : 2}>
                      <path d="M3 3v18h18"/>
                      <path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                  )}
                  {iconName === 'Upload' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={`${currentView === id ? '#2563eb' : '#6b7280'}`} strokeWidth={currentView === id ? 2.5 : 2}>
                      <path d="m21 15-6-6-6 6"/>
                      <path d="M12 3v12"/>
                      <path d="M17 21H7a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2z"/>
                    </svg>
                  )}
                  {iconName === 'MessageSquare' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={`${currentView === id ? '#2563eb' : '#6b7280'}`} strokeWidth={currentView === id ? 2.5 : 2}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  )}
                  {iconName === 'Award' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={`${currentView === id ? '#2563eb' : '#6b7280'}`} strokeWidth={currentView === id ? 2.5 : 2}>
                      <circle cx="12" cy="8" r="6"/>
                      <path d="m9 12 2 2 4-4"/>
                      <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>
                    </svg>
                  )}
                  {notification > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                      {notification > 9 ? '9+' : notification}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium truncate max-w-full leading-tight mt-1 ${
                  currentView === id ? 'text-blue-600' : 'text-gray-600'
                }`}
                style={{
                  fontWeight: currentView === id ? 600 : 400,
                  letterSpacing: '-0.01em'
                }}>
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

export default KonfiLayout;
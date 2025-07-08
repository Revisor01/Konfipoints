// frontend/src/components/ionic/IonicKonfiTabs.js
import React, { useState, useEffect } from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonBadge,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import { Route } from 'react-router-dom';
import {
  analytics,
  cloudUpload,
  chatbubbles,
  star
} from 'ionicons/icons';
import useStatusBar from '../../hooks/useStatusBar';

import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';

// Import your existing components
import KonfiDashboard from '../konfi/KonfiDashboard';
import KonfiRequests from '../konfi/KonfiRequests';
import KonfiBadges from '../konfi/KonfiBadges';
import ChatView from '../chat/ChatView';

const IonicKonfiTabs = () => {
  const { user, setError } = useApp();
  const [loading, setLoading] = useState(true);
  
  // Setup status bar
  useStatusBar();
  
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

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const DashboardTab = () => (
    <IonContent>
      <div style={{ 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
        minHeight: '100%', 
        padding: '16px',
        paddingTop: '0px'
      }}>
        <KonfiDashboard
          konfiData={konfiData}
          badges={badges}
          settings={settings}
          onUpdate={loadData}
        />
      </div>
    </IonContent>
  );

  const RequestsTab = () => (
    <IonContent>
      <div style={{ 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
        minHeight: '100%', 
        padding: '16px',
        paddingTop: '0px'
      }}>
        <KonfiRequests
          requests={requests}
          activities={activities}
          onUpdate={loadData}
        />
      </div>
    </IonContent>
  );

  const BadgesTab = () => (
    <IonContent>
      <div style={{ 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
        minHeight: '100%', 
        padding: '16px',
        paddingTop: '0px'
      }}>
        <KonfiBadges
          badges={badges}
          konfiData={konfiData}
        />
      </div>
    </IonContent>
  );

  const ChatTab = () => (
    <IonContent>
      <div style={{ 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
        minHeight: '100%', 
        padding: '16px',
        paddingTop: '0px'
      }}>
        <ChatView />
      </div>
    </IonContent>
  );

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/konfi/dashboard" component={DashboardTab} />
        <Route exact path="/konfi/badges" component={BadgesTab} />
        <Route exact path="/konfi/requests" component={RequestsTab} />
        <Route exact path="/konfi/chat" component={ChatTab} />
        <Route exact path="/konfi" render={() => <DashboardTab />} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" translucent={true}>
        <IonTabButton tab="dashboard" href="/konfi/dashboard">
          <IonIcon icon={analytics} />
          <IonLabel>Dashboard</IonLabel>
        </IonTabButton>

        <IonTabButton tab="badges" href="/konfi/badges">
          <IonIcon icon={star} />
          <IonLabel>Badges</IonLabel>
        </IonTabButton>

        <IonTabButton tab="requests" href="/konfi/requests">
          <IonIcon icon={cloudUpload} />
          <IonLabel>Anträge</IonLabel>
          {pendingRequests > 0 && (
            <IonBadge color="primary">{pendingRequests}</IonBadge>
          )}
        </IonTabButton>

        <IonTabButton tab="chat" href="/konfi/chat">
          <IonIcon icon={chatbubbles} />
          <IonLabel>Chat</IonLabel>
          <IonBadge color="danger">3</IonBadge>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default IonicKonfiTabs;
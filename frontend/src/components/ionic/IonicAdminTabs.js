// frontend/src/components/ionic/IonicAdminTabs.js
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
  people,
  chatbubbles,
  calendar,
  star,
  ellipsisHorizontal
} from 'ionicons/icons';
import useStatusBar from '../../hooks/useStatusBar';

import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';

// Import your existing components
import KonfisView from '../admin/KonfisView';
import KonfiDetailView from '../admin/KonfiDetailView';
import BadgesView from '../admin/BadgesView';
import ActivitiesView from '../admin/ActivitiesView';
import MoreView from '../admin/MoreView';
import ChatView from '../chat/ChatView';

const IonicAdminTabs = () => {
  const { user, setError } = useApp();
  const [loading, setLoading] = useState(true);
  const [selectedKonfi, setSelectedKonfi] = useState(null);
  const [notifications, setNotifications] = useState({});
  
  // Setup status bar
  useStatusBar();
  
  // Data states
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

  useEffect(() => {
    loadData();
  }, []);

  const KonfisTab = () => {
    const content = selectedKonfi ? (
      <KonfiDetailView
        konfi={selectedKonfi}
        onBack={() => setSelectedKonfi(null)}
        activities={activities}
        settings={settings}
        onUpdate={loadData}
      />
    ) : (
      <KonfisView
        konfis={konfis}
        jahrgaenge={jahrgaenge}
        settings={settings}
        onSelectKonfi={setSelectedKonfi}
        onUpdate={loadData}
      />
    );

    return (
      <IonContent>
        <div style={{ 
          background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
          minHeight: '100%', 
          padding: '16px',
          paddingTop: '0px'
        }}>
          {content}
        </div>
      </IonContent>
    );
  };

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

  const ActivitiesTab = () => (
    <IonContent>
      <div style={{ 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
        minHeight: '100%', 
        padding: '16px',
        paddingTop: '0px'
      }}>
        <ActivitiesView activities={activities} onUpdate={loadData} />
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
        <BadgesView badges={badges} activities={activities} onUpdate={loadData} />
      </div>
    </IonContent>
  );

  const SettingsTab = () => (
    <IonContent>
      <div style={{ 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(245 243 255))', 
        minHeight: '100%', 
        padding: '16px',
        paddingTop: '0px'
      }}>
        <MoreView
          settings={settings}
          jahrgaenge={jahrgaenge}
          requests={requests}
          konfis={konfis}
          onUpdate={loadData}
          notifications={notifications}
        />
      </div>
    </IonContent>
  );

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/admin" render={() => <KonfisTab />} />
        <Route exact path="/admin/konfis" render={() => <KonfisTab />} />
        <Route exact path="/admin/chat" render={() => <ChatTab />} />
        <Route exact path="/admin/activities" render={() => <ActivitiesTab />} />
        <Route exact path="/admin/badges" render={() => <BadgesTab />} />
        <Route exact path="/admin/settings" render={() => <SettingsTab />} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" translucent={true}>
        <IonTabButton tab="konfis" href="/admin/konfis">
          <IonIcon icon={people} />
          <IonLabel>Konfis</IonLabel>
        </IonTabButton>

        <IonTabButton tab="chat" href="/admin/chat">
          <IonIcon icon={chatbubbles} />
          <IonLabel>Chat</IonLabel>
          <IonBadge color="danger">5</IonBadge>
        </IonTabButton>

        <IonTabButton tab="activities" href="/admin/activities">
          <IonIcon icon={calendar} />
          <IonLabel>Aktivitäten</IonLabel>
        </IonTabButton>

        <IonTabButton tab="badges" href="/admin/badges">
          <IonIcon icon={star} />
          <IonLabel>Badges</IonLabel>
        </IonTabButton>

        <IonTabButton tab="settings" href="/admin/settings">
          <IonIcon icon={ellipsisHorizontal} />
          <IonLabel>Mehr</IonLabel>
          {notifications.requests > 0 && (
            <IonBadge color="danger">{notifications.requests}</IonBadge>
          )}
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default IonicAdminTabs;
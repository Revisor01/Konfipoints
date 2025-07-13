import React, { useState, useEffect } from 'react';
import { 
  IonApp, 
  IonRouterOutlet, 
  setupIonicReact, 
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { Route, Redirect } from 'react-router';
import { 
  people, 
  chatbubbles, 
  calendar, 
  star, 
  ellipsisHorizontal,
  person,
  home
} from 'ionicons/icons';

import { useApp } from '../../contexts/AppContext';
import LoginView from '../auth/LoginView';
import LoadingSpinner from '../common/LoadingSpinner';
import ChatRoom from '../chat/ChatRoom';

// Import individual tab components instead of wrapper components
import AdminKonfisPage from '../admin/pages/AdminKonfisPage';
import AdminBadgesPage from '../admin/pages/AdminBadgesPage';
import ActivitiesView from '../admin/ActivitiesView';
import MoreView from '../admin/MoreView';
import ChatView from '../chat/ChatView';
import KonfiDashboard from '../konfi/KonfiDashboard';
import KonfiBadgesView from '../konfi/views/KonfiBadgesView';
import KonfiRequestsView from '../konfi/views/KonfiRequestsView';
import api from '../../services/api';


setupIonicReact({
  rippleEffect: false,
  mode: 'ios',
  swipeBackEnabled: true,
  inputBlurring: true,    // Lasse Ionic das nativ handhaben
  scrollPadding: true,    // Lasse Ionic Safe Areas nativ handhaben  
  hardwareBackButton: false,
  backButtonText: '',
  backButtonIcon: 'arrow-back-outline',
  innerHTMLTemplatesEnabled: true,
  experimentalTransitionShadows: true,  // Native iOS shadows
  spinner: 'lines'
});

const IonicApp = () => {
  const { user, loading } = useApp();
  const [data, setData] = useState({
    konfis: [],
    activities: [],
    badges: [],
    settings: {},
    jahrgaenge: [],
    notifications: {}
  });

  const loadData = async () => {
    try {
      const [konfisRes, activitiesRes, badgesRes, settingsRes, jahrgaengeRes] = await Promise.all([
        api.get('/konfis'),
        api.get('/activities'),
        api.get('/badges'),
        api.get('/settings'),
        api.get('/jahrgaenge')
      ]);
      
      setData({
        konfis: konfisRes.data,
        activities: activitiesRes.data,
        badges: badgesRes.data,
        settings: settingsRes.data,
        jahrgaenge: jahrgaengeRes.data,
        notifications: {}
      });
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  if (loading) {
    return (
      <IonApp>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <LoadingSpinner fullScreen />
        </div>
      </IonApp>
    );
  }

  if (!user) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" component={LoginView} exact />
            <Redirect exact from="/" to="/login" />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }
  
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Chat Room routes (outside tabs to hide tab bar) */}
          <Route path="/chat/:roomId" component={ChatRoom} />
          
          {user.type === 'admin' ? (
            // Admin Tabs - Native Ionic Pattern
            <IonTabs>
              <IonRouterOutlet>
                <Redirect exact path="/admin" to="/admin/konfis" />
                <Route exact path="/admin/konfis" render={() => (
                  <AdminKonfisPage 
                    konfis={data.konfis} 
                    jahrgaenge={data.jahrgaenge} 
                    settings={data.settings}
                    activities={data.activities}
                    onUpdate={loadData}
                  />
                )} />
                <Route exact path="/admin/chat" render={() => 
                  <ChatView onNavigate={() => {}} />
                } />
                <Route exact path="/admin/activities" render={() => 
                  <IonPage>
                    <IonHeader>
                      <IonToolbar>
                        <IonTitle>Aktivitäten</IonTitle>
                      </IonToolbar>
                    </IonHeader>
                    <IonContent className="app-gradient-background" fullscreen>
                      <ActivitiesView activities={data.activities} onUpdate={loadData} />
                    </IonContent>
                  </IonPage>
                } />
                <Route exact path="/admin/badges" render={() => (
                  <AdminBadgesPage 
                    badges={data.badges} 
                    activities={data.activities} 
                    onUpdate={loadData}
                  />
                )} />
                <Route exact path="/admin/settings" render={() => 
                  <IonPage>
                    <IonHeader>
                      <IonToolbar>
                        <IonTitle>Mehr</IonTitle>
                      </IonToolbar>
                    </IonHeader>
                    <IonContent className="app-gradient-background" fullscreen>
                      <MoreView 
                        settings={data.settings}
                        onUpdate={loadData}
                        notifications={data.notifications}
                      />
                    </IonContent>
                  </IonPage>
                } />
                <Redirect exact from="/" to="/admin/konfis" />
              </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="konfis" href="/admin/konfis">
                <IonIcon icon={people} />
                <IonLabel>Konfis</IonLabel>
              </IonTabButton>
              <IonTabButton tab="chat" href="/admin/chat">
                <IonIcon icon={chatbubbles} />
                <IonLabel>Chat</IonLabel>
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
                {data.notifications.requests > 0 && (
                  <IonBadge color="danger">{data.notifications.requests}</IonBadge>
                )}
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        ) : (
          // Konfi Tabs - Native Ionic Pattern  
          <IonTabs>
            <IonRouterOutlet>
              <Redirect exact path="/konfi" to="/konfi/dashboard" />
              <Route exact path="/konfi/dashboard" render={() => 
                <IonPage>
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Dashboard</IonTitle>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent className="app-gradient-background" fullscreen>
                    <KonfiDashboard />
                  </IonContent>
                </IonPage>
              } />
              <Route exact path="/konfi/badges" render={() => 
                <IonPage>
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Badges</IonTitle>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent className="app-gradient-background" fullscreen>
                    <KonfiBadgesView />
                  </IonContent>
                </IonPage>
              } />
              <Route exact path="/konfi/requests" render={() => 
                <IonPage>
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Anfragen</IonTitle>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent className="app-gradient-background" fullscreen>
                    <KonfiRequestsView />
                  </IonContent>
                </IonPage>
              } />
              <Redirect exact from="/" to="/konfi/dashboard" />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="dashboard" href="/konfi/dashboard">
                <IonIcon icon={home} />
                <IonLabel>Dashboard</IonLabel>
              </IonTabButton>
              <IonTabButton tab="badges" href="/konfi/badges">
                <IonIcon icon={star} />
                <IonLabel>Badges</IonLabel>
              </IonTabButton>
              <IonTabButton tab="requests" href="/konfi/requests">
                <IonIcon icon={person} />
                <IonLabel>Anfragen</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        )}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default IonicApp;
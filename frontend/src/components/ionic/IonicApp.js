// frontend/src/components/ionic/IonicApp.js
import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

import { useApp } from '../../contexts/AppContext';
import LoginView from '../auth/LoginView';
import IonicAdminTabs from './IonicAdminTabs';
import IonicKonfiTabs from './IonicKonfiTabs';
import LoadingSpinner from '../common/LoadingSpinner';

// Setup Ionic React
setupIonicReact({
  rippleEffect: false,
  mode: 'ios', // Force iOS mode for consistent native feel
  swipeBackEnabled: true, // Enable swipe back navigation
  inputBlurring: false, // Prevent input blur issues
  scrollPadding: false, // Let native handle scroll padding
  scrollAssist: true // Enable scroll assist for inputs
});

const IonicApp = () => {
  const { user, loading } = useApp();

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

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {!user ? (
            <>
              <Route path="/login" component={LoginView} exact />
              <Route exact path="/" render={() => <Redirect to="/login" />} />
            </>
          ) : user.type === 'admin' ? (
            <>
              <Route path="/admin" render={() => <IonicAdminTabs />} />
              <Route exact path="/" render={() => <Redirect to="/admin/konfis" />} />
            </>
          ) : (
            <>
              <Route path="/konfi" render={() => <IonicKonfiTabs />} />
              <Route exact path="/" render={() => <Redirect to="/konfi/dashboard" />} />
            </>
          )}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default IonicApp;
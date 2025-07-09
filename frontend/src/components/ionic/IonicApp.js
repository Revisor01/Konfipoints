import React, { useState, useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact, IonContent } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';

import { useApp } from '../../contexts/AppContext';
import LoginView from '../auth/LoginView';
import IonicAdminTabs from './IonicAdminTabs';
import IonicKonfiTabs from './IonicKonfiTabs';
import LoadingSpinner from '../common/LoadingSpinner';
import ChatRoom from '../chat/ChatRoom';
import api from '../../services/api';

setupIonicReact({
  rippleEffect: false,
  mode: 'ios',
  swipeBackEnabled: true,
  inputBlurring: false, // Keep this as false
  scrollPadding: false, // Keep this as false
  scrollAssist: true,   // Keep this as true
  hardwareBackButton: false,
  statusTap: false,
  backButtonText: '',
  backButtonIcon: 'arrow-back-outline',
  innerHTMLTemplatesEnabled: true,
  experimentalTransitionShadows: true,
  spinner: 'lines'
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
        <IonRouterOutlet animated={true}>
          {!user ? (
            <>
              <Route path="/login" component={LoginView} exact />
              <Route exact path="/" render={() => <Redirect to="/login" />} />
            </>
          ) : user.type === 'admin' ? (
            <>
              <Route path="/chat/:roomId" component={ChatRoom} exact={false} />
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
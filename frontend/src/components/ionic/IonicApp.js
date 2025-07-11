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
  experimentalTransitionShadows: false,
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
    {/* Nutze Switch, um sicherzustellen, dass nur eine Route gematched wird */}
    <IonRouterOutlet animated={true}>
    <Switch>
    {!user ? (
      // Login Routen
      <>
      <Route path="/login" component={LoginView} exact />
      <Redirect exact from="/" to="/login" />
      </>
    ) : user.type === 'admin' ? (
      // Admin Routen
      <>
      {/* WICHTIG: component={Component} statt render={() => <Component />} */}
      {/* Dadurch wird der Lebenszyklus von React Router besser kontrolliert */}
      <Route path="/admin" component={IonicAdminTabs} />
      <Route path="/chat/:roomId" component={ChatRoom} exact={false} />
      <Redirect exact from="/" to="/admin/konfis" />
      </>
    ) : (
      // Konfi Routen
      <>
      <Route path="/konfi" component={IonicKonfiTabs} />
      <Redirect exact from="/" to="/konfi/dashboard" />
      </>
    )}
    </Switch>
    </IonRouterOutlet>
    </IonReactRouter>
    </IonApp>
  );
};

export default IonicApp;
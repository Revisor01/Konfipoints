// frontend/src/components/ionic/IonicApp.js
import React, { useState, useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact, IonContent } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';

import { useApp } from '../../contexts/AppContext';
import LoginView from '../auth/LoginView';
import IonicAdminTabs from './IonicAdminTabs';
import IonicKonfiTabs from './IonicKonfiTabs';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';
// Setup Ionic React
setupIonicReact({
  rippleEffect: false,
  mode: 'ios', // Force iOS mode for consistent native feel
  swipeBackEnabled: true, // Enable swipe back navigation
  inputBlurring: false, // Prevent input blur issues
  scrollPadding: false, // Let native handle scroll padding
  scrollAssist: true, // Enable scroll assist for inputs
  hardwareBackButton: false, // Disable hardware back button for iOS
  statusTap: false, // Disable status tap scrolling
  backButtonText: '', // Remove back button text
  backButtonIcon: 'arrow-back-outline' // Set back button icon
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
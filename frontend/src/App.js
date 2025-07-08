// frontend/src/App.js
import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Capacitor } from '@capacitor/core';
import IonicApp from './components/ionic/IonicApp';
import LoginView from './components/auth/LoginView';
import AdminLayout from './components/admin/AdminLayout';
import KonfiLayout from './components/konfi/KonfiLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Use Ionic App for native platforms (gives us native tabs)
  if (Capacitor.isNativePlatform()) {
    return <IonicApp />;
  }

  // Fallback for web platforms
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {!user ? (
        <LoginView />
      ) : user.type === 'admin' ? (
        <AdminLayout />
      ) : (
        <KonfiLayout />
      )}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
// frontend/src/App.js
import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import IonicApp from './components/ionic/IonicApp';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // MOBILE FIRST: Always use IonicApp for mobile platforms
  // For web, we'll also use IonicApp to maintain consistency
  return <IonicApp />;
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
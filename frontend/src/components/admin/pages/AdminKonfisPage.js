import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { useApp } from '../../../contexts/AppContext';
import api from '../../../services/api';
import KonfisView from '../KonfisView';
import KonfiModal from '../modals/KonfiModal';
import KonfiDetailView from '../KonfiDetailView';

const AdminKonfisPage = ({ konfis, jahrgaenge, settings, onUpdate, activities }) => {
  const { setSuccess, setError } = useApp();
  const pageRef = React.useRef(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedKonfi, setSelectedKonfi] = React.useState(null);
  const [showDetailView, setShowDetailView] = React.useState(false);

  const handleDeleteKonfi = async (konfi) => {
    if (!window.confirm(`Konfi "${konfi.name}" wirklich löschen?`)) return;

    try {
      await api.delete(`/konfis/${konfi.id}`);
      setSuccess('Konfi gelöscht');
      onUpdate();
    } catch (err) {
      setError('Fehler beim Löschen');
    }
  };

  const handleSelectKonfi = (konfi) => {
    setSelectedKonfi(konfi);
    setShowDetailView(true);
  };

  const handleDetailUpdate = async () => {
    await onUpdate();
    // Force a complete refresh of the selected konfi with fresh data
    if (selectedKonfi) {
      // Immediately get fresh data
      const updatedKonfi = konfis.find(k => k.id === selectedKonfi.id);
      if (updatedKonfi) {
        setSelectedKonfi({...updatedKonfi});
      }
      
      // Also do a delayed update to catch any async data
      setTimeout(async () => {
        await onUpdate();
        const latestKonfi = konfis.find(k => k.id === selectedKonfi.id);
        if (latestKonfi) {
          setSelectedKonfi({...latestKonfi});
        }
      }, 200);
    }
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setSelectedKonfi(null);
  };

  const handleAddKonfi = async (konfiData) => {
    setLoading(true);
    try {
      await api.post('/konfis', konfiData);
      setSuccess('Konfi erfolgreich hinzugefügt');
      setIsModalOpen(false);
      onUpdate();
    } catch (err) {
      setError('Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  const presentKonfiModal = () => {
    setIsModalOpen(true);
  };

  if (showDetailView && selectedKonfi) {
    return (
      <KonfiDetailView
        konfi={selectedKonfi}
        onBack={handleBackFromDetail}
        activities={activities || []}
        settings={settings}
        onUpdate={handleDetailUpdate}
      />
    );
  }

  return (
    <IonPage ref={pageRef}>
      <IonHeader style={{ '--min-height': '0px' }}>
        <IonToolbar style={{ '--min-height': '0px', '--padding-top': '0px', '--padding-bottom': '0px' }}>
          <IonTitle style={{ display: 'none' }}>Konfis</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-gradient-background" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => {
          onUpdate();
          e.detail.complete();
        }}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        {/* Header Card mit Icon und Titel */}
        <IonCard style={{
          margin: '16px 16px 0',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <IonCardHeader style={{ padding: '20px 24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <ion-icon name="people" style={{ 
                fontSize: '28px', 
                color: 'white' 
              }}></ion-icon>
              <IonCardTitle style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white'
              }}>
                Konfis
              </IonCardTitle>
            </div>
          </IonCardHeader>
        </IonCard>

        <KonfisView 
          konfis={konfis}
          jahrgaenge={jahrgaenge}
          settings={settings}
          onUpdate={onUpdate}
          onAddKonfiClick={presentKonfiModal}
          onSelectKonfi={handleSelectKonfi}
          onDeleteKonfi={handleDeleteKonfi}
        />
      </IonContent>
      
      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={() => setIsModalOpen(false)}
        presentingElement={pageRef.current || undefined}
        canDismiss={true}
        backdropDismiss={true}
      >
        <KonfiModal
          jahrgaenge={jahrgaenge}
          onSave={handleAddKonfi}
          onClose={() => setIsModalOpen(false)}
          loading={loading}
        />
      </IonModal>
    </IonPage>
  );
};

export default AdminKonfisPage;
import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { useApp } from '../../../contexts/AppContext';
import api from '../../../services/api';
import BadgesView from '../BadgesView';
import BadgeModal from '../modals/BadgeModal';

const AdminBadgesPage = ({ badges, activities, onUpdate }) => {
  // Parse criteria_extra strings to objects for badges
  const parsedBadges = badges.map(badge => ({
    ...badge,
    criteria_extra: badge.criteria_extra ? 
      (typeof badge.criteria_extra === 'string' ? JSON.parse(badge.criteria_extra) : badge.criteria_extra)
      : {}
  }));
  const { setSuccess, setError } = useApp();
  const pageRef = React.useRef(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentBadge, setCurrentBadge] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSaveBadge = async (badgeData) => {
    setLoading(true);
    try {
      if (currentBadge) {
        await api.put(`/badges/${currentBadge.id}`, badgeData);
        setSuccess('Badge aktualisiert');
      } else {
        await api.post('/badges', badgeData);
        setSuccess('Badge erstellt');
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (err) {
      setError('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async (badge) => {
    if (!window.confirm(`Badge "${badge.name}" wirklich löschen?`)) return;

    try {
      await api.delete(`/badges/${badge.id}`);
      setSuccess('Badge gelöscht');
      onUpdate();
    } catch (err) {
      setError('Fehler beim Löschen');
    }
  };
  
  const presentBadgeModal = (badge = null) => {
    setCurrentBadge(badge);
    setIsModalOpen(true);
  };

  return (
    <IonPage ref={pageRef}>
      <IonHeader style={{ '--min-height': '0px' }}>
        <IonToolbar style={{ '--min-height': '0px', '--padding-top': '0px', '--padding-bottom': '0px' }}>
          <IonTitle style={{ display: 'none' }}>Badges</IonTitle>
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
              <ion-icon name="trophy" style={{ 
                fontSize: '28px', 
                color: 'white' 
              }}></ion-icon>
              <IonCardTitle style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white'
              }}>
                Badges
              </IonCardTitle>
            </div>
          </IonCardHeader>
        </IonCard>

        <BadgesView 
          badges={parsedBadges} 
          onAddBadgeClick={() => presentBadgeModal(null)}
          onEditBadgeClick={(badge) => presentBadgeModal(badge)}
          onDeleteBadgeClick={handleDeleteBadge}
        />
      </IonContent>
      
      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={() => setIsModalOpen(false)}
        presentingElement={pageRef.current || undefined}
        canDismiss={true}
        backdropDismiss={true}
      >
        <BadgeModal
          badge={currentBadge}
          activities={activities}
          onSave={handleSaveBadge}
          onClose={() => setIsModalOpen(false)}
          loading={loading}
        />
      </IonModal>
    </IonPage>
  );
};

export default AdminBadgesPage;
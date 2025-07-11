import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonModal 
} from '@ionic/react';
import { useApp } from '../../../contexts/AppContext';
import api from '../../../services/api';
import BadgesView from '../BadgesView';
import BadgeModal from '../modals/BadgeModal';

const AdminBadgesPage = ({ badges, activities, onUpdate }) => {
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Badges</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-gradient-background" fullscreen>
        <BadgesView 
          badges={badges} 
          onAddBadgeClick={() => presentBadgeModal(null)}
          onEditBadgeClick={(badge) => presentBadgeModal(badge)}
          onDeleteBadgeClick={handleDeleteBadge}
        />
      </IonContent>
      
      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={() => setIsModalOpen(false)}
        presentingElement={pageRef.current || undefined}
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
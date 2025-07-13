// frontend/src/components/admin/KonfiDetailView.js
import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonList,
  IonChip,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  useIonActionSheet
} from '@ionic/react';
import { 
  arrowBack, 
  eye, 
  eyeOff, 
  copy, 
  trash, 
  add, 
  refresh, 
  gift,
  star,
  trophy,
  checkmark,
  calendar,
  bookmark
} from 'ionicons/icons';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate, formatShortDate } from '../../utils/formatters';
import { copyToClipboard, getProgressPercentage } from '../../utils/helpers';

const KonfiDetailView = ({ konfi, onBack, activities, settings, onUpdate }) => {
  const { setSuccess, setError } = useApp();
  const [presentActionSheet] = useIonActionSheet();
  const pageRef = React.useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Bonus points state
  const [bonus, setBonus] = useState({
    description: '',
    points: 1,
    type: 'gottesdienst',
    date: new Date().toISOString().split('T')[0]
  });

  // Activity assignment state
  const [activityAssign, setActivityAssign] = useState({
    activityId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(konfi.password);
    if (success) {
      setCopied(true);
      setSuccess('Passwort kopiert');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddBonus = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfi.id}/bonus-points`, {
        ...bonus,
        completed_date: bonus.date
      });
      console.log('Bonus assignment response:', response);
      setSuccess('Zusatzpunkte erfolgreich vergeben');
      setShowBonusModal(false);
      setBonus({
        description: '',
        points: 1,
        type: 'gottesdienst',
        date: new Date().toISOString().split('T')[0]
      });
      // Sofort die lokalen Daten aktualisieren
      await onUpdate();
    } catch (err) {
      console.error('Error adding bonus:', err);
      setError('Fehler beim Vergeben der Punkte: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveActivity = async (recordId) => {
    if (!window.confirm('Möchten Sie diese Aktivität wirklich entfernen?')) return;
    
    try {
      await api.delete(`/konfis/${konfi.id}/activities/${recordId}`);
      setSuccess('Aktivität erfolgreich entfernt');
      await onUpdate();
    } catch (err) {
      setError('Fehler beim Entfernen der Aktivität');
    }
  };

  const handleGenerateNewPassword = async () => {
    if (!window.confirm('Möchten Sie ein neues Passwort für diesen Konfi generieren?')) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfi.id}/regenerate-password`);
      setSuccess(`Neues Passwort: ${response.data.password}`);
      onUpdate();
    } catch (err) {
      setError('Fehler beim Generieren des neuen Passworts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKonfi = async () => {
    if (!window.confirm(`Möchten Sie ${konfi.name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    
    setLoading(true);
    try {
      await api.delete(`/konfis/${konfi.id}`);
      setSuccess('Konfi erfolgreich gelöscht');
      onBack();
    } catch (err) {
      setError('Fehler beim Löschen des Konfis');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBonus = async (bonusId) => {
    if (!window.confirm('Möchten Sie diese Zusatzpunkte wirklich entfernen?')) return;
    
    try {
      await api.delete(`/konfis/${konfi.id}/bonus-points/${bonusId}`);
      setSuccess('Zusatzpunkte erfolgreich entfernt');
      await onUpdate();
    } catch (err) {
      setError('Fehler beim Entfernen der Zusatzpunkte');
    }
  };

  const handleAssignActivity = async (activityId) => {
    if (!activityAssign.date) {
      setError('Bitte wählen Sie ein Datum aus');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        activityId: parseInt(activityId),
        completed_date: activityAssign.date
      };
      console.log('Sending activity assignment payload:', payload);
      
      const response = await api.post(`/konfis/${konfi.id}/activities`, payload);
      console.log('Activity assignment response:', response);
      setSuccess('Aktivität erfolgreich zugeordnet');
      setShowActivityModal(false);
      setActivityAssign({
        activityId: '',
        date: new Date().toISOString().split('T')[0]
      });
      // Sofort die lokalen Daten aktualisieren
      await onUpdate();
    } catch (err) {
      console.error('Error assigning activity:', err);
      console.error('Error response data:', err.response?.data);
      setError('Fehler beim Zuordnen der Aktivität: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  const doRefresh = async (event) => {
    await onUpdate();
    event.detail.complete();
  };

  return (
    <IonPage ref={pageRef}>
      <IonHeader style={{ '--min-height': '0px' }}>
        <IonToolbar style={{ '--min-height': '0px', '--padding-top': '0px', '--padding-bottom': '0px' }}>
          <IonTitle style={{ display: 'none' }}>Konfi Detail</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="app-gradient-background" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Header Card */}
        <IonCard
          style={{
            '--background': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            '--color': 'white',
            margin: '16px',
            borderRadius: '16px',
            width: 'calc(100% - 32px)',
            '--box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <IonCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IonButton 
                fill="clear" 
                onClick={onBack}
                style={{
                  '--color': 'white',
                  '--background': 'rgba(255,255,255,0.2)',
                  '--border-radius': '8px',
                  margin: '0'
                }}
              >
                <IonIcon icon={arrowBack} style={{ fontSize: '20px' }} />
              </IonButton>
              <IonCardTitle style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                flex: 1
              }}>
                {konfi.name}
              </IonCardTitle>
            </div>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow style={{ textAlign: 'center' }}>
                {showGottesdienstTarget && (
                  <IonCol>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                      {konfi.points?.gottesdienst || 0}
                    </h2>
                    <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                      Gottesdienst
                    </p>
                  </IonCol>
                )}
                {showGemeindeTarget && (
                  <IonCol>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                      {konfi.points?.gemeinde || 0}
                    </h2>
                    <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                      Gemeinde
                    </p>
                  </IonCol>
                )}
                <IonCol>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                    {(konfi.points?.gottesdienst || 0) + (konfi.points?.gemeinde || 0)}
                  </h2>
                  <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                    Gesamt
                  </p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Action Buttons unter dem Gradient */}
        <div style={{ 
          margin: '0 16px 16px 16px', 
          display: 'flex', 
          gap: '12px'
        }}>
          <IonButton 
            expand="block"
            fill="solid"
            onClick={() => setShowActivityModal(true)}
            style={{
              '--background': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              '--color': 'white',
              '--border-radius': '12px',
              flex: 1,
              height: '48px',
              '--box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)',
              '--background-activated': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              '--background-focused': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              '--background-hover': 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
            }}
          >
            <IonIcon icon={add} slot="start" />
            Aktivität vergeben
          </IonButton>
          <IonButton 
            expand="block"
            fill="solid"
            onClick={() => setShowBonusModal(true)}
            style={{
              '--background': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              '--color': 'white',
              '--border-radius': '12px',
              flex: 1,
              height: '48px',
              '--box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)',
              '--background-activated': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              '--background-focused': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              '--background-hover': 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
            }}
          >
            <IonIcon icon={gift} slot="start" />
            Bonus vergeben
          </IonButton>
        </div>

        {/* Login Info Card */}
        <IonCard style={{
          margin: '16px',
          borderRadius: '12px',
          width: 'calc(100% - 32px)'
        }}>
          <IonCardHeader style={{ paddingBottom: '8px' }}>
            <h3 style={{ 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: '0',
              fontSize: '1.125rem'
            }}>
              Login-Informationen
            </h3>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h3>Benutzername</h3>
                  <p>{konfi.username}</p>
                </IonLabel>
                <IonButton 
                  fill="clear" 
                  onClick={() => copyToClipboard(konfi.username).then(() => setSuccess('Benutzername kopiert'))}
                  slot="end"
                >
                  <IonIcon icon={copy} />
                </IonButton>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Passwort</h3>
                  <p>{showPassword ? konfi.password : '••••••••'}</p>
                </IonLabel>
                <IonButton 
                  fill="clear" 
                  onClick={() => setShowPassword(!showPassword)}
                  slot="end"
                >
                  <IonIcon icon={showPassword ? eyeOff : eye} />
                </IonButton>
                <IonButton 
                  fill="clear" 
                  onClick={handleCopyPassword}
                  slot="end"
                >
                  <IonIcon icon={copied ? checkmark : copy} />
                </IonButton>
                <IonButton 
                  fill="clear" 
                  onClick={handleGenerateNewPassword}
                  slot="end"
                >
                  <IonIcon icon={refresh} />
                </IonButton>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Activities Card */}
        <IonCard style={{
          margin: '16px',
          borderRadius: '12px',
          width: 'calc(100% - 32px)'
        }}>
          <IonCardHeader style={{ paddingBottom: '8px' }}>
            <h3 style={{ 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: '0',
              fontSize: '1.125rem'
            }}>
              Aktivitäten ({konfi.activities?.length || 0})
            </h3>
          </IonCardHeader>
          <IonCardContent>
            {konfi.activities && konfi.activities.length > 0 ? (
              <IonList>
                {konfi.activities.map(activity => (
                  <IonItemSliding key={activity.id}>
                    <IonItem
                      style={{
                        '--background': activity.type === 'gottesdienst' ? '#eff6ff' : '#f0fdf4',
                        '--border-color': activity.type === 'gottesdienst' ? '#bfdbfe' : '#bbf7d0',
                        margin: '4px 0',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <IonLabel>
                        <h3>{activity.name}</h3>
                        <p>
                          {activity.points} Punkte · {activity.category || (activity.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde')} · {formatShortDate(activity.date || activity.completed_date)}
                          {activity.admin && ` · von ${activity.admin}`}
                        </p>
                      </IonLabel>
                    </IonItem>
                    <IonItemOptions side="end">
                      <IonItemOption 
                        color="danger" 
                        onClick={() => handleRemoveActivity(activity.id)}
                      >
                        <IonIcon icon={trash} />
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
              </IonList>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <IonIcon 
                  icon={calendar} 
                  style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}
                />
                <p>Noch keine Aktivitäten absolviert</p>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Bonus Points Card */}
        {konfi.bonusPoints && konfi.bonusPoints.length > 0 && (
          <IonCard style={{
            margin: '16px',
            borderRadius: '12px',
            width: 'calc(100% - 32px)'
          }}>
            <IonCardHeader style={{ paddingBottom: '8px' }}>
              <h3 style={{ 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: '0',
                fontSize: '1.125rem'
              }}>
                Zusatzpunkte ({konfi.bonusPoints.length})
              </h3>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {konfi.bonusPoints.map(bonus => (
                  <IonItemSliding key={bonus.id}>
                    <IonItem
                      style={{
                        '--background': bonus.type === 'gottesdienst' ? '#eff6ff' : '#f0fdf4',
                        '--border-color': bonus.type === 'gottesdienst' ? '#bfdbfe' : '#bbf7d0',
                        margin: '4px 0',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <IonLabel>
                        <h3>{bonus.description}</h3>
                        <p>
                          {bonus.points} Punkte · {bonus.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'} · {formatShortDate(bonus.date || bonus.completed_date)}
                          {bonus.admin && ` · von ${bonus.admin}`}
                        </p>
                      </IonLabel>
                    </IonItem>
                    <IonItemOptions side="end">
                      <IonItemOption 
                        color="danger" 
                        onClick={() => handleRemoveBonus(bonus.id)}
                      >
                        <IonIcon icon={trash} />
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Badges Card */}
        {konfi.badges && konfi.badges.length > 0 && (
          <IonCard style={{
            margin: '16px',
            borderRadius: '12px',
            width: 'calc(100% - 32px)'
          }}>
            <IonCardHeader style={{ paddingBottom: '8px' }}>
              <h3 style={{ 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: '0',
                fontSize: '1.125rem'
              }}>
                Errungene Badges ({konfi.badges.length})
              </h3>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {konfi.badges.map(badge => (
                  <IonItem key={badge.id}>
                    <IonLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '2rem' }}>{badge.icon}</span>
                        <div>
                          <h3>{badge.name}</h3>
                          <p>{formatShortDate(badge.earned_at)}</p>
                        </div>
                      </div>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Danger Zone */}
        <IonCard style={{
          margin: '16px',
          borderRadius: '12px',
          width: 'calc(100% - 32px)',
          '--background': '#fef2f2',
          '--border-color': '#fecaca'
        }}>
          <IonCardHeader style={{ paddingBottom: '8px' }}>
            <h3 style={{ 
              fontWeight: '600', 
              color: '#dc2626', 
              margin: '0',
              fontSize: '1.125rem'
            }}>
              Danger Zone
            </h3>
          </IonCardHeader>
          <IonCardContent>
            <IonButton 
              fill="outline" 
              color="danger" 
              onClick={handleDeleteKonfi}
              disabled={loading}
            >
              <IonIcon icon={trash} slot="start" />
              Konfi löschen
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Bonus Modal */}
        <IonModal 
          isOpen={showBonusModal} 
          onDidDismiss={() => setShowBonusModal(false)}
          presentingElement={pageRef.current || undefined}
          canDismiss={true}
          backdropDismiss={true}
        >
          <IonPage>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Bonus</IonTitle>
                <IonButtons slot="start">
                  <IonButton onClick={() => setShowBonusModal(false)}>Abbrechen</IonButton>
                </IonButtons>
                <IonButtons slot="end">
                  <IonButton onClick={handleAddBonus} disabled={loading}>
                    {loading ? 'Vergeben...' : 'Vergeben'}
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Beschreibung</IonLabel>
                  <IonInput
                    value={bonus.description}
                    onIonInput={(e) => setBonus({...bonus, description: e.detail.value})}
                    placeholder="z.B. Extra Engagement"
                    inputmode="text"
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Punkte</IonLabel>
                  <IonInput
                    type="number"
                    value={bonus.points}
                    onIonInput={(e) => setBonus({...bonus, points: parseInt(e.detail.value) || 1})}
                    min={1}
                  />
                </IonItem>
                <IonItem button onClick={() => {
                  presentActionSheet({
                    header: 'Kategorie wählen',
                    buttons: [
                      {
                        text: 'Gottesdienst',
                        handler: () => setBonus({...bonus, type: 'gottesdienst'})
                      },
                      {
                        text: 'Gemeinde',
                        handler: () => setBonus({...bonus, type: 'gemeinde'})
                      },
                      {
                        text: 'Abbrechen',
                        role: 'cancel'
                      }
                    ]
                  });
                }}>
                  <IonLabel position="stacked">Kategorie</IonLabel>
                  <IonLabel>
                    {bonus.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Datum</IonLabel>
                  <IonInput
                    type="date"
                    value={bonus.date}
                    onIonInput={(e) => setBonus({...bonus, date: e.detail.value})}
                  />
                </IonItem>
              </IonList>
            </IonContent>
          </IonPage>
        </IonModal>

        {/* Activity Modal */}
        <IonModal 
          isOpen={showActivityModal} 
          onDidDismiss={() => setShowActivityModal(false)}
          presentingElement={pageRef.current || undefined}
          canDismiss={true}
          backdropDismiss={true}
        >
          <IonPage>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Aktivität vergeben</IonTitle>
                <IonButtons slot="start">
                  <IonButton onClick={() => setShowActivityModal(false)}>Abbrechen</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonItem>
                <IonLabel position="stacked">Datum</IonLabel>
                <IonInput
                  type="date"
                  value={activityAssign.date}
                  onIonInput={(e) => setActivityAssign({...activityAssign, date: e.detail.value})}
                />
              </IonItem>

              {/* Gottesdienst Activities */}
              {activities.filter(a => a.type === 'gottesdienst').length > 0 && (
                <>
                  <IonItem>
                    <IonLabel>
                      <h2>Gottesdienst</h2>
                    </IonLabel>
                  </IonItem>
                  {activities.filter(a => a.type === 'gottesdienst').map(activity => (
                    <IonItem 
                      key={activity.id} 
                      button 
                      onClick={() => handleAssignActivity(activity.id)}
                    >
                      <IonLabel>
                        <h3>{activity.name}</h3>
                        <p>{activity.points} Punkte{activity.category && ` · ${activity.category}`}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </>
              )}

              {/* Gemeinde Activities */}
              {activities.filter(a => a.type === 'gemeinde').length > 0 && (
                <>
                  <IonItem>
                    <IonLabel>
                      <h2>Gemeinde</h2>
                    </IonLabel>
                  </IonItem>
                  {activities.filter(a => a.type === 'gemeinde').map(activity => (
                    <IonItem 
                      key={activity.id} 
                      button 
                      onClick={() => handleAssignActivity(activity.id)}
                    >
                      <IonLabel>
                        <h3>{activity.name}</h3>
                        <p>{activity.points} Punkte{activity.category && ` · ${activity.category}`}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </>
              )}
            </IonContent>
          </IonPage>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default KonfiDetailView;
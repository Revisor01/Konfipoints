import React from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonBadge,
  IonList,
  IonChip,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { add, trash, create } from 'ionicons/icons';

const BadgesView = ({ badges, onAddBadgeClick, onEditBadgeClick, onDeleteBadgeClick }) => {
  const getCriteriaText = (type, value) => {
    switch (type) {
      case 'total_points':
        return `${value} Gesamtpunkte erreichen`;
      case 'gottesdienst_points':
        return `${value} Gottesdienst-Punkte sammeln`;
      case 'gemeinde_points':
        return `${value} Gemeinde-Punkte sammeln`;
      case 'both_categories':
        return `${value} Punkte in beiden Kategorien`;
      case 'activity_count':
        return `${value} Aktivitäten absolvieren`;
      case 'unique_activities':
        return `${value} verschiedene Aktivitäten`;
      case 'specific_activity':
        return `Spezifische Aktivität ${value}x`;
      case 'category_activities':
        return `${value} Kategorie-Aktivitäten`;
      case 'activity_combination':
        return `Aktivitäts-Kombination absolvieren`;
      default:
        return `${type}: ${value}`;
    }
  };

  return (
    <>
      <IonContent fullscreen={true}>

        {/* Inhalt (wie gehabt) */}
        <IonCard
          style={{
            '--background': 'linear-gradient(135deg, #fbbf24, #f97316)',
            '--color': 'white',
            margin: '16px',
            borderRadius: '16px',
            width: 'calc(100% - 32px)',
            '--box-shadow': '0 4px 12px rgba(251, 191, 36, 0.3)',
          }}
        >
          <IonCardHeader>
            <IonCardTitle
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              Badge Verwaltung
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow style={{ textAlign: 'center' }}>
                <IonCol>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{badges.length}</h2>
                  <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>Gesamt</p>
                </IonCol>
                <IonCol>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                    {badges.filter((b) => !b.is_hidden).length}
                  </h2>
                  <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>Sichtbar</p>
                </IonCol>
                <IonCol>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                    {badges.filter((b) => b.is_hidden).length}
                  </h2>
                  <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>Geheim</p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <div style={{ margin: '0 16px 16px 16px', display: 'flex', justifyContent: 'center' }}>
          <IonButton
            expand="block"
            fill="solid"
            onClick={onAddBadgeClick}
            style={{
              '--background': 'linear-gradient(135deg, #f59e0b, #d97706)',
              '--color': 'white',
              '--border-radius': '12px',
              width: '100%',
              height: '48px',
              '--box-shadow': '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <IonIcon icon={add} slot="start" />
            Neues Badge erstellen
          </IonButton>
        </div>

        <IonCard style={{ margin: '16px', borderRadius: '12px', width: 'calc(100% - 32px)' }}>
          <IonCardHeader style={{ paddingBottom: '8px' }}>
            <h3
              style={{
                fontWeight: '600',
                color: '#1f2937',
                margin: '0',
                fontSize: '1.125rem',
              }}
            >
              Badges ({badges.length})
            </h3>
          </IonCardHeader>
          <IonList>
            {badges.map((badge) => (
              <IonItemSliding key={badge.id}>
                <IonItem
                  button
                  onClick={() => onEditBadgeClick(badge)}
                  style={{
                    '--background': '#fefce8',
                    '--border-color': '#fed7aa',
                    '--color': '#1f2937',
                    margin: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <IonLabel>
                    <h2
                      style={{
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        margin: '0 0 4px 0',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                      {badge.name}
                    </h2>
                    {badge.description && (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>
                        {badge.description}
                      </p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 8px 0' }}>
                      {getCriteriaText(badge.criteria_type, badge.criteria_value)}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <IonChip
                        color={badge.is_active ? 'success' : 'medium'}
                        style={{
                          '--background': badge.is_active ? '#dcfce7' : '#f3f4f6',
                          fontSize: '0.75rem',
                          height: '24px',
                        }}
                      >
                        {badge.is_active ? 'Aktiv' : 'Inaktiv'}
                      </IonChip>

                      <IonChip
                        color={badge.is_hidden ? 'secondary' : 'tertiary'}
                        style={{
                          '--background': badge.is_hidden ? '#e9d5ff' : '#e0f2fe',
                          fontSize: '0.75rem',
                          height: '24px',
                        }}
                      >
                        {badge.is_hidden ? 'Geheim' : 'Sichtbar'}
                      </IonChip>

                      {badge.earned_count > 0 && (
                        <IonBadge color="medium" style={{ fontSize: '0.75rem' }}>
                          {badge.earned_count}x
                        </IonBadge>
                      )}
                    </div>
                  </IonLabel>
                </IonItem>

                <IonItemOptions side="end">
                  <IonItemOption color="primary" onClick={() => onEditBadgeClick(badge)}>
                    <IonIcon icon={create} />
                  </IonItemOption>
                  <IonItemOption color="danger" onClick={() => onDeleteBadgeClick(badge)}>
                    <IonIcon icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}

            {badges.length === 0 && (
              <IonItem style={{ '--background': '#f9fafb' }}>
                <IonLabel>
                  <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#9ca3af' }}>
                    <IonIcon icon={add} style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1rem', margin: 0, fontWeight: '500' }}>Noch keine Badges erstellt</p>
                  </div>
                </IonLabel>
              </IonItem>
            )}
          </IonList>
        </IonCard>
      </IonContent>
    </>
  );
};

export default BadgesView;

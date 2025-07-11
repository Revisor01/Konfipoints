// frontend/src/components/admin/BadgesView.js
import React from 'react';
import {
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
  IonChip
} from '@ionic/react';
import { add } from 'ionicons/icons';

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
      {/* Header Card mit Button - Styled Ionic */}
      <IonCard
        style={{
          '--background': 'linear-gradient(135deg, #fbbf24, #f97316)',
          '--color': 'white',
          margin: '16px',
          borderRadius: '16px',
          width: 'calc(100% - 32px)'
        }}
      >
        <IonCardHeader>
          <IonCardTitle style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            Badges Verwaltung
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ position: 'relative' }}>
          <IonGrid>
            <IonRow style={{ textAlign: 'center' }}>
              <IonCol>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                  {badges.length}
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                  Badges
                </p>
              </IonCol>
              <IonCol>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                  {badges.filter(b => b.criteria_type === 'points').length}
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                  Punkte
                </p>
              </IonCol>
              <IonCol>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                  {badges.filter(b => b.criteria_type === 'activities').length}
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                  Aktivitäten
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Button unten rechts - weiter unten */}
          <IonButton
            fill="clear"
            size="default"
            onClick={onAddBadgeClick}
            style={{
              '--color': 'white',
              '--background': 'rgba(255,255,255,0.2)',
              '--border-radius': '12px',
              fontWeight: '600',
              minHeight: '40px',
              position: 'absolute',
              bottom: '16px',
              right: '16px'
            }}
          >
            <IonIcon icon={add} slot="start" />
            Badge
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Badges List - Styled Ionic */}
      <IonCard style={{
        margin: '16px',
        borderRadius: '12px',
        width: 'calc(100% - 32px)'
      }}>
        <IonList>
          {badges.map(badge => (
            <IonItem
              key={badge.id}
              button
              onClick={() => onEditBadgeClick(badge)}
              style={{
                '--background': '#fefce8',
                '--border-color': '#fed7aa',
                '--color': '#1f2937',
                margin: '8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <IonLabel>
                <h2 style={{
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  margin: '0 0 4px 0',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                  {badge.name}
                </h2>
                {badge.description && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 8px 0'
                  }}>
                    {badge.description}
                  </p>
                )}
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0 0 8px 0'
                }}>
                  {getCriteriaText(badge.criteria_type, badge.criteria_value)}
                </p>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <IonChip
                    color={badge.is_active ? 'success' : 'medium'}
                    style={{
                      '--background': badge.is_active ? '#dcfce7' : '#f3f4f6',
                      minWidth: '32px',
                      height: '24px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {badge.is_active ? '✓' : '⏸'}
                  </IonChip>

                  <IonChip
                    color={badge.is_hidden ? 'secondary' : 'tertiary'}
                    style={{
                      '--background': badge.is_hidden ? '#e9d5ff' : '#e0f2fe',
                      minWidth: '32px',
                      height: '24px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {badge.is_hidden ? '🔒' : '👁'}
                  </IonChip>

                  {badge.earned_count > 0 && (
                    <IonBadge
                      color="medium"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {badge.earned_count}x
                    </IonBadge>
                  )}
                </div>
              </IonLabel>
            </IonItem>
          ))}

          {badges.length === 0 && (
            <IonItem style={{ '--background': '#f9fafb' }}>
              <IonLabel>
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  color: '#9ca3af'
                }}>
                  <IonIcon
                    icon={add}
                    style={{
                      fontSize: '4rem',
                      opacity: 0.3,
                      marginBottom: '1rem',
                      display: 'block'
                    }}
                  />
                  <p style={{
                    fontSize: '1rem',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Noch keine Badges erstellt
                  </p>
                </div>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonCard>

    </>
  );
};

export default BadgesView;
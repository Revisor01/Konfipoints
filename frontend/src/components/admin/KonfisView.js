// frontend/src/components/admin/KonfisView.js
import React, { useState } from 'react';
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
  IonChip,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonInput,
  useIonActionSheet
} from '@ionic/react';
import { 
  add, 
  trash, 
  create, 
  search, 
  swapVertical, 
  trophy,
  flash,
  remove
} from 'ionicons/icons';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { filterBySearchTerm, filterByJahrgang } from '../../utils/helpers';

const KonfisView = ({ 
  konfis, 
  jahrgaenge, 
  settings, 
  onUpdate, 
  onAddKonfiClick,
  onSelectKonfi,
  onDeleteKonfi
}) => {
  const [presentActionSheet] = useIonActionSheet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJahrgang, setSelectedJahrgang] = useState('alle');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'points'

  const filteredAndSortedKonfis = (() => {
    let result = filterBySearchTerm(
      filterByJahrgang(konfis, selectedJahrgang),
      searchTerm,
      ['name', 'username']
    );
    
    // Sortierung
    if (sortBy === 'points') {
      result = result.sort((a, b) => {
        const totalA = (a.points?.gottesdienst || 0) + (a.points?.gemeinde || 0);
        const totalB = (b.points?.gottesdienst || 0) + (b.points?.gemeinde || 0);
        return totalB - totalA; // Absteigende Reihenfolge
      });
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  })();



  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  return (
    <>
      {/* Header Card mit Statistiken */}
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
          <IonCardTitle style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            Konfis Verwaltung
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow style={{ textAlign: 'center' }}>
              <IonCol>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                  {filteredAndSortedKonfis.length}
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                  Konfis
                </p>
              </IonCol>
              <IonCol>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                  {filteredAndSortedKonfis.reduce((sum, k) => sum + (k.points?.gottesdienst || 0) + (k.points?.gemeinde || 0), 0)}
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                  Punkte
                </p>
              </IonCol>
              <IonCol>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                  {jahrgaenge?.length || 0}
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: '0.9', margin: '4px 0 0' }}>
                  Jahrgänge
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>

        </IonCardContent>
      </IonCard>

      {/* Add Konfi Button */}
      <div style={{ 
        margin: '0 16px 16px 16px', 
        display: 'flex',
        justifyContent: 'center'
      }}>
        <IonButton
          expand="block"
          fill="solid"
          onClick={onAddKonfiClick}
          style={{
            '--background': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            '--color': 'white',
            '--border-radius': '12px',
            width: '100%',
            height: '48px',
            '--box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)',
            '--background-activated': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            '--background-focused': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            '--background-hover': 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
          }}
        >
          <IonIcon icon={add} slot="start" />
          Neuen Konfi hinzufügen
        </IonButton>
      </div>

      {/* Search & Controls Card */}
      <IonCard style={{
        margin: '16px',
        borderRadius: '12px',
        width: 'calc(100% - 32px)'
      }}>
        <IonCardContent>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: '0 0 8px 0',
              fontSize: '1.125rem'
            }}>
              Suche
            </h3>
          </div>

          <div style={{ 
            '--background': '#f9fafb', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value)}
              placeholder="Konfi suchen..."
              showClearButton="focus"
              style={{ 
                '--background': 'transparent',
                '--border-radius': '0px',
                '--box-shadow': 'none',
                margin: '0',
                padding: '0'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <IonItem button onClick={() => {
              presentActionSheet({
                header: 'Jahrgang wählen',
                buttons: [
                  {
                    text: 'Alle Jahrgänge',
                    handler: () => setSelectedJahrgang('alle')
                  },
                  ...jahrgaenge.map(j => ({
                    text: j.name,
                    handler: () => setSelectedJahrgang(j.name)
                  })),
                  {
                    text: 'Abbrechen',
                    role: 'cancel'
                  }
                ]
              });
            }} style={{ '--background': '#f9fafb', borderRadius: '8px' }}>
              <IonLabel>
                {selectedJahrgang === 'alle' ? 'Alle Jahrgänge' : selectedJahrgang}
              </IonLabel>
            </IonItem>
          </div>

          <IonItem button onClick={() => {
            presentActionSheet({
              header: 'Sortierung',
              buttons: [
                {
                  text: 'Nach Name sortieren',
                  handler: () => setSortBy('name')
                },
                {
                  text: 'Nach Punkten sortieren',
                  handler: () => setSortBy('points')
                },
                {
                  text: 'Abbrechen',
                  role: 'cancel'
                }
              ]
            });
          }} style={{ '--background': '#f9fafb', borderRadius: '8px' }}>
            <IonIcon icon={swapVertical} slot="start" color="medium" />
            <IonLabel>
              {sortBy === 'name' ? 'Nach Name' : 'Nach Punkten'}
            </IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>

      {/* Konfis List */}
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
            Konfis ({filteredAndSortedKonfis.length})
          </h3>
        </IonCardHeader>
        <IonList>
          {filteredAndSortedKonfis.map(konfi => (
            <IonItemSliding key={konfi.id}>
              <IonItem
                button
                onClick={() => onSelectKonfi?.(konfi)}
                detail={true}
                style={{
                  '--background': '#eff6ff',
                  '--border-color': '#bfdbfe',
                  '--color': '#1f2937',
                  margin: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <IonLabel>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      margin: '0',
                      color: '#1f2937'
                    }}>
                      {konfi.name}
                    </h2>
                    {konfi.badgeCount > 0 && (
                      <IonChip color="warning" style={{ '--background': '#fef3c7' }}>
                        <IonIcon icon={trophy} />
                        <IonLabel>{konfi.badgeCount}</IonLabel>
                      </IonChip>
                    )}
                  </div>
                  
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 12px 0'
                  }}>
                    Jahrgang: {konfi.jahrgang}
                  </p>
                  
                  {/* Points Grid */}
                  <IonGrid style={{ padding: '0' }}>
                    <IonRow>
                      {showGottesdienstTarget && (
                        <IonCol style={{ padding: '2px' }}>
                          <div style={{
                            textAlign: 'center',
                            padding: '6px 4px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '6px'
                          }}>
                            <div style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '0.75rem' }}>
                              {konfi.points?.gottesdienst || 0}/{settings.target_gottesdienst}
                            </div>
                            <div style={{ color: '#3b82f6', fontSize: '0.7rem' }}>Gottesdienst</div>
                          </div>
                        </IonCol>
                      )}
                      {showGemeindeTarget && (
                        <IonCol style={{ padding: '2px' }}>
                          <div style={{
                            textAlign: 'center',
                            padding: '6px 4px',
                            backgroundColor: '#dcfce7',
                            borderRadius: '6px'
                          }}>
                            <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '0.75rem' }}>
                              {konfi.points?.gemeinde || 0}/{settings.target_gemeinde}
                            </div>
                            <div style={{ color: '#16a34a', fontSize: '0.7rem' }}>Gemeinde</div>
                          </div>
                        </IonCol>
                      )}
                      <IonCol style={{ padding: '2px' }}>
                        <div style={{
                          textAlign: 'center',
                          padding: '6px 4px',
                          backgroundColor: '#f3e8ff',
                          borderRadius: '6px'
                        }}>
                          <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '0.75rem' }}>
                            {(konfi.points?.gottesdienst || 0) + (konfi.points?.gemeinde || 0)}
                          </div>
                          <div style={{ color: '#8b5cf6', fontSize: '0.7rem' }}>Gesamt</div>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonLabel>
              </IonItem>
              
              <IonItemOptions side="end">
                <IonItemOption color="primary" onClick={() => onSelectKonfi?.(konfi)}>
                  <IonIcon icon={create} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => onDeleteKonfi?.(konfi)}>
                  <IonIcon icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
          
          {filteredAndSortedKonfis.length === 0 && (
            <IonItem style={{ '--background': '#f9fafb' }}>
              <IonLabel>
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  color: '#9ca3af'
                }}>
                  <IonIcon
                    icon={search}
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
                    Keine Konfis gefunden
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

export default KonfisView;
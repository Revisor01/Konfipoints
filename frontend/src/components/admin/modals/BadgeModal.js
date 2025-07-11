import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonList,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { useApp } from '../../../contexts/AppContext';
import api from '../../../services/api';

const CRITERIA_TYPES = {
  total_points: { label: '🎯 Gesamtpunkte', description: 'Summe aller Punkte' },
  gottesdienst_points: { label: '📖 Gottesdienst-Punkte', description: 'Nur gottesdienstliche Punkte' },
  gemeinde_points: { label: '🤝 Gemeinde-Punkte', description: 'Nur gemeindliche Punkte' },
  both_categories: { label: '⚖️ Beide Kategorien', description: 'Mindestpunkte in beiden Bereichen' },
  activity_count: { label: '📊 Aktivitäten-Anzahl', description: 'Gesamtanzahl aller Aktivitäten' },
  unique_activities: { label: '🌟 Verschiedene Aktivitäten', description: 'Anzahl unterschiedlicher Aktivitäten' },
  specific_activity: { label: '🎯 Spezifische Aktivität', description: 'Bestimmte Aktivität X-mal' },
  category_activities: { label: '🏷️ Kategorie-Aktivitäten', description: 'Aktivitäten aus Kategorie' },
  activity_combination: { label: '🎭 Aktivitäts-Kombination', description: 'Kombination von Aktivitäten' }
};

const BadgeModal = ({ badge, activities, onSave, onClose, loading }) => {
  const { setError } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    criteria_type: '',
    criteria_value: 1,
    criteria_extra: {},
    is_active: true,
    is_hidden: false
  });
  
  const [categories, setCategories] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name || '',
        icon: badge.icon || '',
        description: badge.description || '',
        criteria_type: badge.criteria_type || '',
        criteria_value: badge.criteria_value || 1,
        criteria_extra: badge.criteria_extra ? 
          (typeof badge.criteria_extra === 'string' ? JSON.parse(badge.criteria_extra) : badge.criteria_extra) 
          : {},
        is_active: badge.is_active !== undefined ? badge.is_active : true,
        is_hidden: badge.is_hidden !== undefined ? badge.is_hidden : false
      });
      
      if (badge.criteria_extra?.required_activities) {
        setSelectedActivities(badge.criteria_extra.required_activities);
      }
    }
  }, [badge]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/activity-categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories');
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.icon || !formData.criteria_type || !formData.criteria_value) {
      setError('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    const submitData = {
      ...formData,
      criteria_extra: formData.criteria_type === 'activity_combination' 
        ? { required_activities: selectedActivities }
        : formData.criteria_extra
    };

    onSave(submitData);
  };

  const renderExtraFields = () => {
    switch (formData.criteria_type) {
      case 'specific_activity':
        return (
          <IonItem>
            <IonLabel position="stacked">Aktivität wählen</IonLabel>
            <IonSelect
              value={formData.criteria_extra.required_activity_name || ''}
              onSelectionChange={(e) => setFormData({
                ...formData,
                criteria_extra: { required_activity_name: e.detail.value }
              })}
              placeholder="Aktivität wählen..."
            >
              {activities.map(activity => (
                <IonSelectOption key={activity.id} value={activity.name}>
                  {activity.name} ({activity.points} P.)
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        );

      case 'category_activities':
        return (
          <IonItem>
            <IonLabel position="stacked">Kategorie wählen</IonLabel>
            <IonSelect
              value={formData.criteria_extra.required_category || ''}
              onSelectionChange={(e) => setFormData({
                ...formData,
                criteria_extra: { required_category: e.detail.value }
              })}
              placeholder="Kategorie wählen..."
            >
              {categories.map(category => (
                <IonSelectOption key={category} value={category}>{category}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        );

      case 'activity_combination':
        return (
          <>
            <IonItem lines="none">
              <IonLabel>
                <h3>Erforderliche Aktivitäten ({selectedActivities.length})</h3>
              </IonLabel>
            </IonItem>
            {activities.map(activity => (
              <IonItem key={activity.id}>
                <IonCheckbox
                  slot="start"
                  checked={selectedActivities.includes(activity.name)}
                  onIonChange={(e) => {
                    if (e.detail.checked) {
                      setSelectedActivities([...selectedActivities, activity.name]);
                    } else {
                      setSelectedActivities(selectedActivities.filter(n => n !== activity.name));
                    }
                  }}
                />
                <IonLabel style={{ marginLeft: '16px' }}>
                  {activity.name}
                </IonLabel>
              </IonItem>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{badge ? 'Badge bearbeiten' : 'Neues Badge erstellen'}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              Abbrechen
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSubmit}
              disabled={!formData.name || !formData.icon || !formData.criteria_type || !formData.criteria_value || loading}
            >
              {loading ? 'Speichern...' : (badge ? 'Aktualisieren' : 'Erstellen')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
        <IonGrid>
          <IonRow>
            <IonCol size="8">
              <IonItem>
                <IonLabel position="stacked">Name *</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonInput={(e) => setFormData({...formData, name: e.detail.value})}
                  placeholder="z.B. Fleißig"
                />
              </IonItem>
            </IonCol>
            <IonCol size="4">
              <IonItem>
                <IonLabel position="stacked">Icon *</IonLabel>
                <IonInput
                  value={formData.icon}
                  onIonInput={(e) => setFormData({...formData, icon: e.detail.value})}
                  placeholder="🏆"
                  maxlength={2}
                  style={{ textAlign: 'center', fontSize: '1.5rem' }}
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonItem>
          <IonLabel position="stacked">Beschreibung</IonLabel>
          <IonTextarea
            value={formData.description}
            onIonInput={(e) => setFormData({...formData, description: e.detail.value})}
            placeholder="Kurze Beschreibung..."
            rows={2}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Kriterium *</IonLabel>
          <IonSelect
            value={formData.criteria_type}
            onSelectionChange={(e) => setFormData({...formData, criteria_type: e.detail.value})}
            placeholder="Kriterium wählen..."
          >
            {Object.entries(CRITERIA_TYPES).map(([key, type]) => (
              <IonSelectOption key={key} value={key}>{type.label}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        {formData.criteria_type && (
          <IonItem lines="none">
            <IonLabel>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                {CRITERIA_TYPES[formData.criteria_type].description}
              </p>
            </IonLabel>
          </IonItem>
        )}

        <IonItem>
          <IonLabel position="stacked">Wert *</IonLabel>
          <IonInput
            type="number"
            value={formData.criteria_value}
            onIonInput={(e) => setFormData({...formData, criteria_value: parseInt(e.detail.value) || 1})}
            min={1}
          />
        </IonItem>

        {renderExtraFields()}

        <IonItem>
          <IonCheckbox
            slot="start"
            checked={formData.is_active}
            onIonChange={(e) => setFormData({...formData, is_active: e.detail.checked})}
          />
          <IonLabel style={{ marginLeft: '16px' }}>
            <h3>Badge aktiv</h3>
            <p>Badge kann erhalten werden</p>
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonCheckbox
            slot="start"
            checked={formData.is_hidden}
            onIonChange={(e) => setFormData({...formData, is_hidden: e.detail.checked})}
          />
          <IonLabel style={{ marginLeft: '16px' }}>
            <h3>Geheimes Badge 🎭</h3>
            <p>Erst sichtbar wenn erhalten</p>
          </IonLabel>
        </IonItem>

        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default BadgeModal;
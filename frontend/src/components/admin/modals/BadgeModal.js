import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import api from '../../../services/api';
import UniversalModal from '../../shared/UniversalModal';

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
          <div>
            <label className="block text-sm font-medium mb-2">Aktivität wählen</label>
            <select
              value={formData.criteria_extra.required_activity_name || ''}
              onChange={(e) => setFormData({
                ...formData,
                criteria_extra: { required_activity_name: e.target.value }
              })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Aktivität wählen...</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.name}>
                  {activity.name} ({activity.points} P.)
                </option>
              ))}
            </select>
          </div>
        );

      case 'category_activities':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Kategorie wählen</label>
            <select
              value={formData.criteria_extra.required_category || ''}
              onChange={(e) => setFormData({
                ...formData,
                criteria_extra: { required_category: e.target.value }
              })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Kategorie wählen...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        );

      case 'activity_combination':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">
              Erforderliche Aktivitäten ({selectedActivities.length})
            </label>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {activities.map(activity => (
                <label key={activity.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActivities([...selectedActivities, activity.name]);
                      } else {
                        setSelectedActivities(selectedActivities.filter(n => n !== activity.name));
                      }
                    }}
                  />
                  <span className="text-sm">{activity.name}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <UniversalModal
      dismiss={onClose}
      title={badge ? 'Badge bearbeiten' : 'Neues Badge erstellen'}
      onSubmit={handleSubmit}
      submitButtonText={badge ? 'Aktualisieren' : 'Erstellen'}
      submitDisabled={!formData.name || !formData.icon || !formData.criteria_type || !formData.criteria_value}
      loading={loading}
    >
      <div className="p-6 space-y-6">
        <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="z.B. Fleißig"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon *</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className="w-full p-3 border rounded-lg text-2xl text-center"
              placeholder="🏆"
              maxLength={2}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Beschreibung</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border rounded-lg"
            rows="2"
            placeholder="Kurze Beschreibung..."
          />
        </div>

        {/* Criteria */}
        <div>
          <label className="block text-sm font-medium mb-2">Kriterium *</label>
          <select
            value={formData.criteria_type}
            onChange={(e) => setFormData({...formData, criteria_type: e.target.value})}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Kriterium wählen...</option>
            {Object.entries(CRITERIA_TYPES).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
          {formData.criteria_type && (
            <p className="text-xs text-gray-600 mt-1">
              {CRITERIA_TYPES[formData.criteria_type].description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Wert *</label>
          <input
            type="number"
            value={formData.criteria_value}
            onChange={(e) => setFormData({...formData, criteria_value: parseInt(e.target.value) || 1})}
            className="w-full p-3 border rounded-lg"
            min="1"
          />
        </div>

        {renderExtraFields()}

        {/* Settings */}
        <div className="space-y-3 pt-3 border-t">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium">Badge aktiv</div>
              <div className="text-xs text-gray-600">Badge kann erhalten werden</div>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_hidden}
              onChange={(e) => setFormData({...formData, is_hidden: e.target.checked})}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium">Geheimes Badge 🎭</div>
              <div className="text-xs text-gray-600">Erst sichtbar wenn erhalten</div>
            </div>
          </label>
        </div>
        </div>
      </div>
    </UniversalModal>
  );
};

export default BadgeModal;
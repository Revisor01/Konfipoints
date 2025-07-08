import React, { useState, useEffect } from 'react';
import { Loader, Save, X } from 'lucide-react';

// Enhanced Badge Management Modal
export const BadgeModal = ({ 
  show, 
  onClose, 
  badge, 
  criteriaTypes, 
  activities,
  onSubmit, 
  loading 
}) => {
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
  
  // Organize criteria types by category
  const criteriaCategories = [
    {
      title: "🎯 Punkte-basierte Kriterien",
      subtitle: "Einfach zu verwenden, basierend auf Punktzahlen",
      types: ['total_points', 'gottesdienst_points', 'gemeinde_points', 'both_categories']
    },
    {
      title: "📊 Aktivitäts-basierte Kriterien", 
      subtitle: "Basierend auf Anzahl und Art der Aktivitäten",
      types: ['activity_count', 'unique_activities']
    },
    {
      title: "🎯 Spezifische Aktivitäts-Kriterien",
      subtitle: "Für bestimmte Aktivitäten oder Kombinationen",
      types: ['specific_activity', 'category_activities', 'activity_combination']
    },
    {
      title: "⏰ Zeit-basierte Kriterien",
      subtitle: "Für zeitabhängige Leistungen und Serien",
      types: ['time_based', 'streak']
    },
    {
      title: "💎 Spezial-Kriterien",
      subtitle: "Für besondere Situationen",
      types: ['bonus_points']
    }
  ];
  
  // Load categories when modal opens
  useEffect(() => {
    if (show) {
      // This would be passed as prop or imported from API
      setCategories([]);
    }
  }, [show]);
  
  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name || '',
        icon: badge.icon || '',
        description: badge.description || '',
        criteria_type: badge.criteria_type || '',
        criteria_value: badge.criteria_value || 1,
        criteria_extra: badge.criteria_extra ? 
          (typeof badge.criteria_extra === 'string' ? JSON.parse(badge.criteria_extra) : badge.criteria_extra) : {},
        is_active: badge.is_active !== undefined ? badge.is_active : true,
        is_hidden: badge.is_hidden !== undefined ? badge.is_hidden : false
      });
    } else {
      setFormData({
        name: '',
        icon: '',
        description: '',
        criteria_type: '',
        criteria_value: 1,
        criteria_extra: {},
        is_active: true,
        is_hidden: false
      });
    }
  }, [badge]);
  
  if (!show) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Get help text for selected criteria type
  const getHelpText = () => {
    if (!formData.criteria_type || !criteriaTypes[formData.criteria_type]) {
      return null;
    }
    return criteriaTypes[formData.criteria_type].help;
  };
  
  const renderExtraFields = () => {
    switch (formData.criteria_type) {
      case 'activity_combination':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Erforderliche Aktivitäten</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {activities.map(activity => (
                <label key={activity.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formData.criteria_extra.required_activities || []).includes(activity.name)}
                    onChange={(e) => {
                      const current = formData.criteria_extra.required_activities || [];
                      const updated = e.target.checked 
                        ? [...current, activity.name]
                        : current.filter(name => name !== activity.name);
                      setFormData({
                        ...formData,
                        criteria_extra: { ...formData.criteria_extra, required_activities: updated }
                      });
                    }}
                  />
                  <span className="text-sm">{activity.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
              💡 Alle ausgewählten Aktivitäten müssen mindestens einmal absolviert werden.
            </p>
          </div>
        );
      
      case 'category_activities':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Kategorie wählen</label>
            <select
              value={formData.criteria_extra.required_category || ''}
              onChange={(e) => setFormData({
                ...formData,
                criteria_extra: { ...formData.criteria_extra, required_category: e.target.value }
              })}
              className="w-full p-2 border rounded"
            >
              <option value="">Kategorie wählen...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
              💡 Beispiel: {formData.criteria_value} Aktivitäten aus Kategorie "{formData.criteria_extra.required_category || '...'}"
            </p>
          </div>
        );
      
      case 'specific_activity':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Aktivität wählen</label>
            <select
              value={formData.criteria_extra.required_activity_name || ''}
              onChange={(e) => setFormData({
                ...formData,
                criteria_extra: { ...formData.criteria_extra, required_activity_name: e.target.value }
              })}
              className="w-full p-2 border rounded"
            >
              <option value="">Aktivität wählen...</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.name}>
                  {activity.name} ({activity.points} Punkte - {activity.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'})
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
              💡 Beispiel: {formData.criteria_value}x "{formData.criteria_extra.required_activity_name || '...'}" absolvieren
            </p>
          </div>
        );
      
      case 'time_based':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Zeitraum (Tage)</label>
            <input
              type="number"
              value={formData.criteria_extra.days || 7}
              onChange={(e) => setFormData({
                ...formData,
                criteria_extra: { ...formData.criteria_extra, days: parseInt(e.target.value) || 7 }
              })}
              className="w-full p-2 border rounded"
              min="1"
              max="365"
            />
            <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
              💡 Beispiel: {formData.criteria_value} Aktivitäten in {formData.criteria_extra.days || 7} Tagen
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">
          {badge ? 'Badge bearbeiten' : 'Neues Badge erstellen'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                placeholder="z.B. All-Rounder"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon *</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                placeholder="🏆"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded text-sm"
              rows="2"
              placeholder="z.B. Drei verschiedene Aktivitäten in einer Woche"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Kriterium *</label>
              <select
                value={formData.criteria_type}
                onChange={(e) => setFormData({...formData, criteria_type: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                required
              >
                <option value="">Kriterium wählen...</option>
                {criteriaCategories.map(category => (
                  <optgroup key={category.title} label={category.title}>
                    {category.types.map(typeKey => (
                      <option key={typeKey} value={typeKey}>
                        {criteriaTypes[typeKey]?.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {formData.criteria_type && (
                <p className="text-xs text-gray-600 mt-1">
                  {criteriaTypes[formData.criteria_type]?.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wert *</label>
              <input
                type="number"
                value={formData.criteria_value}
                onChange={(e) => setFormData({...formData, criteria_value: parseInt(e.target.value) || 1})}
                className="w-full p-2 border rounded text-sm"
                min="1"
                required
              />
            </div>
          </div>
          
          {/* Help Text für ausgewähltes Kriterium */}
          {getHelpText() && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-sm">💡</span>
                <p className="text-sm text-yellow-800">{getHelpText()}</p>
              </div>
            </div>
          )}
          
          {renderExtraFields()}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                id="is-active"
              />
              <label htmlFor="is-active" className="text-sm">Badge aktiv</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_hidden}
                onChange={(e) => setFormData({...formData, is_hidden: e.target.checked})}
                id="is-hidden"
              />
              <label htmlFor="is-hidden" className="text-sm">Geheimes Badge 🎭</label>
            </div>
            <p className="text-xs text-gray-500">Geheime Badges sind erst sichtbar, wenn sie erreicht wurden</p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {loading && <Loader className="w-3 h-3 animate-spin" />}
              <Save className="w-3 h-3" />
              {badge ? 'Aktualisieren' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
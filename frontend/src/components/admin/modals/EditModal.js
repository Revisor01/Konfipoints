import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import UniversalModal from '../../shared/UniversalModal';
import { updateActivity } from '../../../services/activity';
import { updateBadge, BADGE_CRITERIA_TYPES } from '../../../services/badge';
import { updateKonfi } from '../../../services/konfi';
import { updateAdmin } from '../../../services/admin';
import { updateJahrgang } from '../../../services/jahrgang';

const EditModal = ({ 
  isOpen, 
  onClose, 
  item, 
  itemType, // 'activity', 'badge', 'konfi', 'admin', 'jahrgang'
  onSuccess 
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
      setError('');
    }
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    switch (itemType) {
      case 'activity':
        if (!formData.name?.trim()) {
          setError('Name ist erforderlich');
          return false;
        }
        if (!formData.points || formData.points <= 0) {
          setError('Punkte müssen größer als 0 sein');
          return false;
        }
        break;
        
      case 'badge':
        if (!formData.name?.trim()) {
          setError('Badge-Name ist erforderlich');
          return false;
        }
        if (!formData.criteria_type) {
          setError('Kriterium-Typ ist erforderlich');
          return false;
        }
        if (!formData.criteria_value || formData.criteria_value <= 0) {
          setError('Kriterium-Wert muss größer als 0 sein');
          return false;
        }
        break;
        
      case 'konfi':
        if (!formData.name?.trim()) {
          setError('Name ist erforderlich');
          return false;
        }
        break;
        
      case 'admin':
        if (!formData.name?.trim()) {
          setError('Name ist erforderlich');
          return false;
        }
        if (!formData.email?.trim()) {
          setError('E-Mail ist erforderlich');
          return false;
        }
        break;
        
      case 'jahrgang':
        if (!formData.name?.trim()) {
          setError('Jahrgang-Name ist erforderlich');
          return false;
        }
        break;
        
      default:
        setError('Unbekannter Item-Typ');
        return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const updateData = { ...formData };
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;
      
      switch (itemType) {
        case 'activity':
          await updateActivity(item.id, updateData);
          break;
        case 'badge':
          await updateBadge(item.id, updateData);
          break;
        case 'konfi':
          await updateKonfi(item.id, updateData);
          break;
        case 'admin':
          await updateAdmin(item.id, updateData);
          break;
        case 'jahrgang':
          await updateJahrgang(item.id, updateData);
          break;
        default:
          throw new Error('Unbekannter Item-Typ');
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const types = {
      activity: 'Aktivität',
      badge: 'Badge',
      konfi: 'Konfi',
      admin: 'Admin',
      jahrgang: 'Jahrgang'
    };
    return `${types[itemType] || 'Element'} bearbeiten`;
  };

  const renderFormFields = () => {
    switch (itemType) {
      case 'activity':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Punkte *
              </label>
              <input
                type="number"
                name="points"
                value={formData.points || ''}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );
        
      case 'badge':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge-Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kriterium-Typ *
              </label>
              <select
                name="criteria_type"
                value={formData.criteria_type || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Typ auswählen...</option>
                {Object.entries(BADGE_CRITERIA_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kriterium-Wert *
              </label>
              <input
                type="number"
                name="criteria_value"
                value={formData.criteria_value || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon/Emoji
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🏆"
              />
            </div>
          </>
        );
        
      case 'konfi':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );
        
      case 'admin':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </>
        );
        
      case 'jahrgang':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jahrgang-Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. 2024"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active || false}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Aktiver Jahrgang</span>
              </label>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  if (!item) return null;

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {renderFormFields()}

        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <X size={16} className="inline mr-1" />
            Abbrechen
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline mr-2"></div>
            ) : (
              <Save size={16} className="inline mr-1" />
            )}
            Änderungen speichern
          </button>
        </div>
      </form>
    </UniversalModal>
  );
};

export default EditModal;
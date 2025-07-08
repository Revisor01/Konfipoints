import React, { useState } from 'react';
import { Gift, Save, X, Users } from 'lucide-react';
import UniversalModal from '../../shared/UniversalModal';
import { createBonusPoints } from '../../../services/bonusPoints';

const BonusPointsModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  konfis = [],
  selectedKonfi = null 
}) => {
  const [formData, setFormData] = useState({
    konfi_id: selectedKonfi?.id || '',
    points: '',
    reason: '',
    category: 'manual'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'manual', label: 'Manuell vergeben' },
    { value: 'participation', label: 'Teilnahme' },
    { value: 'behavior', label: 'Verhalten' },
    { value: 'achievement', label: 'Besondere Leistung' },
    { value: 'help', label: 'Hilfsbereitschaft' },
    { value: 'creativity', label: 'Kreativität' },
    { value: 'other', label: 'Sonstiges' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.konfi_id) {
      setError('Bitte wähle einen Konfi aus');
      return false;
    }
    
    if (!formData.points || formData.points <= 0) {
      setError('Bitte gib eine gültige Punktzahl ein');
      return false;
    }
    
    if (formData.points > 100) {
      setError('Maximal 100 Bonuspunkte pro Vergabe');
      return false;
    }
    
    if (!formData.reason.trim()) {
      setError('Bitte gib einen Grund an');
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
      await createBonusPoints({
        ...formData,
        points: parseInt(formData.points)
      });
      
      onSuccess?.();
      onClose();
      
      setFormData({
        konfi_id: '',
        points: '',
        reason: '',
        category: 'manual'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedKonfiData = konfis.find(k => k.id === parseInt(formData.konfi_id));

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bonuspunkte vergeben"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users size={16} className="inline mr-1" />
            Konfi auswählen *
          </label>
          <select
            name="konfi_id"
            value={formData.konfi_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Konfi auswählen...</option>
            {konfis.map(konfi => (
              <option key={konfi.id} value={konfi.id}>
                {konfi.name} ({konfi.total_points || 0} Punkte)
              </option>
            ))}
          </select>
          
          {selectedKonfiData && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedKonfiData.name}</strong> hat aktuell{' '}
                <span className="font-semibold">{selectedKonfiData.total_points || 0}</span> Punkte
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Gift size={16} className="inline mr-1" />
            Bonuspunkte *
          </label>
          <input
            type="number"
            name="points"
            value={formData.points}
            onChange={handleInputChange}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Anzahl Punkte (1-100)"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximal 100 Punkte pro Vergabe
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategorie
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grund/Beschreibung *
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Warum bekommt der Konfi diese Bonuspunkte?"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.reason.length}/200 Zeichen
          </p>
        </div>

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
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline mr-2"></div>
            ) : (
              <Gift size={16} className="inline mr-1" />
            )}
            Bonuspunkte vergeben
          </button>
        </div>
      </form>
    </UniversalModal>
  );
};

export default BonusPointsModal;
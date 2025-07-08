// frontend/src/components/admin/BadgesView.js
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import BadgeModal from './modals/BadgeModal';

const BadgesView = ({ badges, activities, onUpdate }) => {
  const { setSuccess, setError } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editBadge, setEditBadge] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSaveBadge = async (badgeData) => {
    setLoading(true);
    try {
      if (editBadge) {
        await api.put(`/badges/${editBadge.id}`, badgeData);
        setSuccess('Badge aktualisiert');
      } else {
        await api.post('/badges', badgeData);
        setSuccess('Badge erstellt');
      }
      setShowModal(false);
      setEditBadge(null);
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

  const openEditModal = (badge) => {
    setEditBadge(badge);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header Card - Original Style */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-3">Badges Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-xs opacity-80">Badges</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {badges.filter(b => b.criteria_type === 'points').length}
            </div>
            <div className="text-xs opacity-80">Punkte</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {badges.filter(b => b.criteria_type === 'activities').length}
            </div>
            <div className="text-xs opacity-80">Aktivitäten</div>
          </div>
        </div>
      </div>

      {/* Control Card */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Badges ({badges.length})</h3>
          <button
            onClick={() => {
              setEditBadge(null);
              setShowModal(true);
            }}
            className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Neues Badge
          </button>
        </div>
      </div>

      {/* Badges List - Original Style */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-3">
          {badges.map(badge => (
            <div 
              key={badge.id} 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => openEditModal(badge)}
            >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-4xl flex-shrink-0">{badge.icon}</div>
              
              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{badge.name}</h3>
                {badge.description && (
                  <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                )}
                
                {/* Criteria */}
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Kriterium:</span> {badge.criteria_type}
                  {badge.criteria_value && ` ≥ ${badge.criteria_value}`}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    badge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {badge.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  
                  {badge.is_hidden && (
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Geheim
                    </span>
                  )}
                  
                  {badge.earned_count > 0 && (
                    <span className="text-xs text-gray-600">
                      {badge.earned_count}x erhalten
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEditModal(badge)}
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBadge(badge)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
          
          {badges.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Noch keine Badges erstellt</p>
            </div>
          )}
        </div>
      </div>

      {/* Badge Modal */}
      {showModal && (
        <BadgeModal
          badge={editBadge}
          activities={activities}
          onSave={handleSaveBadge}
          onClose={() => {
            setShowModal(false);
            setEditBadge(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default BadgesView;
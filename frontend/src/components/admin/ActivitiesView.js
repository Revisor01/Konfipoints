// frontend/src/components/admin/ActivitiesView.js
import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Heart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import Modal from '../shared/Modal';

const ActivitiesView = ({ activities, onUpdate }) => {
  const { setSuccess, setError } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    points: 1,
    type: 'gottesdienst',
    category: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editActivity) {
        await api.put(`/activities/${editActivity.id}`, formData);
        setSuccess('Aktivität aktualisiert');
      } else {
        await api.post('/activities', formData);
        setSuccess('Aktivität erstellt');
      }
      setShowModal(false);
      resetForm();
      onUpdate();
    } catch (err) {
      setError('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activity) => {
    if (!window.confirm(`Aktivität "${activity.name}" wirklich löschen?`)) return;
    
    try {
      await api.delete(`/activities/${activity.id}`);
      setSuccess('Aktivität gelöscht');
      onUpdate();
    } catch (err) {
      setError('Kann nicht gelöscht werden - Aktivität wurde bereits zugeordnet');
    }
  };

  const openEditModal = (activity) => {
    setEditActivity(activity);
    setFormData({
      name: activity.name,
      points: activity.points,
      type: activity.type,
      category: activity.category || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditActivity(null);
    setFormData({
      name: '',
      points: 1,
      type: 'gottesdienst',
      category: ''
    });
  };

  const gottesdienstActivities = activities.filter(a => a.type === 'gottesdienst');
  const gemeindeActivities = activities.filter(a => a.type === 'gemeinde');

  return (
    <div className="space-y-4">
      {/* Header Card - Original Style */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-3">Aktivitäten Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{activities.length}</div>
            <div className="text-xs opacity-80">Aktivitäten</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {gottesdienstActivities.length}
            </div>
            <div className="text-xs opacity-80">Gottesdienst</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {gemeindeActivities.length}
            </div>
            <div className="text-xs opacity-80">Gemeinde</div>
          </div>
        </div>
      </div>

      {/* Control Card */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Aktivitäten ({activities.length})</h3>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Neue Aktivität
          </button>
        </div>
      </div>

      {/* Gottesdienst Activities - Original Style */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Gottesdienstliche Aktivitäten
        </h3>
        <div className="space-y-2">
          {gottesdienstActivities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onEdit={() => openEditModal(activity)}
              onDelete={() => handleDelete(activity)}
              color="blue"
            />
          ))}
          {gottesdienstActivities.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Keine gottesdienstlichen Aktivitäten
            </p>
          )}
        </div>
      </div>

      {/* Gemeinde Activities */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-green-600" />
          Gemeindliche Aktivitäten
        </h3>
        <div className="space-y-2">
          {gemeindeActivities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onEdit={() => openEditModal(activity)}
              onDelete={() => handleDelete(activity)}
              color="green"
            />
          ))}
          {gemeindeActivities.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Keine gemeindlichen Aktivitäten
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editActivity ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
        onSubmit={handleSubmit}
        submitDisabled={!formData.name.trim()}
        loading={loading}
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="z.B. Sonntagsgottesdienst"
              className="w-full p-3 border rounded-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Punkte *</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 1})}
                min="1"
                max="10"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Typ *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="gottesdienst">Gottesdienstlich</option>
                <option value="gemeinde">Gemeindlich</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Kategorien (optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="z.B. jugend,musik (kommagetrennt)"
              className="w-full p-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Kategorien helfen bei der Badge-Vergabe
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity, onEdit, onDelete, color }) => {
  return (
    <div className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
      <div className="flex-1">
        <div className="font-medium">{activity.name}</div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className={`font-bold text-${color}-600`}>
            {activity.points} {activity.points === 1 ? 'Punkt' : 'Punkte'}
          </span>
          {activity.category && (
            <div className="flex flex-wrap gap-1">
              {activity.category.split(',').map((cat, idx) => (
                <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {cat.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 bg-blue-500 text-white rounded"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-500 text-white rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ActivitiesView;
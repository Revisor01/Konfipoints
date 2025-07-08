import React, { useState } from 'react';
import { 
  Plus, BookOpen, Heart, Edit, Trash2, Loader
} from 'lucide-react';

const AdminActivities = ({
  activities,
  newActivityName,
  setNewActivityName,
  newActivityPoints,
  setNewActivityPoints,
  newActivityType,
  setNewActivityType,
  newActivityCategory,
  setNewActivityCategory,
  handleCreate,
  showActivityActionSheet,
  setShowActivityActionSheet,
  selectedActionActivity,
  setSelectedActionActivity,
  setEditType,
  setEditItem,
  setShowEditModal,
  setDeleteType,
  setDeleteItem,
  setShowDeleteModal,
  loading
}) => {
  return (
    <div className="space-y-4 pt-10">
      {/* Activity Action Sheet */}
      <ActivityActionSheet
        show={showActivityActionSheet}
        onClose={() => {
          setShowActivityActionSheet(false);
          setSelectedActionActivity(null);
        }}
        activity={selectedActionActivity}
        onEdit={() => {
          setEditType('activity');
          setEditItem(selectedActionActivity);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setDeleteType('activity');
          setDeleteItem(selectedActionActivity);
          setShowDeleteModal(true);
        }}
      />
      
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Aktivitäten verwalten</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{activities.length}</div>
            <div className="text-xs opacity-80">Aktivitäten</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activities.filter(a => a.type === 'gottesdienst').length}</div>
            <div className="text-xs opacity-80">Gottesdienst</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activities.filter(a => a.type === 'gemeinde').length}</div>
            <div className="text-xs opacity-80">Gemeinde</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Neue Aktivität hinzufügen</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            placeholder="Name der Aktivität"
            className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newActivityPoints}
              onChange={(e) => setNewActivityPoints(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              placeholder="Punkte"
              className="p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
            />
            <select
              value={newActivityType}
              onChange={(e) => setNewActivityType(e.target.value)}
              className="p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
            >
              <option value="gottesdienst">Gottesdienstlich</option>
              <option value="gemeinde">Gemeindlich</option>
            </select>
          </div>
          <input
            type="text"
            value={newActivityCategory}
            onChange={(e) => setNewActivityCategory(e.target.value)}
            placeholder="Kategorien (kommagetrennt: Kinder,Fest)"
            className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
          <button
            onClick={() => handleCreate('activities', {
              name: newActivityName.trim(),
              points: newActivityPoints,
              type: newActivityType,
              category: newActivityCategory.trim()
            })}
            disabled={loading || !newActivityName.trim()}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Hinzufügen
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" />
          Gottesdienstliche Aktivitäten
        </h3>
        <div className="space-y-3">
          {activities.filter(a => a.type === 'gottesdienst').map(activity => (
            <div 
              key={activity.id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => {
                setSelectedActionActivity(activity);
                setShowActivityActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800 text-base flex-1">{activity.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                    {activity.points}P
                  </span>
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              
              {activity.category && (
                <div className="flex flex-wrap gap-1">
                  {activity.category.split(',').map((cat, index) => (
                    <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {activities.filter(a => a.type === 'gottesdienst').length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Keine gottesdienstlichen Aktivitäten</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5" />
          Gemeindliche Aktivitäten
        </h3>
        <div className="space-y-3">
          {activities.filter(a => a.type === 'gemeinde').map(activity => (
            <div 
              key={activity.id}
              className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => {
                setSelectedActionActivity(activity);
                setShowActivityActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800 text-base flex-1">{activity.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">
                    {activity.points}P
                  </span>
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
              </div>
              
              {activity.category && (
                <div className="flex flex-wrap gap-1">
                  {activity.category.split(',').map((cat, index) => (
                    <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {activities.filter(a => a.type === 'gemeinde').length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Keine gemeindlichen Aktivitäten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component
const ActivityActionSheet = ({ show, onClose, activity, onEdit, onDelete }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{activity?.name}</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{activity?.points} Punkte • {activity?.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}</p>
          {activity?.category && (
            <div className="flex flex-wrap gap-1 mt-2">
              {activity.category.split(',').map((cat, index) => (
                <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                  {cat.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Bearbeiten
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Löschen
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActivities;
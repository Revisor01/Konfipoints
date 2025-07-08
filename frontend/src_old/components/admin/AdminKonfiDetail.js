import React, { useState } from 'react';
import { 
  Gift, RefreshCw, Trash2, Eye, EyeOff, BookOpen, Heart, Award, 
  Calendar, ChevronDown, Plus
} from 'lucide-react';

const AdminKonfiDetail = ({
  selectedKonfi,
  user,
  settings,
  activities,
  passwordVisibility,
  togglePasswordVisibility,
  setBonusKonfiId,
  setShowBonusModal,
  regeneratePassword,
  setDeleteType,
  setDeleteItem,
  setShowDeleteModal,
  getProgressColor,
  assignActivityToKonfi,
  removeActivityFromKonfi,
  removeBonusPointsFromKonfi,
  formatDate,
  activityDate,
  setActivityDate,
  loading,
  showKonfiActivityActionSheet,
  setShowKonfiActivityActionSheet,
  selectedActionActivity,
  setSelectedActionActivity,
  showBonusActionSheet,
  setShowBonusActionSheet,
  selectedActionBonus,
  setSelectedActionBonus
}) => {
  const [activitySort, setActivitySort] = useState('name');

  // Check if targets should be shown (not 0)
  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  return (
    <div className="space-y-4">
      {/* Action Sheets */}
      <KonfiActivityActionSheet
        show={showKonfiActivityActionSheet}
        onClose={() => {
          setShowKonfiActivityActionSheet(false);
          setSelectedActionActivity(null);
        }}
        activity={selectedActionActivity}
        onRemove={() => removeActivityFromKonfi(selectedKonfi.id, selectedActionActivity.id)}
        loading={loading}
        konfiName={selectedKonfi.name}
      />
      
      <KonfiBonusActionSheet
        show={showBonusActionSheet}
        onClose={() => {
          setShowBonusActionSheet(false);
          setSelectedActionBonus(null);
        }}
        bonus={selectedActionBonus}
        onRemove={() => removeBonusPointsFromKonfi(selectedKonfi.id, selectedActionBonus.id)}
        loading={loading}
        konfiName={selectedKonfi.name}
      />

      {/* Header Card */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2">{selectedKonfi.name}</h2>
        <p className="text-sm opacity-90">
          {selectedKonfi.jahrgang} • {selectedKonfi.username}
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold">{selectedKonfi.points.gottesdienst + selectedKonfi.points.gemeinde}</div>
            <div className="text-xs opacity-80">Punkte</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{selectedKonfi.activities?.length || 0}</div>
            <div className="text-xs opacity-80">Aktivitäten</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{selectedKonfi.badges?.length || 0}</div>
            <div className="text-xs opacity-80">Badges</div>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Aktionen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setBonusKonfiId(selectedKonfi.id);
              setShowBonusModal(true);
            }}
            className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium text-base"
          >
            <Gift className="w-4 h-4" />
            Zusatzpunkte
          </button>
          <button
            onClick={() => regeneratePassword(selectedKonfi.id)}
            className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium text-base"
          >
            <RefreshCw className="w-4 h-4" />
            Neues Passwort
          </button>
          <button
            onClick={() => {
              setDeleteType('konfi');
              setDeleteItem(selectedKonfi);
              setShowDeleteModal(true);
            }}
            className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium text-base"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        </div>

        {/* Password Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Passwort:</span>
            {passwordVisibility[selectedKonfi.id] ? (
              <span className="font-mono">{selectedKonfi.password}</span>
            ) : (
              <span>••••••••••</span>
            )}
            <button
              onClick={() => togglePasswordVisibility(selectedKonfi.id)}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              {passwordVisibility[selectedKonfi.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      {(showGottesdienstTarget || showGemeindeTarget) && (
        <div className={`grid gap-4 ${showGottesdienstTarget && showGemeindeTarget ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {showGottesdienstTarget && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Gottesdienst
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {selectedKonfi.points.gottesdienst}/{settings.target_gottesdienst}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gottesdienst, settings.target_gottesdienst)}`}
                  style={{ width: `${Math.min((selectedKonfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {showGemeindeTarget && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Gemeinde
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {selectedKonfi.points.gemeinde}/{settings.target_gemeinde}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gemeinde, settings.target_gemeinde)}`}
                  style={{ width: `${Math.min((selectedKonfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges Card */}
      {selectedKonfi.badges && selectedKonfi.badges.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Erreichte Badges ({selectedKonfi.badges.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {selectedKonfi.badges.map(badge => (
              <div key={badge.id} className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className="text-xs font-bold text-yellow-800 leading-tight mb-1">{badge.name}</div>
                <div className="text-xs text-gray-500">{formatDate(badge.earned_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Assignment Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Schnell-Zuordnung</h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <div className="relative">
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
                style={{ 
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortierung</label>
            <div className="relative">
              <select
                value={activitySort}
                onChange={(e) => setActivitySort(e.target.value)}
                className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
              >
                <option value="name">Nach Name</option>
                <option value="points">Nach Punkten</option>
                <option value="type">Nach Typ</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {activities
            .sort((a, b) => {
              if (activitySort === 'points') return b.points - a.points;
              if (activitySort === 'type') return a.type.localeCompare(b.type);
              return a.name.localeCompare(b.name);
            })
            .map(activity => (
              <button
                key={activity.id}
                onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
                disabled={loading}
                className={`w-full text-left p-3 rounded-lg border text-sm disabled:opacity-50 transition-colors ${
                  activity.type === 'gottesdienst' 
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' 
                    : 'bg-green-50 hover:bg-green-100 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {activity.type === 'gottesdienst' ? (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Heart className="w-4 h-4 text-green-600" />
                    )}
                    <span className="font-medium">{activity.name}</span>
                  </div>
                  <span className={`font-bold ${
                    activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    +{activity.points}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Activities & Bonus Points List */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Absolvierte Aktivitäten & Zusatzpunkte</h3>
        {(selectedKonfi.activities.length === 0 && (!selectedKonfi.bonusPoints || selectedKonfi.bonusPoints.length === 0)) ? (
          <p className="text-gray-600 text-center py-8">Noch keine Aktivitäten absolviert.</p>
        ) : (
          <div className="space-y-3">
            {/* Aktivitäten */}
            {selectedKonfi.activities.map((activity, index) => (
              <div 
                key={`activity-${index}`}
                className={`border rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md ${
                  activity.type === 'gottesdienst' 
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                    : 'bg-green-50 border-green-200 hover:bg-green-100'
                }`}
                onClick={() => {
                  setSelectedActionActivity(activity);
                  setShowKonfiActivityActionSheet(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {activity.type === 'gottesdienst' ? (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Heart className="w-4 h-4 text-green-600" />
                    )}
                    <h4 className="font-bold text-gray-800 text-sm">{activity.name}</h4>
                  </div>
                  <span className={`font-bold text-sm ${
                    activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    +{activity.points}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{activity.admin || 'System'}</span>
                  <span>{formatDate(activity.date)}</span>
                </div>

                {activity.category && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activity.category.split(',').map((cat, catIndex) => (
                      <span key={catIndex} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Zusatzpunkte */}
            {selectedKonfi.bonusPoints && selectedKonfi.bonusPoints.map((bonus, index) => (
              <div 
                key={`bonus-${index}`}
                className="border rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md bg-orange-50 border-orange-200 hover:bg-orange-100"
                onClick={() => {
                  setSelectedActionBonus(bonus);
                  setShowBonusActionSheet(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-orange-600" />
                    <h4 className="font-bold text-gray-800 text-sm">{bonus.description}</h4>
                  </div>
                  <span className="font-bold text-sm text-orange-600">+{bonus.points}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{bonus.admin || 'System'}</span>
                  <span>{formatDate(bonus.date)}</span>
                </div>

                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    bonus.type === 'gottesdienst' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {bonus.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const KonfiActivityActionSheet = ({ show, onClose, activity, onRemove, loading, konfiName }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{activity?.name}</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Konfi: {konfiName}</p>
          <p className="text-sm text-gray-600">{activity?.points} Punkte • {activity?.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}</p>
          <p className="text-xs text-gray-500">Datum: {activity?.date}</p>
          {activity?.admin && <p className="text-xs text-gray-500">Von: {activity.admin}</p>}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              onRemove();
              onClose();
            }}
            disabled={loading}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Aktivität entfernen
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

const KonfiBonusActionSheet = ({ show, onClose, bonus, onRemove, loading, konfiName }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{bonus?.description}</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Konfi: {konfiName}</p>
          <p className="text-sm text-gray-600">{bonus?.points} Punkte • {bonus?.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}</p>
          <p className="text-xs text-gray-500">Datum: {bonus?.date}</p>
          {bonus?.admin && <p className="text-xs text-gray-500">Von: {bonus.admin}</p>}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              onRemove();
              onClose();
            }}
            disabled={loading}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Zusatzpunkte entfernen
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

export default AdminKonfiDetail;
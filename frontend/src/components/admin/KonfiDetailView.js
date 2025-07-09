// frontend/src/components/admin/KonfiDetailView.js
import React, { useState } from 'react';
import { ArrowLeft, Gift, Eye, EyeOff, Copy, Check, Trash2, Plus, RefreshCw, BookOpen, Heart, Star, Award } from 'lucide-react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { formatDate, formatShortDate } from '../../utils/formatters';
import { copyToClipboard, getProgressPercentage } from '../../utils/helpers';
import BadgeDisplay from '../shared/BadgeDisplay';
import Modal from '../shared/Modal';

const KonfiDetailView = ({ konfi, onBack, activities, settings, onUpdate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Bonus points state
  const [bonus, setBonus] = useState({
    description: '',
    points: 1,
    type: 'gottesdienst',
    date: new Date().toISOString().split('T')[0]
  });

  // Activity assignment state
  const [activityAssign, setActivityAssign] = useState({
    activityId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(konfi.password);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddBonus = async () => {
    setLoading(true);
    try {
      await api.post(`/konfis/${konfi.id}/bonus-points`, {
        ...bonus,
        completed_date: bonus.date
      });
      alert('Zusatzpunkte erfolgreich vergeben');
      setShowBonusModal(false);
      onUpdate();
    } catch (err) {
      alert('Fehler beim Vergeben der Punkte');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveActivity = async (recordId) => {
    if (!window.confirm('Möchten Sie diese Aktivität wirklich entfernen?')) return;
    
    try {
      await api.delete(`/konfis/${konfi.id}/activities/${recordId}`);
      alert('Aktivität erfolgreich entfernt');
      onUpdate();
    } catch (err) {
      alert('Fehler beim Entfernen der Aktivität');
    }
  };

  const handleGenerateNewPassword = async () => {
    if (!window.confirm('Möchten Sie ein neues Passwort für diesen Konfi generieren?')) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfi.id}/regenerate-password`);
      alert(`Neues Passwort: ${response.data.password}`);
      onUpdate();
    } catch (err) {
      alert('Fehler beim Generieren des neuen Passworts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKonfi = async () => {
    if (!window.confirm(`Möchten Sie ${konfi.name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    
    setLoading(true);
    try {
      await api.delete(`/konfis/${konfi.id}`);
      alert('Konfi erfolgreich gelöscht');
      onBack();
    } catch (err) {
      alert('Fehler beim Löschen des Konfis');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBonus = async (bonusId) => {
    if (!window.confirm('Möchten Sie diese Zusatzpunkte wirklich entfernen?')) return;
    
    try {
      await api.delete(`/konfis/${konfi.id}/bonus-points/${bonusId}`);
      alert('Zusatzpunkte erfolgreich entfernt');
      onUpdate();
    } catch (err) {
      alert('Fehler beim Entfernen der Zusatzpunkte');
    }
  };

  const handleAssignActivity = async (activityId) => {
    if (!activityAssign.date) {
      alert('Bitte wählen Sie ein Datum aus');
      return;
    }
    
    setLoading(true);
    try {
      await api.post(`/konfis/${konfi.id}/activities`, { 
        activity_id: activityId,
        completed_date: activityAssign.date
      });
      alert('Aktivität erfolgreich zugeordnet');
      onUpdate();
    } catch (err) {
      alert('Fehler beim Zuordnen der Aktivität');
    } finally {
      setLoading(false);
    }
  };

  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  const doRefresh = async (event) => {
    await onUpdate();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton 
              defaultHref="/admin/konfis" 
              onClick={() => {
                if (onBack) {
                  onBack();
                }
              }}
            />
          </IonButtons>
          <IonTitle>{konfi.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding app-gradient-background">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{konfi.name}</h2>
                <p className="text-sm text-white/80">
                  Jahrgang {konfi.jahrgang_name} • {(konfi.points?.gottesdienst || 0) + (konfi.points?.gemeinde || 0)} Punkte
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {showGottesdienstTarget && (
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm text-white/80">Gottesdienste</div>
                  <div className="text-lg font-bold">{konfi.points?.gottesdienst || 0}/{settings.target_gottesdienst}</div>
                </div>
              )}
              {showGemeindeTarget && (
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm text-white/80">Gemeinde</div>
                  <div className="text-lg font-bold">{konfi.points?.gemeinde || 0}/{settings.target_gemeinde}</div>
                </div>
              )}
            </div>
          </div>

      {/* Login Info */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Login-Informationen
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={konfi.username}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(konfi.username)}
                  className="p-2 text-gray-500 hover:text-blue-500"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={konfi.password}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-blue-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyPassword}
                  className="p-2 text-gray-500 hover:text-blue-500"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGenerateNewPassword}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Neues Passwort
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitäten */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Aktivitäten
            </h3>
            <button
              onClick={() => setShowActivityModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Hinzufügen
            </button>
          </div>

          {konfi.activities && konfi.activities.length > 0 ? (
            <div className="space-y-2">
              {konfi.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(activity.completed_date)} • {activity.points} Punkte
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveActivity(activity.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Keine Aktivitäten</p>
          )}
        </div>
      </div>

      {/* Zusatzpunkte */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Zusatzpunkte
            </h3>
            <button
              onClick={() => setShowBonusModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Hinzufügen
            </button>
          </div>

          {konfi.bonus_points && konfi.bonus_points.length > 0 ? (
            <div className="space-y-2">
              {konfi.bonus_points.map((bonusPoint) => (
                <div key={bonusPoint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{bonusPoint.description}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(bonusPoint.completed_date)} • {bonusPoint.points} Punkte
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBonus(bonusPoint.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Keine Zusatzpunkte</p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
          <button
            onClick={handleDeleteKonfi}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Konfi löschen
          </button>
        </div>
      </div>

      {/* Bonus Modal */}
      {showBonusModal && (
        <Modal
          title="Zusatzpunkte vergeben"
          onClose={() => setShowBonusModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <input
                type="text"
                value={bonus.description}
                onChange={(e) => setBonus({ ...bonus, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="z.B. Zusätzliche Hilfe bei Veranstaltung"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Punkte</label>
              <input
                type="number"
                value={bonus.points}
                onChange={(e) => setBonus({ ...bonus, points: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
              <input
                type="date"
                value={bonus.date}
                onChange={(e) => setBonus({ ...bonus, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleAddBonus}
                disabled={loading || !bonus.description}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                Vergeben
              </button>
              <button
                onClick={() => setShowBonusModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Activity Assignment Modal */}
      {showActivityModal && (
        <Modal
          title="Aktivität zuordnen"
          onClose={() => setShowActivityModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
              <input
                type="date"
                value={activityAssign.date}
                onChange={(e) => setActivityAssign({ ...activityAssign, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktivität</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activities?.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      handleAssignActivity(activity.id);
                      setShowActivityModal(false);
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-gray-600">{activity.points} Punkte</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowActivityModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </Modal>
      )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default KonfiDetailView;
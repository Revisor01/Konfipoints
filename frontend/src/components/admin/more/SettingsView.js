import React, { useState, useEffect } from 'react';
import { Save, Loader, BookOpen, UserPlus, Plus } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { getSettings, updateSettings as updateSettingsService } from '../../../services/settings';
import { formatDate } from '../../../utils/formatters';

const SettingsView = () => {
  const { user, jahrgaenge, setSuccess, setError, loadJahrgaenge } = useApp();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    target_gottesdienst: 10,
    target_gemeinde: 10,
    app_name: 'Konfi-Punkte',
    points_per_activity: 10,
    max_bonus_points: 50,
    enable_badges: true,
    enable_chat: true,
    enable_photos: true,
    auto_approve_requests: false,
    notification_admin_new_request: true,
    notification_konfi_approved: true,
    notification_konfi_rejected: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      setError('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      await updateSettingsService(settings);
      setSuccess('Einstellungen erfolgreich gespeichert');
    } catch (err) {
      setError('Fehler beim Speichern der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">System-Einstellungen</h2>
        <p className="opacity-90">Konfiguration und Verwaltung der Anwendung</p>
      </div>

      {/* App-Einstellungen */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Anwendungseinstellungen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App-Name
            </label>
            <input
              type="text"
              value={settings.app_name}
              onChange={(e) => handleInputChange('app_name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Konfi-Punkte"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard-Punkte pro Aktivität
              </label>
              <input
                type="number"
                value={settings.points_per_activity}
                onChange={(e) => handleInputChange('points_per_activity', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. Bonuspunkte
              </label>
              <input
                type="number"
                value={settings.max_bonus_points}
                onChange={(e) => handleInputChange('max_bonus_points', parseInt(e.target.value) || 0)}
                min="1"
                max="500"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Zielpunkte */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Zielpunkte für Konfis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Gottesdienst-Punkte</h4>
            <input
              type="number"
              value={settings.target_gottesdienst}
              onChange={(e) => handleInputChange('target_gottesdienst', parseInt(e.target.value) || 0)}
              min="0"
              max="50"
              className="w-full p-3 border-0 bg-white rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
            <p className="text-xs text-blue-600 mt-1">Mindestpunkte für Gottesdienst-Aktivitäten</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Gemeinde-Punkte</h4>
            <input
              type="number"
              value={settings.target_gemeinde}
              onChange={(e) => handleInputChange('target_gemeinde', parseInt(e.target.value) || 0)}
              min="0"
              max="50"
              className="w-full p-3 border-0 bg-white rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="10"
            />
            <p className="text-xs text-green-600 mt-1">Mindestpunkte für Gemeinde-Aktivitäten</p>
          </div>
        </div>
      </div>

      {/* Feature-Einstellungen */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Features</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Badge-System aktivieren</div>
              <div className="text-sm text-gray-600">Konfis können Badges sammeln</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_badges}
              onChange={(e) => handleInputChange('enable_badges', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Chat-Funktion aktivieren</div>
              <div className="text-sm text-gray-600">Ermöglicht Kommunikation zwischen Konfis</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_chat}
              onChange={(e) => handleInputChange('enable_chat', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Foto-Upload aktivieren</div>
              <div className="text-sm text-gray-600">Konfis können Fotos zu Aktivitäts-Anfragen hinzufügen</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_photos}
              onChange={(e) => handleInputChange('enable_photos', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Auto-Genehmigung von Anfragen</div>
              <div className="text-sm text-gray-600">Aktivitäts-Anfragen werden automatisch genehmigt</div>
            </div>
            <input
              type="checkbox"
              checked={settings.auto_approve_requests}
              onChange={(e) => handleInputChange('auto_approve_requests', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Benachrichtigungseinstellungen */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Benachrichtigungen</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Admin: Neue Anfragen</div>
              <div className="text-sm text-gray-600">Benachrichtigung bei neuen Aktivitäts-Anfragen</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notification_admin_new_request}
              onChange={(e) => handleInputChange('notification_admin_new_request', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Konfi: Anfrage genehmigt</div>
              <div className="text-sm text-gray-600">Benachrichtigung bei genehmigten Anfragen</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notification_konfi_approved}
              onChange={(e) => handleInputChange('notification_konfi_approved', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Konfi: Anfrage abgelehnt</div>
              <div className="text-sm text-gray-600">Benachrichtigung bei abgelehnten Anfragen</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notification_konfi_rejected}
              onChange={(e) => handleInputChange('notification_konfi_rejected', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Speichern Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <button
          onClick={handleUpdateSettings}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-medium transition-colors"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {loading ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
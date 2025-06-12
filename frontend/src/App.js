// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Award, Calendar, Settings, LogIn, LogOut, Plus, Edit, Eye, Star, 
  Loader, RefreshCw, Copy, Check, BookOpen, UserPlus, Trash2, Search, Gift 
} from 'lucide-react';

// API Configuration
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('konfi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const KonfiPointsSystem = () => {
  const [konfis, setKonfis] = useState([]);
  const [activities, setActivities] = useState([]);
  const [jahrgaenge, setJahrgaenge] = useState([]);
  const [settings, setSettings] = useState({ target_gottesdienst: '10', target_gemeinde: '10' });
  const [currentView, setCurrentView] = useState('overview');
  const [selectedKonfi, setSelectedKonfi] = useState(null);
  const [selectedJahrgang, setSelectedJahrgang] = useState('alle');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(null);
  
  // NEUE Suchfelder
  const [searchTerm, setSearchTerm] = useState('');
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  
  // Form states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordType, setPasswordType] = useState('');
  const [newKonfiName, setNewKonfiName] = useState('');
  const [newKonfiJahrgang, setNewKonfiJahrgang] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityPoints, setNewActivityPoints] = useState(1);
  const [newActivityType, setNewActivityType] = useState('gottesdienst');
  const [newJahrgangName, setNewJahrgangName] = useState('');

  // NEUE States für Zusatzpunkte
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusKonfiId, setBonusKonfiId] = useState(null);
  const [bonusPoints, setBonusPoints] = useState(1);
  const [bonusType, setBonusType] = useState('gottesdienst');
  const [bonusDescription, setBonusDescription] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('konfi_token');
    const userData = localStorage.getItem('konfi_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      if (JSON.parse(userData).type === 'admin') {
        loadData();
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [konfisRes, activitiesRes, settingsRes, jahrgaengeRes] = await Promise.all([
        api.get('/konfis'),
        api.get('/activities'),
        api.get('/settings'),
        api.get('/jahrgaenge')
      ]);
      
      setKonfis(konfisRes.data);
      setActivities(activitiesRes.data);
      setSettings(settingsRes.data);
      setJahrgaenge(jahrgaengeRes.data);
      
      // Set default jahrgang if none selected
      if (!selectedJahrgang || selectedJahrgang === 'alle') {
        setNewKonfiJahrgang(jahrgaengeRes.data[0]?.id || '');
      }
    } catch (err) {
      setError('Fehler beim Laden der Daten: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password, type) => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = type === 'admin' ? '/admin/login' : '/konfi/login';
      const payload = type === 'admin' 
        ? { username, password }
        : { username, password };
      
      const response = await api.post(endpoint, payload);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('konfi_token', token);
      localStorage.setItem('konfi_user', JSON.stringify(userData));
      setUser(userData);
      
      if (userData.type === 'admin') {
        await loadData();
        setCurrentView('overview');
      } else {
        setCurrentView('konfi-own');
      }
      
      setShowPasswordModal(false);
      setSuccess(`Willkommen, ${userData.name || userData.username}!`);
    } catch (err) {
      setError('Ungültige Anmeldedaten: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('konfi_token');
    localStorage.removeItem('konfi_user');
    setUser(null);
    setKonfis([]);
    setActivities([]);
    setJahrgaenge([]);
    setCurrentView('overview');
    setSelectedKonfi(null);
    setSuccess('Erfolgreich abgemeldet');
  };

  const addJahrgang = async () => {
    if (!newJahrgangName.trim()) {
      setError('Name des Jahrgangs ist erforderlich');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/jahrgaenge', {
        name: newJahrgangName.trim()
      });
      
      setJahrgaenge([response.data, ...jahrgaenge]);
      setNewJahrgangName('');
      setSuccess('Jahrgang erfolgreich hinzugefügt');
      setError('');
    } catch (err) {
      setError('Fehler beim Hinzufügen des Jahrgangs: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const addKonfi = async () => {
    if (!newKonfiName.trim() || !newKonfiJahrgang) {
      setError('Name und Jahrgang sind erforderlich');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/konfis', {
        name: newKonfiName.trim(),
        jahrgang_id: newKonfiJahrgang
      });
      
      setKonfis([...konfis, response.data]);
      setNewKonfiName('');
      setSuccess(`Konfi erfolgreich hinzugefügt! Passwort: ${response.data.password}`);
      setError('');
    } catch (err) {
      setError('Fehler beim Hinzufügen des Konfis: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (!newActivityName.trim()) {
      setError('Name der Aktivität ist erforderlich');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/activities', {
        name: newActivityName.trim(),
        points: newActivityPoints,
        type: newActivityType
      });
      
      setActivities([...activities, response.data]);
      setNewActivityName('');
      setNewActivityPoints(1);
      setSuccess('Aktivität erfolgreich hinzugefügt');
      setError('');
    } catch (err) {
      setError('Fehler beim Hinzufügen der Aktivität: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const assignActivityToKonfi = async (konfiId, activityId) => {
    setLoading(true);
    try {
      await api.post(`/konfis/${konfiId}/activities`, { activityId });
      await loadData(); // Reload data to get updated points
      setSuccess('Aktivität erfolgreich zugeordnet');
      setError('');
    } catch (err) {
      setError('Fehler beim Zuordnen der Aktivität: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // NEUE Funktion: Zusatzpunkte hinzufügen
  const addBonusPoints = async () => {
    if (!bonusDescription.trim() || !bonusPoints || !bonusKonfiId) {
      setError('Alle Felder sind erforderlich');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/konfis/${bonusKonfiId}/bonus-points`, {
        points: bonusPoints,
        type: bonusType,
        description: bonusDescription.trim()
      });
      
      await loadData(); // Reload data to get updated points
      setShowBonusModal(false);
      setBonusDescription('');
      setBonusPoints(1);
      setBonusKonfiId(null);
      setSuccess(`Zusatzpunkte erfolgreich vergeben!`);
      setError('');
    } catch (err) {
      setError('Fehler beim Vergeben der Zusatzpunkte: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const regeneratePassword = async (konfiId) => {
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfiId}/regenerate-password`);
      await loadData();
      setSuccess(`Neues Passwort generiert: ${response.data.password}`);
      setError('');
    } catch (err) {
      setError('Fehler beim Generieren des Passworts: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    setLoading(true);
    try {
      await api.put('/settings', settings);
      setSuccess('Einstellungen erfolgreich gespeichert');
      setError('');
    } catch (err) {
      setError('Fehler beim Speichern der Einstellungen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadKonfiDetails = async (konfiId) => {
    setLoading(true);
    try {
      const response = await api.get(`/konfis/${konfiId}`);
      setSelectedKonfi(response.data);
      setCurrentView('konfi-detail');
    } catch (err) {
      setError('Fehler beim Laden der Konfi-Details: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPassword(id);
      setTimeout(() => setCopiedPassword(null), 2000);
    } catch (err) {
      setError('Fehler beim Kopieren in die Zwischenablage');
    }
  };

  // ERWEITERTE Filter-Funktionen
  const filteredKonfis = konfis.filter(konfi => {
    const matchesJahrgang = selectedJahrgang === 'alle' || konfi.jahrgang === selectedJahrgang;
    const matchesSearch = searchTerm === '' || 
      konfi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      konfi.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJahrgang && matchesSearch;
  });

  const filteredAssignKonfis = konfis.filter(konfi => {
    const matchesJahrgang = selectedJahrgang === 'alle' || konfi.jahrgang === selectedJahrgang;
    const matchesSearch = assignSearchTerm === '' || 
      konfi.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) ||
      konfi.username.toLowerCase().includes(assignSearchTerm.toLowerCase());
    return matchesJahrgang && matchesSearch;
  });

  const filteredActivities = activities.filter(activity => 
    activitySearchTerm === '' || 
    activity.name.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  const getProgressColor = (current, target) => {
    const percentage = (current / parseInt(target)) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const PasswordModal = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = () => {
      handleLogin(username, password, passwordType);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-bold mb-4">
            {passwordType === 'admin' ? 'Admin-Anmeldung' : 'Konfi-Anmeldung'}
          </h3>
          
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            placeholder={passwordType === 'admin' ? 'Benutzername' : 'Benutzername (z.B. anna.mueller)'}
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Passwort"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          
          {passwordType === 'konfi' && (
            <p className="text-sm text-gray-600 mb-3">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Passwort-Format: z.B. "Roemer11,1" oder "Johannes3,16"
            </p>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Anmelden
            </button>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setError('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    );
  };

  // NEUE Komponente: Zusatzpunkte-Modal
  const BonusPointsModal = () => {
    const konfi = konfis.find(k => k.id === bonusKonfiId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-bold mb-4">
            Zusatzpunkte vergeben für {konfi?.name}
          </h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <input
              type="text"
              value={bonusDescription}
              onChange={(e) => setBonusDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="z.B. Besondere Hilfe bei Gemeindefest"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Punkte</label>
            <input
              type="number"
              value={bonusPoints}
              onChange={(e) => setBonusPoints(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Typ</label>
            <select
              value={bonusType}
              onChange={(e) => setBonusType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="gottesdienst">Gottesdienstlich</option>
              <option value="gemeinde">Gemeindlich</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={addBonusPoints}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <Gift className="w-4 h-4" />
              Vergeben
            </button>
            <button
              onClick={() => {
                setShowBonusModal(false);
                setBonusDescription('');
                setBonusPoints(1);
                setBonusKonfiId(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LoginView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-96">
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Konfi-Punkte-System</h1>
          <p className="text-gray-600">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setPasswordType('admin');
              setShowPasswordModal(true);
            }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Admin-Bereich
          </button>
          
          <button
            onClick={() => {
              setPasswordType('konfi');
              setShowPasswordModal(true);
            }}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Meine Punkte ansehen
          </button>
        </div>
      </div>
    </div>
  );

  const KonfiOwnView = () => {
    const [konfiData, setKonfiData] = useState(null);
    
    useEffect(() => {
      const loadOwnData = async () => {
        if (user?.type === 'konfi') {
          setLoading(true);
          try {
            const response = await api.get(`/konfis/${user.id}`);
            setKonfiData(response.data);
          } catch (err) {
            setError('Fehler beim Laden der Daten: ' + (err.response?.data?.error || err.message));
          } finally {
            setLoading(false);
          }
        }
      };
      
      loadOwnData();
    }, [user]);

    if (loading || !konfiData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    const allActivities = [...konfiData.activities, ...(konfiData.bonusPoints || [])];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hallo {konfiData.name}!</h1>
                <p className="text-gray-600">Jahrgang: {konfiData.jahrgang}</p>
                <p className="text-sm text-gray-500">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Gottesdienstliche Aktivitäten</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${getProgressColor(konfiData.points.gottesdienst, settings.target_gottesdienst)}`}
                      style={{ width: `${Math.min((konfiData.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{konfiData.points.gottesdienst}/{settings.target_gottesdienst}</span>
                </div>
                {konfiData.points.gottesdienst >= parseInt(settings.target_gottesdienst) && (
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Ziel erreicht!
                  </div>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">Gemeindliche Aktivitäten</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${getProgressColor(konfiData.points.gemeinde, settings.target_gemeinde)}`}
                      style={{ width: `${Math.min((konfiData.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{konfiData.points.gemeinde}/{settings.target_gemeinde}</span>
                </div>
                {konfiData.points.gemeinde >= parseInt(settings.target_gemeinde) && (
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Ziel erreicht!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">Meine Aktivitäten</h3>
              {allActivities.length === 0 ? (
                <p className="text-gray-600">Noch keine Aktivitäten eingetragen.</p>
              ) : (
                <div className="space-y-2">
                  {allActivities.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium">{activity.name || activity.description}</span>
                        <span className="text-sm text-gray-600 ml-2">({activity.date})</span>
                        {activity.description && (
                          <span className="text-xs text-orange-600 ml-2 italic">
                            <Gift className="w-3 h-3 inline mr-1" />
                            Zusatzpunkte
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          activity.type === 'gottesdienst' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {activity.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'}
                        </span>
                        <span className="font-bold text-orange-600">+{activity.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <>
        <LoginView />
        {showPasswordModal && <PasswordModal />}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
          </div>
        )}
      </>
    );
  }

  if (user.type === 'konfi') {
    return (
      <>
        <KonfiOwnView />
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
            <button onClick={() => setError('')} className="float-right ml-2 font-bold">×</button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {showPasswordModal && <PasswordModal />}
      {showBonusModal && <BonusPointsModal />}
      
      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button onClick={() => setError('')} className="float-right ml-2 font-bold">×</button>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {success}
          <button onClick={() => setSuccess('')} className="float-right ml-2 font-bold">×</button>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Konfi-Punkte-System</h1>
                <p className="text-sm text-gray-600">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedJahrgang}
                onChange={(e) => setSelectedJahrgang(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="alle">Alle Jahrgänge</option>
                {jahrgaenge.map(j => (
                  <option key={j.id} value={j.name}>
                    Jahrgang {j.name}
                  </option>
                ))}
              </select>
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: 'Übersicht', icon: Users },
              { id: 'manage-konfis', label: 'Konfis verwalten', icon: UserPlus },
              { id: 'manage-activities', label: 'Aktionen verwalten', icon: Calendar },
              { id: 'manage-jahrgaenge', label: 'Jahrgänge verwalten', icon: BookOpen },
              { id: 'assign-points', label: 'Punkte zuordnen', icon: Award },
              { id: 'settings', label: 'Einstellungen', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  currentView === id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {currentView === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Punkteübersicht</h2>
                {/* NEUES Suchfeld */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nach Name oder Nachname suchen..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                {filteredKonfis.map(konfi => (
                  <div 
                    key={konfi.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadKonfiDetails(konfi.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{konfi.name}</h3>
                        <p className="text-sm text-gray-600">
                          Jahrgang: {konfi.jahrgang} | Username: {konfi.username}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {konfi.points.gottesdienst}/{settings.target_gottesdienst}
                          </div>
                          <div className="text-xs text-gray-600">Gottesdienst</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {konfi.points.gemeinde}/{settings.target_gemeinde}
                          </div>
                          <div className="text-xs text-gray-600">Gemeinde</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {konfi.points.gottesdienst + konfi.points.gemeinde}
                          </div>
                          <div className="text-xs text-gray-600">Gesamt</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bars */}
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Gottesdienst</span>
                          <span>{Math.round((konfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gottesdienst, settings.target_gottesdienst)}`}
                            style={{ width: `${Math.min((konfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Gemeinde</span>
                          <span>{Math.round((konfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gemeinde, settings.target_gemeinde)}`}
                            style={{ width: `${Math.min((konfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'manage-jahrgaenge' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Jahrgänge verwalten</h2>
              
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-3">Neuen Jahrgang hinzufügen</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newJahrgangName}
                    onChange={(e) => setNewJahrgangName(e.target.value)}
                    placeholder="z.B. 2025/26"
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    onClick={addJahrgang}
                    disabled={loading}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Hinzufügen
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {jahrgaenge.map(jahrgang => (
                  <div key={jahrgang.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-bold">{jahrgang.name}</h3>
                      <p className="text-sm text-gray-600">
                        {konfis.filter(k => k.jahrgang === jahrgang.name).length} Konfis
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'manage-konfis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Konfis verwalten</h2>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-3">Neuen Konfi hinzufügen</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newKonfiName}
                    onChange={(e) => setNewKonfiName(e.target.value)}
                    placeholder="Name des Konfis"
                    className="p-2 border rounded-lg"
                  />
                  <select
                    value={newKonfiJahrgang}
                    onChange={(e) => setNewKonfiJahrgang(e.target.value)}
                    className="p-2 border rounded-lg"
                  >
                    <option value="">Jahrgang wählen</option>
                    {jahrgaenge.map(j => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addKonfi}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Hinzufügen
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {filteredKonfis.map(konfi => (
                  <div key={konfi.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-bold">{konfi.name}</h3>
                      <p className="text-sm text-gray-600">
                        Jahrgang: {konfi.jahrgang} | Username: {konfi.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        Passwort: {konfi.password}
                        <button
                          onClick={() => copyToClipboard(konfi.password, konfi.id)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          {copiedPassword === konfi.id ? <Check className="w-3 h-3 inline" /> : <Copy className="w-3 h-3 inline" />}
                        </button>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        G: {konfi.points.gottesdienst} | Gem: {konfi.points.gemeinde}
                      </span>
                      {/* VERBESSERTER Passwort-Button */}
                      <button
                        onClick={() => regeneratePassword(konfi.id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 flex items-center gap-1 text-sm"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Neues Passwort
                      </button>
                      <button
                        onClick={() => loadKonfiDetails(konfi.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'manage-activities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Aktionen verwalten</h2>
              
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">Neue Aktion hinzufügen</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="Name der Aktion"
                    className="p-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    value={newActivityPoints}
                    onChange={(e) => setNewActivityPoints(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                    className="p-2 border rounded-lg"
                  />
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                    className="p-2 border rounded-lg"
                  >
                    <option value="gottesdienst">Gottesdienstlich</option>
                    <option value="gemeinde">Gemeindlich</option>
                  </select>
                  <button
                    onClick={addActivity}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Hinzufügen
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-blue-800 mb-3">Gottesdienstliche Aktivitäten</h3>
                  <div className="space-y-2">
                    {activities.filter(a => a.type === 'gottesdienst').map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 bg-blue-50 rounded border">
                        <span className="font-medium">{activity.name}</span>
                        <span className="font-bold text-blue-600">{activity.points} Punkte</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-green-800 mb-3">Gemeindliche Aktivitäten</h3>
                  <div className="space-y-2">
                    {activities.filter(a => a.type === 'gemeinde').map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 bg-green-50 rounded border">
                        <span className="font-medium">{activity.name}</span>
                        <span className="font-bold text-green-600">{activity.points} Punkte</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'assign-points' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Punkte zuordnen</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800">Konfis</h3>
                    {/* NEUES Suchfeld für Zuordnung */}
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-2 text-gray-400" />
                      <input
                        type="text"
                        value={assignSearchTerm}
                        onChange={(e) => setAssignSearchTerm(e.target.value)}
                        placeholder="Suchen..."
                        className="pl-7 pr-2 py-1 border rounded text-sm w-32"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredAssignKonfis.map(konfi => (
                      <div 
                        key={konfi.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-blue-50 ${
                          selectedKonfi?.id === konfi.id ? 'bg-blue-100 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedKonfi(konfi)}
                      >
                        <div className="font-medium">{konfi.name}</div>
                        <div className="text-sm text-gray-600">
                          G: {konfi.points.gottesdienst}/{settings.target_gottesdienst} | 
                          Gem: {konfi.points.gemeinde}/{settings.target_gemeinde}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Aktivitäten & Zusatzpunkte zuordnen</h3>
                  {selectedKonfi ? (
                    <div>
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                        <strong>Ausgewählt: {selectedKonfi.name}</strong>
                        {/* NEUER Button für Zusatzpunkte */}
                        <button
                          onClick={() => {
                            setBonusKonfiId(selectedKonfi.id);
                            setShowBonusModal(true);
                          }}
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 flex items-center gap-1 text-sm"
                        >
                          <Gift className="w-3 h-3" />
                          Zusatzpunkte
                        </button>
                      </div>

                      {/* Suchfeld für Aktivitäten */}
                      <div className="mb-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <input
                            type="text"
                            value={activitySearchTerm}
                            onChange={(e) => setActivitySearchTerm(e.target.value)}
                            placeholder="Aktivitäten durchsuchen..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      {/* VERBESSERTE Aktivitäten-Darstellung */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <div>
                          <h4 className="font-bold text-blue-700 mb-2">Gottesdienstliche Aktivitäten</h4>
                          {filteredActivities.filter(a => a.type === 'gottesdienst').map(activity => (
                            <div key={activity.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-2 border border-blue-200">
                              <div>
                                <div className="font-medium text-blue-800">{activity.name}</div>
                                <div className="text-sm text-blue-600">{activity.points} Punkte</div>
                              </div>
                              <button
                                onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
                                disabled={loading}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                              >
                                Zuordnen
                              </button>
                            </div>
                          ))}
                        </div>

                        <div>
                          <h4 className="font-bold text-green-700 mb-2">Gemeindliche Aktivitäten</h4>
                          {filteredActivities.filter(a => a.type === 'gemeinde').map(activity => (
                            <div key={activity.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg mb-2 border border-green-200">
                              <div>
                                <div className="font-medium text-green-800">{activity.name}</div>
                                <div className="text-sm text-green-600">{activity.points} Punkte</div>
                              </div>
                              <button
                                onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
                                disabled={loading}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                              >
                                Zuordnen
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Bitte wählen Sie zuerst einen Konfi aus.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Einstellungen</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3">Zielpunkte Gottesdienst</h3>
                  <input
                    type="number"
                    value={settings.target_gottesdienst}
                    onChange={(e) => setSettings({
                      ...settings,
                      target_gottesdienst: e.target.value
                    })}
                    min="1"
                    max="50"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3">Zielpunkte Gemeinde</h3>
                  <input
                    type="number"
                    value={settings.target_gemeinde}
                    onChange={(e) => setSettings({
                      ...settings,
                      target_gemeinde: e.target.value
                    })}
                    min="1"
                    max="50"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={updateSettings}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 mb-6"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Einstellungen speichern
              </button>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">System-Info</h3>
                <p className="text-sm text-gray-600 mb-2"><strong>Admin-Zugangsdaten:</strong></p>
                <p className="text-xs text-gray-500 mb-2">Benutzername: admin</p>
                <p className="text-xs text-gray-500 mb-4">Passwort: pastor2025</p>
                <p className="text-sm text-gray-600 mb-2"><strong>Konfi-Passwörter:</strong></p>
                <p className="text-xs text-gray-500 mb-4">Werden automatisch als biblische Referenzen generiert (z.B. "Roemer11,1")</p>
                <p className="text-sm text-gray-600 mb-2"><strong>Zusatzpunkte:</strong></p>
                <p className="text-xs text-gray-500">Können mit freiem Text für besondere Leistungen vergeben werden</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'konfi-detail' && selectedKonfi && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedKonfi.name}</h2>
                  <p className="text-gray-600">
                    Jahrgang: {selectedKonfi.jahrgang} | Username: {selectedKonfi.username}
                  </p>
                  <p className="text-sm text-gray-500">Passwort: {selectedKonfi.password}</p>
                </div>
                <button
                  onClick={() => setCurrentView('overview')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Zurück zur Übersicht
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Gottesdienstliche Aktivitäten</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedKonfi.points.gottesdienst}/{settings.target_gottesdienst}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gottesdienst, settings.target_gottesdienst)}`}
                      style={{ width: `${Math.min((selectedKonfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-2">Gemeindliche Aktivitäten</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {selectedKonfi.points.gemeinde}/{settings.target_gemeinde}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gemeinde, settings.target_gemeinde)}`}
                      style={{ width: `${Math.min((selectedKonfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">Absolvierte Aktivitäten & Zusatzpunkte</h3>
                {(selectedKonfi.activities.length === 0 && (!selectedKonfi.bonusPoints || selectedKonfi.bonusPoints.length === 0)) ? (
                  <p className="text-gray-600">Noch keine Aktivitäten absolviert.</p>
                ) : (
                  <div className="space-y-2">
                    {/* Normale Aktivitäten */}
                    {selectedKonfi.activities.map((activity, index) => (
                      <div key={`activity-${index}`} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium">{activity.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({activity.date})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            activity.type === 'gottesdienst' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'}
                          </span>
                          <span className="font-bold text-orange-600">+{activity.points} Punkte</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Zusatzpunkte */}
                    {selectedKonfi.bonusPoints && selectedKonfi.bonusPoints.map((bonus, index) => (
                      <div key={`bonus-${index}`} className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">{bonus.description}</span>
                          </div>
                          <span className="text-sm text-gray-600 ml-6">({bonus.date})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            bonus.type === 'gottesdienst' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {bonus.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'}
                          </span>
                          <span className="font-bold text-orange-600">+{bonus.points} Punkte</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KonfiPointsSystem;
// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Award, Calendar, Settings, LogIn, LogOut, Plus, Edit, Eye, Star, 
  Loader, RefreshCw, Copy, Check, BookOpen, UserPlus, Trash2, Search, Gift,
  Menu, X, EyeOff, Save, AlertTriangle, Heart
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

// Datumsformat-Funktion
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}`;
};

const BonusPointsModal = ({ 
  show, 
  onClose, 
  konfiId, 
  konfis, 
  description, 
  setDescription, 
  points, 
  setPoints, 
  type, 
  setType, 
  date,
  setDate,
  onSubmit, 
  loading 
}) => {
  if (!show) return null;
  
  const konfi = konfis.find(k => k.id === konfiId);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
    <h3 className="text-lg font-bold mb-4">
    Zusatzpunkte vergeben für {konfi?.name}
    </h3>
    
    <div className="mb-3">
    <label className="block text-sm font-medium mb-1">Beschreibung</label>
    <input
    type="text"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full p-2 border rounded"
    placeholder="z.B. Besondere Hilfe bei Gemeindefest"
    autoFocus
    />
    </div>
    
    <div className="mb-3">
    <label className="block text-sm font-medium mb-1">Punkte</label>
    <input
    type="number"
    value={points}
    onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
    min="1"
    max="10"
    className="w-full p-2 border rounded"
    />
    </div>
    
    <div className="mb-3">
    <label className="block text-sm font-medium mb-1">Typ</label>
    <select
    value={type}
    onChange={(e) => setType(e.target.value)}
    className="w-full p-2 border rounded"
    >
    <option value="gottesdienst">Gottesdienstlich</option>
    <option value="gemeinde">Gemeindlich</option>
    </select>
    </div>
    
    <div className="mb-4">
    <label className="block text-sm font-medium mb-1">Datum</label>
    <input
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    className="w-full p-2 border rounded"
    />
    </div>
    
    <div className="flex gap-2">
    <button
    onClick={onSubmit}
    disabled={loading}
    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
    >
    {loading && <Loader className="w-4 h-4 animate-spin" />}
    <Gift className="w-4 h-4" />
    Vergeben
    </button>
    <button
    onClick={onClose}
    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
    >
    Abbrechen
    </button>
    </div>
    </div>
    </div>
  );
};

const AdminModal = ({ 
  show, 
  onClose, 
  adminForm, 
  setAdminForm, 
  onSubmit, 
  loading 
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
    <h3 className="text-lg font-bold mb-4">Neuen Admin hinzufügen</h3>
    
    <div className="space-y-3">
    <div>
    <label className="block text-sm font-medium mb-1">Benutzername</label>
    <input
    type="text"
    value={adminForm.username}
    onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
    className="w-full p-2 border rounded"
    autoFocus
    />
    </div>
    <div>
    <label className="block text-sm font-medium mb-1">Anzeigename</label>
    <input
    type="text"
    value={adminForm.display_name}
    onChange={(e) => setAdminForm({...adminForm, display_name: e.target.value})}
    className="w-full p-2 border rounded"
    />
    </div>
    <div>
    <label className="block text-sm font-medium mb-1">Passwort</label>
    <input
    type="password"
    value={adminForm.password}
    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
    className="w-full p-2 border rounded"
    />
    </div>
    </div>
    
    <div className="flex gap-2 mt-4">
    <button
    onClick={onSubmit}
    disabled={loading}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
    >
    {loading && <Loader className="w-4 h-4 animate-spin" />}
    <Plus className="w-4 h-4" />
    Hinzufügen
    </button>
    <button
    onClick={onClose}
    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
    >
    Abbrechen
    </button>
    </div>
    </div>
    </div>
  );
};

const KonfiPointsSystem = () => {
  const [konfis, setKonfis] = useState([]);
  const [activities, setActivities] = useState([]);
  const [jahrgaenge, setJahrgaenge] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [bonusDate, setBonusDate] = useState(new Date().toISOString().split('T')[0]);
  const [settings, setSettings] = useState({ target_gottesdienst: '10', target_gemeinde: '10' });
  const [currentView, setCurrentView] = useState('overview');
  const [selectedKonfi, setSelectedKonfi] = useState(null);
  const [selectedJahrgang, setSelectedJahrgang] = useState('alle');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  // Auto-hide error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const [copiedPassword, setCopiedPassword] = useState(null);
  
  // Mobile Navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Password Visibility
  const [passwordVisibility, setPasswordVisibility] = useState({});
  
  // Search states
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

  // Bonus Points Modal
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusKonfiId, setBonusKonfiId] = useState(null);
  const [bonusPoints, setBonusPoints] = useState(1);
  const [bonusType, setBonusType] = useState('gottesdienst');
  const [bonusDescription, setBonusDescription] = useState('');

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState('');
  const [editItem, setEditItem] = useState(null);
  
  // Admin Management
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', display_name: '', password: '' });

  // Delete Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('konfi_token');
    const userData = localStorage.getItem('konfi_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      if (JSON.parse(userData).type === 'admin') {
        loadData();
      } else {
        // Auch für Konfis die Settings laden
        loadSettings();
      }
    }
  }, []);
  
  const loadSettings = async () => {
    try {
      const settingsRes = await api.get('/settings');
      setSettings(settingsRes.data);
    } catch (err) {
      console.error('Fehler beim Laden der Settings:', err);
      // Fallback Settings
      setSettings({ target_gottesdienst: '10', target_gemeinde: '10' });
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [konfisRes, activitiesRes, settingsRes, jahrgaengeRes, adminsRes] = await Promise.all([
        api.get('/konfis'),
        api.get('/activities'),
        api.get('/settings'),
        api.get('/jahrgaenge'),
        api.get('/admins')
      ]);
      
      setKonfis(konfisRes.data);
      setActivities(activitiesRes.data);
      setSettings(settingsRes.data);
      setJahrgaenge(jahrgaengeRes.data);
      setAdmins(adminsRes.data);
      
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
      const response = await api.post(endpoint, { username, password });
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
      setSuccess(`Willkommen, ${userData.display_name || userData.name || userData.username}!`);
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

  const togglePasswordVisibility = (id) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Generic CRUD functions
  const handleCreate = async (type, data) => {
    setLoading(true);
    try {
      const response = await api.post(`/${type}`, data);
      if (type === 'konfis') setKonfis([...konfis, response.data]);
      else if (type === 'activities') setActivities([...activities, response.data]);
      else if (type === 'jahrgaenge') setJahrgaenge([response.data, ...jahrgaenge]);
      else if (type === 'admins') setAdmins([...admins, response.data]);
      
      setSuccess(`${type.slice(0, -1)} erfolgreich hinzugefügt`);
      resetForms();
    } catch (err) {
      setError('Fehler beim Hinzufügen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type, id, data) => {
    setLoading(true);
    try {
      await api.put(`/${type}/${id}`, data);
      await loadData();
      setSuccess(`${type.slice(0, -1)} erfolgreich aktualisiert`);
      setShowEditModal(false);
      setEditItem(null);
    } catch (err) {
      setError('Fehler beim Aktualisieren: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    setLoading(true);
    try {
      // Korrekte Pluralformen für API-Routen
      const apiRoute = type === 'activity' ? 'activities' : 
                      type === 'konfi' ? 'konfis' :
                      type === 'jahrgang' ? 'jahrgaenge' :
                      type === 'admin' ? 'admins' : type + 's';
      
      await api.delete(`/${apiRoute}/${id}`);
      await loadData();
      setSuccess(`${type.slice(0, -1)} erfolgreich gelöscht`);
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (err) {
      setError('Fehler beim Löschen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setNewKonfiName('');
    setNewActivityName('');
    setNewActivityPoints(1);
    setNewJahrgangName('');
    setAdminForm({ username: '', display_name: '', password: '' });
    setShowAdminModal(false);
  };

  const assignActivityToKonfi = async (konfiId, activityId) => {
    if (!activityDate) {
      setError('Bitte wählen Sie ein Datum aus');
      return;
    }
    
    setLoading(true);
    try {
      await api.post(`/konfis/${konfiId}/activities`, { 
        activityId,
        completed_date: activityDate
      });
      await loadData();
      if (selectedKonfi && selectedKonfi.id === parseInt(konfiId)) {
        loadKonfiDetails(konfiId);
      }
      setSuccess('Aktivität erfolgreich zugeordnet');
    } catch (err) {
      setError('Fehler beim Zuordnen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // NEU: Aktivität entfernen
  const removeActivityFromKonfi = async (konfiId, recordId) => {
    setLoading(true);
    try {
      await api.delete(`/konfis/${konfiId}/activities/${recordId}`);
      await loadData();
      if (selectedKonfi && selectedKonfi.id === parseInt(konfiId)) {
        loadKonfiDetails(konfiId);
      }
      setSuccess('Aktivität erfolgreich entfernt');
    } catch (err) {
      setError('Fehler beim Entfernen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

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
        description: bonusDescription.trim(),
        completed_date: bonusDate
      });
      
      await loadData();
      if (selectedKonfi && selectedKonfi.id === bonusKonfiId) {
        loadKonfiDetails(bonusKonfiId);
      }
      setShowBonusModal(false);
      setBonusDescription('');
      setBonusPoints(1);
      setBonusDate(new Date().toISOString().split('T')[0]);
      setBonusKonfiId(null);
      setSuccess(`Zusatzpunkte erfolgreich vergeben!`);
    } catch (err) {
      setError('Fehler beim Vergeben: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // NEU: Zusatzpunkte entfernen
  const removeBonusPointsFromKonfi = async (konfiId, bonusId) => {
    setLoading(true);
    try {
      await api.delete(`/konfis/${konfiId}/bonus-points/${bonusId}`);
      await loadData();
      if (selectedKonfi && selectedKonfi.id === parseInt(konfiId)) {
        loadKonfiDetails(konfiId);
      }
      setSuccess('Zusatzpunkte erfolgreich entfernt');
    } catch (err) {
      setError('Fehler beim Entfernen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // NEU: Admin Modal schließen Funktion
  const AdminModalClose = () => {
    setShowAdminModal(false);
    setAdminForm({ username: '', display_name: '', password: '' });
  };

  // NEU: Admin erstellen Funktion
  const AdminModalSubmit = () => {
    handleCreate('admins', adminForm);
  };

  const BonusPointsModalClose = () => {
    setShowBonusModal(false);
    setBonusDescription('');
    setBonusPoints(1);
    setBonusDate(new Date().toISOString().split('T')[0]); // Reset auf heute
    setBonusKonfiId(null);
  };

  const regeneratePassword = async (konfiId) => {
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfiId}/regenerate-password`);
      await loadData();
      setSuccess(`Neues Passwort generiert: ${response.data.password}`);
    } catch (err) {
      setError('Fehler beim Generieren: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    setLoading(true);
    try {
      await api.put('/settings', settings);
      setSuccess('Einstellungen erfolgreich gespeichert');
    } catch (err) {
      setError('Fehler beim Speichern: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadKonfiDetails = async (konfiId) => {
    setLoading(true);
    try {
      console.log('Frontend: Loading konfi details for ID:', konfiId, 'Type:', typeof konfiId);
      
      // Validate konfiId
      const validId = parseInt(konfiId, 10);
      if (isNaN(validId)) {
        throw new Error('Invalid konfi ID: ' + konfiId);
      }
      
      const response = await api.get(`/konfis/${validId}`);
      console.log('Frontend: Konfi details loaded:', response.data);
      
      // Validate response data
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response data');
      }
      
      setSelectedKonfi(response.data);
      setCurrentView('konfi-detail');
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Frontend: Error loading konfi details:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Fehler beim Laden der Konfi-Details: ' + (err.response?.data?.error || err.message));
      setSelectedKonfi(null); // Clear selected konfi on error
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
      setError('Fehler beim Kopieren');
    }
  };

  // Filter functions
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

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Übersicht', icon: Users },
    { id: 'manage-konfis', label: 'Konfis verwalten', icon: UserPlus },
    { id: 'manage-activities', label: 'Aktionen verwalten', icon: Calendar },
    { id: 'manage-jahrgaenge', label: 'Jahrgänge verwalten', icon: BookOpen },
    // { id: 'assign-points', label: 'Punkte zuordnen', icon: Award },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ];
  
  // INTERNE MODALE (die anderen bleiben wie sie waren):
  
  const PasswordModal = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    if (!showPasswordModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
      onKeyPress={(e) => e.key === 'Enter' && handleLogin(username, password, passwordType)}
      />
      
      {passwordType === 'konfi' && (
        <p className="text-sm text-gray-600 mb-3">
        <BookOpen className="w-4 h-4 inline mr-1" />
        Passwort-Format: z.B. "Roemer11,1" oder "Johannes3,16"
        </p>
      )}
      
      <div className="flex gap-2">
      <button
      onClick={() => handleLogin(username, password, passwordType)}
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
  
  const EditModal = () => {
    const [formData, setFormData] = useState(editItem || {});
    
    useEffect(() => {
      setFormData(editItem || {});
    }, [editItem]);
    
    if (!showEditModal) return null;
    
    const handleSave = () => {
      if (editType === 'konfi') {
        handleUpdate('konfis', formData.id, {
          name: formData.name,
          jahrgang_id: formData.jahrgang_id
        });
      } else if (editType === 'activity') {
        handleUpdate('activities', formData.id, {
          name: formData.name,
          points: formData.points,
          type: formData.type
        });
      } else if (editType === 'jahrgang') {
        handleUpdate('jahrgaenge', formData.id, {
          name: formData.name
        });
      } else if (editType === 'admin') {
        handleUpdate('admins', formData.id, {
          username: formData.username,
          display_name: formData.display_name,
          password: formData.password || undefined
        });
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-bold mb-4">
      {editType === 'konfi' && 'Konfi bearbeiten'}
      {editType === 'activity' && 'Aktivität bearbeiten'}
      {editType === 'jahrgang' && 'Jahrgang bearbeiten'}
      {editType === 'admin' && 'Admin bearbeiten'}
      </h3>
      
      {editType === 'konfi' && (
        <div className="space-y-3">
        <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
        type="text"
        value={formData.name || ''}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full p-2 border rounded"
        />
        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Jahrgang</label>
        <select
        value={formData.jahrgang_id || ''}
        onChange={(e) => setFormData({...formData, jahrgang_id: e.target.value})}
        className="w-full p-2 border rounded"
        >
        {jahrgaenge.map(j => (
          <option key={j.id} value={j.id}>{j.name}</option>
        ))}
        </select>
        </div>
        </div>
      )}
      
      {editType === 'activity' && (
        <div className="space-y-3">
        <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
        type="text"
        value={formData.name || ''}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full p-2 border rounded"
        />
        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Punkte</label>
        <input
        type="number"
        value={formData.points || 1}
        onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 1})}
        min="1"
        max="10"
        className="w-full p-2 border rounded"
        />
        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Typ</label>
        <select
        value={formData.type || 'gottesdienst'}
        onChange={(e) => setFormData({...formData, type: e.target.value})}
        className="w-full p-2 border rounded"
        >
        <option value="gottesdienst">Gottesdienstlich</option>
        <option value="gemeinde">Gemeindlich</option>
        </select>
        </div>
        </div>
      )}
      
      {editType === 'jahrgang' && (
        <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
        type="text"
        value={formData.name || ''}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full p-2 border rounded"
        placeholder="z.B. 2025/26"
        />
        </div>
      )}
      
      {editType === 'admin' && (
        <div className="space-y-3">
        <div>
        <label className="block text-sm font-medium mb-1">Benutzername</label>
        <input
        type="text"
        value={formData.username || ''}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        className="w-full p-2 border rounded"
        />
        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Anzeigename</label>
        <input
        type="text"
        value={formData.display_name || ''}
        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
        className="w-full p-2 border rounded"
        />
        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Neues Passwort (optional)</label>
        <input
        type="password"
        value={formData.password || ''}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        className="w-full p-2 border rounded"
        placeholder="Leer lassen für keine Änderung"
        />
        </div>
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
      <button
      onClick={handleSave}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
      >
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      <Save className="w-4 h-4" />
      Speichern
      </button>
      <button
      onClick={() => {
        setShowEditModal(false);
        setEditItem(null);
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
  
  const DeleteConfirmModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex items-center gap-3 mb-4">
      <AlertTriangle className="w-8 h-8 text-red-500" />
      <h3 className="text-lg font-bold">Löschen bestätigen</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
      Sind Sie sicher, dass Sie <strong>{deleteItem?.name || deleteItem?.username}</strong> löschen möchten?
      {deleteType === 'konfi' && ' Alle Aktivitäten und Punkte werden ebenfalls gelöscht.'}
      {deleteType === 'jahrgang' && ' Dies ist nur möglich wenn keine Konfis zugeordnet sind.'}
      {deleteType === 'activity' && ' Dies ist nur möglich wenn die Aktivität nie zugeordnet wurde.'}
      </p>
      
      <div className="flex gap-2">
      <button
      onClick={() => handleDelete(deleteType, deleteItem.id)}
      disabled={loading}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
      >
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      <Trash2 className="w-4 h-4" />
      Löschen
      </button>
      <button
      onClick={() => {
        setShowDeleteModal(false);
        setDeleteItem(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
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
    const [isLoadingKonfi, setIsLoadingKonfi] = useState(false);
    
    useEffect(() => {
      const loadOwnData = async () => {
        if (user?.type === 'konfi' && user?.id) {
          setIsLoadingKonfi(true);
          try {
            const response = await api.get(`/konfis/${user.id}`);
            setKonfiData(response.data);
          } catch (err) {
            setError('Fehler beim Laden der Daten: ' + (err.response?.data?.error || err.message));
          } finally {
            setIsLoadingKonfi(false);
          }
        }
      };
      
      loadOwnData();
    }, [user?.id, user?.type]); // Korrigierte Dependencies
    
    
    if (isLoadingKonfi || !konfiData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    const allActivities = [...konfiData.activities, ...(konfiData.bonusPoints || [])];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hallo {konfiData.name}!</h1>
                <p className="text-gray-600">Jahrgang: {konfiData.jahrgang}</p>
                <p className="text-sm text-gray-500">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 self-start sm:self-auto"
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
                  <div key={index} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded border gap-2 ${
                    activity.description ? 'bg-orange-50 border-orange-200' : 
                    activity.type === 'gottesdienst' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                  }`}>
                  <div>
                  <div className="flex items-center gap-2">
                  {activity.description ? (
                    <Gift className="w-4 h-4 text-orange-600" />
                  ) : activity.type === 'gottesdienst' ? (
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Heart className="w-4 h-4 text-green-600" />
                  )}
                  <span className="font-medium">{activity.name || activity.description}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                  {formatDate(activity.date)} • {activity.admin && `Vergeben von: ${activity.admin}`}
                  </div>
                  {activity.description && (
                    <span className="text-xs text-orange-600 italic flex items-center gap-1 ml-6">
                    Zusatzpunkt
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

  // Render Login View with Footer
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <div className="flex-1">
          <LoginView />
        </div>
        
        {/* Footer für Login-Ansicht */}
        <div className="bg-white border-t mt-auto">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="text-center text-xs text-gray-500">
              © 2025 Pastor Simon Luthe • Konfi-Punkte-System v1.2.0
            </div>
          </div>
        </div>
        
        <PasswordModal />
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Render Konfi View with Footer
  if (user.type === 'konfi') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <div className="flex-1">
          <KonfiOwnView />
        </div>
        
        {/* Footer für Konfi-Ansicht */}
        <div className="bg-white border-t mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
              <div className="mb-1 sm:mb-0">
                © 2025 Pastor Simon Luthe • Konfi-Punkte-System v1.2.0
              </div>
              <div>
                <a 
                  href="https://github.com/Revisor01/Konfipoints" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
            <button onClick={() => setError('')} className="float-right ml-2 font-bold">×</button>
          </div>
        )}
      </div>
    );
  }

  // Render Admin View with Footer
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Modals */}
      <PasswordModal />
      <BonusPointsModal 
        show={showBonusModal}
        onClose={BonusPointsModalClose}
        konfiId={bonusKonfiId}
        konfis={konfis}
        description={bonusDescription}
        setDescription={setBonusDescription}
        points={bonusPoints}
        setPoints={setBonusPoints}
        type={bonusType}
        setType={setBonusType}
        date={bonusDate}
        setDate={setBonusDate}
        onSubmit={addBonusPoints}
        loading={loading}
      />
      <EditModal />
      <AdminModal 
        show={showAdminModal}
        onClose={AdminModalClose}
        adminForm={adminForm}
        setAdminForm={setAdminForm}
        onSubmit={AdminModalSubmit}
        loading={loading}
      />
      <DeleteConfirmModal />
      
      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-40 max-w-sm">
          {error}
          <button onClick={() => setError('')} className="float-right ml-2 font-bold">×</button>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-40 max-w-sm">
          {success}
          <button onClick={() => setSuccess('')} className="float-right ml-2 font-bold">×</button>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Konfi-Punkte-System</h1>
                <p className="text-xs sm:text-sm text-gray-600">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
              </div>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden sm:flex gap-2">
              <select
                value={selectedJahrgang}
                onChange={(e) => setSelectedJahrgang(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="alle">Alle Jahrgänge</option>
                {jahrgaenge.map(j => (
                  <option key={j.id} value={j.name}>Jahrgang {j.name}</option>
                ))}
              </select>
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Aktualisieren</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Abmelden</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden bg-gray-100 p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Controls */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 space-y-3 pb-4 border-t pt-4">
              <select
                value={selectedJahrgang}
                onChange={(e) => setSelectedJahrgang(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="alle">Alle Jahrgänge</option>
                {jahrgaenge.map(j => (
                  <option key={j.id} value={j.name}>Jahrgang {j.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex gap-6">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentView(id);
                  setMobileMenuOpen(false);
                }}
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="sm:hidden py-4">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCurrentView(id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${
                      currentView === id 
                        ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 min-w-0">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {currentView === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Punkteübersicht</h2>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nach Name oder Nachname suchen..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
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
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
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
                      onClick={() => handleCreate('jahrgaenge', { name: newJahrgangName.trim() })}
                      disabled={loading || !newJahrgangName.trim()}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditType('jahrgang');
                            setEditItem(jahrgang);
                            setShowEditModal(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => {
                            setDeleteType('jahrgang');
                            setDeleteItem(jahrgang);
                            setShowDeleteModal(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Löschen
                        </button>
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
                      onClick={() => handleCreate('konfis', { 
                        name: newKonfiName.trim(), 
                        jahrgang_id: newKonfiJahrgang 
                      })}
                      disabled={loading || !newKonfiName.trim() || !newKonfiJahrgang}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Hinzufügen
                    </button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {filteredKonfis.map(konfi => (
                    <div key={konfi.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold">{konfi.name}</h3>
                        <p className="text-sm text-gray-600">
                          Jahrgang: {konfi.jahrgang} | Username: {konfi.username}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Passwort:</span>
                          {passwordVisibility[konfi.id] ? (
                            <span className="font-mono">{konfi.password}</span>
                          ) : (
                            <span>••••••••••</span>
                          )}
                          <button
                            onClick={() => togglePasswordVisibility(konfi.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {passwordVisibility[konfi.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(konfi.password, konfi.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {copiedPassword === konfi.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
                          G: {konfi.points.gottesdienst} | Gem: {konfi.points.gemeinde}
                        </span>
                        <button
                          onClick={() => regeneratePassword(konfi.id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 flex items-center gap-1 text-sm"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Neues Passwort
                        </button>
                        <button
                          onClick={() => {
                            setEditType('konfi');
                            setEditItem(konfi);
                            setShowEditModal(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => loadKonfiDetails(konfi.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                        <button
                          onClick={() => {
                            setDeleteType('konfi');
                            setDeleteItem(konfi);
                            setShowDeleteModal(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Löschen
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
                      onClick={() => handleCreate('activities', {
                        name: newActivityName.trim(),
                        points: newActivityPoints,
                        type: newActivityType
                      })}
                      disabled={loading || !newActivityName.trim()}
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
                          <div>
                            <span className="font-medium">{activity.name}</span>
                            <div className="text-sm text-blue-600">{activity.points} Punkte</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditType('activity');
                                setEditItem(activity);
                                setShowEditModal(true);
                              }}
                              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType('activity');
                                setDeleteItem(activity);
                                setShowDeleteModal(true);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-green-800 mb-3">Gemeindliche Aktivitäten</h3>
                    <div className="space-y-2">
                      {activities.filter(a => a.type === 'gemeinde').map(activity => (
                        <div key={activity.id} className="flex justify-between items-center p-3 bg-green-50 rounded border">
                          <div>
                            <span className="font-medium">{activity.name}</span>
                            <div className="text-sm text-green-600">{activity.points} Punkte</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditType('activity');
                                setEditItem(activity);
                                setShowEditModal(true);
                              }}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType('activity');
                                setDeleteItem(activity);
                                setShowDeleteModal(true);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Einstellungen</h2>
                
                {/* Points Settings */}
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

                {/* Admin Management */}
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Administrator verwalten</h3>
                    <button
                      onClick={() => setShowAdminModal(true)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Neuer Admin
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {admins.map(admin => (
                      <div key={admin.id} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <div className="font-medium">{admin.display_name}</div>
                          <div className="text-sm text-gray-600">@{admin.username}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditType('admin');
                              setEditItem(admin);
                              setShowEditModal(true);
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          {admin.id !== user.id && (
                            <button
                              onClick={() => {
                                setDeleteType('admin');
                                setDeleteItem(admin);
                                setShowDeleteModal(true);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">System-Info</h3>
                  <p className="text-sm text-gray-600 mb-2"><strong>Konfi-Passwörter:</strong></p>
                  <p className="text-xs text-gray-500 mb-4">Werden automatisch als biblische Referenzen generiert (z.B. "Roemer11,1")</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>Zusatzpunkte:</strong></p>
                  <p className="text-xs text-gray-500 mb-4">Können mit freiem Text für besondere Leistungen vergeben werden</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>Admin-Tracking:</strong></p>
                  <p className="text-xs text-gray-500">Alle Zuordnungen werden mit Admin-Name und Datum gespeichert</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'konfi-detail' && selectedKonfi && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedKonfi.name}</h2>
                    <p className="text-gray-600">
                      Jahrgang: {selectedKonfi.jahrgang} | Username: {selectedKonfi.username}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Passwort:</span>
                      {passwordVisibility[selectedKonfi.id] ? (
                        <span className="font-mono">{selectedKonfi.password}</span>
                      ) : (
                        <span>••••••••••</span>
                      )}
                      <button
                        onClick={() => togglePasswordVisibility(selectedKonfi.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {passwordVisibility[selectedKonfi.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setBonusKonfiId(selectedKonfi.id);
                        setShowBonusModal(true);
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      Zusatzpunkte vergeben
                    </button>
                    <button
                      onClick={() => setCurrentView('overview')}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Zurück zur Übersicht
                    </button>
                  </div>
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

                {/* Quick Activity Assignment */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">Schnell-Zuordnung</h3>
                  
                  {/* Datum-Picker für Aktivitäten */}
                  <div className="mb-4 p-3 bg-blue-50 rounded border">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Datum für Aktivitäten:</label>
                    <input
                      type="date"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Gottesdienstliche Aktivitäten</h4>
            <div className="space-y-1">
            {activities.filter(a => a.type === 'gottesdienst').map(activity => (
              <button
              key={activity.id}
              onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
              disabled={loading}
              className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border text-sm disabled:opacity-50"
              >
              {activity.name} ({activity.points} Punkte)
              </button>
            ))}
            </div>
            </div>
            <div>
            <h4 className="font-medium text-green-700 mb-2">Gemeindliche Aktivitäten</h4>
            <div className="space-y-1">
            {activities.filter(a => a.type === 'gemeinde').map(activity => (
                          <button
                            key={activity.id}
                            onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
                            disabled={loading}
                            className="w-full text-left p-2 bg-green-50 hover:bg-green-100 rounded border text-sm disabled:opacity-50"
                          >
                            {activity.name} ({activity.points} Punkte)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">Absolvierte Aktivitäten & Zusatzpunkte</h3>
                  {(selectedKonfi.activities.length === 0 && (!selectedKonfi.bonusPoints || selectedKonfi.bonusPoints.length === 0)) ? (
                    <p className="text-gray-600">Noch keine Aktivitäten absolviert.</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Normal Activities mit Entfernen-Button */}
                      {selectedKonfi.activities.map((activity, index) => (
                        <div key={`activity-${index}`} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded border gap-2 ${
                          activity.type === 'gottesdienst' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {activity.type === 'gottesdienst' ? (
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Heart className="w-4 h-4 text-green-600" />
                              )}
                              <span className="font-medium">{activity.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              {formatDate(activity.date)} • Vergeben von: {activity.admin}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              activity.type === 'gottesdienst' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {activity.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'}
                            </span>
                            <span className="font-bold text-orange-600">+{activity.points} Punkte</span>
                            <button
                              onClick={() => removeActivityFromKonfi(selectedKonfi.id, activity.id)}
                              disabled={loading}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50 text-xs ml-2"
                              title="Aktivität entfernen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Bonus Points mit Entfernen-Button */}
                      {selectedKonfi.bonusPoints && selectedKonfi.bonusPoints.map((bonus, index) => (
                        <div key={`bonus-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-orange-50 rounded border border-orange-200 gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">{bonus.description}</span>
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              {formatDate(bonus.date)} • Vergeben von: {bonus.admin}
                            </div>
                            <span className="text-xs text-orange-600 italic flex items-center gap-1 ml-6">
                              Zusatzpunkt
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              bonus.type === 'gottesdienst' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {bonus.type === 'gottesdienst' ? 'Gottesdienst' : 'Gemeinde'}
                            </span>
                            <span className="font-bold text-orange-600">+{bonus.points} Punkte</span>
                            <button
                              onClick={() => removeBonusPointsFromKonfi(selectedKonfi.id, bonus.id)}
                              disabled={loading}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50 text-xs ml-2"
                              title="Zusatzpunkte entfernen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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

      {/* Footer - Always at bottom */}
      <div className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-2 sm:mb-0">
              © 2025 Pastor Simon Luthe • Version 1.2.0
            </div>
            <div className="flex items-center gap-4">
              <span>Konfi-Punkte-System</span>
              <a 
                href="https://github.com/Revisor01/Konfipoints" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonfiPointsSystem;
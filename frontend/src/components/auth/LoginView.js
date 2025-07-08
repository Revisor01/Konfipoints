// frontend/src/components/auth/LoginView.js
import React, { useState } from 'react';
import { Award, BookOpen, Loader } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { loginWithAutoDetection } from '../../services/auth';

const LoginView = () => {
  const { setUser, setError, error } = useApp();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const user = await loginWithAutoDetection(formData.username, formData.password);
      setUser(user);
    } catch (err) {
      setError('Ungültige Anmeldedaten: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Konfi-Punkte-System</h1>
          <p className="text-gray-600">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benutzername
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="z.B. admin oder anna.mueller"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="Passwort eingeben"
              disabled={loading}
            />
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <BookOpen className="w-4 h-4 inline mr-2" />
            <strong>Konfis:</strong> Passwort-Format wie "Roemer11,1" oder "Johannes3,16"
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-base"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? 'Anmelde...' : 'Anmelden'}
          </button>
          
          {error && (
            <div className="text-red-600 text-center font-medium text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginView;
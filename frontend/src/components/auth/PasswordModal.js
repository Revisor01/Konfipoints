// frontend/src/components/auth/PasswordModal.js
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { login } from '../../services/auth';
import { BookOpen, Loader } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const PasswordModal = ({ show, onClose, type }) => {
  const { setUser, setError } = useApp();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(formData.username, formData.password, type);
      setUser(user);
      onClose();
    } catch (err) {
      setError('Ungültige Anmeldedaten: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ username: '', password: '' });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {type === 'admin' ? 'Admin-Anmeldung' : 'Konfi-Anmeldung'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 border rounded-lg text-base"
              placeholder={type === 'admin' ? 'Benutzername' : 'Benutzername (z.B. anna.mueller)'}
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border rounded-lg text-base"
              placeholder="Passwort"
              disabled={loading}
            />
          </div>
          
          {type === 'konfi' && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Passwort-Format: z.B. "Roemer11,1" oder "Johannes3,16"
            </p>
          )}
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !formData.username || !formData.password}
              className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
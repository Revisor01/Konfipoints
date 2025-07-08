import React, { useState } from 'react';
import { User, Mail, Key, Save, X } from 'lucide-react';
import UniversalModal from '../../shared/UniversalModal';
import { createAdmin, updateAdmin } from '../../../services/admin';
import { generatePassword } from '../../../utils/helpers';

const AdminModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  admin = null,
  mode = 'create' // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    password: '',
    permissions: admin?.permissions || []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name ist erforderlich');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('E-Mail ist erforderlich');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Ungültige E-Mail-Adresse');
      return false;
    }
    
    if (mode === 'create' && !formData.password) {
      setError('Passwort ist erforderlich');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'create') {
        await createAdmin(formData);
      } else {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateAdmin(admin.id, updateData);
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Neuen Admin erstellen' : 'Admin bearbeiten'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Admin Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-1" />
            E-Mail *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key size={16} className="inline mr-1" />
            Passwort {mode === 'edit' && '(leer lassen für keine Änderung)'}
          </label>
          <div className="space-y-2">
            <div className="flex">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={mode === 'create' ? 'Passwort eingeben' : 'Neues Passwort (optional)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Sicheres Passwort generieren
            </button>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <X size={16} className="inline mr-1" />
            Abbrechen
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline mr-2"></div>
            ) : (
              <Save size={16} className="inline mr-1" />
            )}
            {mode === 'create' ? 'Admin erstellen' : 'Änderungen speichern'}
          </button>
        </div>
      </form>
    </UniversalModal>
  );
};

export default AdminModal;
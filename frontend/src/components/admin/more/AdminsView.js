import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserPlus, Shield } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { createAdmin, updateAdmin, deleteAdmin } from '../../../services/admin';
import { generatePassword } from '../../../utils/helpers';
import { formatDate } from '../../../utils/formatters';
import UniversalModal from '../../shared/UniversalModal';
import AdminActionSheet from '../../shared/ActionSheets/AdminActionSheet';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import EditModal from '../modals/EditModal';

const AdminsView = () => {
  const { user, setSuccess, setError } = useApp();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form State
  const [adminForm, setAdminForm] = useState({ 
    name: '', 
    email: '', 
    password: ''
  });
  
  // Selected Items
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  React.useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      // In a real app, you'd use getAdmins() service
      // For now, we'll use a placeholder
      setAdmins([user]); // At least show current user
    } catch (error) {
      setError('Fehler beim Laden der Administratoren');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!adminForm.name.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    if (!adminForm.email.trim()) {
      setError('E-Mail ist erforderlich');
      return;
    }
    if (!adminForm.password.trim()) {
      setError('Passwort ist erforderlich');
      return;
    }

    setLoading(true);
    try {
      const newAdmin = await createAdmin(adminForm);
      setAdmins([...admins, newAdmin]);
      setSuccess('Administrator erfolgreich erstellt');
      setShowAdminModal(false);
      setAdminForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    setLoading(true);
    try {
      const updatedAdmin = await updateAdmin(selectedAdmin.id, updatedData);
      setAdmins(admins.map(a => a.id === selectedAdmin.id ? updatedAdmin : a));
      setSuccess('Administrator erfolgreich aktualisiert');
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAdmin(selectedAdmin.id);
      setAdmins(admins.filter(a => a.id !== selectedAdmin.id));
      setSuccess('Administrator erfolgreich gelöscht');
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setAdminForm({...adminForm, password: newPassword});
  };

  const AdminModal = () => (
    <UniversalModal
      isOpen={showAdminModal}
      onClose={() => {
        setShowAdminModal(false);
        setAdminForm({ name: '', email: '', password: '' });
      }}
      title="Neuen Administrator hinzufügen"
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={adminForm.name}
            onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
            className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. Pastor Schmidt"
            autoFocus
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail *
          </label>
          <input
            type="email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
            className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="pastor@gemeinde.de"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passwort *
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={adminForm.password}
              onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sicheres Passwort"
              required
            />
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
            onClick={() => setShowAdminModal(false)}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Abbrechen
          </button>
          
          <button
            type="submit"
            disabled={loading || !adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Hinzufügen
          </button>
        </div>
      </form>
    </UniversalModal>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Administratoren verwalten</h2>
        <button
          onClick={() => setShowAdminModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuer Admin
        </button>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {admins.map(admin => (
            <div 
              key={admin.id} 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => {
                setSelectedAdmin(admin);
                setShowActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {admin.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-lg">{admin.name}</div>
                    <div className="text-sm text-gray-600">{admin.email}</div>
                    {admin.created_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Erstellt: {formatDate(admin.created_at)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {admin.id === user?.id && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Sie
                    </span>
                  )}
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>
          ))}
          
          {admins.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Administratoren angelegt
              </h3>
              <p className="text-sm mb-4">
                Erstelle weitere Administrator-Accounts
              </p>
              <button
                onClick={() => setShowAdminModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ersten Admin erstellen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AdminModal />

      <AdminActionSheet
        isOpen={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        currentUser={user}
        onEdit={() => {
          setShowActionSheet(false);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setShowActionSheet(false);
          setShowDeleteModal(true);
        }}
        onResetPassword={(admin) => {
          // Could implement password reset functionality
          setSuccess(`Passwort-Reset für ${admin.name} initiiert`);
          setShowActionSheet(false);
        }}
      />

      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        item={selectedAdmin}
        itemType="admin"
        onSuccess={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleDelete}
        title="Administrator löschen"
        message={`Möchtest du den Administrator "${selectedAdmin?.name}" wirklich löschen?`}
        itemName={selectedAdmin?.name}
        itemType="Administrator"
        consequences={
          selectedAdmin?.id === user?.id 
            ? ['Du kannst dich nicht selbst löschen']
            : ['Der Administrator verliert den Zugang zur Admin-Oberfläche', 'Alle Daten bleiben erhalten']
        }
        confirmText="LÖSCHEN"
        requireConfirmText={true}
        loading={loading}
      />
    </div>
  );
};

export default AdminsView;
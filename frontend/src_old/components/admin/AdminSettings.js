import React, { useState } from 'react';
import { 
  Plus, Loader, BookOpen, UserPlus, LogOut, Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';

const AdminSettings = ({
  settings,
  setSettings,
  updateSettings,
  jahrgaenge,
  konfis,
  admins,
  user,
  loading,
  formatDate,
  handleLogout,
  // Jahrgang functions
  showJahrgangModal,
  setShowJahrgangModal,
  jahrgangForm,
  setJahrgangForm,
  handleCreate,
  // Admin functions
  showAdminModal,
  setShowAdminModal,
  // Action sheets
  showJahrgangActionSheet,
  setShowJahrgangActionSheet,
  selectedActionJahrgang,
  setSelectedActionJahrgang,
  showAdminActionSheet,
  setShowAdminActionSheet,
  selectedActionAdmin,
  setSelectedActionAdmin,
  // Edit/Delete functions
  setEditType,
  setEditItem,
  setShowEditModal,
  setDeleteType,
  setDeleteItem,
  setShowDeleteModal
}) => {
  return (
    <div className="space-y-4 pt-10">
      {/* Action Sheets */}
      <JahrgangActionSheet
        show={showJahrgangActionSheet}
        onClose={() => {
          setShowJahrgangActionSheet(false);
          setSelectedActionJahrgang(null);
        }}
        jahrgang={selectedActionJahrgang}
        onEdit={() => {
          setEditType('jahrgang');
          setEditItem(selectedActionJahrgang);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setDeleteType('jahrgang');
          setDeleteItem(selectedActionJahrgang);
          setShowDeleteModal(true);
        }}
        konfiCount={selectedActionJahrgang ? konfis.filter(k => k.jahrgang === selectedActionJahrgang.name).length : 0}
      />

      <AdminActionSheet
        show={showAdminActionSheet}
        onClose={() => {
          setShowAdminActionSheet(false);
          setSelectedActionAdmin(null);
        }}
        admin={selectedActionAdmin}
        onEdit={() => {
          setEditType('admin');
          setEditItem(selectedActionAdmin);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setDeleteType('admin');
          setDeleteItem(selectedActionAdmin);
          setShowDeleteModal(true);
        }}
        currentUserId={user.id}
      />

      {/* Header Card */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Einstellungen</h2>
        <p className="text-sm opacity-90">System-Konfiguration und Verwaltung</p>
      </div>

      {/* Zielpunkte */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Zielpunkte</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Gottesdienst</h4>
            <input
              type="number"
              value={settings.target_gottesdienst}
              onChange={(e) => setSettings({
                ...settings,
                target_gottesdienst: e.target.value
              })}
              min="0"
              max="50"
              className="w-full p-2 border-0 bg-white rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Gemeinde</h4>
            <input
              type="number"
              value={settings.target_gemeinde}
              onChange={(e) => setSettings({
                ...settings,
                target_gemeinde: e.target.value
              })}
              min="0"
              max="50"
              className="w-full p-2 border-0 bg-white rounded focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <button
          onClick={updateSettings}
          disabled={loading}
          className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          Speichern
        </button>
      </div>

      {/* Jahrgänge */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Jahrgänge</h3>
          <button
            onClick={() => setShowJahrgangModal(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Neuer Jahrgang
          </button>
        </div>
        
        <div className="space-y-3">
          {jahrgaenge.map(jahrgang => {
            const konfiCount = konfis.filter(k => k.jahrgang === jahrgang.name).length;
            
            return (
              <div 
                key={jahrgang.id} 
                className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => {
                  setSelectedActionJahrgang(jahrgang);
                  setShowJahrgangActionSheet(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Jahrgang {jahrgang.name}</div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {konfiCount} Konfis
                  </span>
                </div>
                {jahrgang.confirmation_date && (
                  <div className="text-sm text-gray-600">
                    Konfirmation: {formatDate(jahrgang.confirmation_date)}
                  </div>
                )}
              </div>
            );
          })}
          
          {jahrgaenge.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Noch keine Jahrgänge angelegt</p>
            </div>
          )}
        </div>
      </div>

      {/* Administrator */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Administrator</h3>
          <button
            onClick={() => setShowAdminModal(true)}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Neuer Admin
          </button>
        </div>
        
        <div className="space-y-3">
          {admins.map(admin => (
            <div 
              key={admin.id} 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => {
                setSelectedActionAdmin(admin);
                setShowAdminActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{admin.display_name}</div>
                  <div className="text-sm text-gray-600">@{admin.username}</div>
                </div>
                {admin.id === user.id && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Sie
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {admins.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Noch keine Admins angelegt</p>
            </div>
          )}
        </div>
      </div>

      {/* Abmelden */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>

      {/* Footer mit Versionsnummer und Copyright */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-gray-800">
            Konfi-Punkte-System v2.0.0
          </div>
          <div className="text-xs text-gray-600">
            Entwickelt von <span className="font-medium">Pastor Simon Luthe</span>
          </div>
          <div className="text-xs text-gray-500">
            © 2025 Gemeinde Büsum, Neuenkirchen & Wesselburen
          </div>
          <div className="text-xs text-gray-500">
            <a 
              href="https://github.com/Revisor01/Konfipoints" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              GitHub Repository
            </a>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Mit ❤️ für die Konfirmandenarbeit entwickelt
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const JahrgangActionSheet = ({ show, onClose, jahrgang, onEdit, onDelete, konfiCount }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Jahrgang {jahrgang?.name}</h3>
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
          {konfiCount === 0 && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Löschen
            </button>
          )}
          {konfiCount > 0 && (
            <div className="text-center text-sm text-gray-600 py-2">
              Kann nicht gelöscht werden: {konfiCount} Konfis zugeordnet
            </div>
          )}
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

const AdminActionSheet = ({ show, onClose, admin, onEdit, onDelete, currentUserId }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{admin?.display_name}</h3>
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
          {admin?.id !== currentUserId && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Löschen
            </button>
          )}
          {admin?.id === currentUserId && (
            <div className="text-center text-sm text-gray-600 py-2">
              Sie können Ihr eigenes Konto nicht löschen
            </div>
          )}
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

export default AdminSettings;
import React, { useState, useEffect } from 'react';
import { 
  Loader, Plus, Save, X, Edit, Gift, AlertTriangle, Trash2,
  Eye, EyeOff, Camera, Clock, CheckCircle, XCircle
} from 'lucide-react';
import Modal from '../Modal';

// Bonus Points Modal
export const BonusPointsModal = ({ 
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
  const konfi = konfis.find(k => k.id === konfiId);
  
  const handleSubmit = () => {
    onSubmit();
  };
  
  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`Zusatzpunkte für ${konfi?.name || ''}`}
      onSubmit={handleSubmit}
      submitButtonText="Vergeben"
      submitDisabled={loading || !description.trim()}
      loading={loading}
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Beschreibung</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
            placeholder="z.B. Besondere Hilfe bei Gemeindefest"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Punkte</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
            min="1"
            max="10"
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Typ</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          >
            <option value="gottesdienst">Gottesdienstlich</option>
            <option value="gemeinde">Gemeindlich</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          />
        </div>
      </div>
    </Modal>
  );
};

// Admin Modal
export const AdminModal = ({ 
  show, 
  onClose, 
  adminForm, 
  setAdminForm, 
  onSubmit, 
  loading 
}) => {
  const handleSubmit = () => {
    onSubmit();
  };
  
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Neuen Admin hinzufügen"
      onSubmit={handleSubmit}
      submitButtonText="Hinzufügen"
      submitDisabled={loading || !adminForm.username || !adminForm.display_name || !adminForm.password}
      loading={loading}
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Benutzername</label>
          <input
            type="text"
            value={adminForm.username}
            onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Anzeigename</label>
          <input
            type="text"
            value={adminForm.display_name}
            onChange={(e) => setAdminForm({...adminForm, display_name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Passwort</label>
          <input
            type="password"
            value={adminForm.password}
            onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          />
        </div>
      </div>
    </Modal>
  );
};

// Edit Modal
export const EditModal = ({ 
  show, 
  onClose, 
  editType, 
  editItem, 
  jahrgaenge, 
  onSave, 
  loading 
}) => {
  const [formData, setFormData] = useState(editItem || {});
  
  useEffect(() => {
    setFormData(editItem || {});
  }, [editItem]);
  
  if (!show) return null;
  
  const handleSave = () => {
    onSave(editType, formData.id, formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            <div>
              <label className="block text-sm font-medium mb-1">Kategorie</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="z.B. sonntagsgottesdienst"
              />
            </div>
          </div>
        )}
        
        {editType === 'jahrgang' && (
          <div className="space-y-3">
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
            <div>
              <label className="block text-sm font-medium mb-1">Konfirmationsdatum</label>
              <input
                type="date"
                value={formData.confirmation_date || ''}
                onChange={(e) => setFormData({...formData, confirmation_date: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
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

// Delete Confirm Modal
export const DeleteConfirmModal = ({ 
  show, 
  onClose, 
  deleteType, 
  deleteItem, 
  onConfirm, 
  loading 
}) => {
  if (!show) return null;
  
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
            onClick={() => onConfirm(deleteType, deleteItem.id)}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            <Trash2 className="w-4 h-4" />
            Löschen
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

// Request Management Modal
export const RequestManagementModal = ({ 
  show, 
  onClose, 
  request,
  onUpdateStatus, 
  loading,
  onShowImage,
  formatDate
}) => {
  const [status, setStatus] = useState(request?.status || 'pending');
  const [adminComment, setAdminComment] = useState(request?.admin_comment || '');
  
  useEffect(() => {
    if (request) {
      setStatus(request.status || 'pending');
      setAdminComment(request.admin_comment || '');
    }
  }, [request]);
  
  if (!show || !request) return null;
  
  const handleSubmit = () => {
    onUpdateStatus(request.id, status, adminComment);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Antrag bearbeiten</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-bold">{request.konfi_name}</h4>
            <p className="text-sm">{request.activity_name} ({request.activity_points} Punkte)</p>
            <p className="text-xs text-gray-600">{formatDate(request.requested_date)}</p>
            {request.comment && (
              <p className="text-xs text-gray-700 italic mt-1">"{request.comment}"</p>
            )}
          </div>
          
          {request.photo_filename && (
            <div className="text-center">
              <button 
                onClick={() => onShowImage(request.id, `Foto für ${request.activity_name}`)}
                className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 flex items-center gap-2 mx-auto"
              >
                <Camera className="w-4 h-4" />
                Foto anzeigen
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Ausstehend</option>
              <option value="approved">Genehmigt</option>
              <option value="rejected">Abgelehnt</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Admin-Kommentar {status === 'rejected' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder={status === 'rejected' ? 'Grund für Ablehnung...' : 'Optionaler Kommentar...'}
            />
            {status === 'rejected' && !adminComment.trim() && (
              <p className="text-xs text-red-500 mt-1">Grund für Ablehnung ist erforderlich</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading || (status === 'rejected' && !adminComment.trim())}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              Speichern
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
    </div>
  );
};
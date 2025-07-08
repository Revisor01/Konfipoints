import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { createJahrgang, updateJahrgang, deleteJahrgang } from '../../../services/jahrgang';
import { formatDate } from '../../../utils/formatters';
import UniversalModal from '../../shared/UniversalModal';
import JahrgangActionSheet from '../../shared/ActionSheets/JahrgangActionSheet';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import EditModal from '../modals/EditModal';

const JahrgaengeView = () => {
  const { jahrgaenge, konfis, setSuccess, setError, loadJahrgaenge } = useApp();
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showJahrgangModal, setShowJahrgangModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form State
  const [jahrgangForm, setJahrgangForm] = useState({ 
    name: '', 
    confirmation_date: '',
    description: ''
  });
  
  // Selected Items
  const [selectedJahrgang, setSelectedJahrgang] = useState(null);

  const handleCreate = async () => {
    if (!jahrgangForm.name.trim()) {
      setError('Jahrgang-Name ist erforderlich');
      return;
    }

    setLoading(true);
    try {
      await createJahrgang(jahrgangForm);
      setSuccess('Jahrgang erfolgreich erstellt');
      setShowJahrgangModal(false);
      setJahrgangForm({ name: '', confirmation_date: '', description: '' });
      loadJahrgaenge();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    setLoading(true);
    try {
      await updateJahrgang(selectedJahrgang.id, updatedData);
      setSuccess('Jahrgang erfolgreich aktualisiert');
      setShowEditModal(false);
      setSelectedJahrgang(null);
      loadJahrgaenge();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteJahrgang(selectedJahrgang.id);
      setSuccess('Jahrgang erfolgreich gelöscht');
      setShowDeleteModal(false);
      setSelectedJahrgang(null);
      loadJahrgaenge();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getKonfiCount = (jahrgangName) => {
    return konfis.filter(k => k.jahrgang?.name === jahrgangName).length;
  };

  const JahrgangModal = () => (
    <UniversalModal
      isOpen={showJahrgangModal}
      onClose={() => {
        setShowJahrgangModal(false);
        setJahrgangForm({ name: '', confirmation_date: '', description: '' });
      }}
      title="Neuen Jahrgang hinzufügen"
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jahrgang Name *
          </label>
          <input
            type="text"
            value={jahrgangForm.name}
            onChange={(e) => setJahrgangForm({...jahrgangForm, name: e.target.value})}
            className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="z.B. 2025/26"
            autoFocus
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschreibung
          </label>
          <textarea
            value={jahrgangForm.description}
            onChange={(e) => setJahrgangForm({...jahrgangForm, description: e.target.value})}
            rows="3"
            className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Zusätzliche Informationen zum Jahrgang..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmationsdatum
          </label>
          <div className="relative">
            <input
              type="date"
              value={jahrgangForm.confirmation_date}
              onChange={(e) => setJahrgangForm({...jahrgangForm, confirmation_date: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
            <Calendar className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setShowJahrgangModal(false)}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Abbrechen
          </button>
          
          <button
            type="submit"
            disabled={loading || !jahrgangForm.name.trim()}
            className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
        <h2 className="text-2xl font-bold text-gray-900">Jahrgänge verwalten</h2>
        <button
          onClick={() => setShowJahrgangModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuer Jahrgang
        </button>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {jahrgaenge.map(jahrgang => {
            const konfiCount = getKonfiCount(jahrgang.name);
            
            return (
              <div 
                key={jahrgang.id} 
                className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => {
                  setSelectedJahrgang(jahrgang);
                  setShowActionSheet(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 text-lg">
                    Jahrgang {jahrgang.name}
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {konfiCount} Konfis
                  </span>
                </div>
                
                {jahrgang.description && (
                  <p className="text-sm text-gray-600 mb-2">{jahrgang.description}</p>
                )}
                
                {jahrgang.confirmation_date && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Konfirmation: {formatDate(jahrgang.confirmation_date)}
                  </div>
                )}
                
                {jahrgang.is_active && (
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Aktiver Jahrgang
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          
          {jahrgaenge.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Jahrgänge angelegt
              </h3>
              <p className="text-sm mb-4">
                Erstelle den ersten Jahrgang für deine Konfis
              </p>
              <button
                onClick={() => setShowJahrgangModal(true)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Ersten Jahrgang erstellen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <JahrgangModal />

      <JahrgangActionSheet
        isOpen={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedJahrgang(null);
        }}
        jahrgang={selectedJahrgang}
        onEdit={() => {
          setShowActionSheet(false);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setShowActionSheet(false);
          setShowDeleteModal(true);
        }}
        onViewKonfis={() => {
          // Could navigate to konfis filtered by jahrgang
          setShowActionSheet(false);
        }}
      />

      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedJahrgang(null);
        }}
        item={selectedJahrgang}
        itemType="jahrgang"
        onSuccess={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedJahrgang(null);
        }}
        onConfirm={handleDelete}
        title="Jahrgang löschen"
        message={`Möchtest du den Jahrgang "${selectedJahrgang?.name}" wirklich löschen?`}
        itemName={selectedJahrgang?.name}
        itemType="Jahrgang"
        consequences={
          selectedJahrgang && getKonfiCount(selectedJahrgang.name) > 0 
            ? [`${getKonfiCount(selectedJahrgang.name)} Konfis verlieren ihre Jahrgang-Zuordnung`]
            : []
        }
        loading={loading}
      />
    </div>
  );
};

export default JahrgaengeView;
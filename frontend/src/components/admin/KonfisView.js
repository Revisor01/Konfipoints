// frontend/src/components/admin/KonfisView.js
import React, { useState } from 'react';
import { Search, Plus, Award, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import api from '../../services/api';
import { filterBySearchTerm, filterByJahrgang, getProgressPercentage } from '../../utils/helpers';
import Modal from '../shared/Modal';

const KonfisView = ({ konfis, jahrgaenge, settings, onSelectKonfi, onUpdate }) => {
  const { setSuccess, setError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJahrgang, setSelectedJahrgang] = useState('alle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKonfi, setNewKonfi] = useState({ name: '', jahrgang_id: '' });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'points'

  const filteredAndSortedKonfis = (() => {
    let result = filterBySearchTerm(
      filterByJahrgang(konfis, selectedJahrgang),
      searchTerm,
      ['name', 'username']
    );
    
    // Sortierung
    if (sortBy === 'points') {
      result = result.sort((a, b) => {
        const totalA = (a.points?.gottesdienst || 0) + (a.points?.gemeinde || 0);
        const totalB = (b.points?.gottesdienst || 0) + (b.points?.gemeinde || 0);
        return totalB - totalA; // Absteigende Reihenfolge
      });
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  })();

  const handleAddKonfi = async () => {
    if (!newKonfi.name.trim() || !newKonfi.jahrgang_id) {
      setError('Name und Jahrgang sind erforderlich');
      return;
    }

    setLoading(true);
    try {
      await api.post('/konfis', newKonfi);
      setSuccess('Konfi erfolgreich hinzugefügt');
      setShowAddModal(false);
      setNewKonfi({ name: '', jahrgang_id: '' });
      onUpdate();
    } catch (err) {
      setError('Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  return (
    <div className="space-y-4">
      {/* Header Card - Original Style */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-3">Konfis Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{filteredAndSortedKonfis.length}</div>
            <div className="text-xs opacity-80">Konfis</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {filteredAndSortedKonfis.reduce((sum, k) => sum + (k.points?.gottesdienst || 0) + (k.points?.gemeinde || 0), 0)}
            </div>
            <div className="text-xs opacity-80">Punkte</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{jahrgaenge?.length || 0}</div>
            <div className="text-xs opacity-80">Jahrgänge</div>
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Konfis ({filteredAndSortedKonfis.length})</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Neuer Konfi
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Konfi suchen..."
              className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-base"
            />
          </div>

          <select
            value={selectedJahrgang}
            onChange={(e) => setSelectedJahrgang(e.target.value)}
            className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none text-base"
          >
            <option value="alle">Alle Jahrgänge</option>
            {jahrgaenge.map(j => (
              <option key={j.id} value={j.name}>{j.name}</option>
            ))}
          </select>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none text-base"
            >
              <option value="name">Nach Name sortieren</option>
              <option value="points">Nach Punkten sortieren</option>
            </select>
          </div>
        </div>
      </div>

      {/* Konfis List */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-3">
          {filteredAndSortedKonfis.map(konfi => (
            <div 
              key={konfi.id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => {
                // Scroll nach oben vor Konfi-Auswahl
                const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
                if (scrollContainer) {
                  scrollContainer.scrollTop = 0;
                }
                onSelectKonfi(konfi);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{konfi.name}</div>
                    {konfi.badgeCount > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Award className="w-3 h-3" />
                        {konfi.badgeCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">Jahrgang: {konfi.jahrgang}</div>
                  
                  {/* Points Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {showGottesdienstTarget && (
                      <div className="text-center p-2 bg-blue-100 rounded">
                        <div className="font-bold text-blue-800">
                          {konfi.points?.gottesdienst || 0}/{settings.target_gottesdienst}
                        </div>
                        <div className="text-blue-600">Gottesdienst</div>
                      </div>
                    )}
                    {showGemeindeTarget && (
                      <div className="text-center p-2 bg-green-100 rounded">
                        <div className="font-bold text-green-800">
                          {konfi.points?.gemeinde || 0}/{settings.target_gemeinde}
                        </div>
                        <div className="text-green-600">Gemeinde</div>
                      </div>
                    )}
                    <div className="text-center p-2 bg-purple-100 rounded">
                      <div className="font-bold text-purple-800">
                        {(konfi.points?.gottesdienst || 0) + (konfi.points?.gemeinde || 0)}
                      </div>
                      <div className="text-purple-600">Gesamt</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAndSortedKonfis.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Keine Konfis gefunden</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewKonfi({ name: '', jahrgang_id: '' });
        }}
        title="Neuen Konfi hinzufügen"
        submitButtonText="Hinzufügen"
        onSubmit={handleAddKonfi}
        submitDisabled={!newKonfi.name.trim() || !newKonfi.jahrgang_id}
        loading={loading}
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={newKonfi.name}
              onChange={(e) => setNewKonfi({...newKonfi, name: e.target.value})}
              placeholder="Vor- und Nachname"
              className="w-full p-3 border rounded-lg"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Jahrgang *</label>
            <select
              value={newKonfi.jahrgang_id}
              onChange={(e) => setNewKonfi({...newKonfi, jahrgang_id: e.target.value})}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Jahrgang wählen...</option>
              {jahrgaenge.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KonfisView;
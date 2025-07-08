import React, { useState } from 'react';
import { 
  Plus, Loader, Users, Search, ChevronDown, BookOpen, Heart, Award
} from 'lucide-react';

const AdminKonfis = ({
  konfis,
  jahrgaenge,
  newKonfiName,
  setNewKonfiName,
  newKonfiJahrgang,
  setNewKonfiJahrgang,
  handleCreate,
  loadKonfiDetails,
  loading,
  settings,
  getProgressColor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJahrgang, setSelectedJahrgang] = useState('alle');
  const [sortBy, setSortBy] = useState('name');

  // Check if targets should be shown (not 0)
  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  // Filter function
  const filteredKonfis = konfis.filter(konfi => {
    const matchesJahrgang = selectedJahrgang === 'alle' || konfi.jahrgang === selectedJahrgang;
    const matchesSearch = searchTerm === '' || 
      konfi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      konfi.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJahrgang && matchesSearch;
  });

  return (
    <div className="space-y-4 pt-10">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-3">Konfis Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{filteredKonfis.length}</div>
            <div className="text-xs opacity-80">Konfis</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{filteredKonfis.reduce((sum, k) => sum + k.points.gottesdienst + k.points.gemeinde, 0)}</div>
            <div className="text-xs opacity-80">Punkte</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{filteredKonfis.reduce((sum, k) => sum + (k.badgeCount || 0), 0)}</div>
            <div className="text-xs opacity-80">Badges</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Neuen Konfi hinzufügen</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newKonfiName}
            onChange={(e) => setNewKonfiName(e.target.value)}
            placeholder="Name des Konfis"
            className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <select
            value={newKonfiJahrgang}
            onChange={(e) => setNewKonfiJahrgang(e.target.value)}
            className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-base"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Hinzufügen
          </button>
        </div>
      </div>
      
      {/* Filter und Sortierung */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Filter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nach Name suchen..."
              className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          
          <div className="relative">
            <select
              value={selectedJahrgang}
              onChange={(e) => setSelectedJahrgang(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
            >
              <option value="alle">Alle Jahrgänge</option>
              {jahrgaenge.map(j => (
                <option key={j.id} value={j.name}>{j.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
            >
              <option value="name">Nach Name</option>
              <option value="points">Nach Punkten</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredKonfis
          .sort((a, b) => {
            if (sortBy === 'points') {
              const aTotal = a.points.gottesdienst + a.points.gemeinde;
              const bTotal = b.points.gottesdienst + b.points.gemeinde;
              return bTotal - aTotal;
            }
            return a.name.localeCompare(b.name);
          })
          .map(konfi => (
            <div
              key={konfi.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => loadKonfiDetails(konfi.id)}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">
                    {konfi.name}
                  </h3>
                </div>
                
                <div className="text-center flex-shrink-0 min-w-[60px]">
                  <div className="text-xl font-bold text-purple-600">
                    {konfi.points.gottesdienst + konfi.points.gemeinde}
                  </div>
                  <div className="text-xs text-gray-500">Punkte</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {konfi.jahrgang} • {konfi.username}
              </p>
              
              <div className="space-y-3">
                {showGottesdienstTarget && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Gottesdienst</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {konfi.points.gottesdienst}/{settings.target_gottesdienst}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gottesdienst, settings.target_gottesdienst)}`}
                        style={{ width: `${Math.min((konfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {showGemeindeTarget && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Gemeinde</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {konfi.points.gemeinde}/{settings.target_gemeinde}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gemeinde, settings.target_gemeinde)}`}
                        style={{ width: `${Math.min((konfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        
        {filteredKonfis.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Konfis gefunden</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKonfis;
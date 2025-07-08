import React from 'react';
import { Search, BookOpen, Heart, Award } from 'lucide-react';

const AdminOverview = ({ 
  konfis,
  searchTerm,
  setSearchTerm,
  settings,
  onKonfiClick,
  getProgressColor,
  formatDate
}) => {
  // Check if targets should be shown (not 0)
  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Punkteübersicht</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nach Name suchen..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          {konfis.map(konfi => (
            <div 
              key={konfi.id} 
              className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-blue-50"
              onClick={() => onKonfiClick(konfi.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0" style={{ width: '200px' }}>
                      <h3 className="font-bold text-lg text-blue-600 hover:text-blue-800 truncate">
                        {konfi.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {konfi.jahrgang} | {konfi.username}
                        {konfi.badgeCount > 0 && (
                          <span className="ml-2 text-yellow-600">
                            <Award className="w-3 h-3 inline mr-1" />
                            {konfi.badgeCount}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Progress bars - jetzt immer an gleicher Position */}
                    {(showGottesdienstTarget || showGemeindeTarget) && (
                      <div className="hidden md:block space-y-3 flex-1 w-full">
                        {showGottesdienstTarget && (
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs text-gray-700 font-medium w-20 flex-shrink-0">Gottesdienst</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gottesdienst, settings.target_gottesdienst)}`}
                                style={{ width: `${Math.min((konfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 flex-shrink-0 w-12 text-right">
                              {konfi.points.gottesdienst}/{settings.target_gottesdienst}
                            </span>
                          </div>
                        )}
                        {showGemeindeTarget && (
                          <div className="flex items-center gap-3">
                            <Heart className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs text-gray-700 font-medium w-20 flex-shrink-0">Gemeinde</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gemeinde, settings.target_gemeinde)}`}
                                style={{ width: `${Math.min((konfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-green-600 flex-shrink-0 w-12 text-right">
                              {konfi.points.gemeinde}/{settings.target_gemeinde}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Punkte-Anzeige rechts */}
                <div className="flex items-center gap-6 flex-shrink-0 pl-8">
                  {showGottesdienstTarget && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {konfi.points.gottesdienst}/{settings.target_gottesdienst}
                      </div>
                      <div className="text-xs text-gray-600">Gottesdienst</div>
                    </div>
                  )}
                  {showGemeindeTarget && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {konfi.points.gemeinde}/{settings.target_gemeinde}
                      </div>
                      <div className="text-xs text-gray-600">Gemeinde</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {konfi.points.gottesdienst + konfi.points.gemeinde}
                    </div>
                    <div className="text-xs text-gray-600">Gesamt</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
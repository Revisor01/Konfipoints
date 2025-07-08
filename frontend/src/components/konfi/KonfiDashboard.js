// frontend/src/components/konfi/KonfiDashboard.js
import React from 'react';
import { Trophy, TrendingUp, Calendar, Star, Award, Heart, BookOpen, Target } from 'lucide-react';
import { getConfirmationCountdown, getProgressPercentage } from '../../utils/helpers';
import { formatShortDate } from '../../utils/formatters';
import BadgeDisplay from '../shared/BadgeDisplay';

const KonfiDashboard = ({ konfiData, badges, settings, onUpdate }) => {
  const countdown = getConfirmationCountdown(konfiData.confirmation_date);
  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  const totalPoints = konfiData.points.gottesdienst + konfiData.points.gemeinde;
  const recentActivities = [...(konfiData.activities || []), ...(konfiData.bonusPoints || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Konfi Quest Splash Screen */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Konfi Quest</h1>
        <p className="text-sm opacity-90 mb-4">Deine spirituelle Reise</p>
        {countdown && countdown.isUpcoming && (
          <div>
            <div className="text-3xl font-bold">{countdown.totalDays}</div>
            <div className="text-sm">Tage bis zur Konfirmation</div>
            <div className="text-xs opacity-80 mt-1">
              {countdown.weeks} Wochen, {countdown.remainingDays} Tage
            </div>
          </div>
        )}
      </div>

      {/* Points Overview - Original Style */}
      {(showGottesdienstTarget || showGemeindeTarget) && (
        <div className={`grid gap-4 ${showGottesdienstTarget && showGemeindeTarget ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {showGottesdienstTarget && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Gottesdienst
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {konfiData.points.gottesdienst}/{settings.target_gottesdienst}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    konfiData.points.gottesdienst >= parseInt(settings.target_gottesdienst) 
                      ? 'bg-green-500' 
                      : konfiData.points.gottesdienst >= parseInt(settings.target_gottesdienst) * 0.75 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((konfiData.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                ></div>
              </div>
              {konfiData.points.gottesdienst >= parseInt(settings.target_gottesdienst) && (
                <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Ziel erreicht!
                </div>
              )}
            </div>
          )}
          
          {showGemeindeTarget && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Gemeinde
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {konfiData.points.gemeinde}/{settings.target_gemeinde}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    konfiData.points.gemeinde >= parseInt(settings.target_gemeinde) 
                      ? 'bg-green-500' 
                      : konfiData.points.gemeinde >= parseInt(settings.target_gemeinde) * 0.75 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((konfiData.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                ></div>
              </div>
              {konfiData.points.gemeinde >= parseInt(settings.target_gemeinde) && (
                <div className="text-green-600 font-bold flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4" />
                  Ziel erreicht!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions - Original Style */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4">Schnell-Aktionen</h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => {/* TODO: Navigation zu Anträge */}}
            className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 text-base font-medium"
          >
            <Target className="w-5 h-5" />
            <div className="text-left flex-1">
              <div className="font-bold">Aktivität beantragen</div>
              <div className="text-sm opacity-90">Neue Punkte beantragen</div>
            </div>
          </button>
          <button
            onClick={() => {/* TODO: Navigation zu Badges */}}
            className="bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 flex items-center gap-2 text-base font-medium"
          >
            <Award className="w-5 h-5" />
            <div className="text-left flex-1">
              <div className="font-bold">Meine Badges</div>
              <div className="text-sm opacity-90">Erreichte Auszeichnungen</div>
            </div>
          </button>
        </div>
      </div>

      {/* Total Points Card */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl p-6 text-center shadow-lg">
        <div className="text-5xl font-bold mb-2">{totalPoints}</div>
        <div className="text-lg">Gesamtpunkte</div>
        <div className="mt-3 flex items-center justify-center gap-4 text-sm">
          <span>📖 {konfiData.points.gottesdienst}</span>
          <span>🤝 {konfiData.points.gemeinde}</span>
        </div>
      </div>


      {/* Badges Preview */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Meine Badges
        </h3>
        <BadgeDisplay 
          badges={badges.available || []} 
          earnedBadges={badges.earned || []} 
          konfiData={konfiData}
          showProgress={false}
        />
        {badges.available && badges.available.length > 6 && (
          <p className="text-center text-sm text-blue-600 mt-3">
            Alle Badges im Badge-Bereich ansehen →
          </p>
        )}
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold mb-3">Letzte Aktivitäten</h3>
          <div className="space-y-2">
            {recentActivities.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.type === 'gottesdienst' ? 
                    <BookOpen className="w-4 h-4 text-blue-600" /> : 
                    <Heart className="w-4 h-4 text-green-600" />
                  }
                  <span>{item.name || item.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-600">+{item.points}</span>
                  <span className="text-xs text-gray-500">{formatShortDate(item.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KonfiDashboard;
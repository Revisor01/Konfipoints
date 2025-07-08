import React, { useState, useEffect } from 'react';
import { Trophy, Target, CheckCircle, Clock, Lock } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { getKonfiBadges, checkBadgeEligibility } from '../../../services/badge';
import { calculateBadgeProgress } from '../../../utils/helpers';

const KonfiBadgesView = () => {
  const { user, badges } = useApp();
  const [konfisBadges, setKonfiBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadKonfiBadges();
    }
  }, [user]);

  const loadKonfiBadges = async () => {
    try {
      setLoading(true);
      const data = await getKonfiBadges(user.id);
      setKonfiBadges(data);
    } catch (error) {
      console.error('Error loading konfi badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const BadgeCard = ({ badge, isEarned, progress }) => {
    const progressPercentage = progress?.percentage || 0;
    const isComplete = progressPercentage >= 100;
    const isNearComplete = progressPercentage >= 75;

    return (
      <div 
        className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
          isEarned ? 'border-yellow-400 bg-yellow-50' : 
          isNearComplete ? 'border-orange-300 bg-orange-50' : 
          'border-gray-200 hover:border-blue-300'
        }`}
        onClick={() => setSelectedBadge({ badge, isEarned, progress })}
      >
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
            isEarned ? 'bg-yellow-500 text-white' : 
            isNearComplete ? 'bg-orange-500 text-white' : 
            'bg-gray-200 text-gray-400'
          }`}>
            {isEarned ? (
              <Trophy className="w-8 h-8" />
            ) : (
              badge.icon || '🏆'
            )}
          </div>

          <h3 className={`font-semibold text-lg mb-2 ${
            isEarned ? 'text-yellow-800' : 'text-gray-900'
          }`}>
            {badge.name}
          </h3>

          <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
            {badge.description}
          </p>

          {!isEarned && progress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Fortschritt</span>
                <span>{progress.current}/{progress.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    isNearComplete ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(progressPercentage)}% erreicht
              </p>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2">
            {isEarned ? (
              <>
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Erhalten!</span>
              </>
            ) : isComplete ? (
              <>
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Bereit!</span>
              </>
            ) : isNearComplete ? (
              <>
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Fast da!</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Nicht erreicht</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BadgeModal = ({ badge, isEarned, progress, onClose }) => {
    const getCriteriaDescription = (type, value) => {
      switch (type) {
        case 'total_points':
          return `Erreiche ${value} Gesamtpunkte`;
        case 'activities_count':
          return `Absolviere ${value} Aktivitäten`;
        case 'specific_activity':
          return `Absolviere eine spezifische Aktivität`;
        case 'streak':
          return `Erreiche einen ${value}-Wochen-Streak`;
        case 'konfi_days':
          return `Besuche ${value} Konfi-Tage`;
        case 'bonus':
          return `Besonderes Bonus-Badge`;
        case 'seasonal':
          return `Saison-Badge`;
        default:
          return `Erfülle das Kriterium: ${value}`;
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
              isEarned ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {isEarned ? <Trophy className="w-10 h-10" /> : badge.icon || '🏆'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{badge.name}</h2>
            <p className="text-gray-600">{badge.description}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Anforderung:</h3>
              <p className="text-gray-700">
                {getCriteriaDescription(badge.criteria_type, badge.criteria_value)}
              </p>
            </div>

            {!isEarned && progress && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dein Fortschritt:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Erreicht: {progress.current}</span>
                    <span>Ziel: {progress.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round(progress.percentage)}% erreicht
                    {progress.percentage >= 100 && ' - Badge bereit!'}
                  </p>
                </div>
              </div>
            )}

            {isEarned && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Badge erhalten! Gratulation! 🎉
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const earnedBadges = konfisBadges.filter(kb => kb.badge);
  const availableBadges = badges.filter(badge => 
    !earnedBadges.some(eb => eb.badge.id === badge.id)
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meine Badges</h2>
        <p className="text-gray-600">
          {earnedBadges.length} von {badges.length} Badges erhalten
        </p>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Erhaltene Badges ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((konfisBadge) => (
              <BadgeCard
                key={konfisBadge.badge.id}
                badge={konfisBadge.badge}
                isEarned={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Badges */}
      {availableBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verfügbare Badges ({availableBadges.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBadges.map((badge) => {
              const progress = calculateBadgeProgress(user, badge);
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={false}
                  progress={progress}
                />
              );
            })}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && availableBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Badges verfügbar
          </h3>
          <p className="text-gray-600">
            Es wurden noch keine Badges erstellt.
          </p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge.badge}
          isEarned={selectedBadge.isEarned}
          progress={selectedBadge.progress}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default KonfiBadgesView;
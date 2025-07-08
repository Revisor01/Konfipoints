// frontend/src/components/shared/BadgeDisplay.js
import React from 'react';
import { Star, Lock, TrendingUp } from 'lucide-react';
import { formatShortDate } from '../../utils/formatters';

const BadgeDisplay = ({ badges, earnedBadges, showProgress = true, isAdmin = false, konfiData = null }) => {
  const earnedBadgeIds = earnedBadges.map(b => b.id || b.badge_id);
  
  // Calculate badge progress for konfi view
  const calculateBadgeProgress = (badge) => {
    if (!konfiData || earnedBadgeIds.includes(badge.id) || isAdmin) return null;
    
    let current = 0;
    let total = badge.criteria_value;
    let description = '';
    
    switch (badge.criteria_type) {
      case 'total_points':
        current = konfiData.points.gottesdienst + konfiData.points.gemeinde;
        description = `${current}/${total} Punkte`;
        break;
      
      case 'gottesdienst_points':
        current = konfiData.points.gottesdienst;
        description = `${current}/${total} Gottesdienst`;
        break;
      
      case 'gemeinde_points':
        current = konfiData.points.gemeinde;
        description = `${current}/${total} Gemeinde`;
        break;
      
      case 'both_categories':
        current = Math.min(konfiData.points.gottesdienst, konfiData.points.gemeinde);
        description = `${current}/${total} in beiden`;
        break;
      
      case 'activity_count':
        current = konfiData.activities ? konfiData.activities.length : 0;
        description = `${current}/${total} Aktivitäten`;
        break;
      
      default:
        return null;
    }
    
    return { 
      current, 
      total, 
      description, 
      percentage: Math.min((current / total) * 100, 100) 
    };
  };
  
  // Filter badges
  const visibleBadges = badges.filter(badge => {
    if (isAdmin) return true;
    if (!badge.is_hidden) return true;
    return earnedBadgeIds.includes(badge.id);
  });
  
  return (
    <div className="space-y-4">
      {showProgress && !isAdmin && (
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {earnedBadges.length}/{visibleBadges.length}
          </div>
          <div className="text-sm text-gray-600">Badges erhalten</div>
          {badges.some(b => b.is_hidden && !earnedBadgeIds.includes(b.id)) && (
            <div className="text-xs text-purple-600 mt-1 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              {badges.filter(b => b.is_hidden && !earnedBadgeIds.includes(b.id)).length} geheime Badges verfügbar
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3">
        {visibleBadges.map(badge => {
          const isEarned = earnedBadgeIds.includes(badge.id);
          const isHidden = badge.is_hidden;
          const progress = calculateBadgeProgress(badge);
          
          return (
            <div 
              key={badge.id} 
              className={`p-3 rounded-lg text-center border-2 transition-all ${
                isEarned 
                  ? isHidden 
                    ? 'bg-purple-50 border-purple-400 shadow-md' 
                    : 'bg-yellow-50 border-yellow-400 shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-3xl mb-1">{badge.icon}</div>
              <div className={`text-xs font-bold mb-1 break-words ${
                isEarned 
                  ? isHidden ? 'text-purple-800' : 'text-yellow-800' 
                  : 'text-gray-500'
              }`}>
                {badge.name}
              </div>
              
              {isEarned ? (
                <div className={`text-xs ${isHidden ? 'text-purple-600' : 'text-yellow-600'}`}>
                  <Star className="w-3 h-3 inline mr-0.5" />
                  {isHidden ? 'Geheim!' : 'Erhalten'}
                  {(() => {
                    const earnedBadge = earnedBadges.find(b => (b.id || b.badge_id) === badge.id);
                    if (earnedBadge?.earned_at) {
                      return (
                        <div className="text-xs opacity-75 mt-0.5">
                          {formatShortDate(earnedBadge.earned_at)}
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : progress ? (
                <div className="mt-1">
                  <div className="text-xs text-gray-600 mb-1 font-medium">
                    {progress.description}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${
                        progress.percentage >= 100 ? 'bg-green-500' : 
                        progress.percentage >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  {progress.percentage >= 80 && progress.percentage < 100 && (
                    <div className="text-xs text-orange-600 mt-0.5 font-bold">
                      <TrendingUp className="w-3 h-3 inline mr-0.5" />
                      Fast!
                    </div>
                  )}
                </div>
              ) : (
                isAdmin && isHidden && (
                  <div className="text-xs text-purple-500">
                    <Lock className="w-3 h-3 inline" />
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;
import React, { useState, useEffect, createPortal, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import ChatView from './components/ChatView';

import { 
  BonusPointsModal, 
  AdminModal, 
  EditModal, 
  DeleteConfirmModal, 
  RequestManagementModal 
} from './components/admin/AdminModals';

import { BadgeModal as MobileBadgeModal } from './components/admin/BadgeModal';

import axios from 'axios';
import { 
  Users, Award, Calendar, Settings, LogIn, LogOut, Plus, Edit, Eye, Star, 
  Loader, RefreshCw, Copy, Check, BookOpen, UserPlus, Trash2, Search, Gift,
  Menu, X, EyeOff, Save, AlertTriangle, Heart, Upload, Clock, CheckCircle,
  XCircle, MessageSquare, Camera, BarChart3, Trophy, Zap, Target, ChevronDown
} from 'lucide-react';
import Modal from './components/Modal';

// API Configuration
const API_BASE_URL = 'https://konfipoints.godsapp.de/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Fallback zu localStorage für Web-Kompatibilität
  const token = localStorage.getItem('konfi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useBadgeManager = (user, activityRequests) => {
  useEffect(() => {
    const updateAppBadge = async () => {
      if (user?.type !== 'admin') return;
      
      const pendingRequests = activityRequests.filter(r => r.status === 'pending').length;
      
      try {
        // Native App Badge
        if (Capacitor.isNativePlatform()) {
          const { Badge } = await import('@capawesome/capacitor-badge');
          
          // Check if supported
          const { isSupported } = await Badge.isSupported();
          
          if (isSupported) {
            // Check permissions
            const permissionStatus = await Badge.checkPermissions();
            
            if (permissionStatus.display !== 'granted') {
              await Badge.requestPermissions();
            }
            
            // Set badge
            if (pendingRequests > 0) {
              await Badge.set({ count: pendingRequests });
              console.log(`📱 App Badge gesetzt: ${pendingRequests}`);
            } else {
              await Badge.clear();
              console.log('📱 App Badge geleert');
            }
          }
        }
        
        // Web Title Badge (immer verfügbar)
        if (pendingRequests > 0) {
          document.title = `(${pendingRequests}) Konfi-Punkte Admin`;
        } else {
          document.title = 'Konfi-Punkte Admin';
        }
        
      } catch (error) {
        console.log('Badge update failed:', error);
        
        // Fallback: nur Web Title
        if (pendingRequests > 0) {
          document.title = `(${pendingRequests}) Konfi-Punkte Admin`;
        } else {
          document.title = 'Konfi-Punkte Admin';
        }
      }
    };
    
    // Nur ausführen wenn activityRequests geladen sind
    if (Array.isArray(activityRequests)) {
      updateAppBadge();
    }
  }, [user, activityRequests]);
};

const AdminItemCard = ({ 
  item, 
  onClick, 
  onEdit, 
  onDelete, 
  children,
  badge,
  rightContent,
  clickable = true 
}) => {
  return (
    <div 
    className={`bg-white rounded-lg border-2 border-gray-200 p-4 transition-all ${
      clickable ? 'hover:border-blue-300 hover:shadow-md cursor-pointer' : ''
    }`}
    onClick={clickable ? onClick : undefined}
    >
    {/* ERSTE ZEILE: Nur Buttons und Badges */}
    <div className="flex items-center justify-end gap-2 mb-3">
    <div className="flex items-center gap-2 ml-auto">
    {/* Action Buttons */}
    <div className="flex gap-1">
    {onEdit && (
      <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
      title="Bearbeiten"
      >
      <Edit className="w-4 h-4" />
      </button>
    )}
    {onDelete && (
      <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
      title="Löschen"
      >
      <Trash2 className="w-4 h-4" />
      </button>
    )}
    </div>
    {rightContent}
    </div>
    </div>
    
    {/* ZWEITE ZEILE: Content - volle Breite */}
    <div className="w-full">
    {children}
    </div>
    </div>
  );
};

// Request Card Component - BETTER LAYOUT
const RequestCard = ({ 
  request, 
  onApprove, 
  onReject, 
  onEdit, 
  onShowPhoto,
  loading = false,
  isProcessed = false 
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div 
    className={`bg-white rounded-lg border-2 p-4 transition-all cursor-pointer ${
      request.status === 'pending' 
      ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400' 
      : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={() => setShowActions(!showActions)}
    >
    <div className="space-y-3">
    {/* ERSTE ZEILE: Status und Foto Badge */}
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
    <RequestStatusBadge status={request.status} />
    {request.photo_filename && (
      <button 
      onClick={(e) => {
        e.stopPropagation();
        onShowPhoto();
      }}
      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 flex items-center gap-1 text-xs font-medium"
      >
      <Camera className="w-3 h-3" />
      Foto
      </button>
    )}
    </div>
    
    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showActions ? 'rotate-180' : ''}`} />
    </div>
    
    {/* ZWEITE ZEILE: Vollständiger Titel und Info */}
    <div className="w-full">
    <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">
    {request.konfi_name}
    </h3>
    <p className="text-sm text-gray-600 mb-1">
    {request.activity_name} • {request.activity_points} Punkte
    </p>
    <p className="text-xs text-gray-500">
    {formatDate(request.requested_date)}
    </p>
    </div>
    
    {/* Comment */}
    {request.comment && (
      <p className="text-sm text-gray-700 italic bg-gray-50 p-2 rounded">
      "{request.comment}"
      </p>
    )}
    
    {/* Admin Comment */}
    {request.admin_comment && (
      <p className="text-sm text-blue-600 italic bg-blue-50 p-2 rounded">
      Admin: {request.admin_comment}
      </p>
    )}
    
    {/* Actions */}
    {showActions && (
      <div className="border-t pt-3 space-y-2">
      {request.status === 'pending' ? (
        <div className="flex gap-2">
        <button
        onClick={(e) => {
          e.stopPropagation();
          onApprove();
        }}
        disabled={loading}
        className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
        <CheckCircle className="w-4 h-4" />
        Genehmigen
        </button>
        <button
        onClick={(e) => {
          e.stopPropagation();
          const comment = prompt('Grund für Ablehnung:');
          if (comment) onReject(comment);
        }}
        disabled={loading}
        className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
        <XCircle className="w-4 h-4" />
        Ablehnen
        </button>
        </div>
      ) : (
        <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
        <Edit className="w-4 h-4" />
        Bearbeiten
        </button>
      )}
      </div>
    )}
    </div>
    </div>
  );
};

const BottomTabNavigation = ({ currentView, setCurrentView, navigationItems }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg safe-area-bottom">
    <div className="flex justify-around items-center py-2 px-2">
    {navigationItems.map(({ id, label, icon: Icon, notification }) => (
      <button
      key={id}
      onClick={() => setCurrentView(id)}
      className={`flex flex-col items-center justify-center py-2 px-2 min-w-0 flex-1 transition-colors relative ${
        currentView === id 
        ? 'text-blue-600' 
        : 'text-gray-400'
      }`}
      >
      <div className="relative">
      <Icon className={`w-5 h-5 ${currentView === id ? 'text-blue-600' : 'text-gray-400'}`} />
      {notification > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
        {notification > 9 ? '9+' : notification}
        </span>
      )}
      </div>
      <span className={`text-[10px] font-medium truncate max-w-full leading-tight ${
        currentView === id ? 'text-blue-600' : 'text-gray-400'
      }`}>
      {label}
      </span>
      </button>
    ))}
    </div>
    </div>
  );
};

// Request Status Badge
const RequestStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Ausstehend' },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Genehmigt' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Abgelehnt' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
    <Icon className="w-3 h-3" />
    {config.label}
    </span>
  );
};

// Datumsformat-Funktion
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}`;
};

// Countdown-Funktion
const getConfirmationCountdown = (confirmationDate) => {
  if (!confirmationDate) return null;
  
  const now = new Date();
  const confDate = new Date(confirmationDate);
  const diffTime = confDate - now;
  
  if (diffTime <= 0) return { totalDays: 0, weeks: 0, remainingDays: 0, isUpcoming: false };
  
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  
  return {
    totalDays: days,
    weeks,
    remainingDays,
    isUpcoming: days > 0
  };
};

// Enhanced Badge Display Component with progress tracking
const BadgeDisplay = ({ badges, earnedBadges, showProgress = true, isAdmin = false, konfiData = null }) => {
  const earnedBadgeIds = earnedBadges.map(b => b.id || b.badge_id);
  
  // Calculate badge progress for konfi view
  const calculateBadgeProgress = (badge) => {
    if (!konfiData || earnedBadgeIds.includes(badge.id)) return null;
    
    let current = 0;
    let total = badge.criteria_value;
    let description = '';
    
    switch (badge.criteria_type) {
      case 'total_points':
        current = konfiData.points.gottesdienst + konfiData.points.gemeinde;
        description = `${current}/${total} Punkte`;
        break;
      case 'bonus_points':
        current = konfiData.bonusPoints ? konfiData.bonusPoints.length : 0;
        description = `${current}/${total} Bonuspunkte`;
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
      case 'unique_activities':
        const uniqueActivities = konfiData.activities ? 
        new Set(konfiData.activities.map(a => a.name)).size : 0;
        current = uniqueActivities;
        description = `${current}/${total} verschieden`;
        break;
      case 'specific_activity':
        if (badge.criteria_extra && konfiData.activities) {
          try {
            const extraData = typeof badge.criteria_extra === 'string' 
            ? JSON.parse(badge.criteria_extra) 
            : badge.criteria_extra;
            if (extraData.required_activity_name) {
              current = konfiData.activities.filter(activity => 
                activity.name === extraData.required_activity_name
              ).length;
              description = `${current}/${total}x ${extraData.required_activity_name}`;
            }
          } catch (e) {
            return null;
          }
        }
        break;
      case 'category_activities':
        if (badge.criteria_extra && konfiData.activities) {
          try {
            const extraData = typeof badge.criteria_extra === 'string' 
            ? JSON.parse(badge.criteria_extra) 
            : badge.criteria_extra;
            if (extraData.required_category) {
              current = konfiData.activities.filter(activity => {
                if (!activity.category) return false;
                const categories = activity.category.split(',').map(c => c.trim());
                return categories.includes(extraData.required_category);
              }).length;
              description = `${current}/${total} aus ${extraData.required_category}`;
            }
          } catch (e) {
            return null;
          }
        }
        break;
      case 'activity_combination':
        if (badge.criteria_extra) {
          try {
            const extraData = typeof badge.criteria_extra === 'string' 
            ? JSON.parse(badge.criteria_extra) 
            : badge.criteria_extra;
            if (extraData.required_activities && konfiData.activities) {
              const completedActivities = new Set(konfiData.activities.map(a => a.name));
              current = extraData.required_activities.filter(req => 
                completedActivities.has(req)
              ).length;
              description = `${current}/${extraData.required_activities.length} Kombination`;
            }
          } catch (e) {
            return null;
          }
        }
        break;
      case 'streak':
        if (konfiData.activities) {
          // Hilfsfunktion: Kalenderwoche berechnen
          function getYearWeek(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
          }
          
          // Aktivitätsdaten in Set einzigartiger Wochen umwandeln
          const activityWeeks = new Set(
            konfiData.activities
            .map(activity => getYearWeek(new Date(activity.date)))
            .filter(week => week && !week.includes('NaN'))
          );
          
          // Sortiere Wochen chronologisch (neueste zuerst)
          const sortedWeeks = Array.from(activityWeeks).sort().reverse();
          
          let currentStreak = 0;
          
          // Finde den längsten Streak vom neuesten Datum aus
          if (sortedWeeks.length > 0) {
            currentStreak = 1; // Erste Woche zählt immer
            
            // Prüfe aufeinanderfolgende Wochen rückwärts
            for (let i = 0; i < sortedWeeks.length - 1; i++) {
              const thisWeek = sortedWeeks[i];
              const nextWeek = sortedWeeks[i + 1];
              
              // Berechne die erwartete vorherige Woche
              const [year, week] = thisWeek.split('-W').map(Number);
              let expectedYear = year;
              let expectedWeek = week - 1;
              
              if (expectedWeek === 0) {
                expectedYear -= 1;
                expectedWeek = 52; // Vereinfacht, könnte 53 sein
              }
              
              const expectedWeekStr = `${expectedYear}-W${expectedWeek.toString().padStart(2, '0')}`;
              
              if (nextWeek === expectedWeekStr) {
                currentStreak++;
              } else {
                break; // Streak unterbrochen
              }
            }
          }
          
          current = currentStreak;
          description = `${current}/${total} Wochen-Serie`;
        }
        break;
      case 'time_based':
        if (badge.criteria_extra && konfiData.activities) {
          try {
            const extraData = typeof badge.criteria_extra === 'string' 
            ? JSON.parse(badge.criteria_extra) 
            : badge.criteria_extra;
            const days = extraData.days || 7;
            const now = new Date();
            const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            
            current = konfiData.activities.filter(activity => {
              const activityDate = new Date(activity.date);
              return activityDate >= cutoff;
            }).length;
            description = `${current}/${total} in ${days} Tagen`;
          } catch (e) {
            return null;
          }
        }
        break;
      default:
        return null;
    }
    
    return { current, total, description, percentage: Math.min((current / total) * 100, 100) };
  };
  
  // Filter badges
  const visibleBadges = badges.filter(badge => {
    if (isAdmin) return true;
    if (!badge.is_hidden) return true;
    return earnedBadgeIds.includes(badge.id);
  });
  
  return (
    <div className="space-y-4">
    {showProgress && (
      <div className="text-center text-sm text-gray-600">
      <span className="font-bold">{earnedBadges.length}</span> von <span className="font-bold">{visibleBadges.length}</span> Badges erhalten
      {!isAdmin && badges.some(b => b.is_hidden && !earnedBadgeIds.includes(b.id)) && (
        <div className="text-xs text-purple-600 mt-1">
        🎭 {badges.filter(b => b.is_hidden).length} geheime Badges warten auf dich!
        </div>
      )}
      </div>
    )}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
    {visibleBadges.map(badge => {
      const isEarned = earnedBadgeIds.includes(badge.id);
      const isHidden = badge.is_hidden;
      const progress = !isAdmin && konfiData ? calculateBadgeProgress(badge) : null;
      
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
        title={badge.description}
        >
        <div className="text-2xl mb-1">
        {badge.icon}
        </div>
        <div className={`text-xs font-bold mb-1 leading-tight break-words ${
          isEarned 
          ? isHidden ? 'text-purple-800' : 'text-yellow-800' 
          : 'text-gray-500'
        }`}>
        {badge.name}
        </div>
        
        {isEarned ? (
          <div className={`text-xs mt-1 ${isHidden ? 'text-purple-600' : 'text-yellow-600'}`}>
          <div>✓ {isHidden ? 'Geheim!' : 'Erhalten'}</div>
          {(() => {
            const earnedBadge = earnedBadges.find(b => (b.id || b.badge_id) === badge.id);
            if (earnedBadge && earnedBadge.earned_at) {
              const earnedDate = new Date(earnedBadge.earned_at);
              const day = earnedDate.getDate().toString().padStart(2, '0');
              const month = (earnedDate.getMonth() + 1).toString().padStart(2, '0');
              const year = earnedDate.getFullYear();
              return (
                <div className="text-xs opacity-75 mt-1">
                {day}.{month}.{year}
                </div>
              );
            }
            return null;
          })()}
          </div>
        ) : progress ? (
          <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1 font-medium">
          {progress.description}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
          className={`h-2 rounded-full transition-all ${
            progress.percentage >= 100 ? 'bg-green-500' : 
            progress.percentage >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress.percentage}%` }}
          ></div>
          </div>
          {progress.percentage >= 80 && progress.percentage < 100 && (
            <div className="text-xs text-orange-600 mt-1 font-bold">
            🔥 Fast geschafft!
            </div>
          )}
          </div>
        ) : (
          isAdmin && isHidden && (
            <div className="text-xs text-purple-500 mt-1">
            🎭 Geheim
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

// Image Popup Component
const ImageModal = ({ show, onClose, imageUrl, title }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <img 
            src={imageUrl} 
            alt={title}
            className="max-w-full h-auto rounded"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CaWxkIG5pY2h0IGdlZnVuZGVuPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Bottom Sheet Component für mobile Aktionen
const BottomSheet = ({ show, onClose, children, title }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    if (deltaY > 0) { // Only allow downward swipe
      setCurrentY(deltaY);
    }
  };
  
  const handleTouchEnd = () => {
    if (currentY > 100) { // Threshold für close
      onClose();
    }
    setCurrentY(0);
    setIsDragging(false);
  };
  
  // RESET on show change
  useEffect(() => {
    if (!show) {
      setCurrentY(0);
      setIsDragging(false);
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end">
    <div 
    className="absolute inset-0 bg-black bg-opacity-50"
    onClick={onClose}
    ></div>
    <div 
    className={`relative w-full bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-hidden transition-transform duration-300 ${
      isDragging ? 'transition-none' : ''
    }`}
    style={{ 
      transform: `translateY(${currentY}px)` 
    }}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
    {/* Handle Bar */}
    <div className="p-4 border-b border-gray-100">
    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-grab"></div>
    <h3 className="text-lg font-bold text-center">{title}</h3>
    </div>
    <div className="px-6 pt-6 pb-10 space-y-3 max-h-[60vh] overflow-y-auto safe-area-bottom">
    {children}
    </div>
    </div>
    </div>
  );
};

// Jahrgang Action Sheet
const JahrgangActionSheet = ({ 
  show, 
  onClose, 
  jahrgang, 
  onEdit, 
  onDelete,
  konfiCount
}) => {
  if (!jahrgang) return null;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={`Jahrgang ${jahrgang.name}`}
    >
    <div className="space-y-4">
    {/* Jahrgang Info */}
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
    <h4 className="font-bold text-lg mb-1">Jahrgang {jahrgang.name}</h4>
    {jahrgang.confirmation_date && (
      <p className="text-sm text-gray-600 mb-2">
      Konfirmation: {formatDate(jahrgang.confirmation_date)}
      </p>
    )}
    <div className="flex items-center gap-2">
    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
    {konfiCount} Konfis
    </span>
    </div>
    </div>
    
    {/* Warning wenn Konfis zugeordnet */}
    {konfiCount > 0 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="text-sm text-yellow-800">
      ⚠️ Dieser Jahrgang hat {konfiCount} zugeordnete Konfis. Löschen ist nur möglich, wenn keine Konfis zugeordnet sind.
      </p>
      </div>
    )}
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onEdit();
      onClose();
    }}
    className="w-full bg-purple-500 text-white py-4 rounded-xl hover:bg-purple-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Edit className="w-5 h-5" />
    Jahrgang bearbeiten
    </button>
    
    <button
    onClick={() => {
      onDelete();
      onClose();
    }}
    disabled={konfiCount > 0}
    className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base font-medium"
    >
    <Trash2 className="w-5 h-5" />
    Jahrgang löschen
    </button>
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

// Admin Action Sheet
const AdminActionSheet = ({ 
  show, 
  onClose, 
  admin, 
  onEdit, 
  onDelete,
  currentUserId
}) => {
  if (!admin) return null;
  
  const isCurrentUser = admin.id === currentUserId;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={admin.display_name}
    >
    <div className="space-y-4">
    {/* Admin Info */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h4 className="font-bold text-lg mb-1">{admin.display_name}</h4>
    <p className="text-sm text-gray-600">@{admin.username}</p>
    <p className="text-xs text-gray-500 mt-2">
    Erstellt: {formatDate(admin.created_at)}
    </p>
    </div>
    
    {/* Warning für aktuellen User */}
    {isCurrentUser && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="text-sm text-yellow-800">
      ⚠️ Das ist Ihr eigener Account. Sie können sich nicht selbst löschen.
      </p>
      </div>
    )}
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onEdit();
      onClose();
    }}
    className="w-full bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Edit className="w-5 h-5" />
    Admin bearbeiten
    </button>
    
    {!isCurrentUser && (
      <button
      onClick={() => {
        onDelete();
        onClose();
      }}
      className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 flex items-center justify-center gap-3 text-base font-medium"
      >
      <Trash2 className="w-5 h-5" />
      Admin löschen
      </button>
    )}
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};
// Request Action Sheet - OHNE AUTO-REFRESH
const RequestActionSheet = ({ 
  show, 
  onClose, 
  request, 
  onApprove, 
  onReject, 
  onEdit, 
  onShowPhoto,
  loading 
}) => {
  if (!request) return null;
  
  const handleClose = () => {
    // KEIN AUTO-REFRESH hier
    onClose();
  };
  
  return (
    <BottomSheet 
    show={show} 
    onClose={handleClose}
    title={request.konfi_name}
    >
    <div className="space-y-4">
    {/* Request Info */}
    <div className="bg-gray-50 p-4 rounded-lg">
    <h4 className="font-bold text-lg mb-1">{request.activity_name}</h4>
    <p className="text-sm text-gray-600 mb-1">{request.activity_points} Punkte</p>
    <p className="text-xs text-gray-500">{formatDate(request.requested_date)}</p>
    {request.comment && (
      <p className="text-sm text-gray-700 italic mt-2 bg-white p-2 rounded">
      "{request.comment}"
      </p>
    )}
    {request.admin_comment && (
      <p className="text-sm text-blue-600 italic mt-2 bg-blue-50 p-2 rounded">
      Admin: {request.admin_comment}
      </p>
    )}
    </div>
    
    {/* Action Buttons */}
    {request.photo_filename && (
      <button 
      onClick={() => {
        onShowPhoto();
        handleClose();
      }}
      className="w-full bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 flex items-center justify-center gap-3 text-base font-medium"
      >
      <Camera className="w-5 h-5" />
      Foto anzeigen
      </button>
    )}
    
    {request.status === 'pending' ? (
      <>
      <button
      onClick={() => {
        onApprove();
        handleClose();
      }}
      disabled={loading}
      className="w-full bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
      >
      <CheckCircle className="w-5 h-5" />
      Genehmigen
      </button>
      <button
      onClick={() => {
        const comment = prompt('Grund für Ablehnung:');
        if (comment) {
          onReject(comment);
          handleClose();
        }
      }}
      disabled={loading}
      className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
      >
      <XCircle className="w-5 h-5" />
      Ablehnen
      </button>
      </>
    ) : (
      <button
      onClick={() => {
        onEdit();
        handleClose();
      }}
      disabled={loading}
      className="w-full bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
      >
      <Edit className="w-5 h-5" />
      Bearbeiten
      </button>
    )}
    
    <button
    onClick={handleClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

// Activity Action Sheet  
const ActivityActionSheet = ({ 
  show, 
  onClose, 
  activity, 
  onEdit, 
  onDelete 
}) => {
  if (!activity) return null;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={activity.name}
    >
    <div className="space-y-4">
    {/* Activity Info */}
    <div className={`p-4 rounded-lg ${
      activity.type === 'gottesdienst' ? 'bg-blue-50' : 'bg-green-50'
    }`}>
    <div className="flex items-center justify-between mb-2">
    <span className={`font-medium ${
      activity.type === 'gottesdienst' ? 'text-blue-800' : 'text-green-800'
    }`}>
    {activity.type === 'gottesdienst' ? '📖 Gottesdienstlich' : '❤️ Gemeindlich'}
    </span>
    <span className={`font-bold ${
      activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
    }`}>
    {activity.points} Punkte
    </span>
    </div>
    {activity.category && (
      <div className="flex flex-wrap gap-1">
      {activity.category.split(',').map((cat, index) => (
        <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
        {cat.trim()}
        </span>
      ))}
      </div>
    )}
    </div>
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onEdit();
      onClose();
    }}
    className={`w-full py-4 rounded-xl text-white flex items-center justify-center gap-3 text-base font-medium ${
      activity.type === 'gottesdienst' 
      ? 'bg-blue-500 hover:bg-blue-600' 
      : 'bg-green-500 hover:bg-green-600'
    }`}
    >
    <Edit className="w-5 h-5" />
    Bearbeiten
    </button>
    
    <button
    onClick={() => {
      onDelete();
      onClose();
    }}
    className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Trash2 className="w-5 h-5" />
    Löschen
    </button>
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

const BadgeEditActionSheet = ({ 
  show, 
  onClose, 
  badge, 
  onEdit, 
  onDelete,
  criteriaTypes
}) => {
  if (!badge) return null;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={`${badge.icon} ${badge.name}`}
    >
    <div className="space-y-4">
    {/* Badge Info Card */}
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
    <div className="flex items-center gap-4 mb-3">
    <div className="text-4xl">{badge.icon}</div>
    <div className="flex-1">
    <h4 className="font-bold text-lg text-gray-800">{badge.name}</h4>
    <p className="text-sm text-gray-600 leading-relaxed">{badge.description}</p>
    </div>
    </div>
    
    <div className="flex items-center justify-between">
    <div className="bg-orange-200 text-orange-800 px-3 py-2 rounded-lg">
    <p className="text-xs font-medium">
    {criteriaTypes[badge.criteria_type]?.label} ≥ {badge.criteria_value}
    </p>
    </div>
    <div className="text-right">
    <p className="text-sm font-bold text-orange-700">
    {badge.earned_count || 0}x vergeben
    </p>
    <div className="flex items-center gap-2 mt-1">
    <div className={`w-3 h-3 rounded-full ${badge.is_active == 1 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
    <span className="text-xs text-gray-600">
    {badge.is_active == 1 ? 'Aktiv' : 'Inaktiv'}
    </span>
    {badge.is_hidden == 1 && (
      <>
      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
      <span className="text-xs text-purple-600">Geheim</span>
      </>
    )}
    </div>
    </div>
    </div>
    </div>
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onEdit();
      onClose();
    }}
    className="w-full bg-orange-500 text-white py-4 rounded-xl hover:bg-orange-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Edit className="w-5 h-5" />
    Badge bearbeiten
    </button>
    
    <button
    onClick={() => {
      onDelete();
      onClose();
    }}
    className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Trash2 className="w-5 h-5" />
    Badge löschen
    </button>
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

// Activity Action Sheet für Konfi-Details
const KonfiActivityActionSheet = ({ 
  show, 
  onClose, 
  activity, 
  onRemove,
  loading,
  konfiName
}) => {
  if (!activity) return null;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={activity.name}
    >
    <div className="space-y-4">
    {/* Activity Info */}
    <div className={`p-4 rounded-lg ${
      activity.type === 'gottesdienst' ? 'bg-blue-50' : 'bg-green-50'
    }`}>
    <h4 className="font-bold text-lg mb-1">{activity.name}</h4>
    <p className="text-sm text-gray-600 mb-2">
    {activity.points} Punkte • {formatDate(activity.date)}
    </p>
    <p className="text-sm text-gray-600">
    Vergeben von: {activity.admin || 'System'}
    </p>
    {activity.category && (
      <div className="flex flex-wrap gap-1 mt-2">
      {activity.category.split(',').map((cat, index) => (
        <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
        {cat.trim()}
        </span>
      ))}
      </div>
    )}
    </div>
    
    {/* Warning */}
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    <p className="text-sm text-red-800">
    ⚠️ Diese Aktivität wird von <strong>{konfiName}</strong> entfernt und die Punkte werden abgezogen.
    </p>
    </div>
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onRemove();
      onClose();
    }}
    disabled={loading}
    className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Trash2 className="w-5 h-5" />
    Aktivität entfernen
    </button>
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

// Bonus Points Action Sheet
const KonfiBonusActionSheet = ({ 
  show, 
  onClose, 
  bonus, 
  onRemove,
  loading,
  konfiName
}) => {
  if (!bonus) return null;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={bonus.description}
    >
    <div className="space-y-4">
    {/* Bonus Info */}
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
    <h4 className="font-bold text-lg mb-1">{bonus.description}</h4>
    <p className="text-sm text-gray-600 mb-2">
    {bonus.points} Punkte • {formatDate(bonus.date)}
    </p>
    <p className="text-sm text-gray-600">
    Vergeben von: {bonus.admin || 'System'}
    </p>
    <div className="mt-2">
    <span className={`text-xs px-2 py-1 rounded-full ${
      bonus.type === 'gottesdienst' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
    }`}>
    {bonus.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}
    </span>
    </div>
    </div>
    
    {/* Warning */}
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    <p className="text-sm text-red-800">
    ⚠️ Diese Zusatzpunkte werden von <strong>{konfiName}</strong> entfernt und die Punkte werden abgezogen.
    </p>
    </div>
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onRemove();
      onClose();
    }}
    disabled={loading}
    className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Trash2 className="w-5 h-5" />
    Zusatzpunkte entfernen
    </button>
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

// Badge Action Sheet Component
const BadgeActionSheet = ({ 
  show, 
  onClose, 
  badge, 
  onEdit, 
  onDelete,
  criteriaTypes
}) => {
  if (!badge) return null;
  
  return (
    <BottomSheet 
    show={show} 
    onClose={onClose}
    title={badge.name}
    >
    <div className="space-y-4">
    {/* Badge Info */}
    <div className="bg-orange-50 p-4 rounded-lg">
    <div className="flex items-center gap-4 mb-3">
    <div className="text-4xl">{badge.icon}</div>
    <div className="flex-1">
    <h4 className="font-bold text-lg">{badge.name}</h4>
    <p className="text-sm text-gray-600">{badge.description}</p>
    </div>
    </div>
    
    <div className="flex items-center justify-between">
    <span className="text-sm text-orange-700 bg-orange-200 px-3 py-1 rounded-full">
    {criteriaTypes[badge.criteria_type]?.label} ≥ {badge.criteria_value}
    </span>
    <span className="text-sm text-gray-600 font-medium">
    {badge.earned_count || 0}x vergeben
    </span>
    </div>
    </div>
    
    {/* Action Buttons */}
    <button
    onClick={() => {
      onEdit();
      onClose();
    }}
    className="w-full bg-orange-500 text-white py-4 rounded-xl hover:bg-orange-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Edit className="w-5 h-5" />
    Badge bearbeiten
    </button>
    
    <button
    onClick={() => {
      onDelete();
      onClose();
    }}
    className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 flex items-center justify-center gap-3 text-base font-medium"
    >
    <Trash2 className="w-5 h-5" />
    Badge löschen
    </button>
    
    <button
    onClick={onClose}
    className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
    >
    Abbrechen
    </button>
    </div>
    </BottomSheet>
  );
};

// Enhanced Ranking Component
const EnhancedRankingDisplay = ({ ranking, isAdmin = false }) => {
  if (isAdmin) {
    return (
      <div className="space-y-3">
        {ranking.map((konfi, index) => {
          const position = index + 1;
          const isTop3 = position <= 3;
          
          return (
            <div 
              key={konfi.id || index} 
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isTop3 
                  ? position === 1 ? 'bg-yellow-50 border-yellow-400 shadow-lg' 
                    : position === 2 ? 'bg-gray-50 border-gray-400 shadow-md'
                    : 'bg-orange-50 border-orange-400 shadow-md'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  position === 1 ? 'bg-yellow-400 text-yellow-900' 
                    : position === 2 ? 'bg-gray-400 text-gray-900'
                    : position === 3 ? 'bg-orange-400 text-orange-900'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : position}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">{konfi.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Gottesdienst: {konfi.gottesdienst || 0}</span>
                    <span>Gemeinde: {konfi.gemeinde || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {konfi.points}
                </div>
                <div className="text-sm text-gray-500">Punkte</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    // Konfi view
    return (
      <div className="text-center space-y-6">
        {/* Main Position Card */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 text-white rounded-2xl p-8 shadow-xl">
          <div className="mb-4">
            <div className="text-6xl font-bold mb-2 text-yellow-300">
              #{ranking.myPosition}
            </div>
            <div className="text-xl font-semibold opacity-90">
              von {ranking.totalKonfis} Konfis
            </div>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-yellow-300 mb-1">
              {ranking.myPoints}
            </div>
            <div className="text-sm opacity-90">Punkte erreicht</div>
          </div>
        </div>

      {/* Top 3 Podium */}
      {ranking.topScores && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h4 className="font-bold text-lg mb-6 text-gray-800">🏆 Top 3 Bestenliste</h4>
        <div className="flex justify-center items-end gap-4">
        {/* 2nd Place */}
        {ranking.topScores[1] && (
          <div className="text-center">
          <div className="bg-gray-200 rounded-lg p-4 mb-2 h-16 flex items-end">
          <div className="w-full text-center">
          <div className="text-2xl mb-1">🥈</div>
          </div>
          </div>
          <div className="font-bold text-lg text-gray-700">{ranking.topScores[1]}</div>
          <div className="text-xs text-gray-500">Punkte</div>
          {ranking.topNames && ranking.topNames[1] && (
            <div className="text-xs text-gray-600 font-mono mt-1">
            {ranking.topNames[1].split(' ').map(n => n[0]).join('')}
            </div>
          )}
          </div>
        )}
        
        {/* 1st Place */}
        {ranking.topScores[0] && (
          <div className="text-center">
          <div className="bg-yellow-200 rounded-lg p-4 mb-2 h-20 flex items-end">
          <div className="w-full text-center">
          <div className="text-3xl mb-1">🥇</div>
          </div>
          </div>
          <div className="font-bold text-xl text-yellow-700">{ranking.topScores[0]}</div>
          <div className="text-xs text-gray-500">Punkte</div>
          {ranking.topNames && ranking.topNames[0] && (
            <div className="text-xs text-gray-600 font-mono mt-1">
            {ranking.topNames[0].split(' ').map(n => n[0]).join('')}
            </div>
          )}
          </div>
        )}
        
        {/* 3rd Place */}
        {ranking.topScores[2] && (
          <div className="text-center">
          <div className="bg-orange-200 rounded-lg p-4 mb-2 h-12 flex items-end">
          <div className="w-full text-center">
          <div className="text-xl mb-1">🥉</div>
          </div>
          </div>
          <div className="font-bold text-lg text-orange-700">{ranking.topScores[2]}</div>
          <div className="text-xs text-gray-500">Punkte</div>
          {ranking.topNames && ranking.topNames[2] && (
            <div className="text-xs text-gray-600 font-mono mt-1">
            {ranking.topNames[2].split(' ').map(n => n[0]).join('')}
            </div>
          )}
          </div>
        )}
        </div>
        </div>
      )}
      </div>
    );
  }
};

// Activity Request Modal
// ActivityRequestForm - Nur das Form, kein Modal
const ActivityRequestForm = ({ 
  activities, 
  onSubmit, 
  loading,
  takePicture
}) => {
  const [formData, setFormData] = useState({
    activity_id: '',
    requested_date: new Date().toISOString().split('T')[0],
    comment: '',
    photo: null
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activity_id || !formData.requested_date) {
      console.error('Bitte Aktivität und Datum auswählen');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('activity_id', formData.activity_id);
    submitData.append('requested_date', formData.requested_date);
    submitData.append('comment', formData.comment);
    if (formData.photo) {
      // Convert data URL to blob for FormData
      if (typeof formData.photo === 'string' && formData.photo.startsWith('data:')) {
        const response = await fetch(formData.photo);
        const blob = await response.blob();
        submitData.append('photo', blob, 'photo.jpg');
      } else {
        submitData.append('photo', formData.photo);
      }
    }
    
    await onSubmit(submitData);
    setFormData({
      activity_id: '',
      requested_date: new Date().toISOString().split('T')[0],
      comment: '',
      photo: null
    });
  };
  
  return (
    <form id="request-form" onSubmit={handleSubmit} className="p-4 space-y-6">
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
    Aktivität *
    </label>
    <div className="relative">
    <select
    value={formData.activity_id}
    onChange={(e) => setFormData({...formData, activity_id: e.target.value})}
    className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
    style={{ 
      WebkitAppearance: 'none',
      MozAppearance: 'textfield',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}
    required
    >
    <option value="">Aktivität wählen...</option>
    
    {/* Gottesdienstliche Aktivitäten */}
    <optgroup label="🙏 Gottesdienstliche Aktivitäten">
    {activities
      .filter(activity => activity.type === 'gottesdienst')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(activity => (
        <option key={activity.id} value={activity.id}>
        {activity.name} ({activity.points} Punkte)
        </option>
      ))
    }
    </optgroup>
    
    {/* Gemeindliche Aktivitäten */}
    <optgroup label="❤️ Gemeindliche Aktivitäten">
    {activities
      .filter(activity => activity.type === 'gemeinde')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(activity => (
        <option key={activity.id} value={activity.id}>
        {activity.name} ({activity.points} Punkte)
        </option>
      ))
    }
    </optgroup>
    </select>
    
    {/* iOS-Style dropdown icon */}
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
    <ChevronDown className="w-5 h-5 text-gray-400" />
    </div>
    </div>
    </div>
    
    {/* FIXED: Better styled date input */}
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
    Datum *
    </label>
    <div className="relative">
    <input
    type="date"
    value={formData.requested_date}
    onChange={(e) => setFormData({...formData, requested_date: e.target.value})}
    className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
    style={{ 
      WebkitAppearance: 'none',
      MozAppearance: 'textfield',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}
    required
    />
    {/* iOS-Style calendar icon */}
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
    <Calendar className="w-5 h-5 text-gray-400" />
    </div>
    </div>
    </div>
    
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
    Foto (optional)
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
    {formData.photo ? (
      <div className="space-y-3">
      <img 
      src={typeof formData.photo === 'string' ? formData.photo : URL.createObjectURL(formData.photo)} 
      alt="Aktivitätsfoto" 
      className="w-full max-w-xs h-auto mx-auto rounded-lg"
      style={{ maxHeight: '300px', objectFit: 'contain' }}
      />
      <button
      type="button"
      onClick={() => setFormData({...formData, photo: null})}
      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
      >
      Foto entfernen
      </button>
      </div>
    ) : (
      <div className="space-y-4">
      <Camera className="w-12 h-12 text-gray-400 mx-auto" />
      <button
      type="button"
      onClick={async () => {
        try {
          const photoData = await takePicture();
          if (photoData) {
            setFormData({...formData, photo: photoData});
            console.log('Foto aufgenommen!');
          }
        } catch (error) {
          console.error('Fehler beim Foto aufnehmen');
        }
      }}
      className="bg-blue-500 text-white px-6 py-4 rounded-lg font-medium w-full flex items-center justify-center gap-2 text-base"
      >
      <Camera className="w-5 h-5" />
      📱 Foto aufnehmen
      </button>
      
      <div className="text-sm text-gray-500">oder</div>
      
      <input
      type="file"
      accept="image/jpeg,image/jpg,image/png"
      onChange={(e) => {
        if (e.target.files[0]) {
          const file = e.target.files[0];
          
          // Check file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            console.error('Foto zu groß (max. 5MB). Bitte wählen Sie ein kleineres Foto.');
            e.target.value = '';
            return;
          }
          
          setFormData({...formData, photo: file});
          console.log('Foto ausgewählt!');
        }
      }}
      className="hidden"
      id="photo-input"
      />
      <label htmlFor="photo-input" className="cursor-pointer block">
      <div className="border border-gray-300 text-gray-600 px-6 py-4 rounded-lg font-medium w-full text-center text-base hover:bg-gray-100">
      📁 Aus Galerie wählen
      </div>
      </label>
      
      <div className="text-xs text-gray-500 mt-2">
      JPG/PNG Format, max. 5MB
      </div>
      </div>
    )}
    </div>
    </div>
    
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
    Kommentar (optional)
    </label>
    <textarea
    value={formData.comment}
    onChange={(e) => setFormData({...formData, comment: e.target.value})}
    className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    rows="4"
    placeholder="Zusätzliche Informationen zu der Aktivität..."
    />
    </div>
    
    {/* Bottom spacing for better UX */}
    <div className="h-8"></div>
    </form>
  );
};

// KORRIGIERTES UniversalModal mit verbessertem Touch-Handling
const UniversalModal = ({ 
  show, 
  onClose, 
  title, 
  children, 
  footer,
  size = "default",
  preventBodyScroll = true
}) => {
  // Body-Scroll verhindern
  useEffect(() => {
    if (show && preventBodyScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [show, preventBodyScroll]);
  
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const headerRef = useRef(null);
  
  const handleTouchStart = (e) => {
    // NUR reagieren wenn Touch im Header-Bereich startet
    if (headerRef.current && headerRef.current.contains(e.target)) {
      setStartY(e.touches[0].clientY);
      setIsDragging(true);
    }
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    if (deltaY > 0) { // Nur nach unten
      setCurrentY(deltaY);
      e.preventDefault(); // Verhindere Body-Scroll
      e.stopPropagation();
    }
  };
  
  const handleTouchEnd = () => {
    if (currentY > 100) { // 100px threshold
      onClose();
    }
    setCurrentY(0);
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (!show) {
      setCurrentY(0);
      setIsDragging(false);
    }
  }, [show]);
  
  if (!show) return null;
  
  const sizeClasses = {
    small: "max-h-[60vh]",
    default: "max-h-[75vh]", 
      large: "max-h-[85vh]",
      full: "h-full max-h-screen"
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
    <div 
    className={`w-full bg-white rounded-t-2xl shadow-xl overflow-hidden transition-transform duration-300 flex flex-col ${
      isDragging ? 'transition-none' : ''
      } ${sizeClasses[size]}`}
    style={{ 
      transform: `translateY(${currentY}px)` 
    }}
    >
    {/* Header mit Drag-Handle - NUR HIER Touch-Events */}
    <div 
    ref={headerRef}
    className="flex-shrink-0 p-6 border-b border-gray-100 cursor-grab active:cursor-grabbing"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full"></div>
    <div className="flex items-center justify-between mt-4">
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <button
    onClick={onClose}
    className="text-gray-500 hover:text-gray-700 p-2"
    >
    <X className="w-6 h-6" />
    </button>
    </div>
    </div>
    
    {/* Content - SCROLLABLE, KEIN Touch-Handler */}
    <div className="flex-1 overflow-y-auto min-h-0">
    {children}
    </div>
    
    {/* Footer - FIXED AT BOTTOM */}
    {footer && (
      <div className="flex-shrink-0 border-t border-gray-100 px-6 pt-6 pb-10 bg-white">
      {footer}
      </div>
    )}
    </div>
    </div>
  );
};

// Statistics Dashboard - MOBILE OPTIMIERT
const StatisticsDashboard = ({ konfiData, allStats, badges, settings }) => {
  const countdown = getConfirmationCountdown(konfiData.confirmation_date);
  const earnedBadges = badges.earned || [];
  const availableBadges = badges.available || [];
  
  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;
  
  return (
    <div className="space-y-4">
    {/* Countdown */}
    {countdown && countdown.isUpcoming && (
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 text-center shadow-sm">
      <h2 className="text-xl font-bold mb-2">🎯 MEIN KONFI-JAHR</h2>
      <div className="text-lg">
      Noch <span className="font-bold text-2xl">{countdown.totalDays}</span> Tage 
      bis zur Konfirmation
      <div className="text-sm opacity-90 mt-1">
      ({countdown.weeks} Wochen, {countdown.remainingDays} Tage)
      </div>
      </div>
      </div>
    )}
    
    {/* Ranking */}
    {allStats.myPosition && (
      <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <Trophy className="w-5 h-5 text-yellow-500" />
      MEINE POSITION
      </h3>
      <EnhancedRankingDisplay ranking={allStats} isAdmin={false} />
      </div>
    )}
    
    {/* Badges */}
    <div className="bg-white rounded-xl shadow-sm p-4">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
    <Award className="w-5 h-5 text-yellow-500" />
    MEINE BADGES
    </h3>
    <BadgeDisplay 
    badges={badges.available || []} 
    earnedBadges={badges.earned || []} 
    konfiData={konfiData}
    isAdmin={false}
    showProgress={true}
    />
    </div>
    
    {/* Overall Statistics */}
    {allStats.totalPoints && (
      <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <BarChart3 className="w-5 h-5 text-green-500" />
      GEMEINDE-STATISTIKEN
      </h3>
      <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-50 p-3 rounded-lg text-center">
      <div className="text-xl font-bold text-blue-600">{allStats.totalPoints.total || 0}</div>
      <div className="text-xs text-gray-600">Punkte gesamt</div>
      </div>
      <div className="bg-purple-50 p-3 rounded-lg text-center">
      <div className="text-xl font-bold text-purple-600">{allStats.totalActivities?.count || 0}</div>
      <div className="text-xs text-gray-600">Aktivitäten</div>
      </div>
      <div className="bg-green-50 p-3 rounded-lg text-center col-span-2">
      <div className="text-lg font-bold text-green-600 truncate">
      {allStats.mostPopularActivity?.name || 'Noch keine Daten'}
      </div>
      <div className="text-xs text-gray-600">Beliebteste Aktivität</div>
      </div>
      </div>
      </div>
    )}
    </div>
  );
};

// Main App Component
const KonfiPointsSystem = () => {
  // ALLE STATE-DEFINITIONEN ZUERST - VOR DEN MODAL-KOMPONENTEN
  const [konfis, setKonfis] = useState([]);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [jahrgaenge, setJahrgaenge] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [badges, setBadges] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [activitySort, setActivitySort] = useState('type');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [badgeSort, setBadgeSort] = useState('name');
  const [criteriaTypes, setCriteriaTypes] = useState({});
  const [activityRequests, setActivityRequests] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [ranking, setRanking] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [expandedRequests, setExpandedRequests] = useState({});
  const [expandedActivities, setExpandedActivities] = useState({});
  const [showRequestActionSheet, setShowRequestActionSheet] = useState(false);
  const [showActivityActionSheet, setShowActivityActionSheet] = useState(false);
  const [selectedActionRequest, setSelectedActionRequest] = useState(null);
  const [selectedActionActivity, setSelectedActionActivity] = useState(null);
  const [showBadgeActionSheet, setShowBadgeActionSheet] = useState(false);
  const [selectedActionBadge, setSelectedActionBadge] = useState(null);
  const [selectedActionBonus, setSelectedActionBonus] = useState(null);
  const [showBonusActionSheet, setShowBonusActionSheet] = useState(false);
  const [showJahrgangModal, setShowJahrgangModal] = useState(false);
  const [jahrgangForm, setJahrgangForm] = useState({ name: '', confirmation_date: '' });
  const [showJahrgangActionSheet, setShowJahrgangActionSheet] = useState(false);
  const [selectedActionJahrgang, setSelectedActionJahrgang] = useState(null);
  const [showAdminActionSheet, setShowAdminActionSheet] = useState(false);
  const [selectedActionAdmin, setSelectedActionAdmin] = useState(null);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [bonusDate, setBonusDate] = useState(new Date().toISOString().split('T')[0]);
  const [settings, setSettings] = useState({ target_gottesdienst: '10', target_gemeinde: '10' });
  const [currentView, setCurrentView] = useState('overview');
  const [selectedKonfi, setSelectedKonfi] = useState(null);
  const [selectedJahrgang, setSelectedJahrgang] = useState('alle');
  const [loading, setLoading] = useState(false);
  const [showRequestManagementModal, setShowRequestManagementModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [copiedPassword, setCopiedPassword] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  
  // Form states
  const [newKonfiName, setNewKonfiName] = useState('');
  const [newKonfiJahrgang, setNewKonfiJahrgang] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityPoints, setNewActivityPoints] = useState(1);
  const [newActivityType, setNewActivityType] = useState('gottesdienst');
  const [newActivityCategory, setNewActivityCategory] = useState('');
  const [newJahrgangName, setNewJahrgangName] = useState('');
  const [newJahrgangDate, setNewJahrgangDate] = useState(() => {
    const today = new Date();
    const nextYear = today.getFullYear() + 1;
    // Standard: 1. Mai des nächsten Jahres
    return `${nextYear}-05-01`;
  });
  
  // Modal states
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusKonfiId, setBonusKonfiId] = useState(null);
  const [bonusPoints, setBonusPoints] = useState(1);
  const [bonusType, setBonusType] = useState('gottesdienst');
  const [bonusDescription, setBonusDescription] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState('');
  const [editItem, setEditItem] = useState(null);
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', display_name: '', password: '' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  
  // Badge and Request modals
  const [showMobileBadgeModal, setShowMobileBadgeModal] = useState(false);
  const [editBadge, setEditBadge] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // DIESE BEIDEN STATES WAREN DAS PROBLEM - JETZT FRÜH DEFINIERT
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageData, setCurrentImageData] = useState(null);
  
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent double refresh
    
    setIsRefreshing(true);
    try {
      if (user.type === 'admin') {
        await loadData();
      } else {
        await loadKonfiData(user.id);
      }
      console.log('Daten aktualisiert!');
    } catch (err) {
      console.error('Fehler beim Aktualisieren');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useBadgeManager(user, activityRequests);
  
  // Touch handling for pull-to-refresh
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    const handleTouchStart = (e) => {
      if (window.pageYOffset === 0) { // Only at top of page
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };
    
    const handleTouchMove = (e) => {
      if (!pulling) return;
      currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 100 && !isRefreshing) { // 100px threshold
        handleRefresh();
        pulling = false;
      }
    };
    
    const handleTouchEnd = () => {
      pulling = false;
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [user, isRefreshing]);
    
  // Manual Refresh Button
  const RefreshButton = () => (
    <button
    onClick={handleRefresh}
    disabled={isRefreshing}
    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
    >
    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    {isRefreshing ? 'Lädt...' : 'Aktualisieren'}
    </button>
  );
  
  const takePicture = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 70,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1280,
        correctOrientation: true,
        // Force JPEG format to avoid HEIC issues
        format: 'jpeg'
      });
      
      // Convert to blob and check size
      const dataUrlToBlob = (dataUrl) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
      };
      
      // Additional compression if needed
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate new size (max 1600px on longest side, maintain aspect ratio)
          const maxSize = 1600;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with 80% quality and reduce if needed
          let quality = 0.8;
          let compressedDataUrl;
          let blob;
          
          do {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            blob = dataUrlToBlob(compressedDataUrl);
            
            // If still too large (5MB = 5 * 1024 * 1024 bytes), reduce quality
            if (blob.size > 5 * 1024 * 1024) {
              quality -= 0.1;
            }
          } while (blob.size > 5 * 1024 * 1024 && quality > 0.1);
          
          if (blob.size > 5 * 1024 * 1024) {
            console.error('Foto zu groß. Bitte versuchen Sie es mit einem anderen Foto.');
            resolve(null);
            return;
          }
          
          console.log(`Komprimiertes Foto: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(compressedDataUrl);
        };
        
        img.src = image.dataUrl;
      });
      
    } catch (error) {
      console.error('Camera error:', error);
      console.error('Kamera-Fehler');
      return null;
    }
  };
  
  // Native iOS Image Viewer
  const IOSImageViewer = ({ show, onClose, imageUrl, title }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-black px-4 py-4 flex items-center justify-between">
      <button
      onClick={onClose}
      className="text-white font-medium text-base"
      >
      Zurück
      </button>
      <h1 className="text-white text-lg font-medium text-center flex-1 px-4">{title}</h1>
      <div className="w-16"></div>
      </div>
      
      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black">
      <img 
      src={imageUrl} 
      alt={title}
      className="max-w-full max-h-full object-contain rounded"
      style={{ 
        maxWidth: '100%', 
        maxHeight: '100%',
        width: 'auto',
        height: 'auto'
      }}
      onError={(e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CaWxkIG5pY2h0IGdlZnVuZGVuPC90ZXh0Pjwvc3ZnPg==';
      }}
      />
      </div>
      </div>
    );
  };
  
  // Function to show image
  const showImage = (requestId, title) => {
    setCurrentImage({ url: `${API_BASE_URL}/activity-requests/${requestId}/photo`, title });
    setShowImageModal(true);
  };
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    try {
      setIsInitializing(true);
      
      // Gespeicherten Token laden
      const { value: savedToken } = await Preferences.get({ key: 'konfi_token' });
      const { value: savedUser } = await Preferences.get({ key: 'konfi_user' });
      
      if (savedToken && savedUser) {
        // Token in axios setzen
        api.defaults.headers.Authorization = `Bearer ${savedToken}`;
        
        // User-State wiederherstellen
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Push-Notifications setup
        await setupPushNotifications();
        
        // Daten laden basierend auf User-Typ
        if (userData.type === 'admin') {
          await loadData();
          setCurrentView('konfis');
        } else {
          setCurrentView('konfi-dashboard');
          await loadKonfiData(userData.id);
        }
        
        console.log(`Willkommen zurück, ${userData.display_name || userData.name}!`);
      }
    } catch (err) {
      console.error('Auto-login failed:', err);
      // Bei Fehler User ausloggen
      await handleLogout();
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Push-Notifications Setup-Funktion
  const setupPushNotifications = async () => {
    try {
      // Permission anfragen
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Registrierung
        await PushNotifications.register();
        
        // Listener für Token
        PushNotifications.addListener('registration', (token) => {
          console.log('Push token:', token.value);
          // Token an Backend senden
          sendPushTokenToBackend(token.value);
        });
        
        // Listener für empfangene Notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification);
          
          // Badge-Animation zeigen
          if (notification.data?.type === 'badge') {
            console.log(`🏆 Neues Badge erhalten: ${notification.data.badgeName}!`);
            // Badge-Daten neu laden
            if (user.type === 'konfi') {
              loadKonfiData(user.id);
            }
          } else if (notification.data?.type === 'activity') {
            console.log(`✅ Neue Aktivität bestätigt: +${notification.data.points} Punkte!`);
            if (user.type === 'konfi') {
              loadKonfiData(user.id);
            }
          } else if (notification.data?.type === 'request') {
            console.log(`📋 Antrag ${notification.data.status}: ${notification.data.activityName}`);
            if (user.type === 'konfi') {
              loadKonfiData(user.id);
            } else {
              loadData(); // Admin
            }
          }
        });
        
        // Listener für Tap auf Notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification);
          
          // Navigation basierend auf Notification-Typ
          if (notification.notification.data?.type === 'badge') {
            setCurrentView('konfi-badges');
          } else if (notification.notification.data?.type === 'request') {
            setCurrentView(user.type === 'admin' ? 'requests' : 'konfi-requests');
          }
        });
        
      } else {
        console.log('Push notification permission denied');
      }
    } catch (err) {
      console.error('Push notification setup failed:', err);
    }
  };
  
  // Token an Backend senden
  const sendPushTokenToBackend = async (token) => {
    try {
      await api.post('/push-token', { 
        token, 
        platform: 'ios', // oder 'android'
        userId: user.id,
        userType: user.type
      });
    } catch (err) {
      console.error('Failed to send push token:', err);
    }
  };
  
  const loadSettings = async () => {
    try {
      const settingsRes = await api.get('/settings');
      setSettings(settingsRes.data);
    } catch (err) {
      console.error('Fehler beim Laden der Settings:', err);
      setSettings({ target_gottesdienst: '10', target_gemeinde: '10' });
    }
  };
  
  // KORRIGIERTE VERSION - App.js Zeilen um 1850-1950
  
  // Separate loadKonfiData Funktion definieren
  const loadKonfiData = async (konfiId) => {
    setLoading(true);
    try {
      const [konfiRes, requestsRes, badgesRes, statsRes, rankingRes, settingsRes, activitiesRes] = await Promise.all([
        api.get(`/konfis/${konfiId}`),
        api.get('/activity-requests'),
        api.get(`/konfis/${konfiId}/badges`),
        api.get('/statistics'),
        api.get('/ranking'),
        api.get('/settings'),
        api.get('/activities')
      ]);
      
      setSelectedKonfi(konfiRes.data);
      setActivityRequests(requestsRes.data);
      setStatistics(statsRes.data);
      setRanking(rankingRes.data);
      setSettings(settingsRes.data);
      setActivities(activitiesRes.data);
      
      // Set badges for display
      setBadges({
        earned: badgesRes.data.earned || [],
        available: badgesRes.data.available || []
      });
      
      // Ensure view stays on dashboard unless explicitly changed
      if (currentView !== 'konfi-requests' && currentView !== 'konfi-badges') {
        setCurrentView('konfi-dashboard');
      }
      
    } catch (err) {
      console.error('Error loading konfi data:', err);
      console.error('Fehler beim Laden der Konfi-Daten: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [konfisRes, activitiesRes, settingsRes, jahrgaengeRes, adminsRes, badgesRes, criteriaRes, requestsRes, statsRes, rankingRes] = await Promise.all([
        api.get('/konfis'),
        api.get('/activities'),
        api.get('/settings'),
        api.get('/jahrgaenge'),
        api.get('/admins'),
        api.get('/badges'),
        api.get('/badge-criteria-types'),
        api.get('/activity-requests'),
        api.get('/statistics'),
        api.get('/ranking')
      ]);
      
      setKonfis(konfisRes.data);
      setActivities(activitiesRes.data);
      setSettings(settingsRes.data);
      setJahrgaenge(jahrgaengeRes.data);
      setAdmins(adminsRes.data);
      setCriteriaTypes(criteriaRes.data);
      setActivityRequests(requestsRes.data);
      setStatistics(statsRes.data);
      setRanking(rankingRes.data);
      
      // KORRIGIERT: Verwende die Server-Daten direkt ohne Neuberechnung
      setBadges(badgesRes.data); // ✅ Server hat bereits earned_count korrekt berechnet
      
      if (!selectedJahrgang || selectedJahrgang === 'alle') {
        setNewKonfiJahrgang(jahrgaengeRes.data[0]?.id || '');
      }
    } catch (err) {
      console.error('Fehler beim Laden der Daten: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    // Badge löschen
    try {
      if (Capacitor.isNativePlatform()) {
        const { Badge } = await import('@capawesome/capacitor-badge');
        await Badge.clear();
      }
      document.title = 'Konfi-Punkte-System';
    } catch (error) {
      console.log('Badge clear failed:', error);
    }
    
    // Gespeicherte Daten löschen
    await Preferences.remove({ key: 'konfi_token' });
    await Preferences.remove({ key: 'konfi_user' });
    
    // Push-Notifications deaktivieren
    try {
      await PushNotifications.removeAllListeners();
    } catch (err) {
      console.error('Error removing push listeners:', err);
    }
    
    // Token aus axios entfernen
    delete api.defaults.headers.Authorization;
    setUser(null);
    setKonfis([]);
    setActivities([]);
    setJahrgaenge([]);
    setCurrentView('overview');
    setSelectedKonfi(null);
    console.log('Erfolgreich abgemeldet');
  };
  
  const togglePasswordVisibility = (id) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Activity Request functions
  const handleCreateActivityRequest = async (formData) => {
    setLoading(true);
    try {
      await api.post('/activity-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Antrag erfolgreich gestellt!');
      setShowRequestModal(false);
      
      // Reload requests immediately
      if (user.type === 'konfi') {
        await loadKonfiData(user.id);
      } else {
        const requestsRes = await api.get('/activity-requests');
        setActivityRequests(requestsRes.data);
      }
      
      // Switch back to requests view to see the new request
      setCurrentView('konfi-requests');
    } catch (err) {
      console.error('Fehler beim Stellen des Antrags: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Verbesserte Badge Notification - im handleUpdateRequestStatus
  const handleUpdateRequestStatus = async (requestId, status, adminComment = '') => {
    setLoading(true);
    try {
      const response = await api.put(`/activity-requests/${requestId}`, { 
        status, 
        admin_comment: adminComment 
      });
      
      console.log(`Antrag ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}!`);
      
      // VERBESSERTE BADGE NOTIFICATION
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        response.data.newBadges.forEach(badge => {
          console.log(`🏆 Neues Badge erhalten: "${badge.name}" - ${badge.description}!`);
        });
      }
      
      // Reload data
      await loadData();
    } catch (err) {
      console.error('Fehler beim Aktualisieren: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Badge management functions
  const handleCreateBadge = async (badgeData) => {
    setLoading(true);
    try {
      await api.post('/badges', badgeData);
      console.log('Badge erfolgreich erstellt!');
      setShowMobileBadgeModal(false);
      setEditBadge(null);
      
      const badgesRes = await api.get('/badges');
      setBadges(badgesRes.data);
    } catch (err) {
      console.error('Fehler beim Erstellen des Badges: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateBadge = async (badgeData) => {
    setLoading(true);
    try {
      await api.put(`/badges/${editBadge.id}`, badgeData);
      console.log('Badge erfolgreich aktualisiert!');
      setShowMobileBadgeModal(false);
      setEditBadge(null);
      
      const badgesRes = await api.get('/badges');
      setBadges(badgesRes.data);
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Badges: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteBadge = async (badgeId) => {
    setLoading(true);
    try {
      await api.delete(`/badges/${badgeId}`);
      console.log('Badge erfolgreich gelöscht!');
      
      const badgesRes = await api.get('/badges');
      setBadges(badgesRes.data);
    } catch (err) {
      console.error('Fehler beim Löschen des Badges: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Generic CRUD functions
  const handleCreate = async (type, data) => {
    setLoading(true);
    try {
      const response = await api.post(`/${type}`, data);
      if (type === 'konfis') setKonfis([...konfis, response.data]);
      else if (type === 'activities') setActivities([...activities, response.data]);
      else if (type === 'jahrgaenge') setJahrgaenge([response.data, ...jahrgaenge]);
      else if (type === 'admins') setAdmins([...admins, response.data]);
      
      console.log(`${type.slice(0, -1)} erfolgreich hinzugefügt`);
      resetForms();
    } catch (err) {
      console.error('Fehler beim Hinzufügen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async (type, id, data) => {
    setLoading(true);
    try {
      await api.put(`/${type}/${id}`, data);
      await loadData();
      console.log(`${type.slice(0, -1)} erfolgreich aktualisiert`);
      setShowEditModal(false);
      setEditItem(null);
    } catch (err) {
      console.error('Fehler beim Aktualisieren: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (type, id) => {
    setLoading(true);
    try {
      const apiRoute = type === 'activity' ? 'activities' : 
        type === 'konfi' ? 'konfis' :
        type === 'jahrgang' ? 'jahrgaenge' :
        type === 'admin' ? 'admins' : type + 's';
      
      await api.delete(`/${apiRoute}/${id}`);
      await loadData();
      console.log(`${type.slice(0, -1)} erfolgreich gelöscht`);
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (err) {
      console.error('Fehler beim Löschen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const resetForms = () => {
    setNewKonfiName('');
    setNewActivityName('');
    setNewActivityPoints(1);
    setNewActivityCategory('');
    setNewJahrgangName('');
    setNewJahrgangDate('');
    setAdminForm({ username: '', display_name: '', password: '' });
    setShowAdminModal(false);
  };
  
  const assignActivityToKonfi = async (konfiId, activityId) => {
    if (!activityDate) {
      console.error('Bitte wählen Sie ein Datum aus');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfiId}/activities`, { 
        activityId,
        completed_date: activityDate
      });
      
      await loadData();
      if (selectedKonfi && selectedKonfi.id === parseInt(konfiId)) {
        await loadKonfiDetails(konfiId);
      }
      
      let successMsg = 'Aktivität erfolgreich zugeordnet';
      if (response.data.newBadges > 0) {
        successMsg += ` + ${response.data.newBadges} neue Badge(s)!`;
      }
      console.log(successMsg);
    } catch (err) {
      console.error('Fehler beim Zuordnen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const removeActivityFromKonfi = async (konfiId, recordId) => {
    setLoading(true);
    try {
      await api.delete(`/konfis/${konfiId}/activities/${recordId}`);
      await loadData();
      if (selectedKonfi && selectedKonfi.id === parseInt(konfiId)) {
        await loadKonfiDetails(konfiId);
      }
      console.log('Aktivität erfolgreich entfernt');
    } catch (err) {
      console.error('Fehler beim Entfernen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const addBonusPoints = async () => {
    if (!bonusDescription.trim() || !bonusPoints || !bonusKonfiId) {
      console.error('Alle Felder sind erforderlich');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${bonusKonfiId}/bonus-points`, {
        points: bonusPoints,
        type: bonusType,
        description: bonusDescription.trim(),
        completed_date: bonusDate
      });
      
      await loadData();
      if (selectedKonfi && selectedKonfi.id === bonusKonfiId) {
        await loadKonfiDetails(bonusKonfiId);
      }
      setShowBonusModal(false);
      setBonusDescription('');
      setBonusPoints(1);
      setBonusDate(new Date().toISOString().split('T')[0]);
      setBonusKonfiId(null);
      
      let successMsg = 'Zusatzpunkte erfolgreich vergeben!';
      if (response.data.newBadges > 0) {
        successMsg += ` + ${response.data.newBadges} neue Badge(s)!`;
      }
      console.log(successMsg);
    } catch (err) {
      console.error('Fehler beim Vergeben: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const removeBonusPointsFromKonfi = async (konfiId, bonusId) => {
    setLoading(true);
    try {
      await api.delete(`/konfis/${konfiId}/bonus-points/${bonusId}`);
      await loadData();
      if (selectedKonfi && selectedKonfi.id === parseInt(konfiId)) {
        await loadKonfiDetails(konfiId);
      }
      console.log('Zusatzpunkte erfolgreich entfernt');
    } catch (err) {
      console.error('Fehler beim Entfernen: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const regeneratePassword = async (konfiId) => {
    setLoading(true);
    try {
      const response = await api.post(`/konfis/${konfiId}/regenerate-password`);
      await loadData();
      console.log(`Neues Passwort generiert: ${response.data.password}`);
    } catch (err) {
      console.error('Fehler beim Generieren: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const updateSettings = async () => {
    setLoading(true);
    try {
      await api.put('/settings', settings);
      console.log('Einstellungen erfolgreich gespeichert');
    } catch (err) {
      console.error('Fehler beim Speichern: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const loadKonfiDetails = async (konfiId) => {
    setLoading(true);
    try {
      const validId = parseInt(konfiId, 10);
      if (isNaN(validId)) {
        throw new Error('Invalid konfi ID: ' + konfiId);
      }
      
      const response = await api.get(`/konfis/${validId}`);
      
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response data');
      }
      
      setSelectedKonfi(response.data);
      setCurrentView('konfi-detail');
      console.error('');
    } catch (err) {
      console.error('Frontend: Error loading konfi details:', err);
      console.error('Fehler beim Laden der Konfi-Details: ' + (err.response?.data?.error || err.message));
      setSelectedKonfi(null);
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPassword(id);
      setTimeout(() => setCopiedPassword(null), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren');
    }
  };
  
  // Filter functions
  const filteredKonfis = konfis.filter(konfi => {
    const matchesJahrgang = selectedJahrgang === 'alle' || konfi.jahrgang === selectedJahrgang;
    const matchesSearch = searchTerm === '' || 
      konfi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      konfi.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJahrgang && matchesSearch;
  });
  
  const filteredAssignKonfis = konfis.filter(konfi => {
    const matchesJahrgang = selectedJahrgang === 'alle' || konfi.jahrgang === selectedJahrgang;
    const matchesSearch = assignSearchTerm === '' || 
      konfi.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) ||
      konfi.username.toLowerCase().includes(assignSearchTerm.toLowerCase());
    return matchesJahrgang && matchesSearch;
  });
  
  const filteredActivities = activities.filter(activity => 
    activitySearchTerm === '' || 
    activity.name.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );
  
  const getProgressColor = (current, target) => {
    const percentage = (current / parseInt(target)) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  
  const navigationItems = user?.type === 'admin' ? [
    { id: 'chat', label: 'Chat', icon: MessageSquare, notification: 0 },
    { 
      id: 'requests', 
      label: 'Anträge', 
      icon: Clock,
      notification: activityRequests.filter(r => r.status === 'pending').length
    },
    { id: 'konfis', label: 'Konfis', icon: UserPlus },
    { id: 'manage-activities', label: 'Aktionen', icon: Calendar },
    { id: 'manage-badges', label: 'Badges', icon: Award },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ] : [
    // Für Konfi:
    { id: 'konfi-dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'konfi-requests', label: 'Anträge', icon: Upload },
    // DIESE ZEILE HINZUFÜGEN:
    { 
      id: 'konfi-chat', 
      label: 'Chat', 
      icon: MessageSquare,
      notification: 0 // TODO: Später echte Unread-Counts
    },
    { id: 'konfi-badges', label: 'Badges', icon: Award }
  ];
  
  // Check if targets should be shown (not 0)
  const showGottesdienstTarget = parseInt(settings.target_gottesdienst || 10) > 0;
  const showGemeindeTarget = parseInt(settings.target_gemeinde || 10) > 0;

  // ADMIN Modal
  // NEUES AdminModal mit UniversalModal
  const AdminModal = ({ 
    show, 
    onClose, 
    adminForm, 
    setAdminForm, 
    onSubmit, 
    loading 
  }) => {
    if (!show) return null;
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit();
    };
    
    return (
      <UniversalModal
      show={show}
      onClose={onClose}
      title="Neuen Admin hinzufügen"
      size="default"
      preventBodyScroll={true}
      footer={
        <div className="space-y-3">
        <button
        onClick={handleSubmit}
        disabled={loading || !adminForm.username.trim() || !adminForm.display_name.trim() || !adminForm.password.trim()}
        className="w-full bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
        >
        {loading && <Loader className="w-5 h-5 animate-spin" />}
        <Plus className="w-5 h-5" />
        Hinzufügen
        </button>
        <button
        onClick={onClose}
        className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
        >
        Abbrechen
        </button>
        </div>
      }
      >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Benutzername *</label>
      <input
      type="text"
      value={adminForm.username}
      onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
      className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="z.B. pastor"
      autoFocus
      required
      />
      </div>
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Anzeigename *</label>
      <input
      type="text"
      value={adminForm.display_name}
      onChange={(e) => setAdminForm({...adminForm, display_name: e.target.value})}
      className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="z.B. Pastor Schmidt"
      required
      />
      </div>
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Passwort *</label>
      <input
      type="password"
      value={adminForm.password}
      onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
      className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Sicheres Passwort"
      required
      />
      </div>
      </form>
      </UniversalModal>
    );
  };
  
  // NEUES JahrgangModal mit UniversalModal
  const JahrgangModal = ({ 
    show, 
    onClose, 
    jahrgangForm, 
    setJahrgangForm, 
    onSubmit, 
    loading 
  }) => {
    if (!show) return null;
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit();
    };
    
    return (
      <UniversalModal
      show={show}
      onClose={onClose}
      title="Neuen Jahrgang hinzufügen"
      size="default"
      preventBodyScroll={true}
      footer={
        <div className="space-y-3">
        <button
        onClick={handleSubmit}
        disabled={loading || !jahrgangForm.name.trim()}
        className="w-full bg-purple-500 text-white py-4 rounded-xl hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-3 text-base font-medium"
        >
        {loading && <Loader className="w-5 h-5 animate-spin" />}
        <Plus className="w-5 h-5" />
        Hinzufügen
        </button>
        <button
        onClick={onClose}
        className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 flex items-center justify-center gap-3 text-base font-medium"
        >
        Abbrechen
        </button>
        </div>
      }
      >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Jahrgang Name *</label>
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
      <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmationsdatum</label>
      <div className="relative">
      <input
      type="date"
      value={jahrgangForm.confirmation_date}
      onChange={(e) => setJahrgangForm({...jahrgangForm, confirmation_date: e.target.value})}
      className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white appearance-none"
      style={{ 
        WebkitAppearance: 'none',
        MozAppearance: 'textfield',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
      />
      <Calendar className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      </div>
      </form>
      </UniversalModal>
    );
  };
    
  
  const LoginView = () => {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    
    const handleLoginSubmit = async (e) => {
      e.preventDefault();
      if (!loginData.username || !loginData.password) {
        console.error('Bitte alle Felder ausfüllen');
        return;
      }
      
      setLoginLoading(true);
      
      try {
        // Versuche erst Admin-Login
        let response;
        let userType;
        
        try {
          response = await api.post('/admin/login', loginData);
          userType = 'admin';
        } catch (adminError) {
          // Falls Admin fehlschlägt, versuche Konfi-Login
          try {
            response = await api.post('/konfi/login', loginData);
            userType = 'konfi';
          } catch (konfiError) {
            throw new Error('Ungültige Anmeldedaten');
          }
        }
        
        const { token, user: userData } = response.data;
        
        // Token und User sicher speichern
        await Preferences.set({ key: 'konfi_token', value: token });
        await Preferences.set({ key: 'konfi_user', value: JSON.stringify(userData) });
        
        // Token in axios setzen
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
        
        // Push-Notifications setup
        await setupPushNotifications();
        
        if (userData.type === 'admin') {
          await loadData();
          setCurrentView('overview');
        } else {
          setCurrentView('konfi-dashboard');
          await loadKonfiData(userData.id);
        }
        
        console.log(`Willkommen, ${userData.display_name || userData.name || userData.username}!`);
      } catch (err) {
        console.error(err.message || 'Anmeldung fehlgeschlagen');
      } finally {
        setLoginLoading(false);
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
      <Award className="w-16 h-16 text-blue-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Konfi-Punkte-System</h1>
      <p className="text-gray-600">Gemeinde Büsum, Neuenkirchen & Wesselburen</p>
      </div>
      
      <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
      Benutzername
      </label>
      <input
      type="text"
      value={loginData.username}
      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      placeholder="z.B. admin oder anna.mueller"
      autoFocus
      autoCapitalize="none"
      autoCorrect="off"
      />
      </div>
      
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
      Passwort
      </label>
      <input
      type="password"
      value={loginData.password}
      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      placeholder="Passwort eingeben"
      />
      </div>
      
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
      <BookOpen className="w-4 h-4 inline mr-2" />
      <strong>Konfis:</strong> Passwort-Format wie "Roemer11,1" oder "Johannes3,16"
      </div>
      
      <button
      type="submit"
      disabled={loginLoading}
      className="w-full bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-base"
      >
      {loginLoading && <Loader className="w-5 h-5 animate-spin" />}
      {loginLoading ? 'Anmelde...' : 'Anmelden'}
      </button>
      </form>
      </div>
      </div>
    );
  };
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
      <Award className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Konfi-Punkte-System</h1>
      <p className="text-gray-600">Lade deine Daten...</p>
      </div>
      </div>
    );
  }
  
  // Render Login View
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <div className="flex-1">
          <LoginView />
        </div>
        
        <div className="bg-white border-t mt-auto">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="text-center text-xs text-gray-500">
              © 2025 Pastor Simon Luthe • Konfi-Punkte-System v2.0.0
            </div>
          </div>
        </div>
      </div>
    );
  }
  
// Render Konfi Views
if (user.type === 'konfi') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Modals */}
      <IOSImageViewer 
        show={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={currentImageData?.url}
        title={currentImageData?.title}
      />
      <Modal
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Aktivität beantragen"
        fullScreen={true}
        submitButtonText="Antrag senden"
        onSubmit={() => {
          const form = document.getElementById('request-form');
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }}
        submitDisabled={loading}
        loading={loading}
      >
        <ActivityRequestForm
          activities={activities}
          onSubmit={handleCreateActivityRequest}
          loading={loading}
          takePicture={takePicture}
        />
      </Modal>

      {/* Header - MOBIL OPTIMIERT */}
      <div className="bg-white shadow-sm border-b safe-area-top">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <button 
                  onClick={() => setCurrentView('konfi-dashboard')}
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors text-left"
                >
                  Hallo {user.name}!
                </button>
                <p className="text-sm text-gray-600">Jahrgang: {user.jahrgang}</p>
              </div>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={() => loadKonfiData(user.id)}
                disabled={loading}
                className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 font-medium text-base"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center gap-2 font-medium text-base"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
            
            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden bg-gray-100 p-3 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Controls */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 space-y-3 pb-4 border-t pt-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    loadKonfiData(user.id);
                    setMobileMenuOpen(false);
                  }}
                  disabled={loading}
                  className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-base"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium text-base"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex-1">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          
          {/* Konfi Dashboard - STANDARDISIERT */}
          {currentView === 'konfi-dashboard' && selectedKonfi && (
            <div className="space-y-4">
              {/* Points Overview */}
              {(showGottesdienstTarget || showGemeindeTarget) && (
                <div className="grid grid-cols-1 gap-4">
                  {showGottesdienstTarget && (
                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
                      <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Gottesdienstliche Aktivitäten
                      </h3>
                      <div className="text-3xl font-bold text-blue-600 mb-3">
                        {selectedKonfi.points.gottesdienst}/{settings.target_gottesdienst}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className={`h-4 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gottesdienst, settings.target_gottesdienst)}`}
                          style={{ width: `${Math.min((selectedKonfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      {selectedKonfi.points.gottesdienst >= parseInt(settings.target_gottesdienst) && (
                        <div className="text-green-600 font-bold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Ziel erreicht!
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showGemeindeTarget && (
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm">
                      <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Gemeindliche Aktivitäten
                      </h3>
                      <div className="text-3xl font-bold text-green-600 mb-3">
                        {selectedKonfi.points.gemeinde}/{settings.target_gemeinde}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className={`h-4 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gemeinde, settings.target_gemeinde)}`}
                          style={{ width: `${Math.min((selectedKonfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      {selectedKonfi.points.gemeinde >= parseInt(settings.target_gemeinde) && (
                        <div className="text-green-600 font-bold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Ziel erreicht!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-bold mb-4">Schnell-Aktionen</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 text-base font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-bold">Aktivität beantragen</div>
                      <div className="text-sm opacity-90">Neue Punkte beantragen</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('konfi-badges')}
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
              
              {/* Statistics Dashboard */}
              <StatisticsDashboard 
                konfiData={selectedKonfi}
                allStats={ranking}
                badges={badges}
                settings={settings}
              />
              
              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-bold mb-4">Meine Aktivitäten</h3>
                {(selectedKonfi.activities || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Aktivitäten eingetragen.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedKonfi.activities || []).map((activity, index) => (
                      <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
          activity.type === 'gottesdienst' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
        }`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {activity.type === 'gottesdienst' ? (
                            <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Heart className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-800 truncate">{activity.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(activity.date)}
                              {activity.admin && (
                                <span className="ml-2 text-xs">• {activity.admin}</span>
                              )}
                            </div>
                            {activity.category && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {activity.category.split(',').map((cat, catIndex) => (
                                  <span key={catIndex} className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-medium border border-purple-200">
                                    🏷️ {cat.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-orange-600 flex-shrink-0 ml-3">+{activity.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* KONFI CHAT - NACH den anderen Konfi-Views einfügen */}
{currentView === 'konfi-chat' && user?.type === 'konfi' && (
  <div className="h-full">
    <ChatView
      user={user}
      api={api}
      formatDate={formatDate}
      isAdmin={false}
    />
  </div>
)}

          {/* Konfi Requests - STANDARDISIERT */}
          {currentView === 'konfi-requests' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Meine Anträge</h2>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Neuer Antrag
                  </button>
                </div>
                
                {activityRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Anträge gestellt.</p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="mt-4 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium text-base mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Ersten Antrag stellen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityRequests.map(request => (
                      <div 
                        key={request.id} 
                        className={`border rounded-lg p-4 transition-colors ${
          request.photo_filename 
          ? 'cursor-pointer hover:bg-gray-50 hover:border-blue-300' 
          : ''
        } ${
          request.status === 'pending' 
          ? 'border-yellow-300 bg-yellow-50' 
          : request.status === 'approved'
          ? 'border-green-300 bg-green-50'
          : 'border-red-300 bg-red-50'
        }`}
                        onClick={() => {
                          if (request.photo_filename) {
                            setCurrentImageData({
                              url: `${API_BASE_URL}/activity-requests/${request.id}/photo`,
                              title: `Foto für ${request.activity_name}`
                            });
                            setShowImageViewer(true);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{request.activity_name}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatDate(request.requested_date)} • {request.activity_points} Punkte
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <RequestStatusBadge status={request.status} />
                            {request.photo_filename && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                                <Camera className="w-3 h-3" />
                                Foto
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {request.comment && (
                          <p className="text-sm text-gray-700 italic bg-white p-3 rounded-lg mb-3 border border-gray-200">
                            "{request.comment}"
                          </p>
                        )}
                        
                        {request.admin_comment && (
                          <p className="text-sm text-blue-600 italic bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <strong>Admin:</strong> {request.admin_comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Konfi Badges - STANDARDISIERT */}
          {currentView === 'konfi-badges' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Meine Badges
                </h2>
                
                {badges.available ? (
                  <BadgeDisplay 
                    badges={badges.available} 
                    earnedBadges={badges.earned || []} 
                    konfiData={selectedKonfi}
                    isAdmin={false}
                    showProgress={true}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p>Badges werden geladen...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Tab Navigation - STANDARDISIERT */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40 safe-area-bottom">
    <div className="flex justify-around items-center py-2 px-2">
    {navigationItems.map(({ id, label, icon: Icon, notification }) => (
      <button
      key={id}
      onClick={() => {
        setCurrentView(id);
        setMobileMenuOpen(false);
      }}
      className={`flex flex-col items-center justify-center py-3 px-2 min-w-0 flex-1 transition-colors relative ${
        currentView === id ? 'text-blue-600' : 'text-gray-400'
      }`}
      >
      <div className="relative">
      <Icon className="w-5 h-5" />
      {notification > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
        {notification > 9 ? '9+' : notification}
        </span>
      )}
      </div>
      <span className="text-[10px] font-medium truncate max-w-full leading-tight mt-1">
      {label}
      </span>
      </button>
    ))}
    </div>
    </div>

    </div>
  );
}

  // Render Admin Views - KOMPLETTES INTERFACE
  if (user.type === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* All modals */}
      <ImageModal 
      show={showImageModal}
      onClose={() => setShowImageModal(false)}
      imageUrl={currentImage?.url}
      title={currentImage?.title}
      />
      <IOSImageViewer 
      show={showImageViewer}
      onClose={() => setShowImageViewer(false)}
      imageUrl={currentImageData?.url}
      title={currentImageData?.title}
      />
      <BonusPointsModal 
      show={showBonusModal}
      onClose={() => {
        setShowBonusModal(false);
        setBonusDescription('');
        setBonusPoints(1);
        setBonusDate(new Date().toISOString().split('T')[0]);
        setBonusKonfiId(null);
      }}
      konfiId={bonusKonfiId}
      konfis={konfis}
      description={bonusDescription}
      setDescription={setBonusDescription}
      points={bonusPoints}
      setPoints={setBonusPoints}
      type={bonusType}
      setType={setBonusType}
      date={bonusDate}
      setDate={setBonusDate}
      onSubmit={addBonusPoints}
      loading={loading}
      />
      <EditModal 
      show={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditItem(null);
      }}
      editType={editType}
      editItem={editItem}
      jahrgaenge={jahrgaenge}
      onSave={(type, id, data) => {
        if (type === 'konfi') {
          handleUpdate('konfis', id, {
            name: data.name,
            jahrgang_id: data.jahrgang_id
          });
        } else if (type === 'activity') {
          handleUpdate('activities', id, {
            name: data.name,
            points: data.points,
            type: data.type,
            category: data.category
          });
        } else if (type === 'jahrgang') {
          handleUpdate('jahrgaenge', id, {
            name: data.name,
            confirmation_date: data.confirmation_date
          });
        } else if (type === 'admin') {
          handleUpdate('admins', id, {
            username: data.username,
            display_name: data.display_name,
            password: data.password || undefined
          });
        }
      }}
      loading={loading}
      />
      <AdminModal 
      show={showAdminModal}
      onClose={() => {
        setShowAdminModal(false);
        setAdminForm({ username: '', display_name: '', password: '' });
      }}
      adminForm={adminForm}
      setAdminForm={setAdminForm}
      onSubmit={() => handleCreate('admins', adminForm)}
      loading={loading}
      />
      <RequestManagementModal
      show={showRequestManagementModal}
      onClose={() => {
        setShowRequestManagementModal(false);
        setSelectedRequest(null);
      }}
      request={selectedRequest}
      onUpdateStatus={handleUpdateRequestStatus}
      loading={loading}
      onSetCurrentImageData={setCurrentImageData}
      onSetShowImageViewer={setShowImageViewer}
      />
      <DeleteConfirmModal />
      <MobileBadgeModal 
      show={showMobileBadgeModal}
      onClose={() => {
        setShowMobileBadgeModal(false);
        setEditBadge(null);
      }}
      badge={editBadge}
      criteriaTypes={criteriaTypes}
      activities={activities}
      onSubmit={editBadge ? handleUpdateBadge : handleCreateBadge}
      loading={loading}
      />
      
      {/* Minimaler Header nur bei Detail-Views - MEHR ABSTAND OBEN */}
      {currentView === 'konfi-detail' && (
        <div className="bg-white border-b border-gray-100 pt-14 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 pb-3">
        <div className="flex items-center justify-between">
        <button
        onClick={() => setCurrentView('konfis')}
        className="text-blue-600 font-medium text-sm"
        >
        ← Zurück
        </button>
        
        <h1 className="text-base font-medium text-gray-900">
        {selectedKonfi?.name}
        </h1>
        
        <div className="w-16"></div>
        </div>
        </div>
        </div>
      )}
      
      {/* Content mit Bottom Padding */}
      <div className="flex-1 pb-24">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      
{/* KONFIS - KOMBINIERT - KORRIGIERT */}
{currentView === 'konfis' && (
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
)}

      {/* REQUESTS MANAGEMENT */}
      {currentView === 'requests' && (
        <div className="space-y-4">
        {/* Action Sheets */}
        <RequestActionSheet
        show={showRequestActionSheet}
        onClose={() => {
          setShowRequestActionSheet(false);
          setSelectedActionRequest(null);
        }}
        request={selectedActionRequest}
        onApprove={() => handleUpdateRequestStatus(selectedActionRequest.id, 'approved')}
        onReject={(comment) => handleUpdateRequestStatus(selectedActionRequest.id, 'rejected', comment)}
        onEdit={() => {
          setSelectedRequest(selectedActionRequest);
          setShowRequestManagementModal(true);
        }}
        onShowPhoto={() => {
          setCurrentImageData({
            url: `${API_BASE_URL}/activity-requests/${selectedActionRequest.id}/photo`,
            title: `Foto für ${selectedActionRequest.activity_name}`
          });
          setShowImageViewer(true);
        }}
        loading={loading}
        />
        
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Anträge verwalten</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
        <div>
        <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'pending').length}</div>
        <div className="text-xs opacity-80">Offen</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'approved').length}</div>
        <div className="text-xs opacity-80">Genehmigt</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'rejected').length}</div>
        <div className="text-xs opacity-80">Abgelehnt</div>
        </div>
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-yellow-700 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Offene Anträge
        </h3>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
        {activityRequests.filter(r => r.status === 'pending').length}
        </span>
        </div>
        
        <div className="space-y-3">
        {activityRequests.filter(r => r.status === 'pending').length === 0 ? (
          <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Keine offenen Anträge</p>
          </div>
        ) : (
          activityRequests.filter(r => r.status === 'pending').map(request => (
            <div 
            key={request.id}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => {
              setSelectedActionRequest(request);
              setShowRequestActionSheet(true);
            }}
            >
            <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
            <h4 className="font-bold text-gray-800 text-base mb-1">{request.konfi_name}</h4>
            <p className="text-sm text-gray-600 mb-1">{request.activity_name}</p>
            <p className="text-xs text-gray-500">{formatDate(request.requested_date)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className="text-sm font-medium text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
            {request.activity_points}P
            </span>
            <Clock className="w-4 h-4 text-yellow-600" />
            {request.photo_filename && (
              <Camera className="w-4 h-4 text-blue-600" />
            )}
            </div>
            </div>
            
            {request.comment && (
              <p className="text-sm text-gray-700 italic bg-white p-2 rounded mt-2 line-clamp-2">
              "{request.comment}"
              </p>
            )}
            </div>
          ))
        )}
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Bearbeitete Anträge
        </h3>
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
        Letzte 10
        </span>
        </div>
        
        <div className="space-y-3">
        {activityRequests.filter(r => r.status !== 'pending').slice(0, 10).map(request => (
          <div 
          key={request.id}
          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
            request.status === 'approved' 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : 'bg-red-50 border-red-200 hover:bg-red-100'
          }`}
          onClick={() => {
            setSelectedActionRequest(request);
            setShowRequestActionSheet(true);
          }}
          >
          <div className="flex items-center justify-between">
          <div className="flex-1">
          <h4 className="font-bold text-base mb-1">{request.konfi_name}</h4>
          <p className="text-sm text-gray-600">{request.activity_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
          {request.activity_points}P
          </span>
          {request.status === 'approved' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          {request.photo_filename && (
            <Camera className="w-4 h-4 text-blue-600" />
          )}
          </div>
          </div>
          
          {/* NUR User-Kommentar, KEIN Admin-Kommentar oder Datum */}
          {request.comment && (
            <p className="text-sm text-gray-700 italic bg-white p-2 rounded mt-2 line-clamp-2">
            "{request.comment}"
            </p>
          )}
          </div>
        ))}
        
        {activityRequests.filter(r => r.status !== 'pending').length === 0 && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-sm">Noch keine bearbeiteten Anträge</p>
          </div>
        )}
        </div>
        </div>
        </div>
      )}
      
      {/* ACTIVITIES MANAGEMENT */}
      {currentView === 'manage-activities' && (
        <div className="space-y-4 pt-10">
        {/* Activity Action Sheet */}
        <ActivityActionSheet
        show={showActivityActionSheet}
        onClose={() => {
          setShowActivityActionSheet(false);
          setSelectedActionActivity(null);
        }}
        activity={selectedActionActivity}
        onEdit={() => {
          setEditType('activity');
          setEditItem(selectedActionActivity);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setDeleteType('activity');
          setDeleteItem(selectedActionActivity);
          setShowDeleteModal(true);
        }}
        />
        
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Aktivitäten verwalten</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
        <div>
        <div className="text-2xl font-bold">{activities.length}</div>
        <div className="text-xs opacity-80">Aktivitäten</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activities.filter(a => a.type === 'gottesdienst').length}</div>
        <div className="text-xs opacity-80">Gottesdienst</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activities.filter(a => a.type === 'gemeinde').length}</div>
        <div className="text-xs opacity-80">Gemeinde</div>
        </div>
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Neue Aktivität hinzufügen</h3>
        <div className="space-y-3">
        <input
        type="text"
        value={newActivityName}
        onChange={(e) => setNewActivityName(e.target.value)}
        placeholder="Name der Aktivität"
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        />
        <div className="grid grid-cols-2 gap-3">
        <input
        type="number"
        value={newActivityPoints}
        onChange={(e) => setNewActivityPoints(parseInt(e.target.value) || 1)}
        min="1"
        max="10"
        placeholder="Punkte"
        className="p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        />
        <select
        value={newActivityType}
        onChange={(e) => setNewActivityType(e.target.value)}
        className="p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        >
        <option value="gottesdienst">Gottesdienstlich</option>
        <option value="gemeinde">Gemeindlich</option>
        </select>
        </div>
        <input
        type="text"
        value={newActivityCategory}
        onChange={(e) => setNewActivityCategory(e.target.value)}
        placeholder="Kategorien (kommagetrennt: Kinder,Fest)"
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        />
        <button
        onClick={() => handleCreate('activities', {
          name: newActivityName.trim(),
          points: newActivityPoints,
          type: newActivityType,
          category: newActivityCategory.trim()
        })}
        disabled={loading || !newActivityName.trim()}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Hinzufügen
        </button>
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5" />
        Gottesdienstliche Aktivitäten
        </h3>
        <div className="space-y-3">
        {activities.filter(a => a.type === 'gottesdienst').map(activity => (
          <div 
          key={activity.id}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => {
            setSelectedActionActivity(activity);
            setShowActivityActionSheet(true);
          }}
          >
          <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-800 text-base flex-1">{activity.name}</h4>
          <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
          {activity.points}P
          </span>
          <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          </div>
          
          {activity.category && (
            <div className="flex flex-wrap gap-1">
            {activity.category.split(',').map((cat, index) => (
              <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
              {cat.trim()}
              </span>
            ))}
            </div>
          )}
          </div>
        ))}
        
        {activities.filter(a => a.type === 'gottesdienst').length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Keine gottesdienstlichen Aktivitäten</p>
          </div>
        )}
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5" />
        Gemeindliche Aktivitäten
        </h3>
        <div className="space-y-3">
        {activities.filter(a => a.type === 'gemeinde').map(activity => (
          <div 
          key={activity.id}
          className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => {
            setSelectedActionActivity(activity);
            setShowActivityActionSheet(true);
          }}
          >
          <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-800 text-base flex-1">{activity.name}</h4>
          <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">
          {activity.points}P
          </span>
          <Heart className="w-4 h-4 text-green-600" />
          </div>
          </div>
          
          {activity.category && (
            <div className="flex flex-wrap gap-1">
            {activity.category.split(',').map((cat, index) => (
              <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
              {cat.trim()}
              </span>
            ))}
            </div>
          )}
          </div>
        ))}
        
        {activities.filter(a => a.type === 'gemeinde').length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Keine gemeindlichen Aktivitäten</p>
          </div>
        )}
        </div>
        </div>
        </div>
      )}
      
      {/* BADGES MANAGEMENT */}
      {currentView === 'manage-badges' && (
        <div className="space-y-4 pt-10">
        <BadgeEditActionSheet
        show={showBadgeActionSheet}
        onClose={() => {
          setShowBadgeActionSheet(false);
          setSelectedActionBadge(null);
        }}
        badge={selectedActionBadge}
        onEdit={() => {
          setEditBadge(selectedActionBadge);
          setShowMobileBadgeModal(true);
        }}
        onDelete={() => {
          setDeleteType('badge');
          setDeleteItem(selectedActionBadge);
          setShowDeleteModal(true);
        }}
        criteriaTypes={criteriaTypes}
        />
        
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Badge Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
        <div>
        <div className="text-2xl font-bold">{badges.length}</div>
        <div className="text-xs opacity-80">Badges</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{badges.filter(b => b.is_active).length}</div>
        <div className="text-xs opacity-80">Aktiv</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{badges.filter(b => b.is_hidden).length}</div>
        <div className="text-xs opacity-80">Geheim</div>
        </div>
        </div>
        </div>
        
        <button
        onClick={() => {
          setEditBadge(null);
          setShowMobileBadgeModal(true);
        }}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium"
        >
        <Plus className="w-4 h-4" />
        Neues Badge erstellen
        </button>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="relative">
        <select
        value={badgeFilter}
        onChange={(e) => setBadgeFilter(e.target.value)}
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none"
        >
        <option value="all">Alle Badges</option>
        <option value="active">Nur Aktive</option>
        <option value="inactive">Nur Inaktive</option>
        <option value="hidden">Nur Geheime</option>
        <option value="visible">Nur Sichtbare</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        
        <div className="relative">
        <select
        value={badgeSort}
        onChange={(e) => setBadgeSort(e.target.value)}
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none"
        >
        <option value="name">Nach Name</option>
        <option value="criteria">Nach Kriterium</option>
        <option value="status">Nach Status</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        </div>
        </div>
        
        <div className="space-y-3">
        {badges.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Keine Badges vorhanden</p>
          </div>
        ) : (
          badges
          .filter(badge => {
            if (badgeFilter === 'active') return badge.is_active;
            if (badgeFilter === 'inactive') return !badge.is_active;
            if (badgeFilter === 'hidden') return badge.is_hidden;
            if (badgeFilter === 'visible') return !badge.is_hidden;
            return true;
          })
          .sort((a, b) => {
            if (badgeSort === 'criteria') return a.criteria_type.localeCompare(b.criteria_type);
            if (badgeSort === 'status') return Number(b.is_active) - Number(a.is_active);
            return a.name.localeCompare(b.name);
          })
          // KORRIGIERTE Badge-Anzeige mit besserem Layout
          .map(badge => (
            <div 
            key={badge.id} 
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
            onClick={() => {
              setSelectedActionBadge(badge);
              setShowBadgeActionSheet(true);
            }}
            >
            <div className="space-y-4">
            {/* ERSTE ZEILE: Icon + Name + Buttons */}
            <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-center">
            <div className="text-3xl">{badge.icon}</div>
            </div>
            
            <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 leading-tight">{badge.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">{badge.description}</p>
            </div>
            
            {/* Status-Dots rechts */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${badge.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {badge.is_hidden && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
            </div>
            <div className="text-xs text-gray-500 text-center">
            {badge.is_active ? 'Aktiv' : 'Inaktiv'}
            {badge.is_hidden && <div className="text-purple-600">Geheim</div>}
            </div>
            </div>
            </div>
            
            {/* ZWEITE ZEILE: Kriterium über volle Breite */}
            <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-700 font-medium">
            {criteriaTypes[badge.criteria_type]?.label} ≥ {badge.criteria_value}
            </p>
            </div>
            
            {/* DRITTE ZEILE: Vergabe-Statistik über volle Breite */}
            <div className={`text-center py-2 px-3 rounded-lg border ${
              badge.earned_count > 0 
              ? 'text-green-700 bg-green-50 border-green-200' 
              : 'text-gray-600 bg-gray-50 border-gray-200'
            }`}>
            <span className="text-sm font-bold">{badge.earned_count}</span>
            <span className="text-xs ml-1">mal vergeben</span>
            </div>
            </div>
            </div>
          ))
        )}
        </div>
        </div>
      )}
      
      {/* ADMIN CHAT - NACH den anderen Admin-Views einfügen */}
{currentView === 'chat' && user?.type === 'admin' && (
  <div className="h-full">
    <ChatView
      user={user}
      api={api}
      formatDate={formatDate}
      isAdmin={true}
    />
  </div>
)}

      {/* SETTINGS MIT JAHRGÄNGEN - VERBESSERT */}

{currentView === 'settings' && (
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

    {/* Neue Modals */}
    <JahrgangModal 
      show={showJahrgangModal}
      onClose={() => {
        setShowJahrgangModal(false);
        setJahrgangForm({ name: '', confirmation_date: '' });
      }}
      jahrgangForm={jahrgangForm}
      setJahrgangForm={setJahrgangForm}
      onSubmit={() => handleCreate('jahrgaenge', jahrgangForm)}
      loading={loading}
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
)}

      {/* KONFI DETAIL VIEW */}
{currentView === 'konfi-detail' && selectedKonfi && (
  <div className="space-y-4">
    {/* Action Sheets */}
    <KonfiActivityActionSheet
      show={showActivityActionSheet}
      onClose={() => {
        setShowActivityActionSheet(false);
        setSelectedActionActivity(null);
      }}
      activity={selectedActionActivity}
      onRemove={() => removeActivityFromKonfi(selectedKonfi.id, selectedActionActivity.id)}
      loading={loading}
      konfiName={selectedKonfi.name}
    />
    
    <KonfiBonusActionSheet
      show={showBonusActionSheet}
      onClose={() => {
        setShowBonusActionSheet(false);
        setSelectedActionBonus(null);
      }}
      bonus={selectedActionBonus}
      onRemove={() => removeBonusPointsFromKonfi(selectedKonfi.id, selectedActionBonus.id)}
      loading={loading}
      konfiName={selectedKonfi.name}
    />

    {/* Header Card */}
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-2">{selectedKonfi.name}</h2>
      <p className="text-sm opacity-90">
        {selectedKonfi.jahrgang} • {selectedKonfi.username}
      </p>
      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div>
          <div className="text-2xl font-bold">{selectedKonfi.points.gottesdienst + selectedKonfi.points.gemeinde}</div>
          <div className="text-xs opacity-80">Punkte</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{selectedKonfi.activities?.length || 0}</div>
          <div className="text-xs opacity-80">Aktivitäten</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{selectedKonfi.badges?.length || 0}</div>
          <div className="text-xs opacity-80">Badges</div>
        </div>
      </div>
    </div>

    {/* Actions Card */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <h3 className="font-bold text-gray-800 mb-3">Aktionen</h3>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <button
      onClick={() => {
        setBonusKonfiId(selectedKonfi.id);
        setShowBonusModal(true);
      }}
      className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium text-base"
    >
      <Gift className="w-4 h-4" />
      Zusatzpunkte
    </button>
    <button
      onClick={() => regeneratePassword(selectedKonfi.id)}
      className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium text-base"
    >
      <RefreshCw className="w-4 h-4" />
      Neues Passwort
    </button>
    <button
      onClick={() => {
        setDeleteType('konfi');
        setDeleteItem(selectedKonfi);
        setShowDeleteModal(true);
      }}
      className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium text-base"
    >
      <Trash2 className="w-4 h-4" />
      Löschen
    </button>
  </div>

  {/* Password Display */}
  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Passwort:</span>
      {passwordVisibility[selectedKonfi.id] ? (
        <span className="font-mono">{selectedKonfi.password}</span>
      ) : (
        <span>••••••••••</span>
      )}
      <button
        onClick={() => togglePasswordVisibility(selectedKonfi.id)}
        className="text-blue-500 hover:text-blue-700 p-1"
      >
        {passwordVisibility[selectedKonfi.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  </div>
</div>
{/* Progress Cards */}
    {(showGottesdienstTarget || showGemeindeTarget) && (
      <div className={`grid gap-4 ${showGottesdienstTarget && showGemeindeTarget ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {showGottesdienstTarget && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Gottesdienst
            </h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {selectedKonfi.points.gottesdienst}/{settings.target_gottesdienst}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gottesdienst, settings.target_gottesdienst)}`}
                style={{ width: `${Math.min((selectedKonfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {showGemeindeTarget && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Gemeinde
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {selectedKonfi.points.gemeinde}/{settings.target_gemeinde}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gemeinde, settings.target_gemeinde)}`}
                style={{ width: `${Math.min((selectedKonfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Badges Card */}
    {selectedKonfi.badges && selectedKonfi.badges.length > 0 && (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Erreichte Badges ({selectedKonfi.badges.length})
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {selectedKonfi.badges.map(badge => (
            <div key={badge.id} className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-xs font-bold text-yellow-800 leading-tight mb-1">{badge.name}</div>
              <div className="text-xs text-gray-500">{formatDate(badge.earned_at)}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Quick Assignment Card */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Schnell-Zuordnung</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
          <div className="relative">
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
              style={{ 
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sortierung</label>
          <div className="relative">
            <select
              value={activitySort}
              onChange={(e) => setActivitySort(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
            >
              <option value="name">Nach Name</option>
              <option value="points">Nach Punkten</option>
              <option value="type">Nach Typ</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {activities
          .sort((a, b) => {
            if (activitySort === 'points') return b.points - a.points;
            if (activitySort === 'type') return a.type.localeCompare(b.type);
            return a.name.localeCompare(b.name);
          })
          .map(activity => (
            <button
              key={activity.id}
              onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
              disabled={loading}
              className={`w-full text-left p-3 rounded-lg border text-sm disabled:opacity-50 transition-colors ${
          activity.type === 'gottesdienst' 
          ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' 
          : 'bg-green-50 hover:bg-green-100 border-green-200'
        }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activity.type === 'gottesdienst' ? (
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Heart className="w-4 h-4 text-green-600" />
                  )}
                  <span className="font-medium">{activity.name}</span>
                </div>
                <span className={`font-bold ${
          activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
        }`}>
                  +{activity.points}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>

    {/* Activities & Bonus Points List */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Absolvierte Aktivitäten & Zusatzpunkte</h3>
      {(selectedKonfi.activities.length === 0 && (!selectedKonfi.bonusPoints || selectedKonfi.bonusPoints.length === 0)) ? (
        <p className="text-gray-600 text-center py-8">Noch keine Aktivitäten absolviert.</p>
      ) : (
        <div className="space-y-3">
          {/* Aktivitäten */}
          {selectedKonfi.activities.map((activity, index) => (
            <div 
              key={`activity-${index}`}
              className={`border rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md ${
          activity.type === 'gottesdienst' 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
          : 'bg-green-50 border-green-200 hover:bg-green-100'
        }`}
              onClick={() => {
                setSelectedActionActivity(activity);
                setShowActivityActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {activity.type === 'gottesdienst' ? (
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Heart className="w-4 h-4 text-green-600" />
                  )}
                  <h4 className="font-bold text-gray-800 text-sm">{activity.name}</h4>
                </div>
                <span className={`font-bold text-sm ${
          activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
        }`}>
                  +{activity.points}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{activity.admin || 'System'}</span>
                <span>{formatDate(activity.date)}</span>
              </div>

              {activity.category && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activity.category.split(',').map((cat, catIndex) => (
                    <span key={catIndex} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Zusatzpunkte */}
          {selectedKonfi.bonusPoints && selectedKonfi.bonusPoints.map((bonus, index) => (
            <div 
              key={`bonus-${index}`}
              className="border rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md bg-orange-50 border-orange-200 hover:bg-orange-100"
              onClick={() => {
                setSelectedActionBonus(bonus);
                setShowBonusActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <h4 className="font-bold text-gray-800 text-sm">{bonus.description}</h4>
                </div>
                <span className="font-bold text-sm text-orange-600">+{bonus.points}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{bonus.admin || 'System'}</span>
                <span>{formatDate(bonus.date)}</span>
              </div>

              <div className="mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
          bonus.type === 'gottesdienst' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-green-100 text-green-800'
        }`}>
                  {bonus.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
</div>
      </div>
      
      {/* Bottom Tab Navigation */}
      <BottomTabNavigation 
      currentView={currentView}
      setCurrentView={setCurrentView}
      navigationItems={navigationItems}
      />
      </div>
    );
  }
};

export default KonfiPointsSystem;
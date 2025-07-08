import { getYearWeek } from './dateUtils';

export const getProgressColor = (current, target) => {
  const percentage = (current / parseInt(target)) * 100;
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-yellow-500';
  return 'bg-blue-500';
};

export const getProgressPercentage = (current, target) => {
  return Math.min((current / parseInt(target)) * 100, 100);
};

export const getConfirmationCountdown = (confirmationDate) => {
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

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export const generatePassword = () => {
  const books = [
    'Genesis', 'Exodus', 'Levitikus', 'Numeri', 'Deuteronomium',
    'Josua', 'Richter', 'Ruth', 'Samuel', 'Koenige', 'Chronik',
    'Matthaeus', 'Markus', 'Lukas', 'Johannes', 'Roemer', 'Korinther'
  ];
  
  const book = books[Math.floor(Math.random() * books.length)];
  const chapter = Math.floor(Math.random() * 50) + 1;
  const verse = Math.floor(Math.random() * 30) + 1;
  
  return `${book}${chapter},${verse}`;
};

export const calculateBadgeProgress = (konfi, badge) => {
  if (!konfi || !badge) return { current: 0, target: badge?.criteria_value || 0, percentage: 0 };
  
  const target = parseInt(badge.criteria_value) || 0;
  let current = 0;
  
  switch (badge.criteria_type) {
    case 'total_points':
      current = konfi.total_points || 0;
      break;
    case 'activities_count':
      current = konfi.activities_count || 0;
      break;
    case 'specific_activity':
      current = konfi.activities?.filter(a => a.id === badge.criteria_activity_id).length || 0;
      break;
    case 'streak':
      current = calculateWeekStreak(konfi.activities || []);
      break;
    case 'konfi_days':
      current = konfi.konfi_days_attended || 0;
      break;
    default:
      current = 0;
  }
  
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  return { current, target, percentage };
};

export const calculateWeekStreak = (activities) => {
  if (!activities || activities.length === 0) return 0;
  
  const sortedActivities = activities
    .map(a => new Date(a.created_at))
    .sort((a, b) => b - a);
  
  let streak = 0;
  let currentWeek = getYearWeek(new Date());
  
  for (const activityDate of sortedActivities) {
    const activityWeek = getYearWeek(activityDate);
    
    if (activityWeek === currentWeek) {
      streak++;
      currentWeek--;
    } else if (activityWeek < currentWeek - 1) {
      break;
    }
  }
  
  return streak;
};

export const filterByJahrgang = (items, selectedJahrgang) => {
  if (selectedJahrgang === 'alle' || !selectedJahrgang) {
    return items;
  }
  return items.filter(item => item.jahrgang === selectedJahrgang);
};

export const filterBySearchTerm = (items, searchTerm, searchFields = ['name']) => {
  if (!searchTerm) return items;
  
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(item => 
    searchFields.some(field => 
      item[field]?.toLowerCase().includes(lowerSearch)
    )
  );
};

export const sortByDate = (items, field = 'created_at', ascending = false) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[field]);
    const dateB = new Date(b[field]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const groupByType = (activities) => {
  return activities.reduce((groups, activity) => {
    const type = activity.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(activity);
    return groups;
  }, {});
};
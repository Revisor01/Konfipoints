// Bible books for password generation
export const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Levitikus', 'Numeri', 'Deuteronomium',
  'Josua', 'Richter', 'Ruth', 'Samuel', 'Koenige', 'Chronik',
  'Esra', 'Nehemia', 'Ester', 'Hiob', 'Psalmen', 'Sprueche',
  'Prediger', 'Hohelied', 'Jesaja', 'Jeremia', 'Klagelieder',
  'Hesekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadja',
  'Jona', 'Micha', 'Nahum', 'Habakuk', 'Zephanja', 'Haggai',
  'Sacharja', 'Maleachi', 'Matthaeus', 'Markus', 'Lukas',
  'Johannes', 'Apostelgeschichte', 'Roemer', 'Korinther',
  'Galater', 'Epheser', 'Philipper', 'Kolosser', 'Thessalonicher',
  'Timotheus', 'Titus', 'Philemon', 'Hebraeer', 'Jakobus',
  'Petrus', 'Johannes', 'Judas', 'Offenbarung'
];

// Default settings
export const DEFAULT_SETTINGS = {
  target_gottesdienst: '10',
  target_gemeinde: '10'
};

// Activity types
export const ACTIVITY_TYPES = {
  GOTTESDIENST: 'gottesdienst',
  GEMEINDE: 'gemeinde'
};

// Request status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// User types
export const USER_TYPES = {
  ADMIN: 'admin',
  KONFI: 'konfi'
};

// Navigation items for mobile - Using Lucide React icons (import needed in components)
export const ADMIN_NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: 'MessageSquare', notification: 0 },
  { id: 'konfis', label: 'Konfis', icon: 'UserPlus' },
  { id: 'activities', label: 'Aktionen', icon: 'Calendar' },
  { id: 'badges', label: 'Badges', icon: 'Award' },
  { id: 'settings', label: 'Einstellungen', icon: 'Settings' }
];

export const MORE_MENU_ITEMS = [
  { id: 'requests', label: 'Anträge', icon: 'Clock' },
  { id: 'jahrgaenge', label: 'Jahrgänge', icon: 'BookOpen' },
  { id: 'admins', label: 'Admins', icon: 'UserPlus' },
  { id: 'settings', label: 'Einstellungen', icon: 'Settings' }
];

export const KONFI_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
  { id: 'requests', label: 'Anträge', icon: 'Upload' },
  { id: 'chat', label: 'Chat', icon: 'MessageSquare', notification: 0 },
  { id: 'badges', label: 'Badges', icon: 'Award' }
];
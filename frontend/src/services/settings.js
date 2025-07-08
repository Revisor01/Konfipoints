import api from './api';

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Einstellungen');
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/settings', settings);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren der Einstellungen');
  }
};

export const getSetting = async (key) => {
  try {
    const response = await api.get(`/settings/${key}`);
    return response.data.value;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Einstellung');
  }
};

export const updateSetting = async (key, value) => {
  try {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren der Einstellung');
  }
};

export const DEFAULT_SETTINGS = {
  app_name: 'Konfi-Punkte',
  points_per_activity: 10,
  max_bonus_points: 50,
  enable_badges: true,
  enable_chat: true,
  enable_photos: true,
  auto_approve_requests: false,
  notification_admin_new_request: true,
  notification_konfi_approved: true,
  notification_konfi_rejected: true,
  max_file_size_mb: 5,
  allowed_file_types: ['image/jpeg', 'image/png', 'image/webp'],
  badge_criteria_types: [
    'total_points',
    'activities_count',
    'specific_activity',
    'streak',
    'bonus',
    'seasonal',
    'konfi_days'
  ]
};
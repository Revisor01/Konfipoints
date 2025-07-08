import api from './api';

export const BADGE_CRITERIA_TYPES = {
  TOTAL_POINTS: 'total_points',
  ACTIVITIES_COUNT: 'activities_count',
  SPECIFIC_ACTIVITY: 'specific_activity',
  STREAK: 'streak',
  BONUS: 'bonus',
  SEASONAL: 'seasonal',
  KONFI_DAYS: 'konfi_days'
};

export const createBadge = async (badgeData) => {
  try {
    const response = await api.post('/badges', badgeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Erstellen des Badges');
  }
};

export const updateBadge = async (id, badgeData) => {
  try {
    const response = await api.put(`/badges/${id}`, badgeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren des Badges');
  }
};

export const deleteBadge = async (id) => {
  try {
    await api.delete(`/badges/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen des Badges');
  }
};

export const getBadges = async () => {
  try {
    const response = await api.get('/badges');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Badges');
  }
};

export const getBadge = async (id) => {
  try {
    const response = await api.get(`/badges/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Badges');
  }
};

export const getKonfiBadges = async (konfiId) => {
  try {
    const response = await api.get(`/konfis/${konfiId}/badges`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfi-Badges');
  }
};

export const checkBadgeEligibility = async (konfiId, badgeId) => {
  try {
    const response = await api.get(`/konfis/${konfiId}/badges/${badgeId}/check`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Prüfen der Badge-Berechtigung');
  }
};

export const awardBadge = async (konfiId, badgeId) => {
  try {
    const response = await api.post(`/konfis/${konfiId}/badges/${badgeId}/award`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Vergeben des Badges');
  }
};

export const revokeBadge = async (konfiId, badgeId) => {
  try {
    await api.delete(`/konfis/${konfiId}/badges/${badgeId}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Entziehen des Badges');
  }
};
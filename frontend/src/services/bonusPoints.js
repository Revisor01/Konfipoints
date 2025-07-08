import api from './api';

export const createBonusPoints = async (bonusData) => {
  try {
    const response = await api.post('/bonus-points', bonusData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Vergeben der Bonuspunkte');
  }
};

export const updateBonusPoints = async (id, bonusData) => {
  try {
    const response = await api.put(`/bonus-points/${id}`, bonusData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren der Bonuspunkte');
  }
};

export const deleteBonusPoints = async (id) => {
  try {
    await api.delete(`/bonus-points/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen der Bonuspunkte');
  }
};

export const getBonusPoints = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/bonus-points?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Bonuspunkte');
  }
};

export const getKonfiBonusPoints = async (konfiId) => {
  try {
    const response = await api.get(`/konfis/${konfiId}/bonus-points`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfi-Bonuspunkte');
  }
};

export const getBonusPointsHistory = async (konfiId) => {
  try {
    const response = await api.get(`/konfis/${konfiId}/bonus-points/history`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Bonuspunkte-Historie');
  }
};
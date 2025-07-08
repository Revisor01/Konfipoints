import api from './api';

export const createKonfi = async (konfiData) => {
  try {
    const response = await api.post('/konfis', konfiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Erstellen des Konfis');
  }
};

export const updateKonfi = async (id, konfiData) => {
  try {
    const response = await api.put(`/konfis/${id}`, konfiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren des Konfis');
  }
};

export const deleteKonfi = async (id) => {
  try {
    await api.delete(`/konfis/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen des Konfis');
  }
};

export const getKonfis = async () => {
  try {
    const response = await api.get('/konfis');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfis');
  }
};

export const getKonfi = async (id) => {
  try {
    const response = await api.get(`/konfis/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Konfis');
  }
};

export const getKonfiProfile = async (id) => {
  try {
    const response = await api.get(`/konfis/${id}/profile`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Konfi-Profils');
  }
};

export const getKonfiStatistics = async (id) => {
  try {
    const response = await api.get(`/konfis/${id}/statistics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfi-Statistiken');
  }
};

export const getKonfisByJahrgang = async (jahrgangId) => {
  try {
    const response = await api.get(`/jahrgaenge/${jahrgangId}/konfis`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfis des Jahrgangs');
  }
};

export const updateKonfiPassword = async (id, newPassword) => {
  try {
    const response = await api.put(`/konfis/${id}/password`, { password: newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren des Passworts');
  }
};

export const getKonfiRanking = async (jahrgangId = null) => {
  try {
    const url = jahrgangId ? `/ranking?jahrgang=${jahrgangId}` : '/ranking';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Rankings');
  }
};
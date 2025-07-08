import api from './api';

export const createJahrgang = async (jahrgangData) => {
  try {
    const response = await api.post('/jahrgaenge', jahrgangData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Erstellen des Jahrgangs');
  }
};

export const updateJahrgang = async (id, jahrgangData) => {
  try {
    const response = await api.put(`/jahrgaenge/${id}`, jahrgangData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren des Jahrgangs');
  }
};

export const deleteJahrgang = async (id) => {
  try {
    await api.delete(`/jahrgaenge/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen des Jahrgangs');
  }
};

export const getJahrgaenge = async () => {
  try {
    const response = await api.get('/jahrgaenge');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Jahrgänge');
  }
};

export const getJahrgang = async (id) => {
  try {
    const response = await api.get(`/jahrgaenge/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Jahrgangs');
  }
};

export const getJahrgangStatistics = async (id) => {
  try {
    const response = await api.get(`/jahrgaenge/${id}/statistics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Jahrgang-Statistiken');
  }
};

export const getActiveJahrgang = async () => {
  try {
    const response = await api.get('/jahrgaenge/active');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des aktiven Jahrgangs');
  }
};
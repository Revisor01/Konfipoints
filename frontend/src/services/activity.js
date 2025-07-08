import api from './api';

export const createActivity = async (activityData) => {
  try {
    const response = await api.post('/activities', activityData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Erstellen der Aktivität');
  }
};

export const updateActivity = async (id, activityData) => {
  try {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren der Aktivität');
  }
};

export const deleteActivity = async (id) => {
  try {
    await api.delete(`/activities/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen der Aktivität');
  }
};

export const getActivities = async () => {
  try {
    const response = await api.get('/activities');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Aktivitäten');
  }
};

export const getActivity = async (id) => {
  try {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Aktivität');
  }
};

export const assignActivityToKonfi = async (activityId, konfiId, points = null, note = '') => {
  try {
    const response = await api.post('/activity-assignments', {
      activity_id: activityId,
      konfi_id: konfiId,
      points,
      note
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Zuweisen der Aktivität');
  }
};

export const removeActivityFromKonfi = async (assignmentId) => {
  try {
    await api.delete(`/activity-assignments/${assignmentId}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Entfernen der Aktivität');
  }
};

export const getKonfiActivities = async (konfiId) => {
  try {
    const response = await api.get(`/konfis/${konfiId}/activities`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfi-Aktivitäten');
  }
};
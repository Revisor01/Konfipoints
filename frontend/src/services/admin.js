import api from './api';

export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('/admins', adminData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Erstellen des Admins');
  }
};

export const updateAdmin = async (id, adminData) => {
  try {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren des Admins');
  }
};

export const deleteAdmin = async (id) => {
  try {
    await api.delete(`/admins/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen des Admins');
  }
};

export const getAdmins = async () => {
  try {
    const response = await api.get('/admins');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Admins');
  }
};

export const getAdmin = async (id) => {
  try {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Admins');
  }
};

export const updateAdminPassword = async (id, newPassword) => {
  try {
    const response = await api.put(`/admins/${id}/password`, { password: newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren des Admin-Passworts');
  }
};

export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Admin-Dashboards');
  }
};
import api from './api';

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const createActivityRequest = async (requestData) => {
  try {
    const formData = new FormData();
    
    Object.keys(requestData).forEach(key => {
      if (key === 'photo' && requestData[key]) {
        formData.append('photo', requestData[key]);
      } else if (requestData[key] !== null && requestData[key] !== undefined) {
        formData.append(key, requestData[key]);
      }
    });

    const response = await api.post('/activity-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Erstellen der Aktivitäts-Anfrage');
  }
};

export const updateActivityRequest = async (id, requestData) => {
  try {
    const response = await api.put(`/activity-requests/${id}`, requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren der Aktivitäts-Anfrage');
  }
};

export const deleteActivityRequest = async (id) => {
  try {
    await api.delete(`/activity-requests/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Löschen der Aktivitäts-Anfrage');
  }
};

export const getActivityRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/activity-requests?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Aktivitäts-Anfragen');
  }
};

export const getActivityRequest = async (id) => {
  try {
    const response = await api.get(`/activity-requests/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Aktivitäts-Anfrage');
  }
};

export const approveActivityRequest = async (id, approvalData = {}) => {
  try {
    const response = await api.post(`/activity-requests/${id}/approve`, approvalData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Genehmigen der Aktivitäts-Anfrage');
  }
};

export const rejectActivityRequest = async (id, rejectionReason = '') => {
  try {
    const response = await api.post(`/activity-requests/${id}/reject`, {
      reason: rejectionReason
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Ablehnen der Aktivitäts-Anfrage');
  }
};

export const getKonfiActivityRequests = async (konfiId) => {
  try {
    const response = await api.get(`/konfis/${konfiId}/activity-requests`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Konfi-Aktivitäts-Anfragen');
  }
};

export const getPendingRequestsCount = async () => {
  try {
    const response = await api.get('/activity-requests/pending/count');
    return response.data.count;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Anzahl offener Anfragen');
  }
};
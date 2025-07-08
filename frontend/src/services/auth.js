// frontend/src/services/auth.js
import api from './api';

export const login = async (username, password, type) => {
  const endpoint = type === 'admin' ? '/admin/login' : '/konfi/login';
  const response = await api.post(endpoint, { username, password });
  const { token, user } = response.data;

  if (!token || !user) throw new Error('Fehlender Token oder Benutzer');

  localStorage.setItem('konfi_token', token);
  localStorage.setItem('konfi_user', JSON.stringify(user));

  return user;
};

export const loginWithAutoDetection = async (username, password) => {
  console.log('Login starten…', { username, password });
  
  try {
    const response = await api.post('/admin/login', { username, password });
    console.log('Admin-Login erfolgreich:', response.data);
    const { token, user } = response.data;
    
    if (!token || !user) throw new Error('Fehlender Token oder Benutzer (Admin)');
    
    localStorage.setItem('konfi_token', token);
    localStorage.setItem('konfi_user', JSON.stringify(user));
    
    return user;
  } catch (adminError) {
    console.warn('Admin-Login fehlgeschlagen:', adminError?.response?.data || adminError.message);
    
    try {
      const response = await api.post('/konfi/login', { username, password });
      console.log('Konfi-Login erfolgreich:', response.data);
      const { token, user } = response.data;
      
      if (!token || !user) throw new Error('Fehlender Token oder Benutzer (Konfi)');
      
      localStorage.setItem('konfi_token', token);
      localStorage.setItem('konfi_user', JSON.stringify(user));
      
      return user;
    } catch (konfiError) {
      console.warn('Konfi-Login fehlgeschlagen:', konfiError?.response?.data || konfiError.message);
      throw new Error('Login fehlgeschlagen');
    }
  }
};

export const logout = () => {
  localStorage.removeItem('konfi_token');
  localStorage.removeItem('konfi_user');
};

export const checkAuth = () => {
  const token = localStorage.getItem('konfi_token');
  const rawUser = localStorage.getItem('konfi_user');

  if (token && rawUser) {
    try {
      return JSON.parse(rawUser);
    } catch (err) {
      console.error('Fehler beim Parsen von konfi_user:', err);
      localStorage.removeItem('konfi_user');
      return null;
    }
  }

  return null;
};

export const getToken = () => {
  return localStorage.getItem('konfi_token');
};

export const getUser = () => {
  const raw = localStorage.getItem('konfi_user');
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Fehler beim Parsen von konfi_user:', err);
    localStorage.removeItem('konfi_user');
    return null;
  }
};

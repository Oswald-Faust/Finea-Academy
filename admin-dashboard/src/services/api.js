import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification (désactivé pour accès libre)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('adminToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Intercepteur pour gérer les erreurs de réponse (redirection login désactivée)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion d'erreur sans redirection automatique
    console.error('Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Services utilisateurs
export const userAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  activateUser: (id, isActive) => api.put(`/users/${id}/activate`, { isActive }),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  getUserStats: () => api.get('/users/stats'),
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Services email/newsletter
export const emailAPI = {
  sendNewsletter: (data) => api.post('/email/newsletter', data),
  getNewsletterHistory: () => api.get('/email/newsletter/history'),
  getEmailTemplates: () => api.get('/email/templates'),
  createEmailTemplate: (data) => api.post('/email/templates', data),
  updateEmailTemplate: (id, data) => api.put(`/email/templates/${id}`, data),
  deleteEmailTemplate: (id) => api.delete(`/email/templates/${id}`),
};

// Service de santé de l'API
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
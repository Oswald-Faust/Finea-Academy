import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://finea-api-production.up.railway.app/api';

// Fonctions utilitaires
const getToken = () => {
  return localStorage.getItem('adminToken') || '';
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || `Erreur ${response.status}`);
  }
  return response.json();
};

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

// Service pour les statistiques du dashboard
export const dashboardAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getActivityStats: (period = '30d') => api.get(`/analytics/activity?period=${period}`),
  getRevenueStats: (period = '12m') => api.get(`/analytics/revenue?period=${period}`),
  getCoursePerformance: () => api.get('/analytics/courses/performance'),
  getUserDemographics: () => api.get('/analytics/users/demographics'),
};

// API pour les articles de blog
export const articleAPI = {
  // Créer un nouvel article
  createArticle: async (articleData) => {
    const formData = new FormData();
    
    // Ajouter les données de base
    formData.append('title', articleData.title);
    formData.append('content', JSON.stringify(articleData.content));
    formData.append('type', articleData.type || 'article');
    formData.append('status', articleData.status || 'draft');
    
    // Ajouter l'image de présentation si elle existe
    if (articleData.coverImage && articleData.coverImage.startsWith('data:')) {
      // Convertir base64 en fichier
      const response = await fetch(articleData.coverImage);
      const blob = await response.blob();
      formData.append('coverImage', blob, 'cover-image.jpg');
    }
    
    // Ajouter les autres champs
    if (articleData.tags) formData.append('tags', articleData.tags.join(','));
    if (articleData.scheduledFor) formData.append('scheduledFor', articleData.scheduledFor);
    if (articleData.targetUsers) formData.append('targetUsers', JSON.stringify(articleData.targetUsers));
    if (articleData.targetRoles) formData.append('targetRoles', JSON.stringify(articleData.targetRoles));
    if (articleData.targetSegments) formData.append('targetSegments', JSON.stringify(articleData.targetSegments));
    if (articleData.isGlobal !== undefined) formData.append('isGlobal', articleData.isGlobal);
    if (articleData.priority) formData.append('priority', articleData.priority);

    const response = await fetch(`${API_BASE_URL}/newsletters`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    return handleResponse(response);
  },

  // Récupérer tous les articles
  getArticles: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/newsletters?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Récupérer un article par ID
  getArticleById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Mettre à jour un article
  updateArticle: async (id, articleData) => {
    const formData = new FormData();
    
    // Ajouter les données de base
    if (articleData.title) formData.append('title', articleData.title);
    if (articleData.content) formData.append('content', JSON.stringify(articleData.content));
    if (articleData.status) formData.append('status', articleData.status);
    
    // Ajouter l'image de présentation si elle existe
    if (articleData.coverImage && articleData.coverImage.startsWith('data:')) {
      const response = await fetch(articleData.coverImage);
      const blob = await response.blob();
      formData.append('coverImage', blob, 'cover-image.jpg');
    }
    
    // Ajouter les autres champs
    if (articleData.tags) formData.append('tags', articleData.tags.join(','));
    if (articleData.scheduledFor) formData.append('scheduledFor', articleData.scheduledFor);
    if (articleData.targetUsers) formData.append('targetUsers', JSON.stringify(articleData.targetUsers));
    if (articleData.targetRoles) formData.append('targetRoles', JSON.stringify(articleData.targetRoles));
    if (articleData.targetSegments) formData.append('targetSegments', JSON.stringify(articleData.targetSegments));
    if (articleData.isGlobal !== undefined) formData.append('isGlobal', articleData.isGlobal);
    if (articleData.priority) formData.append('priority', articleData.priority);

    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    return handleResponse(response);
  },

  // Supprimer un article
  deleteArticle: async (id) => {
    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Publier un article
  publishArticle: async (id) => {
    const response = await fetch(`${API_BASE_URL}/newsletters/${id}/publish`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Upload d'image pour l'éditeur
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/newsletters/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    return handleResponse(response);
  },
};

// Service de santé de l'API
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
import axios from 'axios';

// Configuration automatique de l'URL selon l'environnement
const getApiBaseUrl = () => {
  // Si une variable d'environnement est définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Sinon, détecter automatiquement l'environnement
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return 'http://localhost:5001/api';
  } else {
    return 'https://finea-academy-1.onrender.com/api';
  }
};

const API_BASE_URL = getApiBaseUrl().trim();

// Log de l'environnement
console.log(`🌐 Admin Dashboard API Configuration:`);
console.log(`   Environment: ${process.env.NODE_ENV === 'development' ? 'Development' : 'Production'}`);
console.log(`   Base URL: ${API_BASE_URL}`);
console.log(`   Hostname: ${window.location.hostname}`);

// Fonctions utilitaires
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
//     const token = getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Intercepteur pour debug des requêtes
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Requête API:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  // Permissions d'alertes
  getAlertsPermissions: (id) => api.get(`/users/${id}/alerts-permissions`),
  updateAlertsPermissions: (id, permissions) => api.put(`/users/${id}/alerts-permissions`, permissions),
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
      body: formData,
    });

    return handleResponse(response);
  },

  // Supprimer un article
  deleteArticle: async (id) => {
    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
      method: 'DELETE',
      headers: {
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
      body: formData,
    });

    return handleResponse(response);
  },
};

// Services pour les notifications normales
export const notificationAPI = {
  // Récupérer toutes les notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  
  // Récupérer les notifications d'un utilisateur spécifique
  getUserNotifications: (userId, params = {}) => api.get(`/notifications/user/${userId}`, { params }),
  
  // Créer une nouvelle notification
  createNotification: (data) => api.post('/notifications', data),
  
  // Marquer une notification comme lue
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  
  // Marquer toutes les notifications comme lues
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  
  // Supprimer une notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Récupérer les statistiques des notifications
  getStats: () => api.get('/notifications/stats'),
};

// Services pour les notifications push
export const pushNotificationAPI = {
  // Statistiques des notifications push
  getStats: () => api.get('/push-notifications/stats'),
  
  // Liste des appareils connectés
  getDevices: (params = {}) => api.get('/push-notifications/devices', { params }),
  
  // Envoyer une notification push
  send: (data) => api.post('/push-notifications/send', data),
  
  // Envoyer une notification de test
  sendTest: (targetUserId) => api.post('/push-notifications/test', { targetUserId }),
  
  // Enregistrer un token FCM
  registerToken: (data) => api.post('/push-notifications/register', data),
  
  // Supprimer un token FCM
  unregisterToken: (deviceId) => api.delete('/push-notifications/unregister', { data: { deviceId } }),
};

// Services pour les actualités
export const newsAPI = {
  // Récupérer toutes les actualités
  getNews: (params = {}) => api.get('/news', { params }),
  
  // Récupérer une actualité par ID
  getNewsById: (id) => api.get(`/news/${id}`),
  
  // Récupérer l'actualité de la semaine actuelle
  getCurrentWeekNews: () => api.get('/news/current-week'),
  
  // Récupérer une actualité par semaine
  getNewsByWeek: (year, week) => api.get(`/news/week/${year}/${week}`),
  
  // Créer une nouvelle actualité
  createNews: (data) => api.post('/news', data),
  
  // Mettre à jour une actualité
  updateNews: (id, data) => api.put(`/news/${id}`, data),
  
  // Supprimer une actualité
  deleteNews: (id) => api.delete(`/news/${id}`),
  
  // Publier une actualité
  publishNews: (id) => api.patch(`/news/${id}/publish`),
  
  // Récupérer les statistiques des actualités
  getStats: () => api.get('/news/stats/overview'),
  
  // Upload d'image pour une actualité
  uploadImage: (formData) => api.post('/news/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Services pour les concours
export const contestAPI = {
  // Récupérer tous les concours
  getContests: (params = {}) => api.get('/contests', { params }),
  
  // Récupérer un concours par ID
  getContestById: (id) => api.get(`/contests/${id}`),
  
  // Créer un nouveau concours
  createContest: (data) => api.post('/contests', data),
  
  // Mettre à jour un concours
  updateContest: (id, data) => api.put(`/contests/${id}`, data),
  
  // Supprimer un concours
  deleteContest: (id) => api.delete(`/contests/${id}`),
  
  // Récupérer les statistiques des concours
  getStats: () => api.get('/contests/stats/overview'),
  
  // Autres actions spécifiques aux concours
  drawWinner: (id) => api.post(`/contests/${id}/draw`),
  publishResults: (id) => api.patch(`/contests/${id}/publish`),
  getParticipants: (id, params = {}) => api.get(`/contests/${id}/participants`, { params }),
  
  // Méthodes génériques pour les statistiques et gagnants
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),
};

// Service de santé de l'API
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
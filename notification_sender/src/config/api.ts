// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// En-têtes par défaut
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  // On pourra ajouter ici le token d'authentification plus tard
};

// Gestion des réponses d'erreur HTTP
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Une erreur est survenue');
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  return response.json();
};

export { API_BASE_URL, DEFAULT_HEADERS, handleResponse };

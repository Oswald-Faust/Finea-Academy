import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ArticleEditor from '../components/ArticleEditor';
import ArticlePreview from '../components/ArticlePreview';
import ArticleViewer from '../components/ArticleViewer';
import { newsAPI } from '../services/api';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    year: new Date().getFullYear(),
    page: 1,
    limit: 10
  });

  // États pour la création/édition
  const [newsData, setNewsData] = useState({
    title: '',
    content: null,
    coverImage: '',
    summary: '',
    status: 'draft',
    scheduledFor: '',
    tags: [],
    priority: 0
  });

  // Charger les actualités
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getNews(filters);
      
      if (response.data.success) {
        setNews(response.data.data.news);
      } else {
        toast.error('Erreur lors du chargement des actualités');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des actualités');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const fetchStats = async () => {
    try {
      const response = await newsAPI.getStats();
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchStats();
  }, [filters]);

  // Créer une nouvelle actualité
  const handleCreateNews = async () => {
    try {
      const response = await newsAPI.createNews(newsData);

      if (response.data.success) {
        toast.success('Actualité créée avec succès');
        setShowCreateModal(false);
        resetNewsData();
        fetchNews();
        fetchStats();
      } else {
        toast.error(response.data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création');
    }
  };

  // Mettre à jour une actualité
  const handleUpdateNews = async () => {
    try {
      const response = await newsAPI.updateNews(selectedNews._id, newsData);

      if (response.data.success) {
        toast.success('Actualité mise à jour avec succès');
        setShowEditModal(false);
        setSelectedNews(null);
        resetNewsData();
        fetchNews();
        fetchStats();
      } else {
        toast.error(response.data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Supprimer une actualité
  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      return;
    }

    try {
      const response = await newsAPI.deleteNews(newsId);

      if (response.data.success) {
        toast.success('Actualité supprimée avec succès');
        fetchNews();
        fetchStats();
      } else {
        toast.error(response.data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Publier une actualité
  const handlePublishNews = async (newsId) => {
    try {
      const response = await newsAPI.publishNews(newsId);

      if (response.data.success) {
        toast.success('Actualité publiée avec succès');
        fetchNews();
        fetchStats();
      } else {
        toast.error(response.data.error || 'Erreur lors de la publication');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  // Réinitialiser les données du formulaire
  const resetNewsData = () => {
    setNewsData({
      title: '',
      content: null,
      coverImage: '',
      summary: '',
      status: 'draft',
      scheduledFor: '',
      tags: [],
      priority: 0
    });
  };

  // Ouvrir le modal d'édition
  const openEditModal = (newsItem) => {
    setSelectedNews(newsItem);
    setNewsData({
      title: newsItem.title,
      content: newsItem.content,
      coverImage: newsItem.coverImage,
      summary: newsItem.summary,
      status: newsItem.status,
      scheduledFor: newsItem.scheduledFor ? new Date(newsItem.scheduledFor).toISOString().split('T')[0] : '',
      tags: newsItem.tags || [],
      priority: newsItem.priority
    });
    setShowEditModal(true);
  };

  // Ouvrir le modal de prévisualisation
  const openPreviewModal = (newsItem) => {
    setSelectedNews(newsItem);
    setShowPreviewModal(true);
  };

  // Ouvrir le modal de visualisation
  const openViewModal = (newsItem) => {
    setSelectedNews(newsItem);
    setShowViewModal(true);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircleIcon className="h-4 w-4" />;
      case 'scheduled': return <ClockIcon className="h-4 w-4" />;
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
          <p className="text-gray-600">Gérez les actualités hebdomadaires de Finéa Académie</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouvelle Actualité</span>
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publiées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planifiées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
              className="input-field"
            >
              <option value="">Tous les statuts</option>
              <option value="published">Publiées</option>
              <option value="scheduled">Planifiées</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value, page: 1})}
              className="input-field"
            >
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Éléments par page</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: e.target.value, page: 1})}
              className="input-field"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  status: '',
                  year: new Date().getFullYear(),
                  page: 1,
                  limit: 10
                });
              }}
              className="btn-secondary w-full"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des actualités */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semaine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.map((newsItem) => (
                <tr key={newsItem._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {newsItem.coverImage && (
                        <img
                          src={newsItem.coverImage}
                          alt="Cover"
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {newsItem.title}
                        </div>
                        {newsItem.summary && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {newsItem.summary}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {newsItem.weekOfYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(newsItem.status)}`}>
                      {getStatusIcon(newsItem.status)}
                      <span className="ml-1 capitalize">{newsItem.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {newsItem.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(newsItem.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewModal(newsItem)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openPreviewModal(newsItem)}
                        className="text-green-600 hover:text-green-900"
                        title="Prévisualiser"
                      >
                        <PhotoIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(newsItem)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {newsItem.status !== 'published' && (
                        <button
                          onClick={() => handlePublishNews(newsItem._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Publier"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNews(newsItem._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Créer une nouvelle actualité</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <ArticleEditor
                value={newsData.content}
                onChange={(content) => setNewsData({...newsData, content})}
                title={newsData.title}
                setTitle={(title) => setNewsData({...newsData, title})}
                coverImage={newsData.coverImage}
                setCoverImage={(coverImage) => setNewsData({...newsData, coverImage})}
              />
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
                  <textarea
                    value={newsData.summary}
                    onChange={(e) => setNewsData({...newsData, summary: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Résumé de l'actualité..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      value={newsData.status}
                      onChange={(e) => setNewsData({...newsData, status: e.target.value})}
                      className="input-field"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="scheduled">Planifié</option>
                      <option value="published">Publié</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                    <input
                      type="date"
                      value={newsData.scheduledFor}
                      onChange={(e) => setNewsData({...newsData, scheduledFor: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      value={newsData.priority}
                      onChange={(e) => setNewsData({...newsData, priority: parseInt(e.target.value)})}
                      className="input-field"
                    >
                      {Array.from({length: 11}, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateNews}
                  className="btn-primary"
                >
                  Créer l'actualité
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedNews && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Modifier l'actualité</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <ArticleEditor
                value={newsData.content}
                onChange={(content) => setNewsData({...newsData, content})}
                title={newsData.title}
                setTitle={(title) => setNewsData({...newsData, title})}
                coverImage={newsData.coverImage}
                setCoverImage={(coverImage) => setNewsData({...newsData, coverImage})}
              />
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
                  <textarea
                    value={newsData.summary}
                    onChange={(e) => setNewsData({...newsData, summary: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Résumé de l'actualité..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      value={newsData.status}
                      onChange={(e) => setNewsData({...newsData, status: e.target.value})}
                      className="input-field"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="scheduled">Planifié</option>
                      <option value="published">Publié</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                    <input
                      type="date"
                      value={newsData.scheduledFor}
                      onChange={(e) => setNewsData({...newsData, scheduledFor: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      value={newsData.priority}
                      onChange={(e) => setNewsData({...newsData, priority: parseInt(e.target.value)})}
                      className="input-field"
                    >
                      {Array.from({length: 11}, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateNews}
                  className="btn-primary"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreviewModal && selectedNews && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Prévisualisation</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <ArticlePreview article={selectedNews} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedNews && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Détails de l'actualité</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <ArticleViewer article={selectedNews} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;

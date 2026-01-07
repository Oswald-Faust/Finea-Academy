import React, { useState, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
  PlusIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  NewspaperIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { newsAPI } from '../services/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/TinyMCEEditor';
import ArticlePreview from '../components/ArticlePreview';
import ArticleViewer from '../components/ArticleViewer';

const News = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState(null);
  
  // États pour la création/édition
  const [articleTitle, setArticleTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleStatus, setArticleStatus] = useState('draft');
  const [scheduledFor, setScheduledFor] = useState('');
  const [priority, setPriority] = useState(0);
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchNews();
    fetchStats();
  }, [filters, filterStatus, searchTerm]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getNews({
        ...filters,
        status: filterStatus === 'all' ? undefined : filterStatus
      });

      if (response.data.success) {
        setNews(response.data.data.news || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Erreur lors du chargement des actualités');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await newsAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePublishNews = async () => {
    const hasContent = articleContent && articleContent.trim().length > 0;
    
    if (!articleTitle || !hasContent) {
      toast.error('Veuillez remplir le titre et le contenu de l\'actualité');
      return;
    }

    try {
      setLoading(true);
      
      const newsData = {
        title: articleTitle,
        content: articleContent,
        summary: articleSummary,
        status: 'published',
        priority: priority,
        scheduledFor: scheduledFor || null,
        tags: []
      };

      // Si on a une image de présentation, l'ajouter
      if (coverImage && coverImage.startsWith('data:')) {
        newsData.coverImage = coverImage;
      } else if (coverImage) {
        newsData.coverImage = coverImage;
      }

      let response;
      if (editingNews) {
        response = await newsAPI.updateNews(editingNews._id, newsData);
        toast.success('Actualité mise à jour avec succès !');
      } else {
        response = await newsAPI.createNews(newsData);
        toast.success('Actualité publiée avec succès !');
      }
      
      // Réinitialiser le formulaire
      resetForm();
      fetchNews();
      fetchStats();
      setActiveTab('list');
    } catch (error) {
      console.error('Error publishing news:', error);
      toast.error('Erreur lors de la publication de l\'actualité');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const hasContent = articleContent && articleContent.trim().length > 0;
    
    if (!articleTitle || !hasContent) {
      toast.error('Veuillez remplir le titre et le contenu de l\'actualité');
      return;
    }

    try {
      setLoading(true);
      
      const newsData = {
        title: articleTitle,
        content: articleContent,
        summary: articleSummary,
        status: 'draft',
        priority: priority,
        scheduledFor: scheduledFor || null,
        tags: []
      };

      if (coverImage && coverImage.startsWith('data:')) {
        newsData.coverImage = coverImage;
      } else if (coverImage) {
        newsData.coverImage = coverImage;
      }

      if (editingNews) {
        await newsAPI.updateNews(editingNews._id, newsData);
        toast.success('Brouillon mis à jour !');
      } else {
        await newsAPI.createNews(newsData);
        toast.success('Brouillon sauvegardé !');
      }
      
      resetForm();
      fetchNews();
      fetchStats();
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Erreur lors de la sauvegarde du brouillon');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setArticleTitle('');
    setCoverImage('');
    setArticleContent('');
    setArticleSummary('');
    setArticleStatus('draft');
    setScheduledFor('');
    setPriority(0);
    setShowPreview(false);
    setEditingNews(null);
  };

  const deleteNews = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      return;
    }

    try {
      const response = await newsAPI.deleteNews(id);
      if (response.data.success) {
        toast.success('Actualité supprimée avec succès');
        fetchNews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const publishNews = async (id) => {
    try {
      const response = await newsAPI.publishNews(id);
      if (response.data.success) {
        toast.success('Actualité publiée avec succès');
        fetchNews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error publishing news:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  const viewNews = async (id) => {
    try {
      const response = await newsAPI.getNewsById(id);
      if (response.data.success) {
        setSelectedNews(response.data.data);
        setShowViewer(true);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Erreur lors du chargement');
    }
  };

  const editNews = async (id) => {
    try {
      const response = await newsAPI.getNewsById(id);
      if (response.data.success) {
        const newsItem = response.data.data;
        setEditingNews(newsItem);
        setArticleTitle(newsItem.title);
        setArticleContent(newsItem.content || '');
        setArticleSummary(newsItem.summary || '');
        setCoverImage(newsItem.coverImage || '');
        setArticleStatus(newsItem.status);
        setScheduledFor(newsItem.scheduledFor ? new Date(newsItem.scheduledFor).toISOString().split('T')[0] : '');
        setPriority(newsItem.priority || 0);
        setActiveTab('compose');
      }
    } catch (error) {
      console.error('Error fetching news for edit:', error);
      toast.error('Erreur lors du chargement');
    }
  };

  const tabs = [
    { id: 'list', name: 'Actualités', icon: NewspaperIcon },
    { id: 'compose', name: 'Composer', icon: DocumentTextIcon },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publié' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programmé' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header avec style WordPress */}
      <div className="shadow-sm border-b">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <NewspaperIcon className="h-8 w-8 text-primary-600 mr-3" />
              Actualités
            </h1>
            <p className="mt-2 text-gray-600">
              Créez et gérez les actualités hebdomadaires de Finéa Académie
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Paramètres
            </button>
            <button 
              onClick={() => {
                resetForm();
                setActiveTab('compose');
              }}
              className="btn-primary flex items-center hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle Actualité
            </button>
          </div>
        </div>
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
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.published || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.draft || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation tabs style WordPress */}
      <div className="shadow-sm">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>


      {/* Contenu des tabs */}
      <div className="bg-white shadow-sm rounded-lg w-full">
        {/* Tab Liste des actualités */}
        {activeTab === 'list' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Toutes les Actualités</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="input-field pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="input-field"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="published">Publiés</option>
                  <option value="draft">Brouillons</option>
                  <option value="scheduled">Programmés</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actualité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semaine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNews.map((newsItem) => (
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
                            <div className="text-sm font-medium text-gray-900">{newsItem.title}</div>
                            <div className="text-sm text-gray-500">
                              {newsItem.coverImage ? '📷 Avec image' : '📝 Texte seulement'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(newsItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {newsItem.weekOfYear || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {newsItem.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {newsItem.publishedAt 
                            ? new Date(newsItem.publishedAt).toLocaleDateString('fr-FR')
                            : new Date(newsItem.createdAt).toLocaleDateString('fr-FR')
                          }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => viewNews(newsItem._id)}
                            className="text-primary-600 hover:text-primary-900" 
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                            {newsItem.status === 'draft' && (
                              <button 
                                onClick={() => publishNews(newsItem._id)}
                                className="text-green-600 hover:text-green-900" 
                                title="Publier"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button 
                              onClick={() => editNews(newsItem._id)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="Éditer"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          <button 
                              onClick={() => deleteNews(newsItem._id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {/* Tab Composer */}
        {activeTab === 'compose' && (
          <div className="p-6 w-full">
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingNews ? `Modifier l'actualité: ${editingNews.title}` : 'Créer une Actualité'}
              </h3>
              
              <RichTextEditor
                value={articleContent}
                onChange={setArticleContent}
                title={articleTitle}
                setTitle={setArticleTitle}
                coverImage={coverImage}
                setCoverImage={setCoverImage}
              />

              {/* Champs supplémentaires */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Résumé (optionnel)</label>
                  <textarea
                    value={articleSummary}
                    onChange={(e) => setArticleSummary(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Résumé de l'actualité pour l'aperçu..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                    <input
                      type="date"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {Array.from({length: 11}, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t mt-8">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-secondary flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Aperçu
                  </button>
                  {editingNews && (
                    <button
                      onClick={resetForm}
                      className="btn-secondary flex items-center"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Annuler l'édition
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="btn-secondary flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    ) : (
                      <BookmarkIcon className="h-4 w-4 mr-2" />
                    )}
                    {editingNews ? 'Mettre à jour' : 'Sauvegarder brouillon'}
                  </button>
                  <button
                    onClick={handlePublishNews}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    )}
                    {editingNews ? 'Mettre à jour et publier' : 'Publier l\'actualité'}
                  </button>
                </div>
              </div>
              
              {/* Aperçu de l'actualité */}
              {showPreview && (
                <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Aperçu de l'actualité</h4>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <ArticlePreview 
                      title={articleTitle}
                      coverImage={coverImage}
                      content={articleContent}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* News Viewer Modal */}
      {showViewer && selectedNews && (
        <ArticleViewer
          article={selectedNews}
          onClose={() => {
            setShowViewer(false);
            setSelectedNews(null);
          }}
        />
      )}
    </div>
  );
};

export default News;

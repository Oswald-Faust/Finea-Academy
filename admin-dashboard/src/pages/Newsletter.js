import React, { useState, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  PlusIcon,
  PhotoIcon,
  LinkIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ClockIcon,
  PaintBrushIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  BookmarkIcon,
  EnvelopeIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { emailAPI, userAPI, articleAPI } from '../services/api';
import toast from 'react-hot-toast';
import ArticleEditor from '../components/ArticleEditor';
import ArticlePreview from '../components/ArticlePreview';

const Newsletter = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [newsletterData, setNewsletterData] = useState({
    title: '',
    subject: '',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Finéa Académie</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Newsletter</p>
        </header>
        
        <main style="padding: 40px 30px;">
          <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Bonjour !</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Voici les dernières nouvelles de Finéa Académie...
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">💡 Astuce du jour</h3>
            <p style="color: #666; margin-bottom: 0;">Ajoutez votre contenu ici...</p>
          </div>
          
          <a href="#" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            En savoir plus
          </a>
        </main>
        
        <footer style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            © 2024 Finéa Académie. Tous droits réservés.
          </p>
        </footer>
      </div>
    `,
    recipients: 'all',
    template: 'default',
    scheduledFor: '',
    preheader: '',
    senderName: 'Finéa Académie',
    senderEmail: 'contact@finea-academie.com',
    status: 'draft',
  });
  
  const [articles, setArticles] = useState([]);
  const [userStats, setUserStats] = useState({ totalUsers: 250, activeUsers: 180 });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editorMode, setEditorMode] = useState('visual');
  const [articleTitle, setArticleTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [articleContent, setArticleContent] = useState();
  const [showPreview, setShowPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les articles depuis l'API
      const articlesResponse = await articleAPI.getArticles({
        page: currentPage,
        limit: 10,
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm || undefined,
        type: 'article'
      });

      setArticles(articlesResponse.data || []);
      setTotalPages(articlesResponse.pagination?.pages || 1);

      // Récupérer les stats utilisateurs
      const statsResponse = await userAPI.getUserStats();
      setUserStats(statsResponse.data || { totalUsers: 0, activeUsers: 0 });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePublishArticle = async () => {
    if (!articleTitle || !articleContent) {
      toast.error('Veuillez remplir le titre et le contenu de l\'article');
      return;
    }

    try {
      setLoading(true);
      
      const articleData = {
        title: articleTitle,
        content: articleContent,
        type: 'article',
        status: 'published',
        tags: [],
        isGlobal: true,
        priority: 'normal'
      };

      // Si on a une image de présentation, l'ajouter
      if (coverImage && coverImage.startsWith('data:')) {
        articleData.coverImage = coverImage;
      }

      const response = await articleAPI.createArticle(articleData);
      
      toast.success('Article publié avec succès !');
      
      // Réinitialiser le formulaire
      setArticleTitle('');
      setCoverImage('');
      setArticleContent(null);
      setShowPreview(false);
      
      // Recharger la liste des articles
      fetchData();
      
      // Aller à l'onglet campagnes
      setActiveTab('campaigns');
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Erreur lors de la publication de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!articleTitle || !articleContent) {
      toast.error('Veuillez remplir le titre et le contenu de l\'article');
      return;
    }

    try {
      setLoading(true);
      
      const articleData = {
        title: articleTitle,
        content: articleContent,
        type: 'article',
      status: 'draft',
        tags: [],
        isGlobal: true,
        priority: 'normal'
      };

      if (coverImage && coverImage.startsWith('data:')) {
        articleData.coverImage = coverImage;
      }

      await articleAPI.createArticle(articleData);
      
    toast.success('Brouillon sauvegardé !');
      
      // Réinitialiser le formulaire
      setArticleTitle('');
      setCoverImage('');
      setArticleContent(null);
      setShowPreview(false);
      
      // Recharger la liste des articles
      fetchData();
      
      // Aller à l'onglet campagnes
      setActiveTab('campaigns');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Erreur lors de la sauvegarde du brouillon');
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      await articleAPI.deleteArticle(id);
      toast.success('Article supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Erreur lors de la suppression de l\'article');
    }
  };

  const publishArticle = async (id) => {
    try {
      await articleAPI.publishArticle(id);
      toast.success('Article publié avec succès');
      fetchData();
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Erreur lors de la publication de l\'article');
    }
  };

  const tabs = [
    { id: 'campaigns', name: 'Articles', icon: CalendarIcon },
    { id: 'compose', name: 'Composer', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publié' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programmé' },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En cours' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header avec style WordPress */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <EnvelopeIcon className="h-8 w-8 text-primary-600 mr-3" />
              Articles de Blog
            </h1>
            <p className="mt-2 text-gray-600">
              Créez et gérez vos articles de blog avec notre éditeur avancé
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Paramètres
            </button>
            <button 
              onClick={() => setActiveTab('compose')}
              className="btn-primary flex items-center hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvel Article
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs style WordPress */}
      <div className="bg-white shadow-sm">
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

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-100">Utilisateurs Totaux</p>
              <p className="text-2xl font-bold">{userStats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-100">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold">{userStats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-100">Articles Publiés</p>
              <p className="text-2xl font-bold">{articles.filter(a => a.status === 'published').length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-100">Brouillons</p>
              <p className="text-2xl font-bold">{articles.filter(a => a.status === 'draft').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu des tabs */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Tab Articles */}
        {activeTab === 'campaigns' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tous les Articles</h3>
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
                        Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auteur
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
                    {filteredArticles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                            <div className="text-sm font-medium text-gray-900">{article.title}</div>
                            <div className="text-sm text-gray-500">
                              {article.coverImage ? '📷 Avec image' : '📝 Texte seulement'}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {article.createdBy?.firstName} {article.createdBy?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.publishedAt 
                            ? new Date(article.publishedAt).toLocaleDateString('fr-FR')
                            : new Date(article.createdAt).toLocaleDateString('fr-FR')
                          }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900" title="Voir">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                            {article.status === 'draft' && (
                              <button 
                                onClick={() => publishArticle(article._id)}
                                className="text-green-600 hover:text-green-900" 
                                title="Publier"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900" title="Éditer">
                              <PencilIcon className="h-5 w-5" />
                          </button>
                          <button 
                              onClick={() => deleteArticle(article._id)}
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
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Créer un Article de Blog</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sujet de l'email *</label>
                  <input type="text" name="subject" value={newsletterData.subject} onChange={handleInputChange} className="input-field" placeholder="Objet de votre email" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expéditeur</label>
                  <input type="text" name="senderName" value={newsletterData.senderName} onChange={handleInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email expéditeur</label>
                  <input type="email" name="senderEmail" value={newsletterData.senderEmail} onChange={handleInputChange} className="input-field" />
                </div>
              </div>
              <ArticleEditor
                value={articleContent}
                onChange={setArticleContent}
                title={articleTitle}
                setTitle={setArticleTitle}
                coverImage={coverImage}
                setCoverImage={setCoverImage}
              />
              <div className="flex justify-between items-center pt-6 border-t mt-8">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-secondary flex items-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Aperçu
                </button>
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
                    Sauvegarder brouillon
                  </button>
                  <button
                    onClick={handlePublishArticle}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    )}
                    Publier l'article
                  </button>
                </div>
              </div>
              
              {/* Aperçu de l'article */}
              {showPreview && (
                <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Aperçu de l'article</h4>
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

        {/* Tab Analytics */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques des Articles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="card text-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {articles.length}
                </div>
                <div className="text-sm text-gray-500">Total d'articles</div>
              </div>
              
              <div className="card text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'published').length}
                </div>
                <div className="text-sm text-gray-500">Articles publiés</div>
              </div>
              
              <div className="card text-center">
                <BookmarkIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-500">Brouillons</div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Articles récents</h4>
              <div className="space-y-4">
                {articles.slice(0, 5).map((article) => (
                  <div key={article._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{article.title}</div>
                      <div className="text-sm text-gray-500">
                        {article.createdBy?.firstName} {article.createdBy?.lastName} • 
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(article.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
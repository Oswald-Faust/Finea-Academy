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
  EnvelopeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { emailAPI, userAPI, articleAPI } from '../services/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/TinyMCEEditor';
import ArticlePreview from '../components/ArticlePreview';
import ArticleViewer from '../components/ArticleViewer';

const Newsletter = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [newsletterData, setNewsletterData] = useState({
    title: '',
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
    status: 'draft',
  });
  
  const [articles, setArticles] = useState([]);
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
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

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
    // Vérification du contenu HTML (TinyMCE retourne du HTML)
    const hasContent = articleContent && articleContent.trim().length > 0;
    
    console.log('🔍 Validation du contenu (Publier):', {
      articleTitle,
      contentLength: articleContent?.length || 0,
      hasContent
    });
    
    if (!articleTitle || !hasContent) {
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

      console.log('💾 Données envoyées au backend (publication):', articleData);

      // Si on a une image de présentation, l'ajouter
      if (coverImage && coverImage.startsWith('data:')) {
        articleData.coverImage = coverImage;
      }

      let response;
      if (editingArticle) {
        // Mise à jour d'un article existant
        response = await articleAPI.updateArticle(editingArticle._id, articleData);
        toast.success('Article mis à jour avec succès !');
      } else {
        // Création d'un nouvel article
        response = await articleAPI.createArticle(articleData);
        toast.success('Article publié avec succès !');
      }
      
      // Réinitialiser le formulaire
      setArticleTitle('');
      setCoverImage('');
      setArticleContent(null);
      setShowPreview(false);
      setEditingArticle(null);
      
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
    // Vérification du contenu HTML (TinyMCE retourne du HTML)
    const hasContent = articleContent && articleContent.trim().length > 0;
    
    console.log('🔍 Validation du contenu (Brouillon):', {
      articleTitle,
      contentLength: articleContent?.length || 0,
      hasContent
    });
    
    if (!articleTitle || !hasContent) {
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

      console.log('💾 Données envoyées au backend:', articleData);

      if (coverImage && coverImage.startsWith('data:')) {
        articleData.coverImage = coverImage;
      }

      if (editingArticle) {
        // Mise à jour d'un article existant
        await articleAPI.updateArticle(editingArticle._id, articleData);
        toast.success('Brouillon mis à jour !');
      } else {
        // Création d'un nouvel article
        await articleAPI.createArticle(articleData);
        toast.success('Brouillon sauvegardé !');
      }
      
      // Réinitialiser le formulaire
      setArticleTitle('');
      setCoverImage('');
      setArticleContent(null);
      setShowPreview(false);
      setEditingArticle(null);
      
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

  const viewArticle = async (id) => {
    try {
      const response = await articleAPI.getArticleById(id);
      setSelectedArticle(response.data);
      setShowViewer(true);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Erreur lors du chargement de l\'article');
    }
  };

  const editArticle = async (id) => {
    try {
      const response = await articleAPI.getArticleById(id);
      setEditingArticle(response.data);
      setArticleTitle(response.data.title);
      setArticleContent(response.data.content);
      setCoverImage(response.data.coverImage || '');
      setActiveTab('compose');
    } catch (error) {
      console.error('Error fetching article for edit:', error);
      toast.error('Erreur lors du chargement de l\'article');
    }
  };

  const tabs = [
    { id: 'campaigns', name: 'Articles', icon: CalendarIcon },
    { id: 'compose', name: 'Composer', icon: DocumentTextIcon },
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
    <div className="space-y-6 w-full">
      {/* Header avec style WordPress */}
      <div className="shadow-sm border-b">
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
                          <button 
                            onClick={() => viewArticle(article._id)}
                            className="text-primary-600 hover:text-primary-900" 
                            title="Voir"
                          >
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
                            <button 
                              onClick={() => editArticle(article._id)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="Éditer"
                            >
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
          <div className="p-6 w-full">
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingArticle ? `Modifier l'article: ${editingArticle.title}` : 'Créer un Article de Blog'}
              </h3>
        <RichTextEditor
          value={articleContent}
          onChange={setArticleContent}
          title={articleTitle}
          setTitle={setArticleTitle}
          coverImage={coverImage}
          setCoverImage={setCoverImage}
        />
              <div className="flex justify-between items-center pt-6 border-t mt-8">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-secondary flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Aperçu
                  </button>
                  {editingArticle && (
                    <button
                      onClick={() => {
                        setEditingArticle(null);
                        setArticleTitle('');
                        setArticleContent(null);
                        setCoverImage('');
                      }}
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
                    {editingArticle ? 'Mettre à jour' : 'Sauvegarder brouillon'}
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
                    {editingArticle ? 'Mettre à jour et publier' : 'Publier l\'article'}
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

      </div>

      {/* Article Viewer Modal */}
      {showViewer && selectedArticle && (
        <ArticleViewer
          article={selectedArticle}
          onClose={() => {
            setShowViewer(false);
            setSelectedArticle(null);
          }}
        />
      )}
    </div>
  );
};

export default Newsletter;
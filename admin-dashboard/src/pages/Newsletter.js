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
} from '@heroicons/react/24/outline';
import { emailAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

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
  
  const [campaigns, setCampaigns] = useState([
    {
      _id: '1',
      title: 'Newsletter de bienvenue',
      subject: 'Bienvenue dans Finéa Académie !',
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipients: 150,
      openRate: 65,
      clickRate: 12,
    },
    {
      _id: '2',
      title: 'Nouvelles fonctionnalités',
      subject: 'Découvrez nos nouvelles fonctionnalités',
      status: 'draft',
      recipients: 200,
      scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    },
  ]);
  
  const [templates, setTemplates] = useState([
    {
      _id: '1',
      name: 'Template par défaut',
      description: 'Template moderne avec header gradient',
      thumbnail: '',
      content: newsletterData.content,
      category: 'general',
      isDefault: true,
    },
    {
      _id: '2',
      name: 'Template promotionnel',
      description: 'Parfait pour les offres spéciales',
      thumbnail: '',
      content: '<div>Template promotionnel...</div>',
      category: 'promo',
    },
    {
      _id: '3',
      name: 'Template newsletter',
      description: 'Template pour les newsletters régulières',
      thumbnail: '',
      content: '<div>Template newsletter...</div>',
      category: 'newsletter',
    },
  ]);
  
  const [userStats, setUserStats] = useState({ totalUsers: 250, activeUsers: 180 });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editorMode, setEditorMode] = useState('visual'); // visual ou code

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Données mockées pour la démo
      const mockCampaigns = campaigns;
      const mockTemplates = templates;
      const mockStats = { totalUsers: 250, activeUsers: 180 };

      setCampaigns(mockCampaigns);
      setTemplates(mockTemplates);
      setUserStats(mockStats);
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendNewsletter = async () => {
    if (!newsletterData.subject || !newsletterData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      // Créer une nouvelle campagne
      const newCampaign = {
        _id: Date.now().toString(),
        title: newsletterData.title || newsletterData.subject,
        subject: newsletterData.subject,
        content: newsletterData.content,
        status: newsletterData.scheduledFor ? 'scheduled' : 'sent',
        sentAt: newsletterData.scheduledFor || new Date().toISOString(),
        recipients: userStats.totalUsers,
        openRate: Math.floor(Math.random() * 40) + 40, // 40-80%
        clickRate: Math.floor(Math.random() * 20) + 5,  // 5-25%
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      
      toast.success('Newsletter programmée avec succès !');
      setNewsletterData(prev => ({ ...prev, title: '', subject: '', content: '' }));
      setActiveTab('campaigns');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la newsletter');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftCampaign = {
      _id: Date.now().toString(),
      title: newsletterData.title || 'Brouillon sans titre',
      subject: newsletterData.subject,
      content: newsletterData.content,
      status: 'draft',
      recipients: userStats.totalUsers,
    };

    setCampaigns(prev => [draftCampaign, ...prev]);
    toast.success('Brouillon sauvegardé !');
  };

  const applyTemplate = (template) => {
    setNewsletterData(prev => ({
      ...prev,
      content: template.content,
      template: template._id,
    }));
    setSelectedTemplate(template);
    setActiveTab('compose');
    toast.success(`Template "${template.name}" appliqué !`);
  };

  const deleteCampaign = (id) => {
    setCampaigns(prev => prev.filter(c => c._id !== id));
    toast.success('Campagne supprimée');
  };

  const tabs = [
    { id: 'campaigns', name: 'Campagnes', icon: CalendarIcon },
    { id: 'compose', name: 'Composer', icon: DocumentTextIcon },
    { id: 'templates', name: 'Templates', icon: PaintBrushIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { bg: 'bg-green-100', text: 'text-green-800', label: 'Envoyée' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programmée' },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En cours' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
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
              Newsletter & Email Marketing
            </h1>
            <p className="mt-2 text-gray-600">
              Créez et gérez vos campagnes email comme un pro avec notre éditeur avancé
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
              Nouvelle Campagne
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
              <p className="text-sm font-medium text-blue-100">Abonnés Totaux</p>
              <p className="text-2xl font-bold">{userStats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-100">Abonnés Actifs</p>
              <p className="text-2xl font-bold">{userStats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <PaperAirplaneIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-100">Campagnes Envoyées</p>
              <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-100">Taux d'Ouverture Moyen</p>
              <p className="text-2xl font-bold">
                {campaigns.filter(c => c.openRate).length > 0 
                  ? Math.round(campaigns.filter(c => c.openRate).reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.openRate).length)
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu des tabs */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Tab Campagnes */}
        {activeTab === 'campaigns' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Toutes les Campagnes</h3>
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
                  <option value="sent">Envoyées</option>
                  <option value="draft">Brouillons</option>
                  <option value="scheduled">Programmées</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campagne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destinataires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
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
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                          <div className="text-sm text-gray-500">{campaign.subject}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.recipients} abonnés
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.openRate ? (
                          <div className="text-sm">
                            <div className="text-gray-900">📧 {campaign.openRate}% ouvertures</div>
                            <div className="text-gray-500">🖱️ {campaign.clickRate}% clics</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString('fr-FR') : 
                         campaign.scheduledFor ? new Date(campaign.scheduledFor).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900" title="Voir">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900" title="Dupliquer">
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => deleteCampaign(campaign._id)}
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
          </div>
        )}

        {/* Tab Composer */}
        {activeTab === 'compose' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Composer une Nouvelle Campagne</h3>
              
              {/* Informations de la campagne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la campagne
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newsletterData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ma nouvelle campagne"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de l'email *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={newsletterData.subject}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Objet de votre email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expéditeur
                  </label>
                  <input
                    type="text"
                    name="senderName"
                    value={newsletterData.senderName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email expéditeur
                  </label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={newsletterData.senderEmail}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataires
                  </label>
                  <select
                    name="recipients"
                    value={newsletterData.recipients}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="all">Tous les utilisateurs ({userStats.totalUsers})</option>
                    <option value="active">Utilisateurs actifs ({userStats.activeUsers})</option>
                    <option value="new">Nouveaux utilisateurs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programmer l'envoi (optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledFor"
                    value={newsletterData.scheduledFor}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Éditeur */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenu de l'email *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditorMode('visual')}
                      className={`px-3 py-1 text-sm rounded ${
                        editorMode === 'visual' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Visuel
                    </button>
                    <button
                      onClick={() => setEditorMode('code')}
                      className={`px-3 py-1 text-sm rounded ${
                        editorMode === 'code' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Code HTML
                    </button>
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="btn-secondary flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Aperçu
                    </button>
                  </div>
                </div>

                {editorMode === 'code' ? (
                  <textarea
                    name="content"
                    value={newsletterData.content}
                    onChange={handleInputChange}
                    className="input-field font-mono text-sm"
                    rows={20}
                    placeholder="Contenu HTML de votre newsletter..."
                  />
                ) : (
                  <div className="border border-gray-300 rounded-lg">
                    <div className="border-b bg-gray-50 p-3 flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-200 rounded" title="Gras">
                        <strong>B</strong>
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded" title="Italique">
                        <em>I</em>
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded" title="Lien">
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded" title="Image">
                        <PhotoIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      name="content"
                      value={newsletterData.content}
                      onChange={handleInputChange}
                      className="w-full p-4 border-0 focus:ring-0 resize-none"
                      rows={20}
                      placeholder="Écrivez votre newsletter ici..."
                    />
                  </div>
                )}
              </div>

              {/* Aperçu */}
              {previewMode && (
                <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Aperçu de l'email</h4>
                  <div 
                    className="bg-white p-4 rounded border"
                    dangerouslySetInnerHTML={{ __html: newsletterData.content }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={handleSaveDraft}
                  className="btn-secondary flex items-center"
                >
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Sauvegarder brouillon
                </button>
                
                <div className="flex space-x-3">
                  <button className="btn-secondary">
                    Envoyer un test
                  </button>
                  <button
                    onClick={handleSendNewsletter}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    )}
                    {newsletterData.scheduledFor ? 'Programmer' : 'Envoyer maintenant'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Templates */}
        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Templates Email</h3>
              <button className="btn-primary flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.isDefault && (
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => applyTemplate(template)}
                        className="flex-1 btn-primary text-sm"
                      >
                        Utiliser
                      </button>
                      <button className="btn-secondary text-sm">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Analytics */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques des Campagnes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="card text-center">
                <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.openRate).length > 0 
                    ? Math.round(campaigns.filter(c => c.openRate).reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.openRate).length)
                    : 0
                  }%
                </div>
                <div className="text-sm text-gray-500">Taux d'ouverture moyen</div>
              </div>
              
              <div className="card text-center">
                <EyeIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.clickRate).length > 0 
                    ? Math.round(campaigns.filter(c => c.clickRate).reduce((sum, c) => sum + c.clickRate, 0) / campaigns.filter(c => c.clickRate).length)
                    : 0
                  }%
                </div>
                <div className="text-sm text-gray-500">Taux de clic moyen</div>
              </div>
              
              <div className="card text-center">
                <UserGroupIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + (c.recipients || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Emails envoyés total</div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Performance par Campagne</h4>
              <div className="space-y-4">
                {campaigns.filter(c => c.status === 'sent').map((campaign) => (
                  <div key={campaign._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-sm text-gray-500">{campaign.subject}</div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{campaign.recipients}</div>
                        <div className="text-gray-500">Envoyés</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{campaign.openRate}%</div>
                        <div className="text-gray-500">Ouvertures</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{campaign.clickRate}%</div>
                        <div className="text-gray-500">Clics</div>
                      </div>
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
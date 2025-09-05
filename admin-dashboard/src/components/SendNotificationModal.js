import React, { useState } from 'react';
import {
  XMarkIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  PlayIcon,
  CalendarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Configuration automatique de l'URL selon l'environnement
const getApiBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return 'http://localhost:5000/api';
  } else {
    return 'https://finea-api.up.railway.app/api';
  }
};

const SendNotificationModal = ({ isOpen, onClose, user, onNotificationSent }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    scheduledFor: '',
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const templates = [
    {
      id: 'welcome',
      name: 'Bienvenue',
      title: 'Bienvenue sur Finéa Académie !',
      message: 'Nous sommes ravis de vous accueillir dans notre communauté. Commencez votre parcours d\'apprentissage dès maintenant !',
      type: 'success',
      icon: '🎉',
    },
    {
      id: 'reminder',
      name: 'Rappel de cours',
      title: 'Rappel : Votre cours vous attend',
      message: 'N\'oubliez pas de continuer votre formation. Votre progression vous attend !',
      type: 'info',
      icon: '📚',
    },
    {
      id: 'achievement',
      name: 'Félicitations',
      title: 'Félicitations ! Objectif atteint',
      message: 'Vous avez accompli un objectif important. Continuez sur cette lancée !',
      type: 'success',
      icon: '🏆',
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      title: 'Maintenance prévue',
      message: 'Une maintenance est prévue. Veuillez sauvegarder votre travail.',
      type: 'warning',
      icon: '🔧',
    },
    {
      id: 'promotion',
      name: 'Promotion',
      title: 'Offre spéciale pour vous !',
      message: 'Profitez de notre offre spéciale sur les formations premium.',
      type: 'info',
      icon: '💎',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Le titre et le message sont requis');
      return;
    }

    try {
      setLoading(true);
      
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority,
        status: formData.scheduledFor ? 'scheduled' : 'sent',
        targetUsers: [user._id],
        isGlobal: false,
        metadata: {
          ...formData.metadata,
          sentBy: 'admin',
          template: selectedTemplate?.id || 'custom',
        },
        ...(formData.scheduledFor && { scheduledFor: new Date(formData.scheduledFor).toISOString() }),
      };

      const response = await fetch(`${getApiBaseUrl()}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Notification envoyée avec succès !');
        onNotificationSent && onNotificationSent();
        handleClose();
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi de la notification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      scheduledFor: '',
      metadata: {},
    });
    setSelectedTemplate(null);
    setShowAdvanced(false);
    setPreviewMode(false);
    onClose();
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
      type: template.type,
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Envoyer une notification
              </h3>
              <p className="text-sm text-gray-500">
                à {user?.fullName || user?.firstName || 'l\'utilisateur'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Templates */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Modèles rapides</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{template.icon}</span>
                      <span className="text-xs font-medium text-gray-700">
                        {template.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{template.title}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type de notification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de notification
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'info', label: 'Info', color: 'blue' },
                    { value: 'success', label: 'Succès', color: 'green' },
                    { value: 'warning', label: 'Attention', color: 'yellow' },
                    { value: 'error', label: 'Erreur', color: 'red' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.type === type.value
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {getTypeIcon(type.value)}
                        <span className="text-xs font-medium text-gray-700">
                          {type.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full input-field"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la notification"
                  className="w-full input-field"
                  maxLength={200}
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Contenu de la notification"
                  rows={4}
                  className="w-full input-field resize-none"
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/1000 caractères
                </div>
              </div>

              {/* Programmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programmer l'envoi (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  className="w-full input-field"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour envoyer immédiatement
                </p>
              </div>

              {/* Options avancées */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Options avancées</span>
                </button>
              </div>

              {showAdvanced && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Métadonnées personnalisées (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify(formData.metadata, null, 2)}
                      onChange={(e) => {
                        try {
                          const metadata = JSON.parse(e.target.value);
                          setFormData({ ...formData, metadata });
                        } catch (error) {
                          // Ignore les erreurs de parsing
                        }
                      }}
                      placeholder='{"key": "value"}'
                      rows={3}
                      className="w-full input-field font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Aperçu */}
              <div>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Aperçu de la notification</span>
                </button>
              </div>

              {previewMode && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    {getTypeIcon(formData.type)}
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.title || 'Titre de la notification'}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                        {formData.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{formData.message || 'Contenu de la notification'}</p>
                  {formData.scheduledFor && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Programmée pour le {new Date(formData.scheduledFor).toLocaleString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 btn-secondary"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <BellIcon className="h-4 w-4 mr-2" />
                      {formData.scheduledFor ? 'Programmer' : 'Envoyer'}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationModal; 
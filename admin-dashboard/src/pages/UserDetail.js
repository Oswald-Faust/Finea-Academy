import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  PhotoIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import SendNotificationModal from '../components/SendNotificationModal';
import NotificationHistoryModal from '../components/NotificationHistoryModal';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    read: 0,
    unread: 0,
    sent: 0,
    failed: 0,
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUser();
    fetchUserNotifications();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await userAPI.getUserById(id);
      const userData = response.data.data || response.data.user;
      setUser(userData);
      setFormData({
        name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        role: userData.role || 'user',
        isActive: userData.isActive !== false,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'utilisateur');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      await userAPI.updateUser(id, formData);
      toast.success('Utilisateur mis à jour avec succès');
      setEditing(false);
      fetchUser();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        await userAPI.deleteUser(id);
        toast.success('Utilisateur supprimé avec succès');
        navigate('/users');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleStatusToggle = async () => {
    try {
      await userAPI.activateUser(id, !user.isActive);
      toast.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`);
      fetchUser();
    } catch (error) {
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const fetchUserNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user/${id}?limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        
        // Calculer les statistiques
        const stats = {
          total: data.data.length,
          read: data.data.filter(n => n.readBy?.some(r => r.user === id)).length,
          unread: data.data.filter(n => !n.readBy?.some(r => r.user === id)).length,
          sent: data.data.filter(n => n.status === 'sent').length,
          failed: data.data.filter(n => n.status === 'failed').length,
        };
        setNotificationStats(stats);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationSent = () => {
    fetchUserNotifications();
    toast.success('Notification envoyée avec succès !');
  };

  const getNotificationTypeIcon = (type) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Utilisateur non trouvé</h3>
        <Link to="/users" className="mt-4 btn-primary inline-flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/users"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur sans nom'}
            </h1>
            <p className="text-gray-600">ID: {user._id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStatusToggle}
            className={`btn-secondary flex items-center ${
              user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
            }`}
          >
            {user.isActive ? (
              <>
                <XCircleIcon className="h-4 w-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Activer
              </>
            )}
          </button>
          
          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            {editing ? 'Annuler' : 'Modifier'}
          </button>
          
          <button
            onClick={handleDelete}
            className="btn-secondary text-red-600 hover:text-red-700 flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
              {editing && (
                <button
                  onClick={handleSave}
                  className="btn-primary"
                >
                  Sauvegarder
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nom de l'utilisateur"
                  />
                ) : (
                  <p className="text-gray-900">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Non défini'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="email@exemple.com"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                {editing ? (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                    <option value="moderator">Modérateur</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    {user.role === 'admin' && <ShieldCheckIcon className="h-4 w-4 text-red-500 mr-2" />}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : user.role === 'moderator'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                {editing ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Compte actif</span>
                  </label>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Inactif
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité récente</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">Dernière connexion:</span>
                <span className="font-medium text-gray-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">Compte créé:</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-600">Dernière modification:</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.updatedAt).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="card text-center">
            <div className="mb-4">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-700">
                    {user.fullName?.charAt(0) || user.firstName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
            </div>
            <h4 className="text-lg font-medium text-gray-900">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'}</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
            <button className="mt-4 btn-secondary w-full flex items-center justify-center">
              <PhotoIcon className="h-4 w-4 mr-2" />
              Changer la photo
            </button>
          </div>

          {/* Actions rapides */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h4>
            <div className="space-y-3">
              <button className="w-full btn-secondary flex items-center justify-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Envoyer un email
              </button>
              <button className="w-full btn-secondary flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Voir l'historique
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connexions totales:</span>
                <span className="text-sm font-medium text-gray-900">{user.loginCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Emails reçus:</span>
                <span className="text-sm font-medium text-gray-900">{user.emailsReceived || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Statut du compte:</span>
                <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
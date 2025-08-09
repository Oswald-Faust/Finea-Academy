import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BellIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import SendNotificationModal from '../components/SendNotificationModal';
import NotificationHistoryModal from '../components/NotificationHistoryModal';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchUserDetails();
    fetchUserNotifications();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://finea-api-production.up.railway.app/api/users/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
      } else {
        toast.error('Erreur lors du chargement des détails utilisateur');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Erreur lors du chargement des détails utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotifications = async () => {
    try {
      const response = await fetch(`https://finea-api-production.up.railway.app/api/notifications/user/${userId}?limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        
        // Calculer les statistiques
        const stats = {
          total: data.data.length,
          read: data.data.filter(n => n.readBy?.some(r => r.user === userId)).length,
          unread: data.data.filter(n => !n.readBy?.some(r => r.user === userId)).length,
          sent: data.data.filter(n => n.status === 'sent').length,
          failed: data.data.filter(n => n.status === 'failed').length,
        };
        setNotificationStats(stats);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const response = await fetch(`https://finea-api-production.up.railway.app/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({ ...prev, isActive: !prev.isActive }));
        toast.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`);
      } else {
        toast.error('Erreur lors de la modification du statut');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`https://finea-api-production.up.railway.app/api/users/${userId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          toast.success('Utilisateur supprimé avec succès');
          navigate('/users');
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleNotificationSent = () => {
    fetchUserNotifications();
    toast.success('Notification envoyée avec succès !');
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-4 h-4 mr-1" />
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <XCircleIcon className="w-4 h-4 mr-1" />
        Inactif
      </span>
    );
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
        return <BellIcon className="h-5 w-5 text-blue-500" />;
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Utilisateur non trouvé</h2>
        <Link to="/users" className="btn-primary">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux utilisateurs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/users" className="btn-secondary">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'}
            </h1>
            <p className="text-gray-600">ID: {user._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(user.isActive)}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <BellIcon className="h-5 w-5 mr-2" />
            Envoyer une notification
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Aperçu', icon: UserIcon },
            { id: 'notifications', name: 'Notifications', icon: BellIcon },
            { id: 'activity', name: 'Activité', icon: ChartBarIcon },
            { id: 'settings', name: 'Paramètres', icon: CogIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations utilisateur */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date d'inscription</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dernière connexion</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Jamais connecté'}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques des notifications */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques des notifications</h3>
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Voir l'historique complet
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{notificationStats.total}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{notificationStats.read}</div>
                  <div className="text-sm text-green-600">Lues</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{notificationStats.unread}</div>
                  <div className="text-sm text-yellow-600">Non lues</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{notificationStats.failed}</div>
                  <div className="text-sm text-red-600">Échouées</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <BellIcon className="h-5 w-5 mr-2" />
                  Envoyer une notification
                </button>
                <button
                  onClick={handleStatusToggle}
                  className={`w-full btn-secondary flex items-center justify-center ${
                    user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Désactiver l'utilisateur
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Activer l'utilisateur
                    </>
                  )}
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="w-full btn-secondary text-red-600 hover:text-red-700 flex items-center justify-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Supprimer l'utilisateur
                </button>
              </div>
            </div>

            {/* Dernières notifications */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières notifications</h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getNotificationTypeIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune notification envoyée
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Historique des notifications</h3>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle notification
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getNotificationTypeIcon(notification.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.readBy?.some(r => r.user === userId) ? (
                        <EyeIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Inscription</p>
                <p className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            
            {user.lastLoginAt && (
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Dernière connexion</p>
                  <p className="text-sm text-gray-500">
                    {new Date(user.lastLoginAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Notifications reçues</p>
                <p className="text-sm text-gray-500">{notificationStats.total} notifications au total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de l'utilisateur</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Statut du compte</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Statut</span>
                    {getStatusBadge(user.isActive)}
                  </div>
                  <button
                    onClick={handleStatusToggle}
                    className={`w-full btn-secondary ${
                      user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Actions dangereuses</h4>
                <div className="space-y-3">
                  <button
                    onClick={handleDeleteUser}
                    className="w-full btn-secondary text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        user={user}
        onNotificationSent={handleNotificationSent}
      />

      <NotificationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={userId}
        notifications={notifications}
      />
    </div>
  );
};

export default UserDetails; 
import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon,
  PlusIcon,
  PlayIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UsersIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { pushNotificationAPI, userAPI } from '../services/api';

const PushNotifications = () => {
  const [pushStats, setPushStats] = useState({});
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    image: '',
    targetType: 'specific',
    targetUsers: [],
    targetRoles: [],
    isGlobal: false
  });

  useEffect(() => {
    fetchPushStats();
    fetchDevices();
    fetchUsers();
  }, []);

  const fetchPushStats = async () => {
    try {
      const response = await pushNotificationAPI.getStats();
      if (response.data.success) {
        setPushStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await pushNotificationAPI.getDevices({ limit: 10 });
      if (response.data.success) {
        setDevices(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des devices:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50,
        search: searchTerm
      };
      
      const response = await userAPI.getUsers(params);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPushNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationData.title.trim() || !notificationData.message.trim()) {
      toast.error('Le titre et le message sont requis');
      return;
    }

    try {
      let requestData = {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority,
        image: notificationData.image || null,
        data: {
          sentBy: 'admin_dashboard',
          timestamp: new Date().toISOString()
        }
      };

      // Déterminer les cibles
      if (notificationData.targetType === 'global') {
        requestData.isGlobal = true;
      } else if (notificationData.targetType === 'roles') {
        requestData.targetRoles = notificationData.targetRoles;
      } else {
        requestData.targetUsers = selectedUsers;
      }

      const response = await pushNotificationAPI.send(requestData);
      const result = response.data;

      if (result.success) {
        toast.success(`Notification push envoyée ! ${result.data.successCount} succès sur ${result.data.totalSent} tentatives`);
        setShowSendModal(false);
        resetForm();
        fetchPushStats();
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi de la notification push');
    }
  };

  const handleTestNotification = async (userId) => {
    try {
      const response = await pushNotificationAPI.sendTest(userId);
      const result = response.data;

      if (result.success) {
        toast.success('Notification de test envoyée !');
      } else {
        toast.error(result.error || 'Erreur lors du test');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du test de notification');
    }
  };

  const resetForm = () => {
    setNotificationData({
      title: '',
      message: '',
      type: 'general',
      priority: 'normal',
      image: '',
      targetType: 'specific',
      targetUsers: [],
      targetRoles: [],
      isGlobal: false
    });
    setSelectedUsers([]);
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

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'android':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-green-600" />;
      case 'ios':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-gray-600" />;
      case 'web':
        return <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <DeviceTabletIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const templates = [
    {
      id: 'new_course',
      name: 'Nouveau cours',
      title: '🎓 Nouveau cours disponible !',
      message: 'Découvrez notre dernière formation et enrichissez vos compétences !',
      type: 'info'
    },
    {
      id: 'reminder',
      name: 'Rappel',
      title: '📚 Continuez votre apprentissage',
      message: 'Votre formation vous attend ! Reprenez là où vous vous êtes arrêté.',
      type: 'info'
    },
    {
      id: 'contest',
      name: 'Concours',
      title: '🎉 Nouveau concours disponible !',
      message: 'Participez au concours hebdomadaire et tentez de gagner des prix incroyables !',
      type: 'success'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      title: '🔧 Maintenance prévue',
      message: 'Une maintenance est prévue. Veuillez sauvegarder votre progression.',
      type: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DevicePhoneMobileIcon className="h-8 w-8 mr-3 text-primary-600" />
            Notifications Push
          </h1>
          <p className="mt-2 text-gray-600">
            Envoyez des notifications directement sur les téléphones de vos utilisateurs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSendModal(true)}
            className="btn-primary flex items-center hover:shadow-lg transition-all duration-200"
          >
            <RocketLaunchIcon className="h-5 w-5 mr-2" />
            Envoyer une Notification
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <BellIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {pushStats.totalPushNotifications || 0}
          </div>
          <div className="text-sm text-gray-500">Total envoyées</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <DevicePhoneMobileIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {pushStats.totalDevicesWithTokens || 0}
          </div>
          <div className="text-sm text-gray-500">Appareils connectés</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {pushStats.sentNotifications || 0}
          </div>
          <div className="text-sm text-gray-500">Succès</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {pushStats.failedNotifications || 0}
          </div>
          <div className="text-sm text-gray-500">Échecs</div>
        </div>
      </div>

      {/* Répartition par plateforme */}
      {pushStats.devicesByPlatform && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par plateforme</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {pushStats.devicesByPlatform.android || 0}
              </div>
              <div className="text-sm text-gray-500">Android</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DevicePhoneMobileIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {pushStats.devicesByPlatform.ios || 0}
              </div>
              <div className="text-sm text-gray-500">iOS</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {pushStats.devicesByPlatform.web || 0}
              </div>
              <div className="text-sm text-gray-500">Web</div>
            </div>
          </div>
        </div>
      )}

      {/* Appareils récents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Appareils récemment connectés</h3>
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Appareils
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {device.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {device.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {device.devices.map((dev, i) => (
                        <div key={i} className="flex items-center space-x-1">
                          {getPlatformIcon(dev.platform)}
                          <span className="text-xs text-gray-500 capitalize">
                            {dev.platform}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleTestNotification(device.userId)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'envoi de notification */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <RocketLaunchIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Envoyer une notification push
                  </h3>
                  <p className="text-sm text-gray-500">
                    Cette notification sera envoyée directement sur les téléphones
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                {/* Templates rapides */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Modèles rapides</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setNotificationData({
                            ...notificationData,
                            title: template.title,
                            message: template.message,
                            type: template.type
                          });
                        }}
                        className="p-3 rounded-lg border-2 border-gray-200 hover:border-primary-500 transition-all text-left"
                      >
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {template.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendPushNotification} className="space-y-6">
                  {/* Type de ciblage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Qui recevra la notification ?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setNotificationData({...notificationData, targetType: 'global'})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          notificationData.targetType === 'global'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                        <div className="text-sm font-medium">Tous les utilisateurs</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationData({...notificationData, targetType: 'roles'})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          notificationData.targetType === 'roles'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <AdjustmentsHorizontalIcon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-medium">Par rôle</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationData({...notificationData, targetType: 'specific'})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          notificationData.targetType === 'specific'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <UsersIcon className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <div className="text-sm font-medium">Utilisateurs spécifiques</div>
                      </button>
                    </div>
                  </div>

                  {/* Sélection des rôles */}
                  {notificationData.targetType === 'roles' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner les rôles
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['user', 'admin', 'moderator'].map((role) => (
                          <label key={role} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={notificationData.targetRoles.includes(role)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNotificationData({
                                    ...notificationData,
                                    targetRoles: [...notificationData.targetRoles, role]
                                  });
                                } else {
                                  setNotificationData({
                                    ...notificationData,
                                    targetRoles: notificationData.targetRoles.filter(r => r !== role)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 mr-2"
                            />
                            <span className="text-sm capitalize">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sélection des utilisateurs */}
                  {notificationData.targetType === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner les utilisateurs ({selectedUsers.length} sélectionnés)
                      </label>
                      <div className="relative mb-3">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher des utilisateurs..."
                          className="input-field pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                        {users.map((user) => (
                          <label key={user._id} className="flex items-center p-3 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user._id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                }
                              }}
                              className="rounded border-gray-300 mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName || `${user.firstName} ${user.lastName}`}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Type et priorité */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'general', label: 'Général', icon: 'info' },
                          { value: 'course', label: 'Cours', icon: 'success' },
                          { value: 'contest', label: 'Concours', icon: 'success' },
                          { value: 'alert', label: 'Alerte', icon: 'warning' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setNotificationData({ ...notificationData, type: type.value })}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              notificationData.type === type.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-1">
                              {getTypeIcon(type.icon)}
                              <span className="text-xs font-medium">{type.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priorité
                      </label>
                      <select
                        value={notificationData.priority}
                        onChange={(e) => setNotificationData({ ...notificationData, priority: e.target.value })}
                        className="w-full input-field"
                      >
                        <option value="low">Faible</option>
                        <option value="normal">Normale</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={notificationData.title}
                      onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                      placeholder="Titre de la notification push"
                      className="w-full input-field"
                      maxLength={60}
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {notificationData.title.length}/60 caractères (optimisé pour mobile)
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={notificationData.message}
                      onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                      placeholder="Contenu de la notification push"
                      rows={3}
                      className="w-full input-field resize-none"
                      maxLength={160}
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {notificationData.message.length}/160 caractères (optimisé pour mobile)
                    </div>
                  </div>

                  {/* Image (optionnel) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de l'image (optionnel)
                    </label>
                    <input
                      type="url"
                      value={notificationData.image}
                      onChange={(e) => setNotificationData({ ...notificationData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full input-field"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      L'image sera affichée dans la notification (optionnel)
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowSendModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary flex items-center justify-center"
                    >
                      <RocketLaunchIcon className="h-4 w-4 mr-2" />
                      Envoyer la notification push
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotifications;

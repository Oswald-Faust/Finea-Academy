import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const NotificationHistoryModal = ({ isOpen, onClose, userId, notifications }) => {
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (notifications) {
      let filtered = [...notifications];

      // Filtrer par type
      if (filterType !== 'all') {
        filtered = filtered.filter(n => n.type === filterType);
      }

      // Filtrer par statut
      if (filterStatus !== 'all') {
        if (filterStatus === 'read') {
          filtered = filtered.filter(n => n.readBy?.some(r => r.user === userId));
        } else if (filterStatus === 'unread') {
          filtered = filtered.filter(n => !n.readBy?.some(r => r.user === userId));
        } else {
          filtered = filtered.filter(n => n.status === filterStatus);
        }
      }

      // Trier
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setFilteredNotifications(filtered);
    }
  }, [notifications, filterType, filterStatus, sortBy, sortOrder, userId]);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { color: 'green', text: 'Envoyée' },
      scheduled: { color: 'blue', text: 'Programmée' },
      failed: { color: 'red', text: 'Échouée' },
      draft: { color: 'gray', text: 'Brouillon' },
    };

    const config = statusConfig[status] || { color: 'gray', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const getReadStatus = (notification) => {
    const isRead = notification.readBy?.some(r => r.user === userId);
    return isRead ? (
      <EyeIcon className="h-5 w-5 text-green-500" title="Lu" />
    ) : (
      <EyeSlashIcon className="h-5 w-5 text-gray-400" title="Non lu" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Historique des notifications
              </h3>
              <p className="text-sm text-gray-500">
                {filteredNotifications.length} notification(s) trouvée(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full input-field"
              >
                <option value="all">Tous les types</option>
                <option value="info">Information</option>
                <option value="success">Succès</option>
                <option value="warning">Attention</option>
                <option value="error">Erreur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full input-field"
              >
                <option value="all">Tous les statuts</option>
                <option value="sent">Envoyées</option>
                <option value="scheduled">Programmées</option>
                <option value="failed">Échouées</option>
                <option value="read">Lues</option>
                <option value="unread">Non lues</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full input-field"
              >
                <option value="date">Date</option>
                <option value="title">Titre</option>
                <option value="type">Type</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full input-field"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div key={notification._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getReadStatus(notification)}
                          {getStatusBadge(notification.status)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {new Date(notification.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {notification.sentAt && (
                          <div className="flex items-center space-x-1">
                            <BellIcon className="h-4 w-4" />
                            <span>
                              Envoyée: {new Date(notification.sentAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                          <strong>Métadonnées:</strong>
                          <pre className="mt-1 text-gray-600">
                            {JSON.stringify(notification.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune notification trouvée
              </h3>
              <p className="text-sm text-gray-500">
                Aucune notification ne correspond aux filtres sélectionnés.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Affichage de {filteredNotifications.length} notification(s) sur {notifications.length} total
            </p>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationHistoryModal; 
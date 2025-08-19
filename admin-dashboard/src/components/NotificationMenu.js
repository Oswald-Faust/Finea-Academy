import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  EyeIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { notificationAPI } from '../services/api';

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Fermer le dropdown si on clique à l'extérieur
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({ limit: 5 });
      const data = response.data;
      
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.data ? data.data.filter(n => !n.read).length : 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      
      if (response.data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
        toast.success('Toutes les notifications ont été marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur lors du marquage global:', error);
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header du dropdown */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">{unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}</p>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-1 rounded-lg hover:bg-primary-50 transition-all duration-300"
                >
                  Tout marquer
                </button>
              )}
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/10 transition-all duration-300"
                title="Gérer les notifications"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={notification._id}
                  className={`notification-item px-6 py-4 border-b border-white/10 ${
                    !notification.read ? 'bg-primary-50/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-primary-600 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400 font-medium">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                        {!notification.read && (
                          <span className="badge-info-modern">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm inline-block mb-4">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Vous êtes à jour ! Aucune nouvelle notification.
                </p>
              </div>
            )}
          </div>

          {/* Footer du dropdown */}
          {notifications.length > 0 && (
            <div className="px-6 py-4 border-t border-white/20 bg-white/20 backdrop-blur-sm">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full text-sm font-semibold text-primary-600 hover:text-primary-800 transition-all duration-300 py-2 px-4 rounded-xl hover:bg-primary-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationMenu; 
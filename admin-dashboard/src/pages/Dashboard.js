import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { userAPI, emailAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    newslettersSent: 0,
    userGrowth: 0,
    engagementRate: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
      return 'à l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `il y a ${months} mois`;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques
      const statsResponse = await userAPI.getUserStats();
      const statsData = statsResponse.data.data || statsResponse.data;
      setStats(statsData);

      // Récupérer les récents utilisateurs directement via fetch pour plus de contrôle
      const usersResponse = await fetch('https://finea-api-production.up.railway.app/api//users?limit=8&sort=createdAt&order=desc');
      const usersData = await usersResponse.json();
      
      if (usersData.success) {
        setRecentUsers(usersData.data.users || usersData.data || []); 
      } else {
        console.error('Erreur lors de la récupération des utilisateurs:', usersData.error);
        setRecentUsers([]);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error('Dashboard data fetch error:', error);
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers || 0,
      change: stats.userGrowth || 0,
      changeType: (stats.userGrowth || 0) >= 0 ? 'increase' : 'decrease',
      icon: UsersIcon,
      color: 'blue',
      href: '/users',
    },
    {
      title: 'Utilisateurs actifs',
      value: stats.activeUsers || 0,
      change: stats.engagementRate || 0,
      changeType: (stats.engagementRate || 0) >= 0 ? 'increase' : 'decrease',
      icon: ArrowTrendingUpIcon,
      color: 'green',
      href: '/users?filter=active',
    },
    {
      title: 'Nouveaux ce mois',
      value: stats.newUsersThisMonth || 0,
      change: 12.5,
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'purple',
      href: '/users?filter=new',
    },
    {
      title: 'Newsletters envoyées',
      value: stats.newslettersSent || 0,
      change: 8.2,
      changeType: 'increase',
      icon: EnvelopeIcon,
      color: 'orange',
      href: '/newsletter',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header avec gradient */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-purple-600/90"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-yellow-300 animate-pulse-slow" />
            <h1 className="text-4xl font-bold">Dashboard Finéa Académie</h1>
          </div>
          <p className="mt-3 text-xl text-primary-100 font-medium">
            Bienvenue dans votre espace d'administration
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-primary-200">
            <span>📊 Vue d'ensemble</span>
            <span>•</span>
            <span>🚀 Gestion simplifiée</span>
            <span>•</span>
            <span>✨ Interface intuitive</span>
          </div>
        </div>
        {/* Motif décoratif */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5 opacity-30"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Link
            key={card.title}
            to={card.href}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient de fond subtil */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <card.icon className="h-7 w-7 text-white" />
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{(card.value || 0).toLocaleString()}</p>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  {card.changeType === 'increase' ? (
                    <div className="flex items-center px-2 py-1 rounded-full bg-green-100">
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
                      <span className="ml-1 text-sm font-semibold text-green-600">
                        +{card.change}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-1 rounded-full bg-red-100">
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-600" />
                      <span className="ml-1 text-sm font-semibold text-red-600">
                        {card.change}%
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium">vs mois dernier</span>
              </div>
            </div>
            
            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Nouveaux utilisateurs</h3>
                <p className="text-sm text-gray-500">Dernières inscriptions</p>
              </div>
            </div>
            <Link
              to="/users"
              className="group flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-all duration-200"
            >
              <span>Voir tout</span>
              <ArrowRightIcon className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? recentUsers.map((user, index) => {
              const isNew = new Date(user.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Nouveau dans les 24h
              const timeAgo = getTimeAgo(user.createdAt);
              
              return (
                <div key={user._id} className="group relative">
                  <div 
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 cursor-pointer"
                    onClick={() => navigate(`/users/${user._id}`)}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                        <span className="text-sm font-bold text-white">
                          {user.firstName?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      {isNew && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">N</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Utilisateur'}
                        </p>
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Inscrit {timeAgo}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aucun nouvel utilisateur</p>
                <p className="text-sm text-gray-400">Les nouveaux utilisateurs apparaîtront ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Actions rapides</h3>
              <p className="text-sm text-gray-500">Fonctionnalités principales</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/newsletter"
              className="group block p-6 border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <EnvelopeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Envoyer une newsletter</p>
                    <p className="text-sm text-gray-500">Créer et envoyer une newsletter à tous les utilisateurs</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
            
            <Link
              to="/users"
              className="group block p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Gérer les utilisateurs</p>
                    <p className="text-sm text-gray-500">Voir, modifier et gérer tous les utilisateurs</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
            
            <Link
              to="/stats"
              className="group block p-6 border-2 border-gray-100 rounded-2xl hover:border-green-200 hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-500 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Voir les statistiques détaillées</p>
                    <p className="text-sm text-gray-500">Analyser les données et tendances en temps réel</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
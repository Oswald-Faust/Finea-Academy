import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  ChartBarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  BellIcon,
  CheckCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { dashboardAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState({
    dashboard: {},
    activity: {},
    revenue: {},
    demographics: {},
    coursePerformance: {},
  });

  useEffect(() => {
    fetchStats();
    
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, activityRes, revenueRes, demographicsRes, coursePerformanceRes] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        dashboardAPI.getActivityStats(timeRange),
        dashboardAPI.getRevenueStats(),
        dashboardAPI.getUserDemographics(),
        dashboardAPI.getCoursePerformance(),
      ]);

      setStats({
        dashboard: dashboardRes.data.data || dashboardRes.data,
        activity: activityRes.data.data || activityRes.data,
        revenue: revenueRes.data.data || revenueRes.data,
        demographics: demographicsRes.data.data || demographicsRes.data,
        coursePerformance: coursePerformanceRes.data.data || coursePerformanceRes.data,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Données pour les graphiques
  const userGrowthData = {
    labels: stats.dashboard.usersByDay?.map(day => 
      new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    ) || [],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: stats.dashboard.usersByDay?.map(day => day.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const usersByRoleData = {
    labels: ['Utilisateurs', 'Modérateurs', 'Administrateurs'],
    datasets: [
      {
        data: [
          stats.dashboard.roleStats?.user || 0,
          stats.dashboard.roleStats?.moderator || 0,
          stats.dashboard.roleStats?.admin || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const activityData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Utilisateurs actifs',
        data: [45, 52, 48, 67, 58, 42, 38],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: stats.revenue.monthlyRevenue?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenus (€)',
        data: stats.revenue.monthlyRevenue?.map(item => item.revenue) || [],
        backgroundColor: 'rgba(147, 197, 253, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const exportData = () => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `finea-stats-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Données exportées avec succès');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Détaillées</h1>
          <p className="mt-2 text-gray-600">
            Analysez les données et tendances de votre application en temps réel
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
          
          <button
            onClick={exportData}
            className="btn-secondary flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Cards Dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.dashboard.totalUsers?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +{stats.dashboard.userGrowth || 0}% ce mois
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.dashboard.activeUsers?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600">
                {stats.dashboard.engagementRate || 0}% d'engagement
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newsletters envoyées</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.dashboard.newslettersSent?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600">
                +{stats.dashboard.newsletterGrowth || 0}% ce mois
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-orange-100">
              <BellIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.dashboard.notifications?.total?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600">
                {stats.dashboard.notifications?.thisMonth || 0} ce mois
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des inscriptions des 7 derniers jours */}
      {stats.dashboard.usersByDay && stats.dashboard.usersByDay.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Inscriptions des 7 derniers jours</h3>
              <p className="text-sm text-gray-500">Évolution des nouvelles inscriptions en temps réel</p>
            </div>
          </div>
          
          <div className="flex items-end space-x-2 h-32">
            {stats.dashboard.usersByDay.map((day, index) => {
              const maxCount = Math.max(...stats.dashboard.usersByDay.map(d => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative group">
                    <div 
                      className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {day.count} utilisateur{day.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nouvelles inscriptions</h3>
            <p className="text-sm text-gray-600">Évolution des nouvelles inscriptions sur 7 jours</p>
          </div>
          <Line data={userGrowthData} options={chartOptions} />
        </div>

        {/* Users by Role Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Répartition par rôle</h3>
            <p className="text-sm text-gray-600">Distribution des utilisateurs par rôle</p>
          </div>
          <Doughnut data={usersByRoleData} options={doughnutOptions} />
        </div>

        {/* Activity Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activité hebdomadaire</h3>
            <p className="text-sm text-gray-600">Utilisateurs actifs par jour de la semaine</p>
          </div>
          <Bar data={activityData} options={chartOptions} />
        </div>

        {/* Revenue Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Évolution des revenus</h3>
            <p className="text-sm text-gray-600">Revenus mensuels (si applicable)</p>
          </div>
          <Bar data={revenueData} options={chartOptions} />
        </div>
      </div>

      {/* Derniers utilisateurs inscrits */}
      {stats.dashboard.recentUsers && stats.dashboard.recentUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Derniers utilisateurs inscrits</h3>
                <p className="text-sm text-gray-500">Activité récente en temps réel</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.dashboard.recentUsers.map((user, index) => (
              <div key={user._id || index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200 ${
                    user.isActive 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    <span className="text-sm font-bold text-white">
                      {user.firstName?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Utilisateur'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Stats Table */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Statistiques détaillées</h3>
          <p className="text-sm text-gray-600">Métriques avancées et indicateurs de performance</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur actuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évolution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objectif
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Taux d'engagement
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.dashboard.engagementRate || 0}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +{stats.dashboard.userGrowth || 0}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  80%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Nouveaux utilisateurs ce mois
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.dashboard.newUsersThisMonth || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +{stats.dashboard.userGrowth || 0}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  200
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Newsletters envoyées
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.dashboard.newslettersSent || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +{stats.dashboard.newsletterGrowth || 0}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  50
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Utilisateurs vérifiés
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.dashboard.verifiedUsers || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +5.2%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  90%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stats;
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
} from '@heroicons/react/24/outline';
import { userAPI } from '../services/api';
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
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    userGrowth: [],
    usersByRole: {},
    activeUsers: [],
    registrationTrends: [],
  });

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Simuler des données de statistiques
      const mockStats = {
        userGrowth: [
          { date: '2024-01-01', users: 120 },
          { date: '2024-01-02', users: 135 },
          { date: '2024-01-03', users: 142 },
          { date: '2024-01-04', users: 158 },
          { date: '2024-01-05', users: 167 },
          { date: '2024-01-06', users: 175 },
          { date: '2024-01-07', users: 189 },
        ],
        usersByRole: {
          user: 156,
          admin: 3,
          moderator: 8,
        },
        activeUsers: [
          { hour: '00:00', count: 12 },
          { hour: '04:00', count: 8 },
          { hour: '08:00', count: 45 },
          { hour: '12:00', count: 67 },
          { hour: '16:00', count: 52 },
          { hour: '20:00', count: 38 },
        ],
        registrationTrends: [
          { month: 'Jan', count: 23 },
          { month: 'Fév', count: 34 },
          { month: 'Mar', count: 28 },
          { month: 'Avr', count: 41 },
          { month: 'Mai', count: 37 },
          { month: 'Jun', count: 45 },
        ],
      };
      
      setStats(mockStats);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const userGrowthData = {
    labels: stats.userGrowth.map(item => new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Utilisateurs totaux',
        data: stats.userGrowth.map(item => item.users),
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
        data: [stats.usersByRole.user, stats.usersByRole.moderator, stats.usersByRole.admin],
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

  const activeUsersData = {
    labels: stats.activeUsers.map(item => item.hour),
    datasets: [
      {
        label: 'Utilisateurs actifs',
        data: stats.activeUsers.map(item => item.count),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  };

  const registrationTrendsData = {
    labels: stats.registrationTrends.map(item => item.month),
    datasets: [
      {
        label: 'Nouvelles inscriptions',
        data: stats.registrationTrends.map(item => item.count),
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
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="mt-2 text-gray-600">
            Analysez les données et tendances de votre application
          </p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.usersByRole?.user || 0) + (stats.usersByRole?.admin || 0) + (stats.usersByRole?.moderator || 0)}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +12% ce mois
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Croissance</p>
              <p className="text-2xl font-bold text-gray-900">+15.3%</p>
              <p className="text-sm text-green-600">vs mois dernier</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-sm text-green-600">+8% vs précédent</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-orange-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux d'engagement</p>
              <p className="text-2xl font-bold text-gray-900">78.5%</p>
              <p className="text-sm text-green-600">+3.2% ce mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Croissance des utilisateurs</h3>
            <p className="text-sm text-gray-600">Évolution du nombre total d'utilisateurs</p>
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

        {/* Active Users Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilisateurs actifs par heure</h3>
            <p className="text-sm text-gray-600">Activité des utilisateurs dans la journée</p>
          </div>
          <Bar data={activeUsersData} options={chartOptions} />
        </div>

        {/* Registration Trends Chart */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tendances d'inscription</h3>
            <p className="text-sm text-gray-600">Nouvelles inscriptions par mois</p>
          </div>
          <Bar data={registrationTrendsData} options={chartOptions} />
        </div>
      </div>

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
                  Taux de rétention (30j)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  68.5%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +5.2%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  70%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Temps de session moyen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  12m 34s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +1m 12s
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  15m
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Taux de conversion
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  3.8%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    -0.3%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  5%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Satisfaction utilisateur
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  4.2/5
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +0.1
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  4.5/5
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
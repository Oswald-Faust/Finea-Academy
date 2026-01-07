import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  GiftIcon,
  UsersIcon,
  ChartBarIcon,
  TrashIcon,
  PencilIcon,
  CurrencyEuroIcon,
  CheckIcon,
  XMarkIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { contestAPI, standaloneWinnersAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import ManageWinnersModal from '../components/ManageWinnersModal';
import CreateWinnersModal from '../components/CreateWinnersModal';
import AddStandaloneWinnerModal from '../components/AddStandaloneWinnerModal';
import EditWinnerModal from '../components/EditWinnerModal';

const Winners = () => {
  const [activeTab, setActiveTab] = useState('standalone');
  const [winners, setWinners] = useState([]);
  const [standaloneWinners, setStandaloneWinners] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContest, setFilterContest] = useState('all');
  const [stats, setStats] = useState({
    totalWinners: 0,
    totalGains: 0,
    totalPlacesSold: 0,
    totalContests: 0
  });
  
  // États pour l'édition des statistiques
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [editedStats, setEditedStats] = useState({
    totalWinners: 0,
    totalGains: 0,
    totalPlacesSold: 0
  });
  const [savingStats, setSavingStats] = useState(false);
  
  // États pour le modal d'édition des gagnants
  const [isEditWinnerModalOpen, setIsEditWinnerModalOpen] = useState(false);
  const [editingWinner, setEditingWinner] = useState(null);

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les gagnants des concours
      const winnersResponse = await contestAPI.get('/contests/winners/all');
      if (winnersResponse.data.success) {
        setWinners(winnersResponse.data.data);
      }

      // Charger les gagnants indépendants
      const standaloneResponse = await standaloneWinnersAPI.getAll();
      if (standaloneResponse.data.success) {
        setStandaloneWinners(standaloneResponse.data.data);
      }

      // Charger les concours
      const contestsResponse = await contestAPI.get('/contests');
      if (contestsResponse.data.success) {
        setContests(contestsResponse.data.data);
      }

      // Charger les statistiques
      const statsResponse = await contestAPI.get('/contests/stats/global');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleManageWinners = (contest) => {
    setSelectedContest(contest);
    setIsManageModalOpen(true);
  };

  const handleWinnersUpdated = () => {
    loadData(); // Recharger les données après mise à jour
  };

  const handleDeleteWinner = async (winner) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer le gagnant "${winner.winner?.firstName} ${winner.winner?.lastName}" du concours "${winner.contestTitle}" ?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await contestAPI.delete(`/contests/${winner.contestId}/winners/${winner.winnerId}`);
      
      if (response.data.success) {
        toast.success('Gagnant supprimé avec succès');
        loadData(); // Recharger les données
      } else {
        throw new Error(response.data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du gagnant:', error);
      toast.error('Erreur lors de la suppression du gagnant');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `${amount}€`;
  };

  // Fonctions pour l'édition des statistiques
  const handleEditStats = () => {
    setEditedStats({
      totalWinners: stats.totalWinners || 0,
      totalGains: stats.totalGains || 0,
      totalPlacesSold: stats.totalPlacesSold || 0
    });
    setIsEditingStats(true);
  };

  const handleCancelEdit = () => {
    setIsEditingStats(false);
    setEditedStats({
      totalWinners: 0,
      totalGains: 0,
      totalPlacesSold: 0
    });
  };

  const handleSaveStats = async () => {
    try {
      setSavingStats(true);
      
      const response = await contestAPI.put('/contests/stats/global', {
        totalWinners: parseInt(editedStats.totalWinners) || 0,
        totalGains: parseFloat(editedStats.totalGains) || 0,
        totalPlacesSold: parseFloat(editedStats.totalPlacesSold) || 0
      });
      
      if (response.data.success) {
        toast.success('Statistiques mises à jour avec succès !');
        setStats(prev => ({
          ...prev,
          totalWinners: editedStats.totalWinners,
          totalGains: editedStats.totalGains,
          totalPlacesSold: editedStats.totalPlacesSold
        }));
        setIsEditingStats(false);
      } else {
        throw new Error(response.data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
      toast.error('Erreur lors de la sauvegarde des statistiques');
    } finally {
      setSavingStats(false);
    }
  };

  // Filtrer les gagnants selon les critères
  const filteredWinners = winners.filter(winner => {
    const matchesSearch = 
      winner.winner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.winner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.contestTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContest = filterContest === 'all' || winner.contestId === filterContest;
    
    return matchesSearch && matchesContest;
  });

  // Grouper les gagnants par concours
  const winnersByContest = contests.map(contest => {
    const contestWinners = winners.filter(winner => winner.contestId === contest._id);
    return {
      ...contest,
      winners: contestWinners,
      winnersCount: contestWinners.length
    };
  }).filter(contest => contest.winnersCount > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            Gestion des Gagnants
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les gagnants de tous les concours et ajoutez des gagnants manuellement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsStandaloneModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Ajouter Gagnant (sans concours)
          </button>
          {/* Bouton désactivé temporairement
          <button
            onClick={() => {
              if (contests.length === 0) {
                toast.error('Aucun concours disponible');
                return;
              }
              // Ouvrir le modal de création avec tous les concours disponibles
              setIsCreateModalOpen(true);
            }}
            disabled={contests.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Gagnant avec Concours
          </button>
          */}
        </div>
      </div>

      {/* Statistiques globales éditables */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-gray-500" />
              Statistiques Globales
            </h3>
            {!isEditingStats ? (
              <button
                onClick={handleEditStats}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveStats}
                  disabled={savingStats}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {savingStats ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Annuler
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Gagnants */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Gagnants</dt>
                  {isEditingStats ? (
                    <input
                      type="number"
                      value={editedStats.totalWinners}
                      onChange={(e) => setEditedStats(prev => ({ ...prev, totalWinners: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="0"
                    />
                  ) : (
                    <dd className="text-2xl font-bold text-gray-900">{stats.totalWinners}</dd>
                  )}
                </div>
              </div>
            </div>

            {/* Gains Totaux */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CurrencyEuroIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Gains Totaux</dt>
                  {isEditingStats ? (
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={editedStats.totalGains}
                        onChange={(e) => setEditedStats(prev => ({ ...prev, totalGains: e.target.value }))}
                        className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  ) : (
                    <dd className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalGains)}</dd>
                  )}
                </div>
              </div>
            </div>

            {/* Places Vendues */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Places Vendues</dt>
                  {isEditingStats ? (
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={editedStats.totalPlacesSold}
                        onChange={(e) => setEditedStats(prev => ({ ...prev, totalPlacesSold: e.target.value }))}
                        className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  ) : (
                    <dd className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalPlacesSold || 0)}</dd>
                  )}
                </div>
              </div>
            </div>

            {/* Concours avec Gagnants (non éditable) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Concours avec Gagnants</dt>
                  <dd className="text-2xl font-bold text-gray-900">{winnersByContest.length}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {/* Onglet Liste des Gagnants désactivé temporairement
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <EyeIcon className="h-5 w-5 inline mr-2" />
              Liste des Gagnants
            </button>
            */}
            <button
              onClick={() => setActiveTab('standalone')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'standalone'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserPlusIcon className="h-5 w-5 inline mr-2" />
              Gagnants ({standaloneWinners.length})
            </button>
            {/* Onglet Par Concours désactivé temporairement
            <button
              onClick={() => setActiveTab('contests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="h-5 w-5 inline mr-2" />
              Par Concours
            </button>
            */}
          </nav>
        </div>

        <div className="p-6">
          {/* Liste de tous les gagnants */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Tous les Gagnants</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un gagnant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                  </div>
                  <select
                    value={filterContest}
                    onChange={(e) => setFilterContest(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-48"
                  >
                    <option value="all">Tous les concours</option>
                    {contests.map(contest => (
                      <option key={contest._id} value={contest._id}>
                        {contest.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredWinners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun gagnant trouvé avec ces critères de recherche.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gagnant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Concours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWinners.map((winner, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {winner.winner?.firstName} {winner.winner?.lastName}
                              </div>
                              {winner.winner?.email && (
                                <div className="text-sm text-gray-500">
                                  {winner.winner.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{winner.contestTitle}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(winner.drawDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              #{winner.position}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {winner.prize}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatAmount(winner.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(winner.selectedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              winner.isManual 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {winner.isManual ? "Manuel" : "Automatique"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteWinner(winner)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              title="Supprimer ce gagnant"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Gagnants sans concours */}
          {activeTab === 'standalone' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Gagnants Sans Concours</h3>
                <span className="text-sm text-gray-500">
                  Ces gagnants apparaissent directement dans l'application
                </span>
              </div>

              {standaloneWinners.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">Aucun gagnant sans concours pour le moment.</p>
                  <button
                    onClick={() => setIsStandaloneModalOpen(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter un gagnant
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gagnant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date du Tirage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semaine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {standaloneWinners.map((winner) => (
                        <tr key={winner._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {winner.firstName} {winner.lastName}
                              </div>
                              {winner.email && (
                                <div className="text-sm text-gray-500">
                                  {winner.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              #{winner.position}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {winner.prize}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatAmount(winner.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(winner.drawDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {winner.weekOfYear}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingWinner(winner);
                                  setIsEditWinnerModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                title="Modifier ce gagnant"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Supprimer ${winner.firstName} ${winner.lastName} ?`)) {
                                    try {
                                      await standaloneWinnersAPI.delete(winner._id);
                                      toast.success('Gagnant supprimé');
                                      loadData();
                                    } catch (error) {
                                      toast.error('Erreur lors de la suppression');
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                title="Supprimer ce gagnant"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Gestion par concours */}
          {activeTab === 'contests' && (
            <div className="space-y-6">
              {winnersByContest.map(contest => (
                <div key={contest._id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {contest.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Tirage: {formatDate(contest.drawDate)} • {contest.winnersCount} gagnant(s)
                      </p>
                    </div>
                    <button 
                      onClick={() => handleManageWinners(contest)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <GiftIcon className="h-4 w-4 mr-2" />
                      Gérer les Gagnants
                    </button>
                  </div>

                  {contest.winners.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gagnant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {contest.winners.map((winner, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  #{winner.position}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {winner.winner?.firstName} {winner.winner?.lastName}
                                  </div>
                                  {winner.winner?.email && (
                                    <div className="text-sm text-gray-500">
                                      {winner.winner.email}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {winner.prize}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatAmount(winner.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  winner.isManual 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {winner.isManual ? "Manuel" : "Automatique"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteWinner(winner)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Supprimer ce gagnant"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucun gagnant pour ce concours.</p>
                    </div>
                  )}
                </div>
              ))}

              {winnersByContest.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun concours avec des gagnants pour le moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de gagnants pour plusieurs concours */}
      <CreateWinnersModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        contests={contests}
        onWinnersUpdated={handleWinnersUpdated}
      />

      {/* Modal de gestion des gagnants pour un concours spécifique */}
      {selectedContest && (
        <ManageWinnersModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          contest={selectedContest}
          onWinnersUpdated={handleWinnersUpdated}
        />
      )}

      {/* Modal pour ajouter des gagnants indépendants */}
      <AddStandaloneWinnerModal
        isOpen={isStandaloneModalOpen}
        onClose={() => setIsStandaloneModalOpen(false)}
        onWinnersAdded={handleWinnersUpdated}
      />

      {/* Modal pour modifier un gagnant */}
      <EditWinnerModal
        isOpen={isEditWinnerModalOpen}
        onClose={() => {
          setIsEditWinnerModalOpen(false);
          setEditingWinner(null);
        }}
        winner={editingWinner}
        onWinnerUpdated={handleWinnersUpdated}
      />
    </div>
  );
};

export default Winners;
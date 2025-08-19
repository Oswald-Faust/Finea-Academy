import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CreateContestModal from '../components/CreateContestModal';
import SelectWinnerModal from '../components/SelectWinnerModal';
import { contestAPI } from '../services/api';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectWinnerModalOpen, setIsSelectWinnerModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [stats, setStats] = useState({
    totalContests: 0,
    activeContests: 0,
    upcomingContests: 0,
    completedContests: 0,
    totalParticipants: 0,
    totalWinners: 0,
  });

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setFilterStatus(filter);
    }
    fetchContests();
    fetchStats();
  }, [currentPage, filterStatus, filterType, searchParams]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        type: filterType !== 'all' ? filterType : undefined,
      };

      const response = await contestAPI.getContests(params);
      const data = response.data;

      if (data.success) {
        setContests(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des concours');
      console.error('Contests fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await contestAPI.getStats();
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContests();
  };

  const handleContestCreated = () => {
    fetchContests();
    fetchStats();
  };

  const handleDeleteContest = async (contestId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concours ?')) {
      try {
        const response = await contestAPI.deleteContest(contestId);
        const data = response.data;

        if (data.success) {
          toast.success('Concours supprimé avec succès');
          fetchContests();
          fetchStats();
        } else {
          toast.error(data.error || 'Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSelectWinner = (contest) => {
    setSelectedContest(contest);
    setIsSelectWinnerModalOpen(true);
  };

  const handleWinnerSelected = () => {
    fetchContests();
    toast.success('Vainqueur sélectionné avec succès !');
  };

  const getStatusBadge = (status, endDate) => {
    const now = new Date();
    const end = new Date(endDate);

    if (status === 'draft') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Brouillon
        </span>
      );
    } else if (status === 'active' && end > now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Actif
        </span>
      );
    } else if (status === 'active' && end <= now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Terminé
        </span>
      );
    } else if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <TrophyIcon className="w-3 h-3 mr-1" />
          Complété
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Fermé
        </span>
      );
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      trading: { color: 'purple', label: 'Trading' },
      bourse: { color: 'blue', label: 'Bourse' },
      formation: { color: 'green', label: 'Formation' },
      general: { color: 'gray', label: 'Général' },
      special: { color: 'orange', label: 'Spécial' },
    };

    const config = typeConfig[type] || { color: 'gray', label: type };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilEnd = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Concours</h1>
          <p className="mt-2 text-gray-600">
            Gérez tous les concours et sélectionnez les vainqueurs
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Créer un Nouveau Concours
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="stat-card animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center">
            <div className="stat-icon">
              <TrophyIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Concours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContests}</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center">
            <div className="stat-icon">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeContests}</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center">
            <div className="stat-icon">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">À venir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingContests}</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center">
            <div className="stat-icon">
              <StarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedContests}</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center">
            <div className="stat-icon">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center">
            <div className="stat-icon">
              <GiftIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Vainqueurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWinners}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-glass animate-slideInRight">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou description..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="active">Actifs</option>
                <option value="completed">Terminés</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                className="input-field"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="trading">Trading</option>
                <option value="bourse">Bourse</option>
                <option value="formation">Formation</option>
                <option value="general">Général</option>
                <option value="special">Spécial</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contests Table */}
      <div className="table-container animate-fadeInUp">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200/30">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contests.length > 0 ? (
                  contests.map((contest) => (
                    <tr key={contest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <TrophyIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contest.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {contest.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(contest.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contest.status, contest.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contest.currentParticipants}
                          {contest.maxParticipants && ` / ${contest.maxParticipants}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contest.winners.length} vainqueur(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Début: {formatDate(contest.startDate)}</div>
                        <div>Fin: {formatDate(contest.endDate)}</div>
                        {contest.status === 'active' && (
                          <div className="text-xs text-blue-600">
                            {getDaysUntilEnd(contest.endDate)} jours restants
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/contests/${contest._id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          
                          {contest.status === 'active' && new Date(contest.endDate) <= new Date() && (
                            <button
                              onClick={() => handleSelectWinner(contest)}
                              className="text-green-600 hover:text-green-900"
                              title="Sélectionner vainqueur"
                            >
                              <TrophyIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          <Link
                            to={`/contests/${contest._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteContest(contest._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun concours trouvé</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchTerm ? 'Aucun concours ne correspond à votre recherche.' : 'Commencez par créer votre premier concours.'}
                        </p>
                        <button 
                          onClick={() => setIsCreateModalOpen(true)}
                          className="btn-primary"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Créer un concours
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> sur{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateContestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContestCreated={handleContestCreated}
      />

      <SelectWinnerModal
        isOpen={isSelectWinnerModalOpen}
        onClose={() => {
          setIsSelectWinnerModalOpen(false);
          setSelectedContest(null);
        }}
        contest={selectedContest}
        onWinnerSelected={handleWinnerSelected}
      />
    </div>
  );
};

export default Contests; 
import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UsersIcon, 
  TrophyIcon, 
  ClockIcon,
  PlayIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ManageWinnersModal from '../components/ManageWinnersModal';

const WeeklyContest = () => {
  const [currentContest, setCurrentContest] = useState(null);
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [showManageWinnersModal, setShowManageWinnersModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    drawDate: '',
    maxParticipants: 0,
    prizes: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contestRes, statsRes, historyRes] = await Promise.all([
        api.get('/contests/weekly/current'),
        api.get('/contests/weekly/stats'),
        api.get('/contests/weekly/history?limit=5')
      ]);

      console.log('📊 Réponse concours:', contestRes);
      console.log('📊 Réponse stats:', statsRes);
      console.log('📊 Réponse historique:', historyRes);

      // Extraire les données des réponses API
      setCurrentContest(contestRes.data?.data || contestRes.data);
      setStats(statsRes.data?.data || statsRes.data);
      
      // Vérifier que history est un tableau
      const historyData = historyRes.data?.data || historyRes.data;
      if (Array.isArray(historyData)) {
        setHistory(historyData);
      } else if (historyData && Array.isArray(historyData.data)) {
        setHistory(historyData.data);
      } else {
        console.warn('⚠️ History n\'est pas un tableau:', historyData);
        setHistory([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, initialiser avec des valeurs par défaut
      setCurrentContest(null);
      setStats({});
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const createWeeklyContest = async () => {
    try {
      setCreating(true);
      await api.post('/contests/weekly');
      await fetchData();
      alert('Concours hebdomadaire créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du concours');
    } finally {
      setCreating(false);
    }
  };

  const performDraw = async () => {
    try {
      setDrawing(true);
      await api.post('/contests/weekly/draw');
      await fetchData();
      alert('Tirage effectué avec succès !');
    } catch (error) {
      console.error('Erreur lors du tirage:', error);
      alert('Erreur lors du tirage');
    } finally {
      setDrawing(false);
    }
  };

  const viewWinner = (winner) => {
    setSelectedWinner(winner);
    setShowWinnerModal(true);
  };

  const openEditModal = (contest) => {
    if (!contest || !contest._id) {
      console.error('Tentative d\'ouverture du modal avec un concours invalide:', contest);
      alert('Erreur: Impossible de modifier ce concours (ID manquant)');
      return;
    }
    
    console.log('Ouverture du modal d\'édition pour le concours:', contest._id);
    
    setEditingContest(contest);
    setEditForm({
      title: contest.title || '',
      description: contest.description || '',
      startDate: contest.startDate ? new Date(contest.startDate).toISOString().split('T')[0] : '',
      endDate: contest.endDate ? new Date(contest.endDate).toISOString().split('T')[0] : '',
      drawDate: contest.drawDate ? new Date(contest.drawDate).toISOString().split('T')[0] : '',
      maxParticipants: contest.maxParticipants || 0,
      prizes: contest.prizes || []
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingContest(null);
    setEditForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      drawDate: '',
      maxParticipants: 0,
      prizes: []
    });
  };

  const handleManageWinners = () => {
    if (!currentContest || !currentContest._id) {
      alert('Aucun concours sélectionné ou concours invalide');
      return;
    }
    console.log('🎯 Opening ManageWinnersModal with contest:', currentContest);
    setShowManageWinnersModal(true);
  };

  const handleWinnersUpdated = () => {
    fetchData();
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveContestChanges = async () => {
    try {
      if (!editingContest) {
        alert('Aucun concours sélectionné pour la modification');
        return;
      }
      
      if (!editingContest._id) {
        console.error('ID du concours manquant:', editingContest);
        alert('Erreur: ID du concours manquant');
        return;
      }
      
      console.log('Modification du concours:', editingContest._id, editForm);
      
      await api.put(`/contests/${editingContest._id}`, editForm);
      await fetchData();
      closeEditModal();
      alert('Concours modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      if (error.response?.status === 401) {
        alert('Erreur d\'authentification. Veuillez vous reconnecter.');
      } else {
        alert(`Erreur lors de la modification du concours: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const deleteCurrentContest = async () => {
    if (!currentContest) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concours ? Cette action est irréversible.')) {
      try {
        await api.delete(`/contests/${currentContest._id}`);
        await fetchData();
        alert('Concours supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du concours');
      }
    }
  };

  const deleteContest = async (contestId) => {
    if (!contestId) {
      alert('ID du concours manquant');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concours ? Cette action est irréversible.')) {
      try {
        await api.delete(`/contests/${contestId}`);
        await fetchData();
        alert('Concours supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        if (error.response?.status === 401) {
          alert('Erreur d\'authentification. Veuillez vous reconnecter.');
        } else {
          alert(`Erreur lors de la suppression du concours: ${error.response?.data?.error || error.message}`);
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', text: 'Actif' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Terminé' },
      drawing: { color: 'bg-yellow-100 text-yellow-800', text: 'Tirage en cours' }
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Concours Hebdomadaire</h1>
            <p className="text-gray-600 mt-1">Gestion du concours hebdomadaire automatique</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createWeeklyContest}
              disabled={creating || currentContest}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Créer un concours</span>
            </button>
                         {currentContest && (
               <>
                 <button
                   onClick={() => openEditModal(currentContest)}
                   className="btn-secondary flex items-center space-x-2"
                 >
                   <EyeIcon className="h-5 w-5" />
                   <span>Modifier le concours</span>
                 </button>
                 <button
                   onClick={deleteCurrentContest}
                   className="btn-secondary bg-red-600 hover:bg-red-700 flex items-center space-x-2"
                 >
                   <XCircleIcon className="h-5 w-5" />
                   <span>Supprimer le concours</span>
                 </button>
                 {currentContest.isDrawTime === true && (
                   <button
                     onClick={performDraw}
                     disabled={drawing}
                     className="btn-secondary flex items-center space-x-2"
                   >
                     <PlayIcon className="h-5 w-5" />
                     <span>{drawing ? 'Tirage en cours...' : 'Effectuer le tirage'}</span>
                   </button>
                 )}
               </>
             )}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concours cette année</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalContests || 0}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalParticipants || 0}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concours terminés</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedContests || 0}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concours actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeContests || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Concours actuel */}
      {currentContest && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Concours Actuel</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                                 <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentContest.title || 'Sans titre'}</h3>
                                 <p className="text-gray-600 mb-4">{currentContest.description || 'Aucune description disponible'}</p>
                
                <div className="space-y-3">
                                     <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Statut:</span>
                     {getStatusBadge(currentContest.status || 'unknown')}
                   </div>
                                     <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Participants:</span>
                     <span className="font-medium">{currentContest.currentParticipants || 0}</span>
                   </div>
                                     <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Début:</span>
                     <span className="font-medium">{currentContest.startDate ? formatDate(currentContest.startDate) : 'N/A'}</span>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Fin:</span>
                     <span className="font-medium">{currentContest.endDate ? formatDate(currentContest.endDate) : 'N/A'}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Tirage:</span>
                     <span className="font-medium">{currentContest.drawDate ? formatDate(currentContest.drawDate) : 'N/A'}</span>
                   </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Gestion des gagnants</h4>
                  <button
                    onClick={handleManageWinners}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1 transition-colors"
                  >
                    <GiftIcon className="h-4 w-4" />
                    <span>Gérer les gagnants</span>
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {currentContest.participants && currentContest.participants.length > 0 ? (
                    currentContest.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {participant.user?.fullName || `${participant.user?.firstName} ${participant.user?.lastName}`}
                          </p>
                          <p className="text-sm text-gray-600">{participant.user?.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.isWinner && (
                            <TrophyIcon className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(participant.joinedAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucun participant pour le moment</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vainqueurs */}
            {currentContest.winners && currentContest.winners.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Vainqueur(s)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentContest.winners.map((winner, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <TrophyIcon className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {winner.user?.fullName || `${winner.user?.firstName} ${winner.user?.lastName}`}
                          </p>
                          <p className="text-sm text-gray-600">{winner.prize}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => viewWinner(winner)}
                        className="btn-secondary"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des Concours</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vainqueur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
               {Array.isArray(history) && history.length > 0 ? (
                 history.map((contest, index) => (
                 <tr key={contest._id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                                         <div>
                       <div className="text-sm font-medium text-gray-900">{contest.title || 'Sans titre'}</div>
                       <div className="text-sm text-gray-500">Semaine {contest.weekNumber || 'N/A'} - {contest.year || 'N/A'}</div>
                     </div>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                     {contest.status ? getStatusBadge(contest.status) : getStatusBadge('unknown')}
                   </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {contest.currentParticipants || 0}
                   </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                     {contest.winners && contest.winners.length > 0 ? (
                       <div className="flex items-center space-x-2">
                         <span className="text-sm text-gray-900">
                           {contest.winners[0].user?.fullName || `${contest.winners[0].user?.firstName} ${contest.winners[0].user?.lastName}`}
                         </span>
                         <button
                           onClick={() => viewWinner(contest.winners[0])}
                           className="text-blue-600 hover:text-blue-800"
                         >
                           <EyeIcon className="h-4 w-4" />
                         </button>
                       </div>
                     ) : (
                       <span className="text-sm text-gray-500">Aucun vainqueur</span>
                     )}
                   </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {contest.createdAt ? formatDate(contest.createdAt) : 'N/A'}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <button
                       onClick={() => openEditModal(contest)}
                       className="text-blue-600 hover:text-blue-900 mr-2"
                     >
                       <EyeIcon className="h-5 w-5" />
                     </button>
                     <button
                       onClick={() => deleteContest(contest._id)}
                       className="text-red-600 hover:text-red-900"
                     >
                       <XCircleIcon className="h-5 w-5" />
                     </button>
                   </td>
                </tr>
               ))
               ) : (
                 <tr>
                   <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                     Aucun historique disponible
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

             {/* Modal pour modifier le concours */}
       {showEditModal && editingContest && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
             <div className="mt-3">
               <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                 <EyeIcon className="h-6 w-6 text-blue-600" />
               </div>
               <div className="mt-4 text-center">
                 <h3 className="text-lg font-medium text-gray-900">Modifier le Concours</h3>
                 <div className="mt-4 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                       <input
                         type="text"
                         value={editForm.title}
                         onChange={(e) => handleEditFormChange('title', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Participants max</label>
                       <input
                         type="number"
                         value={editForm.maxParticipants}
                         onChange={(e) => handleEditFormChange('maxParticipants', parseInt(e.target.value))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                     <textarea
                       value={editForm.description}
                       onChange={(e) => handleEditFormChange('description', e.target.value)}
                       rows={3}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                       <input
                         type="date"
                         value={editForm.startDate}
                         onChange={(e) => handleEditFormChange('startDate', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                       <input
                         type="date"
                         value={editForm.endDate}
                         onChange={(e) => handleEditFormChange('endDate', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Date de tirage</label>
                       <input
                         type="date"
                         value={editForm.drawDate}
                         onChange={(e) => handleEditFormChange('drawDate', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                   </div>
                 </div>
               </div>
               <div className="mt-6 flex space-x-3">
                 <button
                   onClick={closeEditModal}
                   className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                 >
                   Annuler
                 </button>
                 <button
                   onClick={saveContestChanges}
                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   Sauvegarder
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Modal pour voir les détails du vainqueur */}
       {showWinnerModal && selectedWinner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Détails du Vainqueur</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium text-gray-900">
                      {selectedWinner.user?.fullName || `${selectedWinner.user?.firstName} ${selectedWinner.user?.lastName}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedWinner.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix</p>
                    <p className="font-medium text-gray-900">{selectedWinner.prize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de sélection</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedWinner.selectedAt)}</p>
                  </div>
                  {selectedWinner.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-gray-900">{selectedWinner.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full btn-primary"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des gagnants */}
      <ManageWinnersModal
        isOpen={showManageWinnersModal}
        onClose={() => setShowManageWinnersModal(false)}
        contest={currentContest}
        onWinnersUpdated={handleWinnersUpdated}
      />
    </div>
  );
};

export default WeeklyContest;

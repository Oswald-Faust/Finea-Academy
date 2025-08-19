import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, UsersIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function AllParticipants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContestId, setSelectedContestId] = useState('all');
  const [contests, setContests] = useState([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    fetchContests();
    fetchParticipants();
  }, [selectedContestId]);

  const fetchContests = async () => {
    try {
      const response = await api.get('/contests');
      if (response.data.success) {
        setContests(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des concours:', error);
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      let url = '/contests/participants/all';
      if (selectedContestId !== 'all') {
        url = `/contests/${selectedContestId}/participants`;
      }
      
      const response = await api.get(url);
      if (response.data.success) {
        setParticipants(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      toast.error('Erreur lors du chargement des participants');
    } finally {
      setLoading(false);
    }
  };

  const selectWinners = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Veuillez sélectionner au moins un participant');
      return;
    }

    if (selectedParticipants.length > 3) {
      toast.error('Maximum 3 gagnants autorisés');
      return;
    }

    try {
      const response = await api.post(`/contests/${selectedContestId}/winners/select`, {
        participants: selectedParticipants
      });

      if (response.data.success) {
        toast.success('Gagnants sélectionnés avec succès !');
        setShowWinnerModal(false);
        setSelectedParticipants([]);
        fetchParticipants();
      }
    } catch (error) {
      console.error('Erreur lors de la sélection des gagnants:', error);
      toast.error('Erreur lors de la sélection des gagnants');
    }
  };

  const toggleParticipantSelection = (participant) => {
    setSelectedParticipants(prev => {
      const isSelected = prev.find(p => p._id === participant._id);
      if (isSelected) {
        return prev.filter(p => p._id !== participant._id);
      } else {
        if (prev.length >= 3) {
          toast.warning('Maximum 3 gagnants autorisés');
          return prev;
        }
        return [...prev, participant];
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      participant: 'bg-blue-100 text-blue-800',
      winner: 'bg-green-100 text-green-800',
      eliminated: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      participant: 'Participant',
      winner: 'Gagnant',
      eliminated: 'Éliminé'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tous les Participants
                </h1>
                <p className="text-gray-600">
                  Gérez tous les participants aux concours
                </p>
              </div>
            </div>
            
            {selectedContestId !== 'all' && (
              <button
                onClick={() => setShowWinnerModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <TrophyIcon className="h-5 w-5" />
                <span>Sélectionner les Gagnants</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Filtrer par concours :
            </label>
            <select
              value={selectedContestId}
              onChange={(e) => setSelectedContestId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
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

        {/* Liste des participants */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Participants ({participants.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun participant</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun participant trouvé pour les critères sélectionnés.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position (si gagnant)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant, index) => (
                    <tr key={`${participant.contestId}-${participant.userId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {participant.userEmail ? participant.userEmail.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.userEmail || 'Utilisateur anonyme'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {participant.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.contestTitle}</div>
                        <div className="text-sm text-gray-500">Semaine {participant.contestWeek}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(participant.joinedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.winnerPosition ? `#${participant.winnerPosition}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de sélection des gagnants */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sélectionner les Gagnants
                </h3>
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez jusqu'à 3 gagnants parmi les participants. Cliquez sur les participants pour les sélectionner.
              </p>

              <div className="max-h-96 overflow-y-auto mb-4">
                {participants
                  .filter(p => p.status === 'participant')
                  .map(participant => (
                    <div
                      key={participant.userId}
                      onClick={() => toggleParticipantSelection(participant)}
                      className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                        selectedParticipants.find(p => p._id === participant._id)
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{participant.userEmail || 'Utilisateur anonyme'}</div>
                          <div className="text-sm text-gray-500">
                            Inscrit le {formatDate(participant.joinedAt)}
                          </div>
                        </div>
                        {selectedParticipants.find(p => p._id === participant._id) && (
                          <div className="text-blue-600">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedParticipants.length}/3 gagnants sélectionnés
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowWinnerModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={selectWinners}
                    disabled={selectedParticipants.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmer la Sélection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllParticipants;

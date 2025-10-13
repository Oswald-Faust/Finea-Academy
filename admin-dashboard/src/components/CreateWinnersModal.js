import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  TrophyIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  CurrencyEuroIcon,
  UsersIcon,
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { contestAPI } from '../services/api';

const CreateWinnersModal = ({ isOpen, onClose, contests, onWinnersUpdated }) => {
  const [selectedContests, setSelectedContests] = useState([]);
  const [winners, setWinners] = useState([]);
  const [stats, setStats] = useState({
    totalGains: 0,
    totalPlacesSold: 0,
    totalWinners: 0
  });
  const [loading, setLoading] = useState(false);
  const [newWinner, setNewWinner] = useState({
    contestId: '',
    firstName: '',
    lastName: '',
    email: '',
    prize: '',
    amount: '',
    position: 1,
    drawDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadGlobalStats();
      // Initialiser avec la date d'aujourd'hui
      setNewWinner(prev => ({
        ...prev,
        drawDate: new Date().toISOString().split('T')[0]
      }));
    } else {
      // Reset quand le modal se ferme
      setSelectedContests([]);
      setWinners([]);
      setNewWinner({
        contestId: '',
        firstName: '',
        lastName: '',
        email: '',
        prize: '',
        amount: '',
        position: 1,
        drawDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

  const loadGlobalStats = async () => {
    try {
      const response = await contestAPI.get('/contests/stats/global');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleContestToggle = (contestId) => {
    setSelectedContests(prev => 
      prev.includes(contestId) 
        ? prev.filter(id => id !== contestId)
        : [...prev, contestId]
    );
  };

  const handleAddWinner = () => {
    if (!newWinner.contestId || !newWinner.firstName || !newWinner.lastName || !newWinner.prize) {
      toast.error('Veuillez remplir au moins le concours, prénom, nom et prix');
      return;
    }

    const contest = contests.find(c => c._id === newWinner.contestId);
    if (!contest) {
      toast.error('Concours non trouvé');
      return;
    }

    // Vérifier la position
    const existingPositions = winners
      .filter(w => w.contestId === newWinner.contestId)
      .map(w => w.position);
    
    let position = newWinner.position;
    while (existingPositions.includes(position)) {
      position++;
    }

    const winner = {
      id: Date.now(), // ID temporaire pour la gestion locale
      contestId: newWinner.contestId,
      contestTitle: contest.title,
      firstName: newWinner.firstName,
      lastName: newWinner.lastName,
      email: newWinner.email,
      prize: newWinner.prize,
      amount: parseFloat(newWinner.amount) || 0,
      position: position,
      drawDate: newWinner.drawDate || new Date().toISOString().split('T')[0]
    };

    setWinners(prev => [...prev, winner]);
    
    // Reset du formulaire
    setNewWinner(prev => ({
      ...prev,
      firstName: '',
      lastName: '',
      email: '',
      prize: '',
      amount: '',
      position: 1
    }));

    toast.success('Gagnant ajouté à la liste');
  };

  const handleRemoveWinner = (winnerId) => {
    setWinners(prev => prev.filter(w => w.id !== winnerId));
    toast.success('Gagnant supprimé de la liste');
  };

  const handleSave = async () => {
    if (winners.length === 0) {
      toast.error('Aucun gagnant à sauvegarder');
      return;
    }

    if (selectedContests.length === 0) {
      toast.error('Veuillez sélectionner au moins un concours');
      return;
    }

    try {
      setLoading(true);

      // Grouper les gagnants par concours
      const winnersByContest = {};
      winners.forEach(winner => {
        if (!winnersByContest[winner.contestId]) {
          winnersByContest[winner.contestId] = [];
        }
        winnersByContest[winner.contestId].push(winner);
      });

      // Sauvegarder les gagnants pour chaque concours
      const savePromises = Object.entries(winnersByContest).map(([contestId, contestWinners]) => {
        return contestAPI.post(`/contests/${contestId}/winners/manual`, {
          winners: contestWinners.map(winner => ({
            firstName: winner.firstName,
            lastName: winner.lastName,
            email: winner.email,
            prize: winner.prize,
            amount: winner.amount,
            position: winner.position,
            drawDate: winner.drawDate
          }))
        });
      });

      await Promise.all(savePromises);

      // Calculer les nouvelles statistiques
      const totalNewWinners = winners.length;
      const totalNewGains = winners.reduce((sum, winner) => sum + winner.amount, 0);

      // Mettre à jour les statistiques globales
      const newStats = {
        totalWinners: stats.totalWinners + totalNewWinners,
        totalGains: stats.totalGains + totalNewGains,
        totalPlacesSold: stats.totalPlacesSold // Pas de changement pour les places vendues
      };

      await contestAPI.put('/contests/stats/global', newStats);

      toast.success(`${winners.length} gagnant(s) ajouté(s) avec succès à ${Object.keys(winnersByContest).length} concours !`);
      onWinnersUpdated && onWinnersUpdated();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const getContestName = (contestId) => {
    const contest = contests.find(c => c._id === contestId);
    return contest ? contest.title : 'Concours inconnu';
  };

  const getWinnersForContest = (contestId) => {
    return winners.filter(w => w.contestId === contestId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 text-yellow-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Créer des Gagnants pour Plusieurs Concours
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section gauche - Sélection des concours */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Sélectionner les Concours</h4>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {contests.map(contest => (
                    <label key={contest._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedContests.includes(contest._id)}
                        onChange={() => handleContestToggle(contest._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{contest.title}</div>
                        <div className="text-xs text-gray-500">
                          Tirage: {new Date(contest.drawDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      {selectedContests.includes(contest._id) && (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      )}
                    </label>
                  ))}
                </div>

                {/* Statistiques globales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Statistiques Globales</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Gains Total</div>
                      <div className="font-medium">{stats.totalGains}€</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Places Vendues</div>
                      <div className="font-medium">{stats.totalPlacesSold}€</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Nombre de Gagnants</div>
                      <div className="font-medium">{stats.totalWinners}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section droite - Ajout de gagnants */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Ajouter un Gagnant</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Concours *
                    </label>
                    <select
                      value={newWinner.contestId}
                      onChange={(e) => setNewWinner(prev => ({ ...prev, contestId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner un concours</option>
                      {contests.map(contest => (
                        <option key={contest._id} value={contest._id}>
                          {contest.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={newWinner.firstName}
                        onChange={(e) => setNewWinner(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={newWinner.lastName}
                        onChange={(e) => setNewWinner(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={newWinner.email}
                      onChange={(e) => setNewWinner(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix *
                      </label>
                      <input
                        type="text"
                        value={newWinner.prize}
                        onChange={(e) => setNewWinner(prev => ({ ...prev, prize: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 58€"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant (€)
                      </label>
                      <input
                        type="number"
                        value={newWinner.amount}
                        onChange={(e) => setNewWinner(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="58"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newWinner.position}
                        onChange={(e) => setNewWinner(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date du Tirage
                      </label>
                      <input
                        type="date"
                        value={newWinner.drawDate}
                        onChange={(e) => setNewWinner(prev => ({ ...prev, drawDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddWinner}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter le Gagnant
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des gagnants ajoutés */}
            {winners.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Gagnants à Ajouter ({winners.length})
                </h4>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  {selectedContests.map(contestId => {
                    const contestWinners = getWinnersForContest(contestId);
                    if (contestWinners.length === 0) return null;

                    return (
                      <div key={contestId} className="border-b border-gray-200 last:border-b-0">
                        <div className="bg-gray-50 px-4 py-2">
                          <h5 className="text-sm font-medium text-gray-900">
                            {getContestName(contestId)} ({contestWinners.length} gagnant(s))
                          </h5>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {contestWinners.map(winner => (
                            <div key={winner.id} className="flex items-center justify-between px-4 py-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    #{winner.position}
                                  </span>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {winner.firstName} {winner.lastName}
                                    </div>
                                    {winner.email && (
                                      <div className="text-sm text-gray-500">{winner.email}</div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-900">{winner.prize}</div>
                                  <div className="text-sm font-medium text-gray-900">{winner.amount}€</div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveWinner(winner.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSave}
              disabled={loading || winners.length === 0 || selectedContests.length === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWinnersModal;

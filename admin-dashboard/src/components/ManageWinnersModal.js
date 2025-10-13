import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  TrophyIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  CurrencyEuroIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { contestAPI } from '../services/api';

const ManageWinnersModal = ({ isOpen, onClose, contest, onWinnersUpdated }) => {
  const [winners, setWinners] = useState([]);
  const [stats, setStats] = useState({
    totalGains: 0,
    totalPlacesSold: 0,
    totalWinners: 0
  });
  const [loading, setLoading] = useState(false);
  const [newWinner, setNewWinner] = useState({
    firstName: '',
    lastName: '',
    email: '',
    prize: '',
    amount: '',
    drawDate: ''
  });

  useEffect(() => {
    if (isOpen && contest) {
      console.log('🎯 ManageWinnersModal - Contest reçu:', contest);
      console.log('🎯 ManageWinnersModal - Contest ID:', contest._id);
      loadWinnersData();
    }
  }, [isOpen, contest]);

  const loadWinnersData = async () => {
    try {
      // Charger les gagnants existants du concours
      if (contest.winners && contest.winners.length > 0) {
        setWinners(contest.winners.map(winner => ({
          id: winner._id || winner.user?._id,
          firstName: winner.user?.firstName || '',
          lastName: winner.user?.lastName || '',
          email: winner.user?.email || '',
          prize: winner.prize || '',
          amount: winner.amount || 0,
          position: winner.position || 1,
          drawDate: winner.selectedAt || new Date().toISOString().split('T')[0]
        })));
      }

      // Charger les statistiques globales
      await loadGlobalStats();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

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

  const handleAddWinner = () => {
    if (!newWinner.firstName || !newWinner.lastName || !newWinner.prize) {
      toast.error('Veuillez remplir au moins le prénom, nom et prix');
      return;
    }

    const winner = {
      id: Date.now(), // ID temporaire
      ...newWinner,
      amount: parseFloat(newWinner.amount) || 0,
      position: winners.length + 1
    };

    setWinners([...winners, winner]);
    setNewWinner({
      firstName: '',
      lastName: '',
      email: '',
      prize: '',
      amount: '',
      drawDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleRemoveWinner = (winnerId) => {
    setWinners(winners.filter(w => w.id !== winnerId));
  };

  const handleStatsChange = (field, value) => {
    setStats(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Vérifier que le concours a un ID valide
      if (!contest || !contest._id) {
        throw new Error('Aucun concours sélectionné ou ID manquant');
      }

      // Sauvegarder les gagnants
      const winnersResponse = await contestAPI.post(`/contests/${contest._id}/winners/manual`, {
        winners: winners.map(winner => ({
          firstName: winner.firstName,
          lastName: winner.lastName,
          email: winner.email,
          prize: winner.prize,
          amount: winner.amount,
          position: winner.position,
          drawDate: winner.drawDate
        }))
      });

      if (!winnersResponse.data.success) {
        throw new Error('Erreur lors de la sauvegarde des gagnants');
      }

      // Sauvegarder les statistiques globales
      const statsResponse = await contestAPI.put('/contests/stats/global', stats);

      if (!statsResponse.data.success) {
        throw new Error('Erreur lors de la sauvegarde des statistiques');
      }

      toast.success('Gagnants et statistiques sauvegardés avec succès !');
      onWinnersUpdated && onWinnersUpdated();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Gestion des Gagnants - {contest?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Statistiques Globales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                Statistiques Globales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gains Total (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stats.totalGains}
                    onChange={(e) => handleStatsChange('totalGains', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Places Vendues (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stats.totalPlacesSold}
                    onChange={(e) => handleStatsChange('totalPlacesSold', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Gagnants
                  </label>
                  <input
                    type="number"
                    value={stats.totalWinners}
                    onChange={(e) => handleStatsChange('totalWinners', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Ajouter un Gagnant */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Ajouter un Gagnant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={newWinner.firstName}
                    onChange={(e) => setNewWinner({...newWinner, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={newWinner.lastName}
                    onChange={(e) => setNewWinner({...newWinner, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={newWinner.email}
                    onChange={(e) => setNewWinner({...newWinner, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix
                  </label>
                  <input
                    type="text"
                    value={newWinner.prize}
                    onChange={(e) => setNewWinner({...newWinner, prize: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 58€"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newWinner.amount}
                    onChange={(e) => setNewWinner({...newWinner, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="58.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du Tirage
                  </label>
                  <input
                    type="date"
                    value={newWinner.drawDate}
                    onChange={(e) => setNewWinner({...newWinner, drawDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAddWinner}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter le Gagnant
                </button>
              </div>
            </div>

            {/* Liste des Gagnants */}
            {winners.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Gagnants ({winners.length})
                </h3>
                <div className="space-y-3">
                  {winners.map((winner, index) => (
                    <div key={winner.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            #{winner.position}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {winner.firstName} {winner.lastName}
                            </div>
                            {winner.email && (
                              <div className="text-sm text-gray-500">{winner.email}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{winner.prize}</div>
                            {winner.amount > 0 && (
                              <div className="text-sm text-gray-500">{winner.amount}€</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveWinner(winner.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageWinnersModal;

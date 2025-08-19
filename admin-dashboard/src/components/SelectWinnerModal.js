import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  TrophyIcon,
  UserIcon,
  StarIcon,
  GiftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Configuration automatique de l'URL selon l'environnement
const getApiBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return 'http://localhost:5000/api';
  } else {
    return 'https://finea-api-production.up.railway.app/api';
  }
};

const SelectWinnerModal = ({ isOpen, onClose, contest, onWinnerSelected }) => {
  const [participants, setParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [position, setPosition] = useState(1);
  const [prize, setPrize] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState([]);

  useEffect(() => {
    if (contest) {
      setParticipants(contest.participants || []);
      
      // Calculer les positions disponibles
      const usedPositions = contest.winners.map(w => w.position);
      const maxPosition = Math.max(...usedPositions, 0);
      const available = [];
      for (let i = 1; i <= Math.max(maxPosition + 1, contest.prizes.length); i++) {
        if (!usedPositions.includes(i)) {
          available.push(i);
        }
      }
      setAvailablePositions(available);
      setPosition(available[0] || 1);
      
      // Trouver le prix correspondant
      const prizeObj = contest.prizes.find(p => p.position === position);
      setPrize(prizeObj ? prizeObj.name : '');
    }
  }, [contest, position]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un participant');
      return;
    }

    if (!prize.trim()) {
      toast.error('Veuillez spécifier le prix');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${getApiBaseUrl()}/contests/${contest._id}/winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          position,
          prize: prize.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Vainqueur sélectionné avec succès !');
        onWinnerSelected && onWinnerSelected();
        handleClose();
      } else {
        toast.error(data.error || 'Erreur lors de la sélection du vainqueur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sélection du vainqueur');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setPosition(1);
    setPrize('');
    setNotes('');
    onClose();
  };

  const getPositionBadge = (pos) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-gray-100 text-gray-800',
      3: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[pos] || 'bg-blue-100 text-blue-800'}`}>
        {pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}e`}
      </span>
    );
  };

  if (!isOpen || !contest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sélectionner un vainqueur
              </h3>
              <p className="text-sm text-gray-500">
                {contest.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => {
                  setPosition(parseInt(e.target.value));
                  const prizeObj = contest.prizes.find(p => p.position === parseInt(e.target.value));
                  setPrize(prizeObj ? prizeObj.name : '');
                }}
                className="w-full input-field"
              >
                {availablePositions.map(pos => (
                  <option key={pos} value={pos}>
                    {getPositionBadge(pos).props.children} Position {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix à attribuer
              </label>
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="Ex: Formation Premium"
                className="w-full input-field"
                required
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un participant
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {participants.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {participants.map((participant) => {
                      const isWinner = contest.winners.some(w => w.user === participant.user._id);
                      return (
                        <div
                          key={participant.user._id}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedUser?._id === participant.user._id
                              ? 'bg-primary-50 border-primary-200'
                              : 'hover:bg-gray-50'
                          } ${isWinner ? 'opacity-50' : ''}`}
                          onClick={() => !isWinner && setSelectedUser(participant.user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-primary-600" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {participant.user.fullName || `${participant.user.firstName || ''} ${participant.user.lastName || ''}`.trim()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {participant.user.email}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Inscrit le {new Date(participant.joinedAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isWinner && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                                  Vainqueur
                                </span>
                              )}
                              {selectedUser?._id === participant.user._id && (
                                <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>Aucun participant</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur la sélection..."
                rows={3}
                className="w-full input-field resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {notes.length}/500 caractères
              </div>
            </div>

            {/* Résumé */}
            {selectedUser && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Résumé de la sélection</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Position:</span>
                    <span className="text-blue-900">{getPositionBadge(position).props.children} Position {position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Vainqueur:</span>
                    <span className="text-blue-900">{selectedUser.fullName || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Prix:</span>
                    <span className="text-blue-900">{prize}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading || !selectedUser}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sélection...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    Sélectionner le vainqueur
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SelectWinnerModal; 
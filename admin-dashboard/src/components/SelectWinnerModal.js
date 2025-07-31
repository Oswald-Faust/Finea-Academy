import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  TrophyIcon,
  UserIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  GiftIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SelectWinnerModal = ({ isOpen, onClose, contest, onWinnerSelected }) => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [selectedPrize, setSelectedPrize] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [randomSelection, setRandomSelection] = useState(false);

  useEffect(() => {
    if (contest && isOpen) {
      // Filtrer les participants qui ne sont pas encore vainqueurs
      const availableParticipants = contest.participants.filter(p => !p.isWinner);
      setParticipants(availableParticipants);
      setFilteredParticipants(availableParticipants);
      
      // Déterminer la prochaine position disponible
      const nextPosition = contest.winners.length + 1;
      setSelectedPosition(nextPosition);
      
      // Sélectionner le prix correspondant à la position
      const prizeForPosition = contest.prizes.find(p => p.position === nextPosition);
      if (prizeForPosition) {
        setSelectedPrize(prizeForPosition.name);
      }
    }
  }, [contest, isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = participants.filter(participant => {
        const user = participant.user;
        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchTerm, participants]);

  const handleSubmit = async () => {
    if (!selectedWinner) {
      toast.error('Veuillez sélectionner un vainqueur');
      return;
    }

    if (!selectedPrize) {
      toast.error('Veuillez spécifier le prix');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/contests/${contest._id}/winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedWinner._id,
          position: selectedPosition,
          prize: selectedPrize,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Vainqueur sélectionné pour la position ${selectedPosition} !`);
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

  const handleRandomSelection = () => {
    if (filteredParticipants.length === 0) {
      toast.error('Aucun participant disponible');
      return;
    }

    setRandomSelection(true);
    
    // Animation de sélection aléatoire
    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredParticipants.length);
      setSelectedWinner(filteredParticipants[randomIndex].user);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        setRandomSelection(false);
        toast.success('Sélection aléatoire terminée !');
      }
    }, 100);
  };

  const handleClose = () => {
    setSelectedWinner(null);
    setSelectedPosition(1);
    setSelectedPrize('');
    setNotes('');
    setSearchTerm('');
    setRandomSelection(false);
    onClose();
  };

  const getPositionDisplay = (position) => {
    switch (position) {
      case 1: return { emoji: '🥇', label: '1ère place' };
      case 2: return { emoji: '🥈', label: '2ème place' };
      case 3: return { emoji: '🥉', label: '3ème place' };
      default: return { emoji: '🏆', label: `${position}ème place` };
    }
  };

  if (!isOpen || !contest) return null;

  const positionDisplay = getPositionDisplay(selectedPosition);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-400 to-orange-500">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Sélectionner le vainqueur
              </h3>
              <p className="text-sm text-yellow-100">
                {contest.title} - {positionDisplay.emoji} {positionDisplay.label}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-yellow-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Participants disponibles ({filteredParticipants.length})
                </h4>
                <button
                  onClick={handleRandomSelection}
                  disabled={filteredParticipants.length === 0 || randomSelection}
                  className="btn-secondary flex items-center"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {randomSelection ? 'Sélection...' : 'Aléatoire'}
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un participant..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Participants List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => {
                    const user = participant.user;
                    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    const isSelected = selectedWinner?._id === user._id;
                    
                    return (
                      <div
                        key={participant._id}
                        onClick={() => setSelectedWinner(user)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${randomSelection ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              <UserIcon className={`h-6 w-6 ${
                                isSelected ? 'text-yellow-600' : 'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fullName || 'Nom non défini'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              Inscrit le {new Date(participant.joinedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <StarIcon className="h-5 w-5 text-yellow-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun participant trouvé
                    </h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Aucun participant ne correspond à votre recherche.'
                        : 'Tous les participants ont déjà été sélectionnés comme vainqueurs.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Winner Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Détails du vainqueur
                </h4>

                {selectedWinner ? (
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{positionDisplay.emoji}</div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedWinner.fullName || 
                         `${selectedWinner.firstName || ''} ${selectedWinner.lastName || ''}`.trim() ||
                         'Nom non défini'}
                      </h3>
                      <p className="text-gray-600">{selectedWinner.email}</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mt-2">
                        {positionDisplay.label}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Sélectionnez un participant pour commencer</p>
                  </div>
                )}

                {/* Prize Details */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={selectedPosition}
                      onChange={(e) => {
                        const newPosition = parseInt(e.target.value);
                        setSelectedPosition(newPosition);
                        // Auto-sélectionner le prix correspondant
                        const prizeForPosition = contest.prizes.find(p => p.position === newPosition);
                        if (prizeForPosition) {
                          setSelectedPrize(prizeForPosition.name);
                        }
                      }}
                      className="w-full input-field"
                    >
                      {Array.from({ length: Math.max(5, contest.prizes.length) }, (_, i) => i + 1)
                        .filter(pos => !contest.winners.some(w => w.position === pos))
                        .map(position => (
                          <option key={position} value={position}>
                            {getPositionDisplay(position).emoji} {getPositionDisplay(position).label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix / Récompense *
                    </label>
                    <input
                      type="text"
                      value={selectedPrize}
                      onChange={(e) => setSelectedPrize(e.target.value)}
                      placeholder="Ex: 500€ en cash"
                      className="w-full input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ajoutez des notes sur la sélection..."
                      rows={3}
                      className="w-full input-field resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {contest.winners.length > 0 && (
              <p>
                {contest.winners.length} vainqueur(s) déjà sélectionné(s)
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            
            <button
              onClick={handleSubmit}
              className="btn-primary flex items-center"
              disabled={loading || !selectedWinner || !selectedPrize}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sélection...
                </>
              ) : (
                <>
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  Confirmer la sélection
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectWinnerModal;
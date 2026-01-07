import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { standaloneWinnersAPI, userAPI } from '../services/api';

const EditWinnerModal = ({ isOpen, onClose, winner, onWinnerUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    prize: '',
    amount: '',
    position: 1,
    drawDate: '',
    userId: null,
    username: '',
    ethAddress: ''
  });

  // Charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userAPI.getUsers({ limit: 1000 });
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      }
    };
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Initialiser le formulaire avec les données du gagnant
  useEffect(() => {
    if (winner) {
      setFormData({
        firstName: winner.firstName || '',
        lastName: winner.lastName || '',
        email: winner.email || '',
        prize: winner.prize || '',
        amount: winner.amount || '',
        position: winner.position || 1,
        drawDate: winner.drawDate ? new Date(winner.drawDate).toISOString().split('T')[0] : '',
        userId: winner.userId || null,
        username: winner.username || '',
        ethAddress: winner.ethAddress || ''
      });
      setSearchUser(winner.username ? `@${winner.username}` : '');
    }
  }, [winner]);

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user => {
    const search = searchUser.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  }).slice(0, 10);

  const handleSelectUser = (user) => {
    setFormData(prev => ({
      ...prev,
      firstName: user.firstName || prev.firstName,
      lastName: user.lastName || prev.lastName,
      email: user.email || prev.email,
      userId: user._id,
      username: user.username || `${user.firstName} ${user.lastName}`
    }));
    setSearchUser(`@${user.username || user.email}`);
    setShowUserDropdown(false);
  };

  const handleClearUser = () => {
    setFormData(prev => ({
      ...prev,
      userId: null,
      username: ''
    }));
    setSearchUser('');
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.prize) {
      toast.error('Veuillez remplir au moins le prénom, nom et prix');
      return;
    }

    try {
      setLoading(true);

      const response = await standaloneWinnersAPI.update(winner._id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        prize: formData.prize,
        amount: parseFloat(formData.amount) || 0,
        position: formData.position,
        drawDate: formData.drawDate,
        userId: formData.userId,
        username: formData.username,
        ethAddress: formData.ethAddress
      });

      if (response.data.success) {
        toast.success('Gagnant modifié avec succès !');
        onWinnerUpdated && onWinnerUpdated();
        onClose();
      } else {
        throw new Error(response.data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <PencilIcon className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Modifier le Gagnant
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Formulaire d'édition */}
            <div className="space-y-4">
              {/* Sélection d'utilisateur (pour position 1) */}
              {formData.position === 1 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    🏆 Gagnant Principal (Position #1)
                  </h4>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lier à un utilisateur Finea
                    </label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          value={searchUser}
                          onChange={(e) => {
                            setSearchUser(e.target.value);
                            setShowUserDropdown(true);
                          }}
                          onFocus={() => setShowUserDropdown(true)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Rechercher par username, nom ou email..."
                        />
                      </div>
                      {formData.userId && (
                        <button
                          onClick={handleClearUser}
                          className="ml-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                    {/* Dropdown des utilisateurs */}
                    {showUserDropdown && searchUser && filteredUsers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredUsers.map(user => (
                          <button
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium">{user.firstName} {user.lastName}</span>
                              {user.username && (
                                <span className="text-gray-500 ml-2">@{user.username}</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{user.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Adresse ETH */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse Ethereum (visible uniquement par le gagnant)
                    </label>
                    <input
                      type="text"
                      value={formData.ethAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, ethAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    value={formData.prize}
                    onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
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
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date du Tirage
                  </label>
                  <input
                    type="date"
                    value={formData.drawDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, drawDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
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

export default EditWinnerModal;

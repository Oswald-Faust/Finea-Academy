import React, { useState } from 'react';
import {
  XMarkIcon,
  TrophyIcon,
  CalendarIcon,
  UsersIcon,
  GiftIcon,
  DocumentTextIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateContestModal = ({ isOpen, onClose, onContestCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    startDate: '',
    endDate: '',
    drawDate: '',
    maxParticipants: '',
    rules: '',
    eligibilityCriteria: {
      minAge: 18,
      requiredLevel: 'all',
      activeUserOnly: true,
    },
    prizes: [],
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.drawDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      const contestData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        prizes: formData.prizes.filter(prize => prize.name && prize.name.trim()),
      };

      const response = await fetch('https://finea-api-production.up.railway.app/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contestData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Concours créé avec succès !');
        onContestCreated && onContestCreated();
        handleClose();
      } else {
        toast.error(data.error || 'Erreur lors de la création du concours');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du concours');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'general',
      startDate: '',
      endDate: '',
      drawDate: '',
      maxParticipants: '',
      rules: '',
      eligibilityCriteria: {
        minAge: 18,
        requiredLevel: 'all',
        activeUserOnly: true,
      },
      prizes: [],
    });
    setShowAdvanced(false);
    onClose();
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: prev.prizes.length + 1, name: '', description: '', value: '', type: 'other' }]
    }));
  };

  const removePrize = (index) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const updatePrize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Créer un nouveau concours
              </h3>
              <p className="text-sm text-gray-500">
                Configurez tous les paramètres de votre concours
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
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du concours *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Concours Trading 2024"
                  className="w-full input-field"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de concours
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full input-field"
                >
                  <option value="general">Général</option>
                  <option value="trading">Trading</option>
                  <option value="bourse">Bourse</option>
                  <option value="formation">Formation</option>
                  <option value="special">Spécial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre concours..."
                rows={4}
                className="w-full input-field resize-none"
                maxLength={2000}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 caractères
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de tirage *
                </label>
                <input
                  type="datetime-local"
                  value={formData.drawDate}
                  onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                  className="w-full input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de participants (optionnel)
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="Laissez vide pour illimité"
                className="w-full input-field"
                min="1"
              />
            </div>

            {/* Prix */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Prix à gagner
                </label>
                <button
                  type="button"
                  onClick={addPrize}
                  className="btn-secondary flex items-center text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter un prix
                </button>
              </div>

              <div className="space-y-4">
                {formData.prizes.map((prize, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Prix #{prize.position}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removePrize(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom du prix
                        </label>
                        <input
                          type="text"
                          value={prize.name}
                          onChange={(e) => updatePrize(index, 'name', e.target.value)}
                          placeholder="Ex: Formation Premium"
                          className="w-full input-field text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={prize.type}
                          onChange={(e) => updatePrize(index, 'type', e.target.value)}
                          className="w-full input-field text-sm"
                        >
                          <option value="other">Autre</option>
                          <option value="money">Argent</option>
                          <option value="formation">Formation</option>
                          <option value="equipment">Équipement</option>
                          <option value="certificate">Certificat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Valeur (optionnel)
                        </label>
                        <input
                          type="number"
                          value={prize.value}
                          onChange={(e) => updatePrize(index, 'value', e.target.value)}
                          placeholder="0"
                          className="w-full input-field text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={prize.description}
                        onChange={(e) => updatePrize(index, 'description', e.target.value)}
                        placeholder="Description du prix..."
                        rows={2}
                        className="w-full input-field text-sm resize-none"
                      />
                    </div>
                  </div>
                ))}

                {formData.prizes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <GiftIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm">Aucun prix configuré</p>
                    <p className="text-xs">Cliquez sur "Ajouter un prix" pour commencer</p>
                  </div>
                )}
              </div>
            </div>

            {/* Règles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Règles du concours
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Décrivez les règles et conditions du concours..."
                rows={4}
                className="w-full input-field resize-none"
                maxLength={2000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.rules.length}/2000 caractères
              </div>
            </div>

            {/* Options avancées */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <CogIcon className="h-4 w-4" />
                <span>Critères d'éligibilité</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge minimum
                    </label>
                    <input
                      type="number"
                      value={formData.eligibilityCriteria.minAge}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: {
                          ...formData.eligibilityCriteria,
                          minAge: parseInt(e.target.value)
                        }
                      })}
                      className="w-full input-field"
                      min="13"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau requis
                    </label>
                    <select
                      value={formData.eligibilityCriteria.requiredLevel}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: {
                          ...formData.eligibilityCriteria,
                          requiredLevel: e.target.value
                        }
                      })}
                      className="w-full input-field"
                    >
                      <option value="all">Tous niveaux</option>
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activeUserOnly"
                      checked={formData.eligibilityCriteria.activeUserOnly}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: {
                          ...formData.eligibilityCriteria,
                          activeUserOnly: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activeUserOnly" className="ml-2 block text-sm text-gray-900">
                      Utilisateurs actifs uniquement
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
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
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    Créer le concours
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

export default CreateContestModal; 
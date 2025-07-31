import React, { useState } from 'react';
import {
  XMarkIcon,
  TrophyIcon,
  CalendarIcon,
  UsersIcon,
  GiftIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateContestModal = ({ isOpen, onClose, onContestCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    prizes: [
      { position: 1, name: '', description: '', value: '', type: 'money' }
    ],
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, name: 'Informations de base', icon: TrophyIcon },
    { id: 2, name: 'Dates et participants', icon: CalendarIcon },
    { id: 3, name: 'Prix et règles', icon: GiftIcon },
  ];

  const contestTypes = [
    { value: 'trading', label: 'Trading', icon: '📈', color: 'purple' },
    { value: 'bourse', label: 'Bourse', icon: '📊', color: 'blue' },
    { value: 'formation', label: 'Formation', icon: '🎓', color: 'green' },
    { value: 'general', label: 'Général', icon: '🏆', color: 'orange' },
    { value: 'special', label: 'Spécial', icon: '✨', color: 'pink' },
  ];

  const prizeTypes = [
    { value: 'money', label: 'Argent', icon: '💰' },
    { value: 'formation', label: 'Formation', icon: '📚' },
    { value: 'equipment', label: 'Équipement', icon: '🎧' },
    { value: 'certificate', label: 'Certificat', icon: '📜' },
    { value: 'other', label: 'Autre', icon: '🎁' },
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.title || !formData.description) {
        toast.error('Le titre et la description sont requis');
        return;
      }

      if (!formData.startDate || !formData.endDate || !formData.drawDate) {
        toast.error('Toutes les dates sont requises');
        return;
      }

      // Vérifier la logique des dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const draw = new Date(formData.drawDate);

      if (start >= end) {
        toast.error('La date de fin doit être après la date de début');
        return;
      }

      if (draw < end) {
        toast.error('La date de tirage doit être après la date de fin');
        return;
      }

      const response = await fetch('http://localhost:5000/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          prizes: formData.prizes.filter(p => p.name.trim()),
        }),
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
    setCurrentStep(1);
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
      prizes: [
        { position: 1, name: '', description: '', value: '', type: 'money' }
      ],
    });
    onClose();
  };

  const addPrize = () => {
    setFormData({
      ...formData,
      prizes: [
        ...formData.prizes,
        {
          position: formData.prizes.length + 1,
          name: '',
          description: '',
          value: '',
          type: 'money'
        }
      ]
    });
  };

  const removePrize = (index) => {
    const newPrizes = formData.prizes.filter((_, i) => i !== index);
    // Réorganiser les positions
    const reorderedPrizes = newPrizes.map((prize, i) => ({
      ...prize,
      position: i + 1
    }));
    setFormData({
      ...formData,
      prizes: reorderedPrizes
    });
  };

  const updatePrize = (index, field, value) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setFormData({ ...formData, prizes: newPrizes });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <TrophyIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Créer un nouveau concours
              </h3>
              <p className="text-sm text-primary-100">
                Étape {currentStep} sur {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-primary-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center ${
                    isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isCompleted ? 'bg-green-100 border-green-600' :
                      isCurrent ? 'bg-primary-100 border-primary-600' : 'bg-white border-gray-300'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6">
            {/* Étape 1: Informations de base */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Informations générales
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du concours *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Grand Concours Trading 2024"
                        className="w-full input-field"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Décrivez votre concours en détail..."
                        rows={4}
                        className="w-full input-field resize-none"
                        maxLength={2000}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type de concours *
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {contestTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value })}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.type === type.value
                                ? `border-${type.color}-500 bg-${type.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <div className="text-xs font-medium text-gray-700">
                              {type.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Dates et participants */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Planning et participants
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre maximum de participants
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
                            minAge: parseInt(e.target.value) || 18
                          }
                        })}
                        className="w-full input-field"
                        min="13"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
              </div>
            )}

            {/* Étape 3: Prix et règles */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Prix et récompenses
                  </h4>
                  
                  <div className="space-y-4">
                    {formData.prizes.map((prize, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-900">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'} 
                            {' '}Position {prize.position}
                          </h5>
                          {formData.prizes.length > 1 && (
                            <button
                              onClick={() => removePrize(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du prix
                            </label>
                            <input
                              type="text"
                              value={prize.name}
                              onChange={(e) => updatePrize(index, 'name', e.target.value)}
                              placeholder="Ex: 500€ en cash"
                              className="w-full input-field"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type de prix
                            </label>
                            <select
                              value={prize.type}
                              onChange={(e) => updatePrize(index, 'type', e.target.value)}
                              className="w-full input-field"
                            >
                              {prizeTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Valeur (€)
                            </label>
                            <input
                              type="number"
                              value={prize.value}
                              onChange={(e) => updatePrize(index, 'value', e.target.value)}
                              placeholder="0"
                              className="w-full input-field"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={prize.description}
                              onChange={(e) => updatePrize(index, 'description', e.target.value)}
                              placeholder="Description détaillée"
                              className="w-full input-field"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={addPrize}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                    >
                      <PlusIcon className="h-5 w-5 mx-auto text-gray-400" />
                      <span className="block text-sm text-gray-600 mt-1">Ajouter un prix</span>
                    </button>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Règles du concours
                    </label>
                    <textarea
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      placeholder="Décrivez les règles et conditions de participation..."
                      rows={6}
                      className="w-full input-field resize-none"
                      maxLength={2000}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="btn-secondary"
                disabled={loading}
              >
                Précédent
              </button>
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
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="btn-primary"
                disabled={loading}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Créer le concours
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContestModal;
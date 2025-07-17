import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  ServerIcon,
  UserIcon,
  KeyIcon,
  GlobeAltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings = () => {
  // Utilisateur admin par défaut (plus besoin d'authentification)
  const user = { name: 'Administrateur', email: 'admin@finea-academie.com' };
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Paramètres généraux
    siteName: 'Finéa Académie Admin',
    siteDescription: 'Dashboard administrateur pour Finéa Académie',
    contactEmail: 'admin@finea.com',
    timezone: 'Europe/Paris',
    language: 'fr',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    newsletterNotifications: true,
    userRegistrationNotifications: true,
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    
    // Apparence
    theme: 'light',
    primaryColor: '#3B82F6',
    sidebarCollapsed: false,
    compactMode: false,
    
    // API et intégrations
    apiRateLimit: 1000,
    backupFrequency: 'daily',
    logLevel: 'info',
  });

  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'general', name: 'Général', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Apparence', icon: PaintBrushIcon },
    { id: 'system', name: 'Système', icon: ServerIcon },
    { id: 'profile', name: 'Profil', icon: UserIcon },
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simuler la sauvegarde des paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      // Réinitialiser aux valeurs par défaut
      toast.success('Paramètres réinitialisés');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-gray-600">
          Configurez votre dashboard et vos préférences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des onglets */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Onglet Général */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres généraux</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du site
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contact
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={settings.contactEmail}
                        onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuseau horaire
                      </label>
                      <select
                        className="input-field"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                      >
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue
                      </label>
                      <select
                        className="input-field"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description du site
                    </label>
                    <textarea
                      rows={3}
                      className="input-field"
                      value={settings.siteDescription}
                      onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notification</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                        <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Notifications push</h4>
                        <p className="text-sm text-gray-500">Recevoir des notifications push dans le navigateur</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.pushNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Nouvelles inscriptions</h4>
                        <p className="text-sm text-gray-500">Être notifié des nouveaux utilisateurs</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.userRegistrationNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'userRegistrationNotifications', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
                        <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeout de session (minutes)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tentatives de connexion max
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={settings.loginAttempts}
                          onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Changer le mot de passe</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="password"
                          placeholder="Nouveau mot de passe"
                          className="input-field"
                        />
                        <input
                          type="password"
                          placeholder="Confirmer le mot de passe"
                          className="input-field"
                        />
                      </div>
                      <button className="mt-4 btn-primary flex items-center">
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Apparence */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personnalisation de l'interface</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thème
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => handleSettingChange('appearance', 'theme', theme)}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              settings.theme === theme
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Auto'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur principale
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300"
                        />
                        <span className="text-sm text-gray-600">{settings.primaryColor}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Sidebar réduite</h4>
                          <p className="text-sm text-gray-500">Réduire la barre latérale par défaut</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.sidebarCollapsed}
                            onChange={(e) => handleSettingChange('appearance', 'sidebarCollapsed', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Mode compact</h4>
                          <p className="text-sm text-gray-500">Interface plus dense avec moins d'espacement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.compactMode}
                            onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Système */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration système</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limite de requêtes API (par heure)
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={settings.apiRateLimit}
                        onChange={(e) => handleSettingChange('system', 'apiRateLimit', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fréquence de sauvegarde
                      </label>
                      <select
                        className="input-field"
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                      >
                        <option value="hourly">Toutes les heures</option>
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau de log
                      </label>
                      <select
                        className="input-field"
                        value={settings.logLevel}
                        onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                      >
                        <option value="error">Erreurs seulement</option>
                        <option value="warn">Avertissements</option>
                        <option value="info">Informations</option>
                        <option value="debug">Debug</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du profil</h3>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-700">
                        {user?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <button className="btn-secondary">
                        Changer la photo
                      </button>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG ou GIF. Max 2MB.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        defaultValue={user?.name || ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        defaultValue={user?.email || ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={user?.role || 'admin'}
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dernière connexion
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={handleReset}
                className="btn-secondary text-red-600 hover:text-red-700"
              >
                Réinitialiser
              </button>
              
              <div className="flex space-x-3">
                <button className="btn-secondary">
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </div>
                  ) : (
                    'Sauvegarder'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
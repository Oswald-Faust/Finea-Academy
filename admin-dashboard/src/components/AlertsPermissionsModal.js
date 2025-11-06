import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AlertsPermissionsModal = ({ isOpen, onClose, user }) => {
  const [permissions, setPermissions] = useState({
    canViewClosedAlerts: false,
    canViewPositioningAlerts: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchPermissions();
    }
  }, [isOpen, user]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAlertsPermissions(user._id);
      if (response.data.success) {
        setPermissions(response.data.data.permissions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      toast.error('Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userAPI.updateAlertsPermissions(user._id, permissions);
      toast.success('Permissions mises à jour avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Permissions d'Alertes
              </h3>
              <p className="text-sm text-gray-500">
                {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : (
            <>
              {/* Alertes Clôturées */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Alertes Clôturées
                      </h4>
                      <p className="text-sm text-gray-500">
                        Accès à la section "Alertes clôturées" sur l'écran d'accueil
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePermissionChange('canViewClosedAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      permissions.canViewClosedAlerts ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        permissions.canViewClosedAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {permissions.canViewClosedAlerts && (
                  <div className="ml-12 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ L'utilisateur pourra voir les alertes clôturées dans la section dédiée
                    </p>
                  </div>
                )}
              </div>

              {/* Alertes de Positionnement */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Alertes de Positionnement
                      </h4>
                      <p className="text-sm text-gray-500">
                        Accès à l'outil "Alertes de Positionnement" dans la section Outils
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePermissionChange('canViewPositioningAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      permissions.canViewPositioningAlerts ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        permissions.canViewPositioningAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {permissions.canViewPositioningAlerts && (
                  <div className="ml-12 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ L'utilisateur pourra accéder aux alertes de positionnement depuis les outils
                    </p>
                  </div>
                )}
              </div>

              {/* Message d'information */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800">
                      Information importante
                    </h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Si l'utilisateur n'a pas les permissions nécessaires, il verra le message 
                      "Vous n'avez pas l'autorisation de voir ce contenu" à la place des alertes.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsPermissionsModal;

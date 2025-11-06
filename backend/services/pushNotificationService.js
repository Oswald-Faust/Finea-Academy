const axios = require('axios');
const User = require('../models/User');

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.initializeOneSignal();
  }

  initializeOneSignal() {
    try {
      // Vérifier la configuration OneSignal
      if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
        console.warn('⚠️  OneSignal non configuré - Les notifications push ne fonctionneront pas');
        console.warn('⚠️  Variables requises: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY');
        return;
      }

      this.appId = process.env.ONESIGNAL_APP_ID;
      this.apiKey = process.env.ONESIGNAL_REST_API_KEY;
      this.apiUrl = 'https://onesignal.com/api/v1/notifications';
      
      this.isInitialized = true;
      console.log('✅ Service OneSignal initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de OneSignal:', error);
      this.isInitialized = false;
    }
  }

  // Envoyer une notification à un utilisateur spécifique
  async sendToUser(userId, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('OneSignal non initialisé - notification non envoyée');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      // Vérifier les préférences de notification
      if (!user.preferences.notifications.push) {
        return { success: false, error: 'Notifications push désactivées pour cet utilisateur' };
      }

      const playerIds = user.getActivePushTokens();
      if (playerIds.length === 0) {
        return { success: false, error: 'Aucun token push actif pour cet utilisateur' };
      }

      // Filtrer les player IDs valides (UUID format OneSignal)
      const validPlayerIds = this.filterValidPlayerIds(playerIds);
      const invalidPlayerIds = playerIds.filter(id => !validPlayerIds.includes(id));

      // Nettoyer les tokens invalides automatiquement
      if (invalidPlayerIds.length > 0) {
        console.log(`⚠️  ${invalidPlayerIds.length} tokens invalides détectés pour ${user.email}`);
        await this.handleInvalidPlayerIds(invalidPlayerIds);
      }

      if (validPlayerIds.length === 0) {
        return { success: false, error: 'Aucun token push valide pour cet utilisateur (tous les tokens sont invalides)' };
      }

      return await this.sendToPlayerIds(validPlayerIds, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi à l\'utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification à plusieurs utilisateurs
  async sendToUsers(userIds, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('OneSignal non initialisé - notifications non envoyées');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      const users = await User.find({
        _id: { $in: userIds },
        'preferences.notifications.push': true,
        isActive: true
      });

      const allPlayerIds = [];
      for (const user of users) {
        const playerIds = user.getActivePushTokens();
        allPlayerIds.push(...playerIds);
      }

      // Filtrer les player IDs valides (UUID format OneSignal)
      const validPlayerIds = this.filterValidPlayerIds(allPlayerIds);
      const invalidPlayerIds = allPlayerIds.filter(id => !validPlayerIds.includes(id));

      // Nettoyer les tokens invalides automatiquement
      if (invalidPlayerIds.length > 0) {
        console.log(`⚠️  ${invalidPlayerIds.length} tokens invalides détectés et ignorés`);
        await this.handleInvalidPlayerIds(invalidPlayerIds);
      }

      if (validPlayerIds.length === 0) {
        return { success: false, error: 'Aucun token push valide trouvé' };
      }

      return await this.sendToPlayerIds(validPlayerIds, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi aux utilisateurs:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification globale à tous les utilisateurs actifs
  async sendToAllUsers(notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('OneSignal non initialisé - notification globale non envoyée');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      // Utiliser le segment "All" de OneSignal pour envoyer à tous
      const payload = {
        app_id: this.appId,
        included_segments: ['All'],
        headings: { en: notification.title, fr: notification.title },
        contents: { en: notification.message, fr: notification.message },
        data: {
          type: notification.type || 'general',
          priority: notification.priority || 'normal',
          ...data
        }
      };

      if (notification.image) {
        payload.big_picture = notification.image;
      }

      // Configuration Android - OneSignal utilisera le canal par défaut
      // android_channel_id est optionnel - si omis, OneSignal utilise le canal par défaut
      payload.android_accent_color = '000D64FF';
      payload.android_sound = 'default';
      payload.priority = 10; // Priorité normale

      // Configuration iOS
      payload.sound = 'default';

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      console.log(`📱 Notification globale envoyée via OneSignal: ${response.data.id}`);
      
      return {
        success: true,
        successCount: 1,
        failureCount: 0,
        totalSent: 1,
        onesignalId: response.data.id
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi global OneSignal:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.errors?.[0] || error.message };
    }
  }

  // Envoyer une notification par rôles
  async sendToRoles(roles, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('OneSignal non initialisé - notifications par rôle non envoyées');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      const users = await User.find({
        role: { $in: roles },
        isActive: true,
        'preferences.notifications.push': true
      });

      const allPlayerIds = [];
      for (const user of users) {
        const playerIds = user.getActivePushTokens();
        allPlayerIds.push(...playerIds);
      }

      // Filtrer les player IDs valides (UUID format OneSignal)
      const validPlayerIds = this.filterValidPlayerIds(allPlayerIds);
      const invalidPlayerIds = allPlayerIds.filter(id => !validPlayerIds.includes(id));

      // Nettoyer les tokens invalides automatiquement
      if (invalidPlayerIds.length > 0) {
        console.log(`⚠️  ${invalidPlayerIds.length} tokens invalides détectés et ignorés`);
        await this.handleInvalidPlayerIds(invalidPlayerIds);
      }

      if (validPlayerIds.length === 0) {
        return { success: false, error: 'Aucun token push valide trouvé pour ces rôles' };
      }

      return await this.sendToPlayerIds(validPlayerIds, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi par rôles:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification à des player IDs spécifiques (OneSignal)
  async sendToPlayerIds(playerIds, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('OneSignal non initialisé - notification non envoyée');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      // OneSignal limite à 2000 player IDs par requête
      const chunks = [];
      for (let i = 0; i < playerIds.length; i += 2000) {
        chunks.push(playerIds.slice(i, i + 2000));
      }

      let totalSuccess = 0;
      let totalFailure = 0;
      const errors = [];

      for (const chunk of chunks) {
        const payload = {
          app_id: this.appId,
          include_player_ids: chunk,
          headings: { en: notification.title, fr: notification.title },
          contents: { en: notification.message, fr: notification.message },
          data: {
            type: notification.type || 'general',
            priority: notification.priority || 'normal',
            ...data
          }
        };

        if (notification.image) {
          payload.big_picture = notification.image;
        }

        // Configuration Android - OneSignal utilisera le canal par défaut
        // android_channel_id est optionnel - si omis, OneSignal utilise le canal par défaut
        payload.android_accent_color = '000D64FF';
        payload.android_sound = 'default';
        payload.priority = 10; // Priorité normale

        // Configuration iOS
        payload.sound = 'default';

        try {
          const response = await axios.post(this.apiUrl, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${this.apiKey}`
            }
          });

          totalSuccess += chunk.length;
          console.log(`📱 Notification envoyée via OneSignal (chunk): ${response.data.id}`);
        } catch (error) {
          totalFailure += chunk.length;
          const errorMsg = error.response?.data?.errors?.[0] || error.message;
          errors.push(errorMsg);
          console.error('❌ Erreur OneSignal:', errorMsg);
        }
      }

      // Nettoyer les player IDs invalides
      if (totalFailure > 0 && errors.length > 0) {
        await this.handleInvalidPlayerIds(playerIds.slice(0, totalFailure));
      }

      const results = {
        success: totalSuccess > 0,
        successCount: totalSuccess,
        failureCount: totalFailure,
        totalSent: playerIds.length,
        errors: errors.length > 0 ? errors : undefined
      };

      console.log(`📱 Notifications OneSignal: ${totalSuccess}/${playerIds.length} succès`);
      return results;

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification OneSignal:', error);
      return { success: false, error: error.response?.data?.errors?.[0] || error.message };
    }
  }

  // Gérer les player IDs OneSignal invalides
  async handleInvalidPlayerIds(playerIds) {
    try {
      // Supprimer les player IDs invalides de la base de données
      // Note: On utilise fcmTokens.token car c'est là que sont stockés les player IDs
      await User.updateMany(
        { 'fcmTokens.token': { $in: playerIds } },
        { $pull: { fcmTokens: { token: { $in: playerIds } } } }
      );
      
      console.log(`🧹 ${playerIds.length} player IDs OneSignal invalides supprimés`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des player IDs:', error);
    }
  }

  // Filtrer les player IDs valides (UUID format OneSignal)
  filterValidPlayerIds(playerIds) {
    // OneSignal Player IDs sont des UUIDs (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return playerIds.filter(id => uuidRegex.test(id));
  }

  // Enregistrer un player ID OneSignal pour un utilisateur
  async registerToken(userId, playerId, platform, deviceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      await user.addPushToken(playerId, platform, deviceId);
      console.log(`📱 Player ID OneSignal enregistré pour ${user.email} (${platform})`);
      
      return { success: true, message: 'Token enregistré avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un player ID OneSignal
  async unregisterToken(userId, deviceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      await user.removePushToken(deviceId);
      console.log(`📱 Player ID OneSignal supprimé pour ${user.email}`);
      
      return { success: true, message: 'Token supprimé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      return { success: false, error: error.message };
    }
  }

  // Créer une notification de test
  createTestNotification() {
    return {
      title: '🎉 Test Notification',
      message: 'Ceci est une notification de test depuis Finéa Académie !',
      type: 'test',
      priority: 'normal',
      image: null
    };
  }
}

// Exporter une instance singleton
module.exports = new PushNotificationService();

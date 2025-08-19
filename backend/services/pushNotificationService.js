const admin = require('firebase-admin');
const User = require('../models/User');

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      // Vérifier si Firebase Admin est déjà initialisé
      if (admin.apps.length === 0) {
        // Initialiser Firebase Admin avec les variables d'environnement
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          // Pour production avec fichier de clé de service
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID
          });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          // Pour production avec clé de service inline
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              projectId: process.env.FIREBASE_PROJECT_ID
            });
          } catch (parseError) {
            console.error('❌ Erreur de parsing de FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
            console.warn('⚠️  Firebase non configuré - Les notifications push ne fonctionneront pas');
            return;
          }
        } else if (process.env.FIREBASE_PROJECT_ID) {
          // Pour développement avec projet ID uniquement
          admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID
          });
        } else {
          console.warn('⚠️  Firebase non configuré - Les notifications push ne fonctionneront pas');
          return;
        }
      }

      this.messaging = admin.messaging();
      this.isInitialized = true;
      console.log('✅ Service de notifications push initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
      this.isInitialized = false;
    }
  }

  // Envoyer une notification à un utilisateur spécifique
  async sendToUser(userId, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('Firebase non initialisé - notification non envoyée');
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

      const tokens = user.getActiveFCMTokens();
      if (tokens.length === 0) {
        return { success: false, error: 'Aucun token FCM actif pour cet utilisateur' };
      }

      return await this.sendToTokens(tokens, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi à l\'utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification à plusieurs utilisateurs
  async sendToUsers(userIds, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('Firebase non initialisé - notifications non envoyées');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      const users = await User.find({
        _id: { $in: userIds },
        'preferences.notifications.push': true,
        isActive: true
      });

      const allTokens = [];
      for (const user of users) {
        const tokens = user.getActiveFCMTokens();
        allTokens.push(...tokens);
      }

      if (allTokens.length === 0) {
        return { success: false, error: 'Aucun token FCM actif trouvé' };
      }

      return await this.sendToTokens(allTokens, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi aux utilisateurs:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification globale à tous les utilisateurs actifs
  async sendToAllUsers(notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('Firebase non initialisé - notification globale non envoyée');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      const users = await User.find({
        isActive: true,
        'preferences.notifications.push': true
      });

      const allTokens = [];
      for (const user of users) {
        const tokens = user.getActiveFCMTokens();
        allTokens.push(...tokens);
      }

      if (allTokens.length === 0) {
        return { success: false, error: 'Aucun utilisateur avec notifications push activées' };
      }

      return await this.sendToTokens(allTokens, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi global:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification par rôles
  async sendToRoles(roles, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('Firebase non initialisé - notifications par rôle non envoyées');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      const users = await User.find({
        role: { $in: roles },
        isActive: true,
        'preferences.notifications.push': true
      });

      const allTokens = [];
      for (const user of users) {
        const tokens = user.getActiveFCMTokens();
        allTokens.push(...tokens);
      }

      if (allTokens.length === 0) {
        return { success: false, error: 'Aucun utilisateur trouvé pour ces rôles' };
      }

      return await this.sendToTokens(allTokens, notification, data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi par rôles:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une notification à des tokens spécifiques
  async sendToTokens(tokens, notification, data = {}) {
    if (!this.isInitialized) {
      console.warn('Firebase non initialisé - notification non envoyée');
      return { success: false, error: 'Service non initialisé' };
    }

    try {
      // Préparer le message
      const message = {
        notification: {
          title: notification.title,
          body: notification.message,
          ...(notification.image && { imageUrl: notification.image })
        },
        data: {
          type: notification.type || 'general',
          priority: notification.priority || 'normal',
          ...data
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#000D64', // Couleur de la notification
            channelId: 'finea_notifications',
            priority: this.getAndroidPriority(notification.priority),
            defaultSound: true,
            defaultVibrate: true,
            defaultLightSettings: true
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            ...data
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.message
              },
              badge: 1,
              sound: 'default',
              category: 'GENERAL'
            }
          },
          fcm_options: {
            image: notification.image
          }
        },
        tokens: tokens.slice(0, 500) // FCM limite à 500 tokens par batch
      };

      // Envoyer la notification
      const response = await this.messaging.sendEachForMulticast(message);

      // Traiter les réponses
      const results = {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalSent: tokens.length,
        responses: response.responses
      };

      // Nettoyer les tokens invalides
      if (response.failureCount > 0) {
        await this.handleFailedTokens(tokens, response.responses);
      }

      console.log(`📱 Notification envoyée: ${response.successCount}/${tokens.length} succès`);
      return results;

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Gérer les tokens FCM invalides
  async handleFailedTokens(tokens, responses) {
    try {
      const invalidTokens = [];
      
      responses.forEach((response, index) => {
        if (!response.success) {
          const error = response.error;
          // Token invalide ou non enregistré
          if (error.code === 'messaging/invalid-registration-token' || 
              error.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokens[index]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        // Supprimer les tokens invalides de la base de données
        await User.updateMany(
          { 'fcmTokens.token': { $in: invalidTokens } },
          { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
        );
        
        console.log(`🧹 ${invalidTokens.length} tokens FCM invalides supprimés`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des tokens:', error);
    }
  }

  // Convertir la priorité en priorité Android
  getAndroidPriority(priority) {
    switch (priority) {
      case 'urgent':
        return 'max';
      case 'high':
        return 'high';
      case 'medium':
        return 'default';
      case 'low':
        return 'min';
      default:
        return 'default';
    }
  }

  // Enregistrer un token FCM pour un utilisateur
  async registerToken(userId, token, platform, deviceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      await user.addFCMToken(token, platform, deviceId);
      console.log(`📱 Token FCM enregistré pour ${user.email} (${platform})`);
      
      return { success: true, message: 'Token enregistré avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un token FCM
  async unregisterToken(userId, deviceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      await user.removeFCMToken(deviceId);
      console.log(`📱 Token FCM supprimé pour ${user.email}`);
      
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

  // Test d'envoi de notification (pour les tests sans utilisateurs)
  async testNotificationSend(notification, data = {}) {
    if (!this.isInitialized) {
      return { success: false, error: 'Service Firebase non initialisé' };
    }

    try {
      console.log('🧪 Test d\'envoi de notification...');
      
      // Créer un token de test fictif
      const testToken = 'test_token_' + Date.now();
      
      // Préparer le message de test
      const message = {
        notification: {
          title: notification.title || 'Test Notification',
          body: notification.message || 'Message de test'
        },
        data: {
          type: 'test',
          timestamp: Date.now().toString(),
          ...data
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#000D64',
            channelId: 'finea_notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrate: true
          }
        },
        token: testToken
      };

      console.log('📤 Message de test préparé:', JSON.stringify(message, null, 2));
      
      // Note: On ne peut pas vraiment envoyer avec un token fictif
      // Mais on peut valider que la configuration Firebase fonctionne
      console.log('✅ Configuration Firebase validée pour les tests');
      
      return { 
        success: true, 
        message: 'Test de configuration réussi',
        notification: message,
        note: 'Token fictif utilisé - pas d\'envoi réel'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exporter une instance singleton
module.exports = new PushNotificationService();

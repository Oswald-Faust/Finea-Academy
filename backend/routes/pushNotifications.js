const express = require('express');
const { protect } = require('../middleware/auth');
const pushNotificationService = require('../services/pushNotificationService');
const Notification = require('../models/Notification');
const User = require('../models/User');

const router = express.Router();

// @desc    Enregistrer un token FCM pour un utilisateur
// @route   POST /api/push-notifications/register
// @access  Private
router.post('/register', protect, async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;
    const userId = req.user._id;

    if (!token || !platform || !deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Token, platform et deviceId requis'
      });
    }

    const result = await pushNotificationService.registerToken(userId, token, platform, deviceId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Token FCM enregistré avec succès'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du token FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement du token FCM'
    });
  }
});

// @desc    Supprimer un token FCM
// @route   DELETE /api/push-notifications/unregister
// @access  Private
router.delete('/unregister', protect, async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user._id;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID requis'
      });
    }

    const result = await pushNotificationService.unregisterToken(userId, deviceId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Token FCM supprimé avec succès'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du token FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du token FCM'
    });
  }
});

// @desc    Envoyer une notification push immédiate (Admin)
// @route   POST /api/push-notifications/send
// @access  Public (pour l'admin dashboard)
router.post('/send', async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'general',
      priority = 'normal',
      image,
      data = {},
      targetUsers = [],
      targetRoles = [],
      isGlobal = false
    } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Le titre et le message sont requis'
      });
    }

    // Créer l'objet notification
    const notification = {
      title,
      message,
      type,
      priority,
      image
    };

    let result;

    // Déterminer le type d'envoi
    if (isGlobal) {
      result = await pushNotificationService.sendToAllUsers(notification, data);
    } else if (targetRoles.length > 0) {
      result = await pushNotificationService.sendToRoles(targetRoles, notification, data);
    } else if (targetUsers.length > 0) {
      result = await pushNotificationService.sendToUsers(targetUsers, notification, data);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Cibles de notification requises (utilisateurs, rôles ou global)'
      });
    }

    // Enregistrer la notification dans la base de données pour l'historique
    try {
      const notificationRecord = new Notification({
        title,
        message,
        type,
        priority,
        status: result.success ? 'sent' : 'failed',
        targetUsers: targetUsers.length > 0 ? targetUsers : [],
        targetRoles: targetRoles.length > 0 ? targetRoles : [],
        isGlobal,
        sentAt: result.success ? new Date() : null,
        metadata: {
          pushNotification: true,
          fcmResults: result,
          image
        },
        createdBy: '64f1a2b3c4d5e6f7a8b9c0d1' // ID temporaire pour l'admin
      });
      
      await notificationRecord.save();
    } catch (dbError) {
      console.error('Erreur lors de l\'enregistrement en DB:', dbError);
      // Ne pas faire échouer la notification pour une erreur de DB
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Notification push envoyée avec succès',
        data: {
          successCount: result.successCount,
          failureCount: result.failureCount,
          totalSent: result.totalSent
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification push:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de la notification push'
    });
  }
});

// @desc    Envoyer une notification de test
// @route   POST /api/push-notifications/test
// @access  Public (pour l'admin dashboard)
router.post('/test', async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur cible requis pour le test'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    const testNotification = pushNotificationService.createTestNotification();
    const result = await pushNotificationService.sendToUser(targetUserId, testNotification);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Notification de test envoyée avec succès',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de test:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de la notification de test'
    });
  }
});

// @desc    Récupérer les statistiques des notifications push
// @route   GET /api/push-notifications/stats
// @access  Public (pour l'admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    // Statistiques des notifications push depuis la base de données
    const pushNotifications = await Notification.find({
      'metadata.pushNotification': true
    });

    const stats = {
      totalPushNotifications: pushNotifications.length,
      sentNotifications: pushNotifications.filter(n => n.status === 'sent').length,
      failedNotifications: pushNotifications.filter(n => n.status === 'failed').length,
      totalDevicesWithTokens: 0,
      devicesByPlatform: { android: 0, ios: 0, web: 0 }
    };

    // Compter les devices avec tokens FCM
    const usersWithTokens = await User.find({
      'fcmTokens.0': { $exists: true },
      isActive: true
    }).select('fcmTokens');

    stats.totalDevicesWithTokens = usersWithTokens.reduce((total, user) => {
      return total + user.fcmTokens.filter(token => token.isActive).length;
    }, 0);

    // Compter par plateforme
    usersWithTokens.forEach(user => {
      user.fcmTokens.forEach(token => {
        if (token.isActive && stats.devicesByPlatform[token.platform] !== undefined) {
          stats.devicesByPlatform[token.platform]++;
        }
      });
    });

    // Statistiques par type de notification
    const notificationsByType = await Notification.aggregate([
      { $match: { 'metadata.pushNotification': true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    stats.notificationsByType = notificationsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// @desc    Récupérer les utilisateurs avec leurs tokens FCM (pour debug admin)
// @route   GET /api/push-notifications/devices
// @access  Public (pour l'admin dashboard)
router.get('/devices', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find({
      'fcmTokens.0': { $exists: true },
      isActive: true
    })
    .select('firstName lastName email fcmTokens')
    .sort({ 'fcmTokens.lastUsed': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await User.countDocuments({
      'fcmTokens.0': { $exists: true },
      isActive: true
    });

    const devicesInfo = users.map(user => ({
      userId: user._id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      devices: user.fcmTokens.map(token => ({
        platform: token.platform,
        deviceId: token.deviceId,
        lastUsed: token.lastUsed,
        isActive: token.isActive
      }))
    }));

    res.json({
      success: true,
      data: devicesInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devices:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des devices'
    });
  }
});

module.exports = router;

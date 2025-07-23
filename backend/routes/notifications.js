const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');
const { validateNotification } = require('../middleware/validation');

const router = express.Router();

// @desc    Créer une nouvelle notification
// @route   POST /api/notifications
// @access  Public (temporairement pour les tests)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      priority = 'medium',
      status = 'draft',
      targetUsers = [],
      targetRoles = [],
      targetSegments = [],
      isGlobal = false,
      scheduledFor,
      metadata = {}
    } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Le titre et le message sont requis'
      });
    }

    // Créer la notification
    const notification = new Notification({
      title,
      message,
      type,
      priority,
      status,
      targetUsers: targetUsers.length > 0 ? targetUsers : [],
      targetRoles: targetRoles.length > 0 ? targetRoles : [],
      targetSegments: targetSegments.length > 0 ? targetSegments : [],
      isGlobal,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      metadata,
      createdBy: '64f1a2b3c4d5e6f7a8b9c0d1', // ID temporaire pour les tests
      lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1'
    });

    await notification.save();

    // Si la notification doit être envoyée immédiatement
    if (status === 'sent' || (!scheduledFor && status !== 'draft')) {
      await sendNotificationToUsers(notification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: notification
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la notification'
    });
  }
});

// @desc    Récupérer toutes les notifications
// @route   GET /api/notifications
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    });
  }
});

// @desc    Récupérer les notifications d'un utilisateur
// @route   GET /api/notifications/user/:userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      unreadOnly = false
    } = req.query;

    // Construire le filtre
    const filter = {
      $or: [
        { targetUsers: userId },
        { isGlobal: true }
      ]
    };

    if (unreadOnly === 'true') {
      filter['readBy.user'] = { $ne: userId };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { createdAt: -1 };

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    // Marquer les notifications comme lues si demandé
    if (unreadOnly !== 'true') {
      for (const notification of notifications) {
        if (!notification.isReadBy(userId)) {
          await notification.markAsRead(userId);
        }
      }
    }

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    });
  }
});

// @desc    Marquer une notification comme lue
// @route   PATCH /api/notifications/:id/read
// @access  Public
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification non trouvée'
      });
    }

    await notification.markAsRead(userId);

    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du marquage de la notification'
    });
  }
});

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Public (temporairement pour les tests)
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification non trouvée'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la notification'
    });
  }
});

// @desc    Actions groupées sur les notifications
// @route   PUT /api/notifications/bulk-read
// @route   PUT /api/notifications/bulk-delete
// @access  Public (temporairement pour les tests)
router.put('/bulk-:action', async (req, res) => {
  try {
    const { action } = req.params;
    const { ids, userId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Liste d\'IDs requise'
      });
    }

    if (action === 'read') {
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'ID utilisateur requis pour marquer comme lu'
        });
      }

      const notifications = await Notification.find({ _id: { $in: ids } });
      for (const notification of notifications) {
        await notification.markAsRead(userId);
      }

      res.json({
        success: true,
        message: `${notifications.length} notification(s) marquée(s) comme lue(s)`
      });
    } else if (action === 'delete') {
      await Notification.deleteMany({ _id: { $in: ids } });

      res.json({
        success: true,
        message: `${ids.length} notification(s) supprimée(s)`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Action non reconnue'
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'action groupée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'action groupée'
    });
  }
});

// Fonction pour envoyer les notifications aux utilisateurs
async function sendNotificationToUsers(notification) {
  try {
    let targetUsers = [];

    // Déterminer les utilisateurs cibles
    if (notification.isGlobal) {
      // Tous les utilisateurs actifs
      targetUsers = await User.find({ isActive: true }).select('_id');
    } else if (notification.targetUsers.length > 0) {
      targetUsers = notification.targetUsers;
    } else if (notification.targetRoles.length > 0) {
      // Utilisateurs avec les rôles spécifiés
      targetUsers = await User.find({ 
        role: { $in: notification.targetRoles },
        isActive: true 
      }).select('_id');
    }

    // Ici, on pourrait intégrer avec FCM, OneSignal, ou autre service de push
    console.log(`Notification "${notification.title}" envoyée à ${targetUsers.length} utilisateur(s)`);

    // Marquer comme envoyée
    await notification.markAsSent();

  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    notification.status = 'failed';
    await notification.save();
  }
}

module.exports = router; 
const express = require('express');
const router = express.Router();

// Routes publiques pour les notifications

// @desc    Récupérer toutes les notifications
// @route   GET /api/notifications
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { userId, type, status = 'all', page = 1, limit = 20 } = req.query;
    
    // Notifications fictives mais réalistes
    let notifications = [
      {
        id: 1,
        type: 'course_enrollment',
        title: 'Nouvelle inscription',
        message: 'Un utilisateur s\'est inscrit au cours "Introduction à la Finance"',
        data: { courseId: 1, userId: 123, courseName: 'Introduction à la Finance' },
        status: 'unread',
        priority: 'medium',
        createdAt: new Date(Date.now() - 3600000), // 1h ago
        readAt: null
      },
      {
        id: 2,
        type: 'system_alert',
        title: 'Maintenance programmée',
        message: 'Maintenance du système prévue dimanche de 2h à 4h du matin',
        data: { maintenanceDate: '2024-07-21T02:00:00Z' },
        status: 'unread',
        priority: 'high',
        createdAt: new Date(Date.now() - 7200000), // 2h ago
        readAt: null
      },
      {
        id: 3,
        type: 'payment_received',
        title: 'Paiement reçu',
        message: 'Paiement de 149.99€ reçu pour le cours "Trading Avancé"',
        data: { amount: 149.99, currency: 'EUR', courseId: 2 },
        status: 'read',
        priority: 'low',
        createdAt: new Date(Date.now() - 14400000), // 4h ago
        readAt: new Date(Date.now() - 10800000) // 3h ago
      },
      {
        id: 4,
        type: 'user_milestone',
        title: 'Objectif atteint',
        message: '1000 utilisateurs inscrits ! Félicitations !',
        data: { milestone: 1000, type: 'user_count' },
        status: 'read',
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        readAt: new Date(Date.now() - 82800000)
      },
      {
        id: 5,
        type: 'course_completion',
        title: 'Cours terminé',
        message: 'Marie Dubois a terminé le cours "Cryptomonnaies et Blockchain"',
        data: { userId: 456, courseId: 3, userName: 'Marie Dubois' },
        status: 'unread',
        priority: 'low',
        createdAt: new Date(Date.now() - 1800000), // 30min ago
        readAt: null
      },
      {
        id: 6,
        type: 'newsletter_sent',
        title: 'Newsletter envoyée',
        message: 'Newsletter "Nouvelles formations" envoyée à 1,247 utilisateurs',
        data: { recipientCount: 1247, subject: 'Nouvelles formations' },
        status: 'read',
        priority: 'low',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        readAt: new Date(Date.now() - 169200000)
      }
    ];

    // Filtrage
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    if (status !== 'all') {
      notifications = notifications.filter(n => n.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(notifications.length / limit),
        totalNotifications: notifications.length,
        unreadCount: notifications.filter(n => n.status === 'unread').length
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

// @desc    Créer une nouvelle notification
// @route   POST /api/notifications
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { type, title, message, data = {}, priority = 'medium' } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Type, titre et message requis'
      });
    }

    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      data,
      status: 'unread',
      priority,
      createdAt: new Date(),
      readAt: null
    };

    // TODO: Sauvegarder en base de données
    
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

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/read
// @access  Public
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Mettre à jour en base de données
    
    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: {
        id: parseInt(id),
        status: 'read',
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la notification'
    });
  }
});

// @desc    Marquer toutes les notifications comme lues
// @route   PUT /api/notifications/read-all
// @access  Public
router.put('/read-all', async (req, res) => {
  try {
    // TODO: Mettre à jour toutes les notifications en base de données
    
    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
      data: {
        updatedCount: 3, // Nombre fictif
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des notifications'
    });
  }
});

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Supprimer de la base de données
    
    res.status(200).json({
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

// @desc    Récupérer les statistiques des notifications
// @route   GET /api/notifications/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total: 156,
      unread: 23,
      byType: {
        course_enrollment: 45,
        system_alert: 12,
        payment_received: 67,
        user_milestone: 8,
        course_completion: 18,
        newsletter_sent: 6
      },
      byPriority: {
        high: 5,
        medium: 67,
        low: 84
      },
      last24Hours: 12,
      last7Days: 34
    };

    res.status(200).json({
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

// @desc    Configurer les préférences de notifications
// @route   POST /api/notifications/preferences
// @access  Public
router.post('/preferences', async (req, res) => {
  try {
    const { 
      userId, 
      emailNotifications = true, 
      pushNotifications = true,
      types = ['all']
    } = req.body;

    const preferences = {
      userId: userId || 'default',
      emailNotifications,
      pushNotifications,
      enabledTypes: types,
      updatedAt: new Date()
    };

    // TODO: Sauvegarder les préférences en base de données

    res.status(200).json({
      success: true,
      message: 'Préférences de notification mises à jour',
      data: preferences
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des préférences'
    });
  }
});

module.exports = router; 
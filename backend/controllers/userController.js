const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// @desc    Récupérer tous les utilisateurs (Public pour le dashboard)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sort = req.query.sort || '-createdAt';
    
    const query = {};
    
    // Recherche par nom, prénom ou email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password -passwordResetToken -emailVerificationToken');
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    next(error);
  }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private/Admin ou propriétaire
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    next(error);
  }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin ou propriétaire
const updateUser = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array(),
      });
    }
    
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phone',
      'address',
      'preferences'
    ];
    
    // Si l'utilisateur est admin, permettre plus de modifications
    if (req.user.role === 'admin') {
      allowedUpdates.push('role', 'isActive', 'isEmailVerified');
    }
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    next(error);
  }
};

// @desc    Désactiver un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    // Ne pas supprimer, mais désactiver
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur désactivé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
    next(error);
  }
};

// @desc    Réactiver un utilisateur
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    user.isActive = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur réactivé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'utilisateur:', error);
    next(error);
  }
};

// @desc    Changer le rôle d'un utilisateur
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rôle invalide',
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Rôle mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    next(error);
  }
};

// @desc    Obtenir les statistiques des utilisateurs
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    
    // Nouveaux utilisateurs ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Utilisateurs par jour pour les 30 derniers jours
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const usersByDay = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        adminUsers,
        moderatorUsers,
        newUsersThisMonth,
        usersByDay,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    next(error);
  }
};

// @desc    Uploader un avatar utilisateur vers Cloudflare R2
// @route   POST /api/users/:id/avatar
// @access  Private/Admin ou propriétaire
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier téléchargé',
      });
    }
    
    // Avec Cloudflare R2, req.file.location contient l'URL publique
    const avatarUrl = req.file.location;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Avatar mis à jour avec succès',
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'avatar:', error);
    next(error);
  }
};

// @desc    Mettre à jour les permissions d'alertes d'un utilisateur
// @route   PUT /api/users/:id/alerts-permissions
// @access  Private/Admin
const updateAlertsPermissions = async (req, res, next) => {
  try {
    const { canViewClosedAlerts, canViewPositioningAlerts } = req.body;
    
r    // S'assurer que les valeurs sont bien des booléens
    const canViewClosed = Boolean(canViewClosedAlerts);
    const canViewPositioning = Boolean(canViewPositioningAlerts);
    
    // Utiliser $set pour s'assurer que la structure complète est créée
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'permissions.alerts.canViewClosedAlerts': canViewClosed,
          'permissions.alerts.canViewPositioningAlerts': canViewPositioning,
        }
      },
      { 
        new: true,
        upsert: false,
        runValidators: true
      }
    ).select('-password -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    console.log(`✅ Permissions mises à jour pour l'utilisateur ${user._id}:`, {
      canViewClosedAlerts: user.permissions?.alerts?.canViewClosedAlerts,
      canViewPositioningAlerts: user.permissions?.alerts?.canViewPositioningAlerts
    });
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Permissions d\'alertes mises à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions:', error);
    next(error);
  }
};

// @desc    Obtenir les permissions d'alertes d'un utilisateur
// @route   GET /api/users/:id/alerts-permissions
// @access  Private/Admin
const getAlertsPermissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('permissions.alerts firstName lastName email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.fullName,
        email: user.email,
        permissions: user.permissions?.alerts || {
          canViewClosedAlerts: false,
          canViewPositioningAlerts: false
        }
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    next(error);
  }
};

// @desc    Vérifier les permissions d'alertes de l'utilisateur connecté
// @route   GET /api/users/me/alerts-permissions
// @access  Private
const getMyAlertsPermissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('permissions.alerts firstName lastName email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    const permissions = {
      canViewClosedAlerts: user.permissions?.alerts?.canViewClosedAlerts || false,
      canViewPositioningAlerts: user.permissions?.alerts?.canViewPositioningAlerts || false,
    };
    
    console.log(`📋 Permissions récupérées pour ${user.email} (${user._id}):`, {
      permissions: user.permissions?.alerts,
      returned: permissions
    });
    
    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  updateUserRole,
  getUserStats,
  uploadAvatar,
  updateAlertsPermissions,
  getAlertsPermissions,
  getMyAlertsPermissions,
}; 
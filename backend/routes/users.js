const express = require('express');
const {
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
} = require('../controllers/userController');

const {
  validateUpdateProfile,
  validateUpdatePreferences,
} = require('../middleware/validation');

const { protect: auth } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware, cloudflareUploadHandler } = require('../middleware/cloudflareUploads');

const router = express.Router();

// ============================================
// ROUTES SPÉCIFIQUES (doivent être avant /:id)
// ============================================

// Routes pour les statistiques
router.get('/stats', getUserStats);
router.get('/detailed-stats', async (req, res) => {
  try {
    const User = require('../models/User');

    // Statistiques de base
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    // Utilisateurs par rôle
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Nouveaux utilisateurs cette semaine
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Nouveaux utilisateurs ce mois
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        newUsersThisWeek,
        newUsersThisMonth,
        usersByRole: usersByRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        growth: {
          weeklyGrowth: ((newUsersThisWeek / Math.max(totalUsers - newUsersThisWeek, 1)) * 100).toFixed(1),
          monthlyGrowth: ((newUsersThisMonth / Math.max(totalUsers - newUsersThisMonth, 1)) * 100).toFixed(1)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Routes pour les permissions d'alertes de l'utilisateur connecté
router.get('/me/alerts-permissions', auth, getMyAlertsPermissions);

// Route pour demander un RDV téléphonique
router.post('/request-callback', auth, async (req, res) => {
  try {
    const { requestPhoneCall } = require('../services/googleSheetsService');
    const User = require('../models/User');
    
    // Récupérer l'utilisateur connecté
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Enregistrer la demande dans Google Sheet
    const result = await requestPhoneCall({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Votre demande de rappel téléphonique a été enregistrée. Nous vous contacterons prochainement !'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enregistrement de la demande. Veuillez réessayer.'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la demande de rappel:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la demande de rappel'
    });
  }
});

// Route pour créer un utilisateur manuellement
router.post('/create', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'user' } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      isEmailVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur'
    });
  }
});

// Route pour l'inscription
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont obligatoires (prénom, nom, email, mot de passe, téléphone)'
      });
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
    }

    // Validation du numéro de téléphone français
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez entrer un numéro de téléphone français valide (ex: 0612345678 ou +33612345678)'
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un compte avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      isActive: true,
      isEmailVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès ! Bienvenue dans Finéa Académie !',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
});

// ============================================
// ROUTES AVEC PARAMÈTRE :id
// ============================================

// Routes pour la gestion des utilisateurs
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', validateUpdateProfile, updateUser);
router.delete('/:id', deleteUser);

// Routes de gestion
router.put('/:id/activate', activateUser);
router.put('/:id/role', updateUserRole);

// Routes pour les permissions d'alertes d'un utilisateur spécifique
router.get('/:id/alerts-permissions', getAlertsPermissions);
router.put('/:id/alerts-permissions', updateAlertsPermissions);

// Route pour l'upload d'avatar vers Cloudflare R2
router.post('/:id/avatar', auth, cloudflareUploadHandler, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Route pour supprimer définitivement un utilisateur
router.delete('/:id/permanent', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }
    
    // Supprimer définitivement l'utilisateur
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé définitivement avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression définitive de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'utilisateur',
    });
  }
});

module.exports = router; 

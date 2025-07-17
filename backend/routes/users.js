const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  updateUserRole,
  getUserStats,
  uploadAvatar,
} = require('../controllers/userController');

const {
  validateUpdateProfile,
  validateUpdatePreferences,
} = require('../middleware/validation');

const router = express.Router();

// Configuration de multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'), false);
    }
  },
});

// Routes publiques - aucune authentification requise

// Routes pour les statistiques
router.get('/stats', getUserStats);

// Routes pour la gestion des utilisateurs
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', validateUpdateProfile, updateUser);
router.delete('/:id', deleteUser);

// Routes de gestion
router.put('/:id/activate', activateUser);
router.put('/:id/role', updateUserRole);

// Route pour l'upload d'avatar
router.post('/:id/avatar', upload.single('avatar'), uploadAvatar);

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

// Nouvelles routes utiles

// @desc    Créer un utilisateur manuellement
// @route   POST /api/users/create
// @access  Public
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
      emailVerified: true
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

// @desc    Enregistrement d'un utilisateur via l'application
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont obligatoires'
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
      role: 'user',
      isActive: true,
      emailVerified: false
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

// @desc    Récupérer les statistiques détaillées
// @route   GET /api/users/detailed-stats
// @access  Public
router.get('/detailed-stats', async (req, res) => {
  try {
    const User = require('../models/User');

    // Statistiques de base
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });

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

module.exports = router; 
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

const { protect, authorize, checkOwnership } = require('../middleware/auth');
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

// Routes avec authentification requise
router.use(protect);

// Routes pour les statistiques (Admin seulement)
router.get('/stats', authorize('admin'), getUserStats);

// Routes pour la gestion des utilisateurs
router.get('/', authorize('admin', 'moderator'), getUsers);
router.get('/:id', checkOwnership, getUserById);
router.put('/:id', checkOwnership, validateUpdateProfile, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

// Routes spécifiques aux admins
router.put('/:id/activate', authorize('admin'), activateUser);
router.put('/:id/role', authorize('admin'), updateUserRole);

// Route pour l'upload d'avatar
router.post('/:id/avatar', checkOwnership, upload.single('avatar'), uploadAvatar);

module.exports = router; 
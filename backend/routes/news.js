const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, param, query } = require('express-validator');

// Import du contrôleur
const {
  getAllNews,
  getNewsById,
  getLatestNews,
  getCurrentWeekNews,
  getNewsByWeek,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  getNewsStats
} = require('../controllers/newsController');

// Import des middlewares
const { protect: auth } = require('../middleware/auth');
const { uploadArticleImage, cloudflareUploadHandler } = require('../middleware/cloudflareUploads');

// Validation pour la création/mise à jour d'actualités
const newsValidation = [
  body('title')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères')
    .trim(),
  
  body('content')
    .notEmpty()
    .withMessage('Le contenu est requis'),
  
  body('summary')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Le résumé ne peut pas dépasser 500 caractères')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['draft', 'scheduled', 'published'])
    .withMessage('Le statut doit être draft, scheduled ou published'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('La date de publication doit être au format ISO 8601'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Chaque tag ne peut pas dépasser 50 caractères'),
  
  body('priority')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('La priorité doit être un nombre entre 0 et 10'),
  
  body('targetRoles')
    .optional()
    .isArray()
    .withMessage('Les rôles ciblés doivent être un tableau'),
  
  body('targetRoles.*')
    .optional()
    .isIn(['admin', 'user', 'premium', 'trial'])
    .withMessage('Rôle invalide')
];

// Validation pour les paramètres d'ID
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID invalide')
];

// Validation pour les paramètres de semaine
const weekValidation = [
  param('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Année invalide'),
  
  param('week')
    .isInt({ min: 1, max: 53 })
    .withMessage('Semaine invalide (1-53)')
];

// Validation pour les paramètres de requête
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'scheduled', 'published'])
    .withMessage('Statut invalide'),
  
  query('sortBy')
    .optional()
    .isIn(['publishedAt', 'createdAt', 'title', 'views', 'priority'])
    .withMessage('Critère de tri invalide'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre de tri invalide')
];

// Routes publiques
// @route   GET /api/news/latest
// @desc    Récupérer la dernière actualité publiée
// @access  Public
router.get('/latest', getLatestNews);

// @route   GET /api/news/current-week
// @desc    Récupérer l'actualité de la semaine actuelle
// @access  Public
router.get('/current-week', getCurrentWeekNews);

// @route   GET /api/news/week/:year/:week
// @desc    Récupérer une actualité par semaine
// @access  Public
router.get('/week/:year/:week', weekValidation, getNewsByWeek);

// @route   GET /api/news
// @desc    Récupérer toutes les actualités (avec filtres)
// @access  Public
router.get('/', queryValidation, getAllNews);

// @route   GET /api/news/stats/overview
// @desc    Récupérer les statistiques des actualités
// @access  Public
router.get('/stats/overview', getNewsStats);

// @route   GET /api/news/:id
// @desc    Récupérer une actualité par ID
// @access  Public
router.get('/:id', idValidation, getNewsById);

// Routes publiques pour la gestion des actualités
// @route   POST /api/news
// @desc    Créer une nouvelle actualité
// @access  Public
router.post('/', newsValidation, createNews);

// @route   PUT /api/news/:id
// @desc    Mettre à jour une actualité
// @access  Public
router.put('/:id', idValidation, newsValidation, updateNews);

// @route   DELETE /api/news/:id
// @desc    Supprimer une actualité
// @access  Public
router.delete('/:id', idValidation, deleteNews);

// @route   PATCH /api/news/:id/publish
// @desc    Publier une actualité
// @access  Public
router.patch('/:id/publish', idValidation, publishNews);

// Route pour l'upload d'images vers Cloudflare R2
// @route   POST /api/news/upload-image
// @desc    Uploader une image pour une actualité
// @access  Private (Admin)
router.post('/upload-image', auth, cloudflareUploadHandler, uploadArticleImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier image fourni'
      });
    }

    // Avec Cloudflare R2, req.file.location contient l'URL publique
    res.json({
      success: true,
      data: {
        url: req.file.location, // URL publique Cloudflare
        key: req.file.key, // Clé du fichier dans R2
        filename: req.file.key.split('/').pop(), // Nom du fichier
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bucket: req.file.bucket
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
});

module.exports = router;

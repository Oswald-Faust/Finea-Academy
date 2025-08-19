const express = require('express');
const { protect } = require('../middleware/auth');
const Favorites = require('../models/Favorites');
const { Newsletter } = require('../models/Newsletter');
const User = require('../models/User');

const router = express.Router();

// @desc    Ajouter un article aux favoris
// @route   POST /api/favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { articleId, type = 'article' } = req.body;
    const userId = req.user._id;

    // Vérifier que l'article existe
    const article = await Newsletter.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    // Ajouter aux favoris
    const favorite = await Favorites.addFavorite(userId, articleId, type);

    // Mettre à jour le compteur de favoris de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $inc: { favoritesCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Article ajouté aux favoris',
      data: favorite
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'ajout aux favoris'
    });
  }
});

// @desc    Retirer un article des favoris
// @route   DELETE /api/favorites/:articleId
// @access  Private
router.delete('/:articleId', protect, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id;

    // Retirer des favoris
    const removed = await Favorites.removeFavorite(userId, articleId);

    if (removed) {
      // Mettre à jour le compteur de favoris de l'utilisateur
      await User.findByIdAndUpdate(userId, {
        $inc: { favoritesCount: -1 }
      });

      res.json({
        success: true,
        message: 'Article retiré des favoris'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Article non trouvé dans vos favoris'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression des favoris'
    });
  }
});

// @desc    Vérifier si un article est en favori
// @route   GET /api/favorites/check/:articleId
// @access  Private
router.get('/check/:articleId', protect, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id;

    const isFavorite = await Favorites.isFavorite(userId, articleId);

    res.json({
      success: true,
      data: { isFavorite }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des favoris'
    });
  }
});

// @desc    Récupérer tous les favoris de l'utilisateur connecté
// @route   GET /api/favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    const favorites = await Favorites.getUserFavorites(userId, type);

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des favoris'
    });
  }
});

// @desc    Récupérer les statistiques des favoris (Admin)
// @route   GET /api/favorites/stats
// @access  Public (pour l'admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Favorites.getFavoritesStats();

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

// @desc    Récupérer tous les favoris de tous les utilisateurs (Admin)
// @route   GET /api/favorites/all
// @access  Public (pour l'admin dashboard)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, userId } = req.query;

    // Construire le filtre
    const filter = {};
    if (type) filter.type = type;
    if (userId) filter.user = userId;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { addedAt: -1 };

    const favorites = await Favorites.find(filter)
      .populate('user', 'firstName lastName email fullName')
      .populate('article', 'title coverImage type status tags')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Favorites.countDocuments(filter);

    res.json({
      success: true,
      data: favorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les favoris:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de tous les favoris'
    });
  }
});

// @desc    Récupérer les favoris d'un utilisateur spécifique (Admin)
// @route   GET /api/favorites/user/:userId
// @access  Public (pour l'admin dashboard)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    const favorites = await Favorites.getUserFavorites(userId, type);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email
        },
        favorites
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des favoris utilisateur'
    });
  }
});

module.exports = router;

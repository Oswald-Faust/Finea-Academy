const express = require('express');
const multer = require('multer');
const path = require('path');
const { Newsletter } = require('../models/Newsletter');
const auth = require('../middleware/auth');
const { validateNewsletter } = require('../middleware/validation');

const router = express.Router();

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/articles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'), false);
    }
  },
});

// @desc    Créer un nouvel article
// @route   POST /api/newsletters
// @access  Private/Admin
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const {
      title,
      content,
      type = 'article',
      status = 'draft',
      tags = [],
      scheduledFor,
      targetUsers,
      targetRoles,
      targetSegments,
      isGlobal = false,
      priority = 'normal'
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Le titre et le contenu sont requis'
      });
    }

    // Traitement de l'image de présentation
    let coverImageUrl = null;
    if (req.file) {
      coverImageUrl = `/uploads/articles/${req.file.filename}`;
    }

    // Créer l'article
    const article = new Newsletter({
      title,
      coverImage: coverImageUrl,
      content: JSON.parse(content),
      type,
      status,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      targetUsers: targetUsers ? JSON.parse(targetUsers) : [],
      targetRoles: targetRoles ? JSON.parse(targetRoles) : [],
      targetSegments: targetSegments ? JSON.parse(targetSegments) : [],
      isGlobal,
      priority,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    });

    await article.save();

    res.status(201).json({
      success: true,
      message: 'Article créé avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'article'
    });
  }
});

// @desc    Récupérer tous les articles
// @route   GET /api/newsletters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type = 'article',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire le filtre
    const filter = { type };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'content.blocks.text': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const articles = await Newsletter.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Exclure le contenu pour la liste

    const total = await Newsletter.countDocuments(filter);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des articles'
    });
  }
});

// @desc    Récupérer un article par ID
// @route   GET /api/newsletters/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Newsletter.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'article'
    });
  }
});

// @desc    Mettre à jour un article
// @route   PUT /api/newsletters/:id
// @access  Private/Admin
router.put('/:id', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const {
      title,
      content,
      status,
      tags,
      scheduledFor,
      targetUsers,
      targetRoles,
      targetSegments,
      isGlobal,
      priority
    } = req.body;

    const article = await Newsletter.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    // Traitement de l'image de présentation
    if (req.file) {
      article.coverImage = `/uploads/articles/${req.file.filename}`;
    }

    // Mise à jour des champs
    if (title) article.title = title;
    if (content) article.content = JSON.parse(content);
    if (status) article.status = status;
    if (tags) article.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (scheduledFor) article.scheduledFor = new Date(scheduledFor);
    if (targetUsers) article.targetUsers = JSON.parse(targetUsers);
    if (targetRoles) article.targetRoles = JSON.parse(targetRoles);
    if (targetSegments) article.targetSegments = JSON.parse(targetSegments);
    if (isGlobal !== undefined) article.isGlobal = isGlobal;
    if (priority) article.priority = priority;

    article.lastModifiedBy = req.user.id;

    // Si on publie l'article
    if (status === 'published' && article.status !== 'published') {
      article.publishedAt = new Date();
    }

    await article.save();

    res.json({
      success: true,
      message: 'Article mis à jour avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'article'
    });
  }
});

// @desc    Supprimer un article
// @route   DELETE /api/newsletters/:id
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Newsletter.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    await Newsletter.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'article'
    });
  }
});

// @desc    Publier un article
// @route   PATCH /api/newsletters/:id/publish
// @access  Private/Admin
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const article = await Newsletter.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    article.status = 'published';
    article.publishedAt = new Date();
    article.lastModifiedBy = req.user.id;

    await article.save();

    res.json({
      success: true,
      message: 'Article publié avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la publication de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la publication de l\'article'
    });
  }
});

// @desc    Upload d'image pour l'éditeur
// @route   POST /api/newsletters/upload-image
// @access  Private/Admin
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier téléchargé'
      });
    }

    const imageUrl = `/uploads/articles/${req.file.filename}`;

    res.json({
      success: 1,
      file: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload d\'image:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload d\'image'
    });
  }
});

module.exports = router; 
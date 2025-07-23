const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Newsletter } = require('../models/Newsletter');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');
const { validateNewsletter } = require('../middleware/validation');

const router = express.Router();

// S'assurer que le dossier uploads/articles existe
const uploadsDir = './uploads/articles';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
// @access  Public (temporairement pour les tests)
router.post('/', upload.single('coverImage'), async (req, res) => {
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
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      targetUsers: targetUsers ? JSON.parse(targetUsers) : [],
      targetRoles: targetRoles ? JSON.parse(targetRoles) : [],
      targetSegments: targetSegments ? JSON.parse(targetSegments) : [],
      isGlobal,
      priority,
      createdBy: '64f1a2b3c4d5e6f7a8b9c0d1', // ID temporaire pour les tests
      lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1' // ID temporaire pour les tests
    });

    await article.save();

    // Envoyer une notification automatique si l'article est publié
    if (status === 'published') {
      await sendArticleNotification(article);
    }

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

// Fonction pour envoyer une notification automatique quand un article est créé
async function sendArticleNotification(article) {
  try {
    // Créer une notification pour tous les utilisateurs
    const notification = new Notification({
      title: 'Nouvel article disponible !',
      message: `Un nouvel article "${article.title}" vient d'être publié. Découvrez-le maintenant !`,
      type: 'article',
      priority: 'medium',
      status: 'sent',
      isGlobal: true,
      metadata: {
        articleId: article._id,
        articleTitle: article.title,
        articleType: article.type
      },
      createdBy: '64f1a2b3c4d5e6f7a8b9c0d1', // ID temporaire pour les tests
      lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1'
    });

    await notification.save();

    // Envoyer la notification aux utilisateurs
    const targetUsers = await User.find({ isActive: true }).select('_id');
    console.log(`Notification d'article "${article.title}" envoyée à ${targetUsers.length} utilisateur(s)`);

    // Marquer comme envoyée
    await notification.markAsSent();

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification d\'article:', error);
  }
}

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
// @access  Public (temporairement pour les tests)
router.put('/:id', upload.single('coverImage'), async (req, res) => {
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

    article.lastModifiedBy = '64f1a2b3c4d5e6f7a8b9c0d1'; // ID temporaire pour les tests

    // Si on publie l'article
    if (status === 'published' && article.status !== 'published') {
      article.publishedAt = new Date();
      
      // Envoyer une notification automatique
      await sendArticleNotification(article);
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
// @access  Public (temporairement pour les tests)
router.delete('/:id', async (req, res) => {
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
// @access  Public (temporairement pour les tests)
router.patch('/:id/publish', async (req, res) => {
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
    article.lastModifiedBy = '64f1a2b3c4d5e6f7a8b9c0d1'; // ID temporaire pour les tests

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
// @access  Public (temporairement pour les tests)
router.post('/upload-image', upload.single('image'), async (req, res) => {
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

// @desc    Toggle bookmark d'un article
// @route   PATCH /api/newsletters/:id/bookmark
// @access  Public (temporairement pour les tests)
router.patch('/:id/bookmark', async (req, res) => {
  try {
    const { isBookmarked } = req.body;
    
    if (typeof isBookmarked !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Le paramètre isBookmarked doit être un booléen'
      });
    }

    const article = await Newsletter.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    // Pour l'instant, on simule le bookmark côté client
    // En production, il faudrait stocker les bookmarks dans une collection séparée
    res.json({
      success: true,
      message: isBookmarked ? 'Article ajouté aux favoris' : 'Article retiré des favoris',
      data: {
        isBookmarked: isBookmarked
      }
    });
  } catch (error) {
    console.error('Erreur lors du toggle bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du toggle bookmark'
    });
  }
});

// @desc    Créer des articles de test
// @route   POST /api/newsletters/seed-test-data
// @access  Public (temporairement pour les tests)
router.post('/seed-test-data', async (req, res) => {
  try {
    // Supprimer les articles existants
    await Newsletter.deleteMany({});
    
    const testArticles = [
      {
        title: 'La guerre commerciale de Donald Trump, un immense défi pour l\'économie mondiale',
        content: {
          blocks: [
            {
              data: {
                text: 'La guerre commerciale initiée par Donald Trump en 2018 visait à réduire le déficit commercial américain, notamment avec la Chine. Cette politique protectionniste a bouleversé les équilibres économiques mondiaux, entraînant une hausse des droits de douane, des représailles économiques et des tensions sur les chaînes d\'approvisionnement. Cette politique a perturbé les équilibres économiques mondiaux, provoquant un ralentissement du commerce international, des incertitudes pour les entreprises et un impact direct sur les consommateurs, marquant un tournant majeur dans la mondialisation.'
              }
            }
          ]
        },
        coverImage: '/uploads/articles/bourse-1.jpg',
        type: 'article',
        status: 'published',
        tags: ['économie', 'commerce', 'politique'],
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours ago
        createdBy: '64f1a2b3c4d5e6f7a8b9c0d1',
        lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1'
      },
      {
        title: 'Les pays pauvres étranglés par le poids de la dette',
        content: {
          blocks: [
            {
              data: {
                text: 'Les pays en développement font face à une crise de la dette sans précédent. L\'accumulation de dettes publiques et privées, combinée à la hausse des taux d\'intérêt et à la dépréciation des monnaies locales, plonge de nombreux pays dans une situation économique critique. Cette crise menace la stabilité financière mondiale et remet en question les mécanismes de financement du développement international.'
              }
            }
          ]
        },
        coverImage: '/uploads/articles/bourse-2.jpg',
        type: 'article',
        status: 'published',
        tags: ['dette', 'développement', 'crise'],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours ago
        createdBy: '64f1a2b3c4d5e6f7a8b9c0d1',
        lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1'
      },
      {
        title: 'L\'impact des cryptomonnaies sur l\'économie traditionnelle',
        content: {
          blocks: [
            {
              data: {
                text: 'L\'émergence des cryptomonnaies bouleverse les systèmes financiers traditionnels. Bitcoin, Ethereum et autres monnaies numériques créent de nouveaux paradigmes économiques, remettant en question le rôle des banques centrales et des institutions financières établies.'
              }
            }
          ]
        },
        coverImage: '/uploads/articles/trading-1.jpg',
        type: 'article',
        status: 'published',
        tags: ['crypto', 'bitcoin', 'finance'],
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours ago
        createdBy: '64f1a2b3c4d5e6f7a8b9c0d1',
        lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1'
      },
      {
        title: 'Les enjeux de la transition énergétique pour l\'économie mondiale',
        content: {
          blocks: [
            {
              data: {
                text: 'La transition vers les énergies renouvelables représente un défi économique majeur. Cette transformation nécessite des investissements massifs dans les infrastructures vertes tout en gérant la transition des industries polluantes vers des modèles durables.'
              }
            }
          ]
        },
        coverImage: '/uploads/articles/bourse-3.jpg',
        type: 'article',
        status: 'published',
        tags: ['énergie', 'transition', 'durable'],
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 jours ago
        createdBy: '64f1a2b3c4d5e6f7a8b9c0d1',
        lastModifiedBy: '64f1a2b3c4d5e6f7a8b9c0d1'
      }
    ];

    const createdArticles = await Newsletter.insertMany(testArticles);

    res.status(201).json({
      success: true,
      message: `${createdArticles.length} articles de test créés avec succès`,
      data: createdArticles
    });
  } catch (error) {
    console.error('Erreur lors de la création des articles de test:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création des articles de test'
    });
  }
});

module.exports = router; 
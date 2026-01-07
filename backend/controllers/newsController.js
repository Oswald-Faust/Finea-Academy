const News = require('../models/News');
const { validationResult } = require('express-validator');

// Fonction utilitaire pour obtenir la semaine de l'année
const getWeekOfYear = (date) => {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// @desc    Récupérer toutes les actualités
// @route   GET /api/news
// @access  Public
const getAllNews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      year, 
      week,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Construction du filtre
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (year && week) {
      filter.weekOfYear = `${year}-W${week.toString().padStart(2, '0')}`;
    } else if (year) {
      filter.weekOfYear = { $regex: `^${year}-W` };
    }

    // Configuration du tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calcul de la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Récupération des actualités
    const news = await News.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('author', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    // Comptage total
    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des actualités'
    });
  }
};

// @desc    Récupérer une actualité par ID
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Actualité non trouvée'
      });
    }

    // Incrémenter les vues si l'actualité est publiée
    if (news.status === 'published') {
      await news.incrementViews();
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'actualité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de l\'actualité'
    });
  }
};

// @desc    Récupérer la dernière actualité publiée
// @route   GET /api/news/latest
// @access  Public
const getLatestNews = async (req, res) => {
  try {
    console.log('Récupération de la dernière actualité...');
    
    const news = await News.findOne({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate('author', 'firstName lastName email');

    console.log('Actualité trouvée:', news ? news.title : 'Aucune');

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Aucune actualité publiée trouvée',
        data: null
      });
    }

    // Incrémenter les vues
    await news.incrementViews();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière actualité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de la dernière actualité'
    });
  }
};

// @desc    Récupérer l'actualité de la semaine actuelle
// @route   GET /api/news/current-week
// @access  Public
const getCurrentWeekNews = async (req, res) => {
  try {
    const currentWeek = getWeekOfYear(new Date());
    const news = await News.findOne({ 
      weekOfYear: currentWeek, 
      status: 'published' 
    }).populate('author', 'firstName lastName email');

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Aucune actualité publiée pour cette semaine',
        data: null
      });
    }

    // Incrémenter les vues
    await news.incrementViews();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'actualité de la semaine:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de l\'actualité'
    });
  }
};

// @desc    Récupérer une actualité par semaine
// @route   GET /api/news/week/:year/:week
// @access  Public
const getNewsByWeek = async (req, res) => {
  try {
    const { year, week } = req.params;
    const weekOfYear = `${year}-W${week.padStart(2, '0')}`;
    
    const news = await News.findOne({ weekOfYear })
      .populate('author', 'firstName lastName email');

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Aucune actualité trouvée pour cette semaine',
        data: null
      });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'actualité par semaine:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de l\'actualité'
    });
  }
};

// @desc    Créer une nouvelle actualité
// @route   POST /api/news
// @access  Private (Admin)
const createNews = async (req, res) => {
  try {
    console.log('Création d\'actualité - Données reçues:', req.body);
    console.log('Fichier uploadé:', req.file);
    
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erreurs de validation:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const {
      title,
      content,
      summary,
      status = 'draft',
      scheduledFor,
      tags = [],
      targetUsers = [],
      targetRoles = [],
      priority = 0
    } = req.body;

    // Traitement de l'image de couverture
    let coverImageUrl = req.body.coverImage || null;
    if (req.file) {
      // Avec Cloudflare R2, construire l'URL publique
      if (req.file.key) {
        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        coverImageUrl = `${publicUrl}/${req.file.key}`;
      } else if (req.file.location) {
        coverImageUrl = req.file.location;
      } else if (req.file.filename) {
        coverImageUrl = `/uploads/articles/${req.file.filename}`;
      }
      
      console.log('📸 Image de couverture uploadée:', {
        key: req.file.key,
        location: req.file.location,
        filename: req.file.filename,
        finalUrl: coverImageUrl
      });
    }

    // Vérifier qu'il n'y a pas déjà une actualité pour la semaine ciblée
    const targetDate = scheduledFor ? new Date(scheduledFor) : new Date();
    const weekOfYear = getWeekOfYear(targetDate);
    
    const existingNews = await News.findOne({ weekOfYear });
    if (existingNews) {
      return res.status(409).json({
        success: false,
        error: 'Une actualité existe déjà pour cette semaine',
        data: { weekOfYear, existingNewsId: existingNews._id }
      });
    }

    // Parser les tags si c'est une chaîne JSON
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    // Créer la nouvelle actualité
    const newsData = {
      title,
      content,
      coverImage: coverImageUrl,
      summary,
      status,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      tags: parsedTags,
      targetUsers,
      targetRoles,
      priority: parseInt(priority) || 0,
      author: req.body.authorId || null, // ID de l'auteur fourni dans le body ou null
      weekOfYear
    };

    console.log('Données à sauvegarder:', newsData);
    
    const news = new News(newsData);
    await news.save();

    console.log('Actualité créée avec succès:', news._id);

    // Récupérer l'actualité avec les données de l'auteur
    const populatedNews = await News.findById(news._id)
      .populate('author', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Actualité créée avec succès',
      data: populatedNews
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'actualité:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Une actualité existe déjà pour cette semaine'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la création de l\'actualité'
    });
  }
};

// @desc    Mettre à jour une actualité
// @route   PUT /api/news/:id
// @access  Private (Admin)
const updateNews = async (req, res) => {
  try {
    console.log('Mise à jour d\'actualité - Données reçues:', req.body);
    console.log('Fichier uploadé:', req.file);
    
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const {
      title,
      content,
      summary,
      status,
      scheduledFor,
      tags,
      targetUsers,
      targetRoles,
      priority
    } = req.body;

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Actualité non trouvée'
      });
    }

    // Traitement de l'image de couverture
    let coverImageUrl = null;
    if (req.file) {
      // Avec Cloudflare R2, construire l'URL publique
      if (req.file.key) {
        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        coverImageUrl = `${publicUrl}/${req.file.key}`;
      } else if (req.file.location) {
        coverImageUrl = req.file.location;
      } else if (req.file.filename) {
        coverImageUrl = `/uploads/articles/${req.file.filename}`;
      }
      
      console.log('📸 Image de couverture mise à jour:', {
        key: req.file.key,
        location: req.file.location,
        filename: req.file.filename,
        finalUrl: coverImageUrl
      });
    } else if (req.body.coverImage) {
      // Si pas de nouveau fichier mais une URL existante dans le body
      coverImageUrl = req.body.coverImage;
    }

    // Vérifier si le changement de semaine crée un conflit
    if (scheduledFor && news.scheduledFor) {
      const newWeekOfYear = getWeekOfYear(new Date(scheduledFor));
      if (newWeekOfYear !== news.weekOfYear) {
        const existingNews = await News.findOne({ 
          weekOfYear: newWeekOfYear,
          _id: { $ne: req.params.id }
        });
        if (existingNews) {
          return res.status(409).json({
            success: false,
            error: 'Une actualité existe déjà pour cette semaine',
            data: { weekOfYear: newWeekOfYear, existingNewsId: existingNews._id }
          });
        }
      }
    }

    // Parser les tags si c'est une chaîne JSON
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    // Mise à jour des champs
    const updateData = {
      lastModifiedBy: req.body.authorId || null,
      lastModifiedAt: new Date(),
      version: news.version + 1
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (coverImageUrl !== null) updateData.coverImage = coverImageUrl;
    if (summary !== undefined) updateData.summary = summary;
    if (status !== undefined) updateData.status = status;
    if (scheduledFor !== undefined) updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    if (parsedTags !== undefined) updateData.tags = parsedTags;
    if (targetUsers !== undefined) updateData.targetUsers = targetUsers;
    if (targetRoles !== undefined) updateData.targetRoles = targetRoles;
    if (priority !== undefined) updateData.priority = priority;

    // Mettre à jour publishedAt si le status passe à 'published'
    if (status === 'published' && news.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName email')
     .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Actualité mise à jour avec succès',
      data: updatedNews
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'actualité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour de l\'actualité'
    });
  }
};

// @desc    Supprimer une actualité
// @route   DELETE /api/news/:id
// @access  Private (Admin)
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Actualité non trouvée'
      });
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Actualité supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'actualité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression de l\'actualité'
    });
  }
};

// @desc    Publier une actualité
// @route   PATCH /api/news/:id/publish
// @access  Private (Admin)
const publishNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Actualité non trouvée'
      });
    }

    // Vérifier si l'actualité peut être publiée
    if (!news.canPublish()) {
      return res.status(400).json({
        success: false,
        error: 'Cette actualité ne peut pas être publiée pour cette semaine'
      });
    }

    // Mettre à jour le statut
    news.status = 'published';
    news.publishedAt = new Date();
    news.lastModifiedBy = req.body.authorId || null;
    news.lastModifiedAt = new Date();
    news.version += 1;

    await news.save();

    const updatedNews = await News.findById(news._id)
      .populate('author', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Actualité publiée avec succès',
      data: updatedNews
    });
  } catch (error) {
    console.error('Erreur lors de la publication de l\'actualité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la publication de l\'actualité'
    });
  }
};

// @desc    Récupérer les statistiques des actualités
// @route   GET /api/news/stats/overview
// @access  Private (Admin)
const getNewsStats = async (req, res) => {
  try {
    const stats = await News.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: 'published' });
    const draftNews = await News.countDocuments({ status: 'draft' });
    const scheduledNews = await News.countDocuments({ status: 'scheduled' });

    // Statistiques par année
    const yearlyStats = await News.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: { $substr: ['$weekOfYear', 0, 4] },
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalNews,
        published: publishedNews,
        draft: draftNews,
        scheduled: scheduledNews,
        byStatus: stats,
        yearlyStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
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
};

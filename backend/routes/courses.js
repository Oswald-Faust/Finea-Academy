const express = require('express');
const router = express.Router();

// Routes publiques pour les cours/formations

// @desc    Récupérer tous les cours
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Pour l'instant, retourner des données fictives
    // TODO: Implémenter un modèle Course
    const courses = [
      {
        id: 1,
        title: 'Introduction à la Finance',
        description: 'Découvrez les bases de la finance moderne et de l\'investissement',
        instructor: 'Jean Dupont',
        duration: '8 semaines',
        level: 'Débutant',
        price: 149.99,
        category: 'Finance',
        image: '/images/courses/finance-intro.jpg',
        enrolled: 156,
        rating: 4.8,
        createdAt: new Date('2024-01-15'),
        isActive: true,
        modules: [
          { title: 'Les bases de la finance', duration: '2h30' },
          { title: 'Types d\'investissements', duration: '3h15' },
          { title: 'Gestion des risques', duration: '2h45' }
        ]
      },
      {
        id: 2,
        title: 'Trading et Analyse Technique',
        description: 'Maîtrisez l\'art du trading et de l\'analyse technique des marchés',
        instructor: 'Marie Martin',
        duration: '12 semaines',
        level: 'Intermédiaire',
        price: 299.99,
        category: 'Trading',
        image: '/images/courses/trading-advanced.jpg',
        enrolled: 89,
        rating: 4.9,
        createdAt: new Date('2024-02-01'),
        isActive: true,
        modules: [
          { title: 'Analyse technique fondamentale', duration: '4h20' },
          { title: 'Stratégies de trading', duration: '5h10' },
          { title: 'Psychologie du trader', duration: '3h30' }
        ]
      },
      {
        id: 3,
        title: 'Cryptomonnaies et Blockchain',
        description: 'Comprenez l\'univers des cryptomonnaies et de la blockchain',
        instructor: 'Pierre Blanchard',
        duration: '6 semaines',
        level: 'Débutant',
        price: 199.99,
        category: 'Crypto',
        image: '/images/courses/crypto-blockchain.jpg',
        enrolled: 203,
        rating: 4.7,
        createdAt: new Date('2024-01-30'),
        isActive: true,
        modules: [
          { title: 'Introduction à la blockchain', duration: '2h45' },
          { title: 'Principales cryptomonnaies', duration: '3h20' },
          { title: 'Sécurité et wallets', duration: '2h15' }
        ]
      }
    ];

    // Filtrage et pagination
    const { category, level, search, page = 1, limit = 10 } = req.query;
    let filteredCourses = [...courses];

    if (category) {
      filteredCourses = filteredCourses.filter(course => 
        course.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level.toLowerCase() === level.toLowerCase()
      );
    }

    if (search) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedCourses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredCourses.length / limit),
        totalCourses: filteredCourses.length,
        hasNext: endIndex < filteredCourses.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des cours'
    });
  }
});

// @desc    Récupérer un cours par ID
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Données fictives d'un cours détaillé
    const course = {
      id: parseInt(id),
      title: 'Introduction à la Finance',
      description: 'Découvrez les bases de la finance moderne et de l\'investissement. Ce cours complet vous permettra de maîtriser les concepts fondamentaux nécessaires pour comprendre les marchés financiers.',
      instructor: {
        name: 'Jean Dupont',
        bio: 'Expert en finance avec 15 ans d\'expérience dans l\'investment banking',
        avatar: '/images/instructors/jean-dupont.jpg',
        rating: 4.9
      },
      duration: '8 semaines',
      level: 'Débutant',
      price: 149.99,
      category: 'Finance',
      image: '/images/courses/finance-intro.jpg',
      enrolled: 156,
      rating: 4.8,
      reviews: 67,
      createdAt: new Date('2024-01-15'),
      isActive: true,
      modules: [
        {
          id: 1,
          title: 'Les bases de la finance',
          duration: '2h30',
          lessons: [
            { title: 'Introduction à la finance', duration: '15min', type: 'video' },
            { title: 'Les marchés financiers', duration: '20min', type: 'video' },
            { title: 'Quiz - Les bases', duration: '10min', type: 'quiz' }
          ]
        },
        {
          id: 2,
          title: 'Types d\'investissements',
          duration: '3h15',
          lessons: [
            { title: 'Actions et obligations', duration: '25min', type: 'video' },
            { title: 'Les fonds d\'investissement', duration: '30min', type: 'video' },
            { title: 'Exercice pratique', duration: '20min', type: 'exercise' }
          ]
        },
        {
          id: 3,
          title: 'Gestion des risques',
          duration: '2h45',
          lessons: [
            { title: 'Comprendre les risques', duration: '18min', type: 'video' },
            { title: 'Diversification', duration: '22min', type: 'video' },
            { title: 'Projet final', duration: '45min', type: 'project' }
          ]
        }
      ],
      requirements: [
        'Aucun prérequis nécessaire',
        'Un ordinateur avec accès à internet',
        'Motivation pour apprendre'
      ],
      whatYouWillLearn: [
        'Comprendre les bases de la finance',
        'Analyser différents types d\'investissements',
        'Gérer les risques financiers',
        'Développer une stratégie d\'investissement'
      ]
    };

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du cours'
    });
  }
});

// @desc    Créer un nouveau cours
// @route   POST /api/courses
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      duration,
      level,
      price,
      category,
      modules = []
    } = req.body;

    if (!title || !description || !instructor || !level || !category) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // TODO: Implémenter la création en base de données
    const newCourse = {
      id: Date.now(), // ID temporaire
      title,
      description,
      instructor,
      duration: duration || '4 semaines',
      level,
      price: price || 0,
      category,
      image: '/images/courses/default.jpg',
      enrolled: 0,
      rating: 0,
      createdAt: new Date(),
      isActive: true,
      modules
    };

    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: newCourse
    });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du cours'
    });
  }
});

// @desc    Inscrire un utilisateur à un cours
// @route   POST /api/courses/:id/enroll
// @access  Public
router.post('/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userEmail, userName } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur ou email requis'
      });
    }

    // TODO: Implémenter l'inscription en base de données
    const enrollment = {
      courseId: parseInt(id),
      userId: userId || `temp_${Date.now()}`,
      userEmail,
      userName,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    };

    res.status(201).json({
      success: true,
      message: 'Inscription au cours réussie',
      data: enrollment
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription au cours'
    });
  }
});

// @desc    Récupérer les statistiques des cours
// @route   GET /api/courses/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    // Statistiques fictives
    const stats = {
      totalCourses: 24,
      activeCourses: 21,
      totalEnrollments: 1247,
      totalRevenue: 52485.50,
      averageRating: 4.7,
      topCategories: [
        { name: 'Finance', count: 8, percentage: 33.3 },
        { name: 'Trading', count: 6, percentage: 25.0 },
        { name: 'Crypto', count: 5, percentage: 20.8 },
        { name: 'Immobilier', count: 3, percentage: 12.5 },
        { name: 'Entrepreneuriat', count: 2, percentage: 8.3 }
      ],
      monthlyEnrollments: [
        { month: 'Janvier', enrollments: 145 },
        { month: 'Février', enrollments: 189 },
        { month: 'Mars', enrollments: 203 },
        { month: 'Avril', enrollments: 167 },
        { month: 'Mai', enrollments: 221 },
        { month: 'Juin', enrollments: 198 }
      ],
      topInstructors: [
        { name: 'Jean Dupont', courses: 5, rating: 4.9 },
        { name: 'Marie Martin', courses: 4, rating: 4.8 },
        { name: 'Pierre Blanchard', courses: 3, rating: 4.7 }
      ]
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

module.exports = router; 
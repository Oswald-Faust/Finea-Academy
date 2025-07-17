const express = require('express');
const router = express.Router();

// Routes publiques pour les analyses et rapports

// @desc    Récupérer le rapport d'activité générale
// @route   GET /api/analytics/activity
// @access  Public
router.get('/activity', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Données d'activité fictives mais réalistes
    const activityData = {
      userActivity: {
        newUsers: period === '7d' ? 23 : period === '30d' ? 156 : 489,
        activeUsers: period === '7d' ? 78 : period === '30d' ? 342 : 1247,
        totalSessions: period === '7d' ? 234 : period === '30d' ? 1456 : 4782,
        avgSessionDuration: '8min 34s',
        bounceRate: '24.6%'
      },
      courseActivity: {
        enrollments: period === '7d' ? 45 : period === '30d' ? 189 : 567,
        completions: period === '7d' ? 12 : period === '30d' ? 67 : 234,
        totalWatchTime: period === '7d' ? '234h' : period === '30d' ? '1,456h' : '4,823h',
        popularCourses: [
          { title: 'Introduction à la Finance', enrollments: 67 },
          { title: 'Trading Avancé', enrollments: 54 },
          { title: 'Crypto & Blockchain', enrollments: 43 }
        ]
      },
      revenue: {
        total: period === '7d' ? 2845.50 : period === '30d' ? 12467.80 : 45892.20,
        courses: period === '7d' ? 2145.50 : period === '30d' ? 9567.80 : 35234.20,
        subscriptions: period === '7d' ? 700.00 : period === '30d' ? 2900.00 : 10658.00,
        growth: period === '7d' ? '+12.4%' : period === '30d' ? '+8.7%' : '+15.2%'
      },
      engagement: {
        emailOpenRate: '68.5%',
        emailClickRate: '12.3%',
        forumPosts: period === '7d' ? 89 : period === '30d' ? 456 : 1234,
        supportTickets: period === '7d' ? 12 : period === '30d' ? 34 : 89
      }
    };

    res.status(200).json({
      success: true,
      data: activityData,
      period,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'activité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données d\'activité'
    });
  }
});

// @desc    Récupérer les données de performance des cours
// @route   GET /api/analytics/courses/performance
// @access  Public
router.get('/courses/performance', async (req, res) => {
  try {
    const performanceData = [
      {
        id: 1,
        title: 'Introduction à la Finance',
        enrollments: 156,
        completions: 89,
        completionRate: 57.1,
        averageRating: 4.8,
        revenue: 23244.00,
        avgTimeToComplete: '6.5 semaines',
        dropoffPoints: [
          { module: 'Module 2', percentage: 15.3 },
          { module: 'Module 4', percentage: 22.8 }
        ]
      },
      {
        id: 2,
        title: 'Trading et Analyse Technique',
        enrollments: 89,
        completions: 67,
        completionRate: 75.3,
        averageRating: 4.9,
        revenue: 26691.00,
        avgTimeToComplete: '10.2 semaines',
        dropoffPoints: [
          { module: 'Module 3', percentage: 8.9 },
          { module: 'Module 7', percentage: 12.4 }
        ]
      },
      {
        id: 3,
        title: 'Cryptomonnaies et Blockchain',
        enrollments: 203,
        completions: 124,
        completionRate: 61.1,
        averageRating: 4.7,
        revenue: 40597.00,
        avgTimeToComplete: '5.8 semaines',
        dropoffPoints: [
          { module: 'Module 1', percentage: 18.7 },
          { module: 'Module 5', percentage: 14.2 }
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: performanceData,
      summary: {
        totalEnrollments: performanceData.reduce((sum, course) => sum + course.enrollments, 0),
        totalCompletions: performanceData.reduce((sum, course) => sum + course.completions, 0),
        avgCompletionRate: (performanceData.reduce((sum, course) => sum + course.completionRate, 0) / performanceData.length).toFixed(1),
        totalRevenue: performanceData.reduce((sum, course) => sum + course.revenue, 0)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des performances'
    });
  }
});

// @desc    Récupérer les données démographiques des utilisateurs
// @route   GET /api/analytics/users/demographics
// @access  Public
router.get('/users/demographics', async (req, res) => {
  try {
    const demographics = {
      ageGroups: [
        { range: '18-24', count: 234, percentage: 18.8 },
        { range: '25-34', count: 456, percentage: 36.6 },
        { range: '35-44', count: 342, percentage: 27.4 },
        { range: '45-54', count: 156, percentage: 12.5 },
        { range: '55+', count: 59, percentage: 4.7 }
      ],
      locations: [
        { country: 'France', count: 678, percentage: 54.4 },
        { country: 'Canada', count: 234, percentage: 18.8 },
        { country: 'Belgique', count: 156, percentage: 12.5 },
        { country: 'Suisse', count: 89, percentage: 7.1 },
        { country: 'Autres', count: 90, percentage: 7.2 }
      ],
      deviceTypes: [
        { type: 'Desktop', count: 789, percentage: 63.3 },
        { type: 'Mobile', count: 345, percentage: 27.7 },
        { type: 'Tablet', count: 113, percentage: 9.0 }
      ],
      registrationSources: [
        { source: 'Site web', count: 567, percentage: 45.5 },
        { source: 'Réseaux sociaux', count: 345, percentage: 27.7 },
        { source: 'Email marketing', count: 234, percentage: 18.8 },
        { source: 'Référencement', count: 101, percentage: 8.1 }
      ],
      subscriptionTypes: [
        { type: 'Gratuit', count: 890, percentage: 71.4 },
        { type: 'Premium', count: 267, percentage: 21.4 },
        { type: 'Pro', count: 90, percentage: 7.2 }
      ]
    };

    res.status(200).json({
      success: true,
      data: demographics,
      totalUsers: 1247,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données démographiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données démographiques'
    });
  }
});

// @desc    Récupérer les données de revenus détaillées
// @route   GET /api/analytics/revenue
// @access  Public
router.get('/revenue', async (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    let monthlyRevenue = [];
    if (period === '12m') {
      monthlyRevenue = [
        { month: 'Jan 2024', revenue: 3456.78, courses: 2156.78, subscriptions: 1300.00 },
        { month: 'Fév 2024', revenue: 4123.45, courses: 2823.45, subscriptions: 1300.00 },
        { month: 'Mar 2024', revenue: 3789.12, courses: 2489.12, subscriptions: 1300.00 },
        { month: 'Avr 2024', revenue: 4567.89, courses: 3267.89, subscriptions: 1300.00 },
        { month: 'Mai 2024', revenue: 5234.56, courses: 3934.56, subscriptions: 1300.00 },
        { month: 'Jun 2024', revenue: 4891.23, courses: 3591.23, subscriptions: 1300.00 }
      ];
    }

    const revenueAnalysis = {
      currentMonth: {
        total: 4891.23,
        growth: '+12.4%',
        courses: 3591.23,
        subscriptions: 1300.00
      },
      previousMonth: {
        total: 5234.56,
        courses: 3934.56,
        subscriptions: 1300.00
      },
      yearToDate: {
        total: 26062.03,
        courses: 18262.03,
        subscriptions: 7800.00,
        growth: '+18.7%'
      },
      topEarningCourses: [
        { title: 'Trading Avancé', revenue: 26691.00, enrollments: 89 },
        { title: 'Crypto & Blockchain', revenue: 40597.00, enrollments: 203 },
        { title: 'Introduction Finance', revenue: 23244.00, enrollments: 156 }
      ],
      monthlyRevenue
    };

    res.status(200).json({
      success: true,
      data: revenueAnalysis,
      period,
      currency: 'EUR'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données de revenus:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données de revenus'
    });
  }
});

// @desc    Générer un rapport personnalisé
// @route   POST /api/analytics/reports/custom
// @access  Public
router.post('/reports/custom', async (req, res) => {
  try {
    const { 
      dateRange, 
      metrics = ['users', 'courses', 'revenue'], 
      format = 'json' 
    } = req.body;

    if (!dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({
        success: false,
        error: 'Période de dates requise (start et end)'
      });
    }

    // Génération d'un rapport personnalisé
    const customReport = {
      reportId: `report_${Date.now()}`,
      dateRange,
      metrics,
      generatedAt: new Date(),
      data: {}
    };

    // Ajouter les données selon les métriques demandées
    if (metrics.includes('users')) {
      customReport.data.users = {
        total: 1247,
        new: 156,
        active: 342,
        churned: 23
      };
    }

    if (metrics.includes('courses')) {
      customReport.data.courses = {
        total: 24,
        published: 21,
        enrollments: 1456,
        completions: 234
      };
    }

    if (metrics.includes('revenue')) {
      customReport.data.revenue = {
        total: 45892.20,
        courses: 35234.20,
        subscriptions: 10658.00,
        refunds: 234.50
      };
    }

    if (format === 'csv') {
      // TODO: Générer un CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=rapport_custom.csv');
      return res.send('csv data would be here');
    }

    res.status(200).json({
      success: true,
      data: customReport
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du rapport'
    });
  }
});

module.exports = router; 
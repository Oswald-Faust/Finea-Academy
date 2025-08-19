const Contest = require('../models/Contest');
const User = require('../models/User');
const WeeklyContestService = require('../services/weeklyContestService');
const { protect: auth } = require('../middleware/auth');

// @desc    Créer un nouveau concours
// @route   POST /api/contests
// @access  Private (Admin)
const createContest = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      drawDate,
      maxParticipants,
      prizes,
      rules,
      eligibilityCriteria,
      metadata = {}
    } = req.body;

    // Validation
    if (!title || !description || !startDate || !endDate || !drawDate) {
      return res.status(400).json({
        success: false,
        error: 'Le titre, la description et les dates sont requis'
      });
    }

    // Vérifier que les dates sont logiques
    const start = new Date(startDate);
    const end = new Date(endDate);
    const draw = new Date(drawDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'La date de fin doit être après la date de début'
      });
    }

    if (draw < end) {
      return res.status(400).json({
        success: false,
        error: 'La date de tirage doit être après la date de fin'
      });
    }

    const contest = new Contest({
      title,
      description,
      type,
      startDate: start,
      endDate: end,
      drawDate: draw,
      maxParticipants: maxParticipants || null,
      prizes: prizes || [],
      rules,
      eligibilityCriteria: eligibilityCriteria || {},
      metadata,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await contest.save();

    res.status(201).json({
      success: true,
      message: 'Concours créé avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de la création du concours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du concours'
    });
  }
};

// @desc    Créer un concours hebdomadaire
// @route   POST /api/contests/weekly
// @access  Public (Admin dashboard)
const createWeeklyContest = async (req, res) => {
  try {
    // Pas besoin d'authentification - création directe avec adminUserId null
    const contest = await WeeklyContestService.createWeeklyContest(null);
    
    res.status(201).json({
      success: true,
      message: 'Concours hebdomadaire créé avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de la création du concours hebdomadaire:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création du concours hebdomadaire'
    });
  }
};

// @desc    Obtenir le concours hebdomadaire actuel
// @route   GET /api/contests/weekly/current
// @access  Public
const getCurrentWeeklyContest = async (req, res) => {
  try {
    const contest = await Contest.findCurrentWeeklyContest()
      .populate('participants.user', 'firstName lastName email fullName')
      .populate('winners.user', 'firstName lastName email fullName');

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Aucun concours hebdomadaire actif'
      });
    }

    res.json({
      success: true,
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du concours hebdomadaire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du concours hebdomadaire'
    });
  }
};

// @desc    Effectuer le tirage automatique
// @route   POST /api/contests/weekly/draw
// @access  Public (Admin dashboard)
const performAutoDraw = async (req, res) => {
  try {
    // Pas besoin d'authentification - tirage direct
    await WeeklyContestService.performAutoDraws();
    
    res.json({
      success: true,
      message: 'Tirage automatique effectué'
    });
  } catch (error) {
    console.error('Erreur lors du tirage automatique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du tirage automatique'
    });
  }
};

// @desc    Obtenir les statistiques des concours hebdomadaires
// @route   GET /api/contests/weekly/stats
// @access  Public
const getWeeklyContestStats = async (req, res) => {
  try {
    const stats = await WeeklyContestService.getWeeklyContestStats();
    
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
};

// @desc    Obtenir l'historique des concours hebdomadaires
// @route   GET /api/contests/weekly/history
// @access  Public
const getWeeklyContestHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const history = await WeeklyContestService.getWeeklyContestHistory(parseInt(limit));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// @desc    Participer au concours hebdomadaire
// @route   POST /api/contests/weekly/participate
// @access  Private (Authentification requise)
const participateInWeeklyContest = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise pour participer au concours'
      });
    }

    // Récupérer le concours hebdomadaire actuel
    const currentContest = await Contest.findOne({
      isWeeklyContest: true,
      status: 'active'
    });

    if (!currentContest) {
      return res.status(404).json({
        success: false,
        error: 'Aucun concours hebdomadaire actif'
      });
    }

    // Vérifier si le concours est ouvert aux inscriptions
    if (!currentContest.isOpenForRegistration) {
      return res.status(400).json({
        success: false,
        error: 'Le concours n\'est pas ouvert aux inscriptions'
      });
    }

    // Vérifier si l'utilisateur participe déjà
    const isAlreadyParticipating = currentContest.participants.some(
      participant => participant.user.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipating) {
      return res.status(400).json({
        success: false,
        error: 'Vous participez déjà à ce concours'
      });
    }

    // Ajouter le participant avec l'ID utilisateur authentifié
    await currentContest.addParticipant(req.user._id);

    res.json({
      success: true,
      message: 'Participation enregistrée avec succès',
      data: currentContest
    });
  } catch (error) {
    console.error('Erreur lors de la participation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la participation'
    });
  }
};

// @desc    Vérifier si l'utilisateur participe au concours hebdomadaire
// @route   GET /api/contests/weekly/participation
// @access  Private
const checkWeeklyContestParticipation = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    // Récupérer le concours hebdomadaire actuel
    const currentContest = await Contest.findOne({
      isWeeklyContest: true,
      status: 'active'
    });

    if (!currentContest) {
      return res.json({
        success: true,
        data: { isParticipating: false, reason: 'Aucun concours actif' }
      });
    }

    // Vérifier si l'utilisateur participe
    const isParticipating = currentContest.participants.some(
      participant => participant.user.toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      data: { 
        isParticipating,
        contestId: currentContest._id,
        contestTitle: currentContest.title
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de participation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification de participation'
    });
  }
};

// @desc    Récupérer tous les participants de tous les concours
// @route   GET /api/contests/participants/all
// @access  Public (Admin dashboard)
const getAllParticipants = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('participants.user', 'firstName lastName email fullName')
      .sort({ createdAt: -1 });

    const allParticipants = [];
    
    contests.forEach(contest => {
      contest.participants.forEach(participant => {
        // Vérifier si c'est un gagnant
        const winner = contest.winners.find(w => w.user.toString() === participant.user._id.toString());
        
        allParticipants.push({
          userId: participant.user._id,
          userEmail: participant.user?.email || 'Email non disponible',
          userFullName: participant.user?.fullName || `${participant.user?.firstName} ${participant.user?.lastName}`,
          contestId: contest._id,
          contestTitle: contest.title,
          contestWeek: contest.weekNumber,
          joinedAt: participant.joinedAt,
          status: winner ? 'winner' : 'participant',
          winnerPosition: winner?.position || null,
          winnerPrize: winner?.prize || null
        });
      });
    });

    res.json({
      success: true,
      data: allParticipants
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des participants'
    });
  }
};

// @desc    Sélectionner plusieurs gagnants pour un concours
// @route   POST /api/contests/:id/winners/select
// @access  Public (Admin dashboard)
const selectMultipleWinners = async (req, res) => {
  try {
    const { id } = req.params;
    const { participants } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Liste de participants requise'
      });
    }

    if (participants.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 3 gagnants autorisés'
      });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Effacer les anciens gagnants
    contest.winners = [];

    // Ajouter les nouveaux gagnants
    participants.forEach((participant, index) => {
      contest.winners.push({
        user: participant.userId,
        position: index + 1,
        prize: contest.prizes[index]?.name || `Prix ${index + 1}`,
        selectedAt: new Date(),
        selectedBy: null // Pas d'authentification admin
      });
    });

    await contest.save();

    // Ici on peut ajouter la logique pour envoyer des notifications
    // TODO: Implémenter le système de notifications

    res.json({
      success: true,
      message: 'Gagnants sélectionnés avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de la sélection des gagnants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la sélection des gagnants'
    });
  }
};

// @desc    Récupérer tous les concours
// @route   GET /api/contests
// @access  Public
const getContests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const contests = await Contest.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email fullName')
      .populate('winners.user', 'firstName lastName email fullName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contest.countDocuments(filter);

    res.json({
      success: true,
      data: contests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des concours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des concours'
    });
  }
};

// @desc    Récupérer un concours par ID
// @route   GET /api/contests/:id
// @access  Public
const getContestById = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email fullName')
      .populate('winners.user', 'firstName lastName email fullName')
      .populate('winners.selectedBy', 'firstName lastName email');

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    res.json({
      success: true,
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du concours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du concours'
    });
  }
};

// @desc    Mettre à jour un concours
// @route   PUT /api/contests/:id
// @access  Private (Admin)
const updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que le concours existe
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Empêcher la modification si le concours est terminé
    if (contest.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Impossible de modifier un concours terminé'
      });
    }

    // Mettre à jour
    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastModifiedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('lastModifiedBy', 'firstName lastName email')
     .populate('participants.user', 'firstName lastName email fullName')
     .populate('winners.user', 'firstName lastName email fullName');

    res.json({
      success: true,
      message: 'Concours mis à jour avec succès',
      data: updatedContest
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du concours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du concours'
    });
  }
};

// @desc    Supprimer un concours
// @route   DELETE /api/contests/:id
// @access  Private (Admin)
const deleteContest = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Empêcher la suppression si le concours a des participants
    if (contest.participants.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer un concours avec des participants'
      });
    }

    await Contest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Concours supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du concours:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du concours'
    });
  }
};

// @desc    Ajouter un participant
// @route   POST /api/contests/:id/participants
// @access  Private
const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Vérifier que le concours est ouvert aux inscriptions
    if (!contest.isOpenForRegistration) {
      return res.status(400).json({
        success: false,
        error: 'Le concours n\'est pas ouvert aux inscriptions'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await contest.addParticipant(userId);

    res.json({
      success: true,
      message: 'Participant ajouté avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du participant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout du participant'
    });
  }
};

// @desc    Retirer un participant
// @route   DELETE /api/contests/:id/participants/:userId
// @access  Private (Admin)
const removeParticipant = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    await contest.removeParticipant(userId);

    res.json({
      success: true,
      message: 'Participant retiré avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors du retrait du participant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du retrait du participant'
    });
  }
};

// @desc    Sélectionner un vainqueur
// @route   POST /api/contests/:id/winners
// @access  Private (Admin)
const selectWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, position, prize, notes } = req.body;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Vérifier que le concours est terminé
    const now = new Date();
    if (contest.endDate > now) {
      return res.status(400).json({
        success: false,
        error: 'Le concours n\'est pas encore terminé'
      });
    }

    await contest.selectWinner(userId, position, prize, req.user._id, notes);

    res.json({
      success: true,
      message: 'Vainqueur sélectionné avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors de la sélection du vainqueur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la sélection du vainqueur'
    });
  }
};

// @desc    Retirer un vainqueur
// @route   DELETE /api/contests/:id/winners/:userId
// @access  Private (Admin)
const removeWinner = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    await contest.removeWinner(userId);

    res.json({
      success: true,
      message: 'Vainqueur retiré avec succès',
      data: contest
    });
  } catch (error) {
    console.error('Erreur lors du retrait du vainqueur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du retrait du vainqueur'
    });
  }
};

// @desc    Récupérer les statistiques des concours
// @route   GET /api/contests/stats/overview
// @access  Public
const getContestStats = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalContests,
      activeContests,
      upcomingContests,
      completedContests,
      totalParticipants,
      totalWinners
    ] = await Promise.all([
      Contest.countDocuments(),
      Contest.countDocuments({
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
      }),
      Contest.countDocuments({
        status: 'active',
        startDate: { $gt: now }
      }),
      Contest.countDocuments({
        $or: [
          { status: 'completed' },
          { endDate: { $lt: now } }
        ]
      }),
      Contest.aggregate([
        { $unwind: '$participants' },
        { $group: { _id: null, total: { $sum: 1 } } }
      ]),
      Contest.aggregate([
        { $unwind: '$winners' },
        { $group: { _id: null, total: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      totalContests,
      activeContests,
      upcomingContests,
      completedContests,
      totalParticipants: totalParticipants[0]?.total || 0,
      totalWinners: totalWinners[0]?.total || 0
    };

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
};

// @desc    Récupérer les concours par type
// @route   GET /api/contests/type/:type
// @access  Public
const getContestsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contests = await Contest.find({ type })
      .populate('createdBy', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email fullName')
      .populate('winners.user', 'firstName lastName email fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contest.countDocuments({ type });

    res.json({
      success: true,
      data: contests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des concours par type:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des concours'
    });
  }
};

module.exports = {
  createContest,
  createWeeklyContest,
  getCurrentWeeklyContest,
  performAutoDraw,
  getWeeklyContestStats,
  getWeeklyContestHistory,
  participateInWeeklyContest,
  checkWeeklyContestParticipation,
  getAllParticipants,
  selectMultipleWinners,
  getContests,
  getContestById,
  updateContest,
  deleteContest,
  addParticipant,
  removeParticipant,
  selectWinner,
  removeWinner,
  getContestStats,
  getContestsByType
}; 
const express = require('express');
const {
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
} = require('../controllers/contestController');

// Import des nouveaux contrôleurs pour les statistiques et gagnants
const {
  getGlobalStats,
  updateGlobalStats,
  addManualWinners,
  getAllWinners,
  getDisplayStats
} = require('../controllers/contestStatsController');

// Import du middleware d'authentification pour certaines routes
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', getContests);
router.get('/stats/overview', getContestStats);
router.get('/stats/global', getGlobalStats);
router.get('/stats/display', getDisplayStats);
router.get('/winners/all', getAllWinners);
router.get('/type/:type', getContestsByType);
router.get('/participants/all', getAllParticipants);

// Routes pour le concours hebdomadaire (AVANT /:id)
router.get('/weekly/current', getCurrentWeeklyContest);
router.get('/weekly/stats', getWeeklyContestStats);
router.get('/weekly/history', getWeeklyContestHistory);
router.get('/weekly/participation', protect, checkWeeklyContestParticipation); // Vérifier la participation
router.post('/weekly/participate', protect, participateInWeeklyContest); // Authentification requise

// Routes publiques (sans auth) - AVANT /:id
router.post('/', createContest);
router.post('/weekly', createWeeklyContest);
router.post('/weekly/draw', performAutoDraw);

// Routes pour les statistiques (Admin)
router.put('/stats/global', updateGlobalStats);

// Route générique pour un concours spécifique (APRÈS les routes spécifiques)
router.get('/:id', getContestById);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);

// Gestion des participants
router.post('/:id/participants', addParticipant);
router.delete('/:id/participants/:userId', removeParticipant);

// Gestion des vainqueurs
router.post('/:id/winners', selectWinner);
router.post('/:id/winners/select', selectMultipleWinners);
router.post('/:id/winners/manual', addManualWinners);
router.delete('/:id/winners/:userId', removeWinner);

module.exports = router; 
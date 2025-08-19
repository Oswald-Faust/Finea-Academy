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

// Import du middleware d'authentification pour certaines routes
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', getContests);
router.get('/stats/overview', getContestStats);
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
router.delete('/:id/winners/:userId', removeWinner);

module.exports = router; 
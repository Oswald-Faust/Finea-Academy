const express = require('express');
const {
  createContest,
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
const { protect: auth } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', getContests);
router.get('/stats/overview', getContestStats);
router.get('/type/:type', getContestsByType);
router.get('/:id', getContestById);

// Routes protégées (admin)
router.post('/', auth, createContest);
router.put('/:id', auth, updateContest);
router.delete('/:id', auth, deleteContest);

// Gestion des participants
router.post('/:id/participants', auth, addParticipant);
router.delete('/:id/participants/:userId', auth, removeParticipant);

// Gestion des vainqueurs
router.post('/:id/winners', auth, selectWinner);
router.delete('/:id/winners/:userId', auth, removeWinner);

module.exports = router; 
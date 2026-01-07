const express = require('express');
const router = express.Router();
const {
  getAllStandaloneWinners,
  getCurrentWeekWinners,
  getRecentWinners,
  createStandaloneWinners,
  deleteStandaloneWinner,
  clearWeekWinners,
  updateStandaloneWinner,
  getFirstPlaceWinner
} = require('../controllers/standaloneWinnerController');

// Routes publiques
// @route   GET /api/standalone-winners
// @desc    Récupérer tous les gagnants indépendants
router.get('/', getAllStandaloneWinners);

// @route   GET /api/standalone-winners/first-place
// @desc    Récupérer le gagnant en position 1 (pour la page d'accueil)
router.get('/first-place', getFirstPlaceWinner);

// @route   GET /api/standalone-winners/current-week
// @desc    Récupérer les gagnants de la semaine actuelle
router.get('/current-week', getCurrentWeekWinners);

// @route   GET /api/standalone-winners/recent
// @desc    Récupérer les gagnants récents pour l'affichage dans l'app
router.get('/recent', getRecentWinners);

// Routes Admin
// @route   POST /api/standalone-winners
// @desc    Ajouter un ou plusieurs gagnants
router.post('/', createStandaloneWinners);

// @route   PUT /api/standalone-winners/:id
// @desc    Mettre à jour un gagnant
router.put('/:id', updateStandaloneWinner);

// @route   DELETE /api/standalone-winners/:id
// @desc    Supprimer un gagnant
router.delete('/:id', deleteStandaloneWinner);

// @route   DELETE /api/standalone-winners/week/:week
// @desc    Supprimer tous les gagnants d'une semaine
router.delete('/week/:week', clearWeekWinners);

module.exports = router;

const express = require('express');
const router = express.Router();
const forexFactoryController = require('../controllers/forexFactoryController');

/**
 * @route   GET /api/forex-factory/calendar
 * @desc    Récupère tous les événements du calendrier économique
 * @query   date - Date au format YYYY-MM-DD (optionnel)
 * @access  Public
 */
router.get('/calendar', forexFactoryController.getCalendarEvents);

/**
 * @route   GET /api/forex-factory/weekly
 * @desc    Récupère le calendrier de la semaine groupé par jour
 * @access  Public
 */
router.get('/weekly', forexFactoryController.getWeeklyCalendar);

/**
 * @route   GET /api/forex-factory/high-impact
 * @desc    Récupère uniquement les événements à fort impact
 * @access  Public
 */
router.get('/high-impact', forexFactoryController.getHighImpactEvents);

/**
 * @route   GET /api/forex-factory/currency/:currency
 * @desc    Récupère les événements filtrés par devise
 * @param   currency - Code de la devise (USD, EUR, GBP, etc.)
 * @access  Public
 */
router.get('/currency/:currency', forexFactoryController.getEventsByCurrency);

/**
 * @route   GET /api/forex-factory/summary
 * @desc    Récupère un résumé des événements du jour
 * @access  Public
 */
router.get('/summary', forexFactoryController.getTodaySummary);

/**
 * @route   GET /api/forex-factory/news
 * @desc    Récupère les news avec leurs détails
 * @access  Public
 */
router.get('/news', forexFactoryController.getNews);

module.exports = router;


// Utiliser Puppeteer pour contourner le blocage 403
const forexFactoryService = require('../services/forexFactoryPuppeteerService');

/**
 * Récupère tous les événements du calendrier économique
 */
exports.getCalendarEvents = async (req, res) => {
  try {
    const { date } = req.query;
    
    const events = await forexFactoryService.getCalendarEvents(date);
    
    // Si aucun événement, ajouter un avertissement
    const response = {
      success: true,
      count: events.length,
      data: events,
      timestamp: new Date().toISOString()
    };
    
    if (events.length === 0) {
      response.warning = 'Le calendrier économique est temporairement indisponible. Le service de scraping ForexFactory ne fonctionne pas actuellement.';
      response.suggestion = 'Visitez directement https://www.forexfactory.com/calendar pour consulter le calendrier.';
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Erreur dans getCalendarEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements du calendrier',
      error: error.message,
      suggestion: 'Le service de calendrier économique nécessite Chrome/Puppeteer qui pourrait ne pas être correctement configuré.'
    });
  }
};

/**
 * Récupère le calendrier de la semaine
 */
exports.getWeeklyCalendar = async (req, res) => {
  try {
    const result = await forexFactoryService.getWeeklyCalendar();
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans getWeeklyCalendar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du calendrier hebdomadaire',
      error: error.message
    });
  }
};

/**
 * Récupère uniquement les événements à fort impact
 */
exports.getHighImpactEvents = async (req, res) => {
  try {
    const result = await forexFactoryService.getHighImpactEvents();
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans getHighImpactEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements à fort impact',
      error: error.message
    });
  }
};

/**
 * Récupère les événements filtrés par devise
 */
exports.getEventsByCurrency = async (req, res) => {
  try {
    const { currency } = req.params;
    
    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'Le code de devise est requis'
      });
    }
    
    const result = await forexFactoryService.getEventsByCurrency(currency);
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans getEventsByCurrency:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements par devise',
      error: error.message
    });
  }
};

/**
 * Récupère un résumé des événements du jour
 */
exports.getTodaySummary = async (req, res) => {
  try {
    const result = await forexFactoryService.getTodaySummary();
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans getTodaySummary:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du résumé',
      error: error.message
    });
  }
};

/**
 * Récupère les news avec leurs détails
 */
exports.getNews = async (req, res) => {
  try {
    const newsArticles = await forexFactoryService.getNews();
    
    res.status(200).json({
      success: true,
      count: newsArticles.length,
      data: newsArticles,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans getNews:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des news',
      error: error.message
    });
  }
};


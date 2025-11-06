const axios = require('axios');
const cheerio = require('cheerio');

class ForexFactoryService {
  constructor() {
    this.baseUrl = 'https://www.forexfactory.com';
    this.calendarUrl = `${this.baseUrl}/calendar`;
  }

  /**
   * Récupère les événements du calendrier économique de ForexFactory
   * @param {string} date - Date au format YYYY-MM-DD (optionnel, par défaut aujourd'hui)
   * @returns {Promise<Array>} Liste des événements économiques
   */
  async getCalendarEvents(date = null) {
    try {
      // Formater la date si fournie
      let url = this.calendarUrl;
      if (date) {
        // ForexFactory utilise le format month=MM.DD.YYYY
        const dateObj = new Date(date);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        url = `${this.calendarUrl}?month=${month}.${day}.${year}`;
      }

      // Récupérer la page HTML avec headers améliorés pour éviter le blocage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'Referer': 'https://www.forexfactory.com/'
        },
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Ne pas throw sur 403
        }
      });

      // Vérifier si la requête a réussi
      if (response.status === 403) {
        console.error('❌ ForexFactory bloque notre accès (403). Solutions possibles:');
        console.error('   1. Utiliser l\'API RapidAPI (payante mais stable)');
        console.error('   2. Implémenter un système de proxy');
        console.error('   3. Ajouter un délai entre les requêtes');
        throw new Error('Accès bloqué par ForexFactory (403 Forbidden). Veuillez utiliser une alternative comme RapidAPI.');
      }

      if (response.status !== 200) {
        throw new Error(`Réponse inattendue de ForexFactory: ${response.status}`);
      }

      // Parser le HTML avec Cheerio
      const $ = cheerio.load(response.data);
      const events = [];
      let currentDate = '';

      // Parcourir les lignes du tableau du calendrier
      $('.calendar__row').each((index, element) => {
        const $row = $(element);
        
        // Vérifier si c'est une ligne de date
        const dateCell = $row.find('.calendar__date').text().trim();
        if (dateCell) {
          currentDate = dateCell;
        }

        // Extraire les informations de l'événement
        const time = $row.find('.calendar__time').text().trim();
        const currency = $row.find('.calendar__currency').text().trim();
        const impact = $row.find('.calendar__impact span').attr('class') || '';
        const event = $row.find('.calendar__event').text().trim();
        const actual = $row.find('.calendar__actual').text().trim();
        const forecast = $row.find('.calendar__forecast').text().trim();
        const previous = $row.find('.calendar__previous').text().trim();

        // Ne garder que les événements valides (qui ont au moins un nom)
        if (event && currency) {
          // Déterminer le niveau d'impact
          let impactLevel = 'low';
          if (impact.includes('icon--ff-impact-red')) {
            impactLevel = 'high';
          } else if (impact.includes('icon--ff-impact-ora')) {
            impactLevel = 'medium';
          } else if (impact.includes('icon--ff-impact-yel')) {
            impactLevel = 'low';
          }

          events.push({
            date: currentDate || 'N/A',
            time: time || 'All Day',
            currency: currency,
            impact: impactLevel,
            event: event,
            actual: actual || '-',
            forecast: forecast || '-',
            previous: previous || '-'
          });
        }
      });

      return events;
    } catch (error) {
      console.error('Erreur lors de la récupération du calendrier ForexFactory:', error.message);
      throw new Error(`Impossible de récupérer les données de ForexFactory: ${error.message}`);
    }
  }

  /**
   * Récupère les événements de la semaine
   * @returns {Promise<Object>} Événements groupés par jour
   */
  async getWeeklyCalendar() {
    try {
      const events = await this.getCalendarEvents();
      
      // Grouper les événements par date
      const groupedEvents = events.reduce((acc, event) => {
        if (!acc[event.date]) {
          acc[event.date] = [];
        }
        acc[event.date].push(event);
        return acc;
      }, {});

      return {
        success: true,
        data: groupedEvents,
        totalEvents: events.length
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du calendrier hebdomadaire:', error.message);
      throw error;
    }
  }

  /**
   * Récupère les événements à fort impact seulement
   * @returns {Promise<Array>} Liste des événements à fort impact
   */
  async getHighImpactEvents() {
    try {
      const events = await this.getCalendarEvents();
      const highImpactEvents = events.filter(event => event.impact === 'high');
      
      return {
        success: true,
        data: highImpactEvents,
        totalEvents: highImpactEvents.length
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à fort impact:', error.message);
      throw error;
    }
  }

  /**
   * Récupère les événements filtrés par devise
   * @param {string} currency - Code de la devise (USD, EUR, etc.)
   * @returns {Promise<Array>} Liste des événements pour cette devise
   */
  async getEventsByCurrency(currency) {
    try {
      const events = await this.getCalendarEvents();
      const filteredEvents = events.filter(event => 
        event.currency.toUpperCase() === currency.toUpperCase()
      );
      
      return {
        success: true,
        data: filteredEvents,
        totalEvents: filteredEvents.length,
        currency: currency.toUpperCase()
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des événements pour ${currency}:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère un résumé des événements importants du jour
   * @returns {Promise<Object>} Résumé des événements
   */
  async getTodaySummary() {
    try {
      const events = await this.getCalendarEvents();
      
      const summary = {
        total: events.length,
        highImpact: events.filter(e => e.impact === 'high').length,
        mediumImpact: events.filter(e => e.impact === 'medium').length,
        lowImpact: events.filter(e => e.impact === 'low').length,
        currencies: [...new Set(events.map(e => e.currency))],
        upcomingHighImpact: events.filter(e => e.impact === 'high').slice(0, 5)
      };

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error.message);
      throw error;
    }
  }
}

module.exports = new ForexFactoryService();


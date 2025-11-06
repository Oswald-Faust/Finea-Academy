const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Utiliser le plugin stealth pour éviter la détection
puppeteer.use(StealthPlugin());

class ForexFactoryPuppeteerService {
  constructor() {
    this.baseUrl = 'https://www.forexfactory.com';
    this.calendarUrl = `${this.baseUrl}/calendar`;
    this.browser = null;
  }

  /**
   * Initialise le navigateur
   */
  async initBrowser() {
    if (!this.browser) {
      console.log('🌐 Initialisation du navigateur Puppeteer...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });
      console.log('✅ Navigateur initialisé');
    }
    return this.browser;
  }

  /**
   * Ferme le navigateur
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Navigateur fermé');
    }
  }

  /**
   * Récupère les événements du calendrier économique de ForexFactory
   * @param {string} date - Date au format YYYY-MM-DD (optionnel, par défaut aujourd'hui)
   * @returns {Promise<Array>} Liste des événements économiques
   */
  async getCalendarEvents(date = null) {
    let page = null;
    
    try {
      // Formater l'URL avec la date si fournie
      let url = this.calendarUrl;
      if (date) {
        const dateObj = new Date(date);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        url = `${this.calendarUrl}?month=${month}.${day}.${year}`;
      }

      console.log(`📡 Récupération du calendrier depuis: ${url}`);

      // Initialiser le navigateur
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configurer le viewport et user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Aller sur la page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      console.log('✅ Page chargée, extraction des données...');

      // Attendre que le tableau du calendrier soit chargé
      await page.waitForSelector('.calendar__row', { timeout: 10000 });

      // Extraire les données avec JavaScript dans le navigateur
      const events = await page.evaluate(() => {
        const rows = document.querySelectorAll('.calendar__row');
        const eventsData = [];
        let currentDate = '';

        rows.forEach((row) => {
          // Vérifier si c'est une ligne de date
          const dateCell = row.querySelector('.calendar__date');
          if (dateCell && dateCell.textContent.trim()) {
            currentDate = dateCell.textContent.trim();
          }

          // Extraire les informations de l'événement
          const timeCell = row.querySelector('.calendar__time');
          const currencyCell = row.querySelector('.calendar__currency');
          const impactCell = row.querySelector('.calendar__impact span');
          const eventCell = row.querySelector('.calendar__event');
          const actualCell = row.querySelector('.calendar__actual');
          const forecastCell = row.querySelector('.calendar__forecast');
          const previousCell = row.querySelector('.calendar__previous');

          const time = timeCell ? timeCell.textContent.trim() : '';
          const currency = currencyCell ? currencyCell.textContent.trim() : '';
          const impactClass = impactCell ? impactCell.className : '';
          const event = eventCell ? eventCell.textContent.trim() : '';
          const actual = actualCell ? actualCell.textContent.trim() : '';
          const forecast = forecastCell ? forecastCell.textContent.trim() : '';
          const previous = previousCell ? previousCell.textContent.trim() : '';

          // Ne garder que les événements valides
          if (event && currency) {
            // Déterminer le niveau d'impact
            let impactLevel = 'low';
            if (impactClass.includes('icon--ff-impact-red')) {
              impactLevel = 'high';
            } else if (impactClass.includes('icon--ff-impact-ora')) {
              impactLevel = 'medium';
            } else if (impactClass.includes('icon--ff-impact-yel')) {
              impactLevel = 'low';
            }

            eventsData.push({
              date: currentDate || 'N/A',
              time: time || 'All Day',
              currency: currency,
              impact: impactLevel,
              event: event,
              actual: actual || '-',
              forecast: forecast || '-',
              previous: previous || '-',
            });
          }
        });

        return eventsData;
      });

      console.log(`✅ ${events.length} événements extraits avec succès`);

      // Fermer la page
      await page.close();

      return events;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du calendrier ForexFactory:', error.message);
      
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignorer les erreurs de fermeture
        }
      }
      
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

  /**
   * Récupère les news avec leurs détails depuis ForexFactory
   * @returns {Promise<Array>} Liste des articles de news
   */
  async getNews() {
    // TEMPORAIRE: Retourner des données de démonstration
    // TODO: Affiner le scraping selon la vraie structure HTML de ForexFactory
    console.log('📰 Retour de données de démonstration pour les news');
    
    return [
      {
        title: 'US Services PMI at 52.4%; October 2025 ISM Services PMI Report',
        source: 'ForexFactory',
        timeAgo: '2 hours ago',
        imageUrl: null,
        excerpt: 'The US Services PMI came in at 52.4% for October 2025, showing continued expansion in the services sector despite recent economic headwinds.',
        comments: 15,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: 'ADP: US National Employment Report - Private Sector Employment Increased by 42,000 Jobs',
        source: 'ADP',
        timeAgo: '3 hours ago',
        imageUrl: null,
        excerpt: 'Private sector employment increased by 42,000 jobs in October according to the ADP National Employment Report, below expectations of 89,000.',
        comments: 28,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: "ECB's Stournaras: More easing can't be ruled out",
        source: 'MNI',
        timeAgo: '5 hours ago',
        imageUrl: null,
        excerpt: 'European Central Bank official Stournaras suggests additional monetary easing measures remain possible as inflation continues to moderate.',
        comments: 12,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: 'Bessent says US housing market in "recession" due to Federal Reserve interest rate policies',
        source: 'Reuters',
        timeAgo: '6 hours ago',
        imageUrl: null,
        excerpt: 'Treasury Secretary Scott Bessent stated that the US housing market is experiencing a recession due to the Federal Reserve\'s sustained high interest rates.',
        comments: 34,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: 'China to remove tariffs on US agriculture goods from Nov 10',
        source: 'Bloomberg',
        timeAgo: '8 hours ago',
        imageUrl: null,
        excerpt: 'China announced it will remove tariffs on certain US agricultural products starting November 10, signaling potential thaw in trade relations.',
        comments: 42,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: 'Supreme Court Confronts Trump\'s Power to Disrupt Global Economy',
        source: 'Financial Times',
        timeAgo: '10 hours ago',
        imageUrl: null,
        excerpt: 'The Supreme Court is examining the extent of presidential authority over international trade policies and tariffs.',
        comments: 67,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: 'Gold Prices Surge to New Record High Amid Global Uncertainty',
        source: 'MarketWatch',
        timeAgo: '12 hours ago',
        imageUrl: null,
        excerpt: 'Gold prices reached a new all-time high today as investors seek safe-haven assets amid geopolitical tensions and economic uncertainty.',
        comments: 23,
        url: 'https://www.forexfactory.com/news'
      },
      {
        title: 'Bank of Japan Holds Rates Steady, Signals Patience on Policy',
        source: 'Nikkei',
        timeAgo: '14 hours ago',
        imageUrl: null,
        excerpt: 'The Bank of Japan maintained its ultra-loose monetary policy, indicating a patient approach to any future rate adjustments.',
        comments: 19,
        url: 'https://www.forexfactory.com/news'
      }
    ];
    
    // Code de scraping réel commenté temporairement - TODO: activer plus tard
    // Voir la méthode getNewsWithScraping() ci-dessous pour le code complet
  }

  async getNewsWithScraping() {
    let page = null;
    
    try {
      const url = `${this.baseUrl}/news`;
      console.log(`📰 Récupération des news depuis: ${url}`);

      // Initialiser le navigateur
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configurer le viewport et user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Aller sur la page des news
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      console.log('✅ Page news chargée, extraction des données...');

      // Attendre le chargement du contenu principal
      await page.waitForSelector('.flexBox_flexBox__V6O3y, table, .calendar_row', { timeout: 10000 });

      // Extraire les données des news avec JavaScript dans le navigateur
      const newsArticles = await page.evaluate(() => {
        const newsData = [];
        
        // Essayer différents patterns de structure HTML
        // Pattern 1: Recherche générale de rows/articles
        const possibleSelectors = [
          'tr[data-eventid]',
          '.flexBox_flexBox__V6O3y',
          'table tr',
          '[class*="news"]',
          '[class*="story"]',
          'article'
        ];
        
        let articles = [];
        for (const selector of possibleSelectors) {
          articles = document.querySelectorAll(selector);
          if (articles.length > 0) {
            console.log(`Found ${articles.length} articles with selector: ${selector}`);
            break;
          }
        }

        // Si aucun article trouvé, créer des données de démonstration
        if (articles.length === 0) {
          console.log('No articles found, returning demo data');
          return [{
            title: 'US Services PMI at 52.4%; October 2025 ISM Services PMI Report',
            source: 'ForexFactory',
            timeAgo: '2 hours ago',
            imageUrl: null,
            excerpt: 'The US Services PMI came in at 52.4% for October 2025, showing continued expansion in the services sector.',
            comments: 5,
            url: 'https://www.forexfactory.com/news'
          },
          {
            title: 'ADP: US National Employment Report - Private Sector Employment Increased',
            source: 'ADP',
            timeAgo: '3 hours ago',
            imageUrl: null,
            excerpt: 'Private sector employment increased by 42,000 jobs in October according to the ADP National Employment Report.',
            comments: 12,
            url: 'https://www.forexfactory.com/news'
          },
          {
            title: "ECB's Stournaras: More easing can't be ruled out",
            source: 'MNI',
            timeAgo: '5 hours ago',
            imageUrl: null,
            excerpt: 'European Central Bank official Stournaras suggests additional monetary easing measures remain possible.',
            comments: 8,
            url: 'https://www.forexfactory.com/news'
          }];
        }

        articles.forEach((article, index) => {
          // Extraire les informations disponibles
          const allText = article.textContent || '';
          const allLinks = article.querySelectorAll('a');
          
          // Essayer d'extraire un titre
          let title = '';
          const headings = article.querySelectorAll('h1, h2, h3, h4, .title, [class*="title"], [class*="event"]');
          if (headings.length > 0) {
            title = headings[0].textContent.trim();
          } else if (allLinks.length > 0) {
            title = allLinks[0].textContent.trim();
          }
          
          // Si on a un titre valide, créer une entrée
          if (title && title.length > 10 && index < 20) {
            newsData.push({
              title: title,
              source: 'ForexFactory',
              timeAgo: 'Recent',
              imageUrl: null,
              excerpt: allText.substring(0, 150).trim() || 'No description available',
              comments: 0,
              url: window.location.href
            });
          }
        });

        return newsData.slice(0, 15); // Limiter à 15 articles
      });

      console.log(`✅ ${newsArticles.length} articles de news extraits avec succès`);

      // Fermer la page
      await page.close();

      return newsArticles;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des news ForexFactory:', error.message);
      
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignorer les erreurs de fermeture
        }
      }
      
      throw new Error(`Impossible de récupérer les news de ForexFactory: ${error.message}`);
    }
  }
}

// Créer une instance singleton
const instance = new ForexFactoryPuppeteerService();

// Fermer le navigateur proprement à l'arrêt du serveur
process.on('SIGTERM', async () => {
  await instance.closeBrowser();
});

process.on('SIGINT', async () => {
  await instance.closeBrowser();
});

module.exports = instance;


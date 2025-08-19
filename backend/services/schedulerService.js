const WeeklyContestService = require('./weeklyContestService');

class SchedulerService {
  constructor() {
    this.scheduler = null;
    this.isRunning = false;
  }

  // Démarrer le planificateur
  start() {
    if (this.isRunning) {
      console.log('Le planificateur est déjà en cours d\'exécution');
      return;
    }

    this.isRunning = true;
    console.log('Planificateur de concours hebdomadaires démarré');

    // Vérifier les tirages toutes les 5 minutes
    this.scheduler = setInterval(async () => {
      try {
        await WeeklyContestService.performAutoDraws();
      } catch (error) {
        console.error('Erreur lors de l\'exécution du planificateur:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Exécuter immédiatement une première vérification
    this.performInitialCheck();
  }

  // Arrêter le planificateur
  stop() {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
    this.isRunning = false;
    console.log('Planificateur de concours hebdomadaires arrêté');
  }

  // Vérification initiale au démarrage
  async performInitialCheck() {
    try {
      console.log('Vérification initiale des tirages...');
      await WeeklyContestService.performAutoDraws();
    } catch (error) {
      console.error('Erreur lors de la vérification initiale:', error);
    }
  }

  // Vérifier si le planificateur fonctionne
  isActive() {
    return this.isRunning;
  }

  // Obtenir le statut du planificateur
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: new Date().toISOString()
    };
  }
}

// Instance singleton
const schedulerService = new SchedulerService();

module.exports = schedulerService;

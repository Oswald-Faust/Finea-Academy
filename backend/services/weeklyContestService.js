const Contest = require('../models/Contest');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

class WeeklyContestService {
  // Obtenir le numéro de semaine actuel
  static getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  // Obtenir l'année actuelle
  static getCurrentYear() {
    return new Date().getFullYear();
  }

  // Vérifier si un concours hebdomadaire existe pour la semaine actuelle
  static async checkCurrentWeeklyContest() {
    const weekNumber = this.getCurrentWeekNumber();
    const year = this.getCurrentYear();
    
    const existingContest = await Contest.findOne({
      isWeeklyContest: true,
      weekNumber,
      year
    });

    return existingContest;
  }

  // Créer un nouveau concours hebdomadaire
  static async createWeeklyContest(adminUserId) {
    const weekNumber = this.getCurrentWeekNumber();
    const year = this.getCurrentYear();

    // Vérifier s'il existe déjà un concours pour cette semaine
    const existingContest = await this.checkCurrentWeeklyContest();
    if (existingContest) {
      throw new Error(`Un concours existe déjà pour la semaine ${weekNumber} de ${year}`);
    }

    // Créer le nouveau concours
    const contest = await Contest.createWeeklyContest(weekNumber, year, adminUserId);
    
    console.log(`Nouveau concours hebdomadaire créé: ${contest.title}`);
    return contest;
  }

  // Effectuer le tirage automatique pour les concours en attente
  static async performAutoDraws() {
    const now = new Date();
    
    // Trouver tous les concours qui doivent être tirés
    const contestsToDraw = await Contest.find({
      isWeeklyContest: true,
      autoDrawEnabled: true,
      drawCompleted: false,
      drawDate: { $lte: now },
      status: 'active'
    });

    // console.log(`${contestsToDraw.length} concours(s) à tirer`);

    for (const contest of contestsToDraw) {
      try {
        await contest.performAutoDraw();
        console.log(`Tirage effectué pour le concours: ${contest.title}`);
        
        // Envoyer un email au gagnant
        if (contest.winners.length > 0) {
          const winner = contest.winners[0];
          const winnerUser = await User.findById(winner.user);
          
          if (winnerUser) {
            await this.sendWinnerNotification(winnerUser, contest);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du tirage du concours ${contest.title}:`, error);
      }
    }
  }

  // Envoyer une notification au gagnant
  static async sendWinnerNotification(winner, contest) {
    try {
      const emailContent = `
        <h2>🎉 Félicitations ! Vous avez gagné !</h2>
        <p>Bonjour ${winner.firstName},</p>
        <p>Nous avons le plaisir de vous annoncer que vous avez gagné le concours hebdomadaire de Finéa Académie !</p>
        <h3>Détails du concours :</h3>
        <ul>
          <li><strong>Concours :</strong> ${contest.title}</li>
          <li><strong>Prix :</strong> ${contest.winners[0].prize}</li>
          <li><strong>Date du tirage :</strong> ${new Date(contest.drawCompletedAt).toLocaleDateString('fr-FR')}</li>
        </ul>
        <p>Notre équipe vous contactera dans les prochains jours pour organiser la remise de votre prix.</p>
        <p>Merci de votre participation et à bientôt !</p>
        <p>L'équipe Finéa Académie</p>
      `;

      await sendEmail({
        to: winner.email,
        subject: '🎉 Vous avez gagné le concours hebdomadaire !',
        message: emailContent
      });

      console.log(`Email de victoire envoyé à ${winner.email}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de victoire:', error);
    }
  }

  // Obtenir les statistiques des concours hebdomadaires
  static async getWeeklyContestStats() {
    const currentYear = this.getCurrentYear();
    
    const stats = await Contest.aggregate([
      {
        $match: {
          isWeeklyContest: true,
          year: currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalContests: { $sum: 1 },
          totalParticipants: { $sum: '$currentParticipants' },
          completedContests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          activeContests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalContests: 0,
      totalParticipants: 0,
      completedContests: 0,
      activeContests: 0
    };
  }

  // Obtenir l'historique des concours hebdomadaires
  static async getWeeklyContestHistory(limit = 10) {
    return await Contest.find({
      isWeeklyContest: true
    })
    .populate('winners.user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit);
  }

  // Programmer la création automatique du prochain concours
  static async scheduleNextWeeklyContest(adminUserId) {
    const nextWeekNumber = this.getCurrentWeekNumber() + 1;
    const year = this.getCurrentYear();
    
    // Vérifier si le concours de la semaine prochaine existe déjà
    const existingContest = await Contest.findOne({
      isWeeklyContest: true,
      weekNumber: nextWeekNumber,
      year
    });

    if (!existingContest) {
      try {
        await Contest.createWeeklyContest(nextWeekNumber, year, adminUserId);
        console.log(`Concours de la semaine ${nextWeekNumber} programmé`);
      } catch (error) {
        console.error('Erreur lors de la programmation du concours:', error);
      }
    }
  }

  // Nettoyer les anciens concours (optionnel)
  static async cleanupOldContests() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await Contest.deleteMany({
      isWeeklyContest: true,
      createdAt: { $lt: oneYearAgo },
      status: 'completed'
    });

    console.log(`${result.deletedCount} anciens concours supprimés`);
    return result.deletedCount;
  }
}

module.exports = WeeklyContestService;

const ContestStats = require('../models/ContestStats');
const Contest = require('../models/Contest');
const StandaloneWinner = require('../models/StandaloneWinner');

// @desc    Récupérer les statistiques globales
// @route   GET /api/contests/stats/global
// @access  Public
const getGlobalStats = async (req, res) => {
  try {
    let stats = await ContestStats.getCurrentStats();
    
    // Si aucune statistique n'existe, créer des valeurs par défaut
    if (!stats) {
      stats = await ContestStats.create({
        totalGains: 0,
        totalPlacesSold: 0,
        totalWinners: 0,
        totalContests: 0
      });
    }

    res.json({
      success: true,
      data: {
        totalGains: stats.totalGains,
        totalPlacesSold: stats.totalPlacesSold,
        totalWinners: stats.totalWinners,
        totalContests: stats.totalContests,
        lastUpdated: stats.lastUpdated
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// @desc    Mettre à jour les statistiques globales
// @route   PUT /api/contests/stats/global
// @access  Public (Admin dashboard)
const updateGlobalStats = async (req, res) => {
  try {
    const { totalGains, totalPlacesSold, totalWinners } = req.body;

    // Validation des données
    if (typeof totalGains !== 'number' || totalGains < 0) {
      return res.status(400).json({
        success: false,
        error: 'Gains total invalide'
      });
    }

    if (typeof totalPlacesSold !== 'number' || totalPlacesSold < 0) {
      return res.status(400).json({
        success: false,
        error: 'Places vendues invalides'
      });
    }

    if (typeof totalWinners !== 'number' || totalWinners < 0) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de gagnants invalide'
      });
    }

    const updatedStats = await ContestStats.updateGlobalStats({
      totalGains,
      totalPlacesSold,
      totalWinners
    });

    res.json({
      success: true,
      message: 'Statistiques mises à jour avec succès',
      data: {
        totalGains: updatedStats.totalGains,
        totalPlacesSold: updatedStats.totalPlacesSold,
        totalWinners: updatedStats.totalWinners,
        lastUpdated: updatedStats.lastUpdated
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des statistiques'
    });
  }
};

// @desc    Ajouter des gagnants manuellement à un concours
// @route   POST /api/contests/:id/winners/manual
// @access  Public (Admin dashboard)
const addManualWinners = async (req, res) => {
  try {
    const { id } = req.params;
    const { winners } = req.body;

    if (!winners || !Array.isArray(winners) || winners.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Liste de gagnants requise'
      });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Effacer les anciens gagnants manuels
    contest.winners = contest.winners.filter(winner => 
      winner.notes !== 'Ajouté manuellement'
    );

    // Ajouter les nouveaux gagnants
    const newWinners = winners.map((winner, index) => ({
      user: null, // Pas d'utilisateur lié pour les gagnants manuels
      position: index + 1,
      prize: winner.prize || `Prix ${index + 1}`,
      amount: winner.amount || 0,
      selectedAt: winner.drawDate ? new Date(winner.drawDate) : new Date(),
      selectedBy: null,
      notes: 'Ajouté manuellement',
      // Stocker les informations du gagnant manuel
      manualWinner: {
        firstName: winner.firstName,
        lastName: winner.lastName,
        email: winner.email || null
      }
    }));

    contest.winners.push(...newWinners);
    contest.drawCompleted = true;
    contest.drawCompletedAt = new Date();
    contest.status = 'completed';

    await contest.save();

    // Mettre à jour les statistiques globales
    const currentStats = await ContestStats.getCurrentStats();
    if (currentStats) {
      const totalWinners = currentStats.totalWinners + winners.length;
      const totalGains = currentStats.totalGains + 
        winners.reduce((sum, winner) => sum + (winner.amount || 0), 0);
      
      await ContestStats.updateGlobalStats({
        totalGains,
        totalWinners,
        totalPlacesSold: currentStats.totalPlacesSold
      });
    }

    res.json({
      success: true,
      message: `${winners.length} gagnant(s) ajouté(s) avec succès`,
      data: {
        contest: contest,
        winnersAdded: winners.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des gagnants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout des gagnants'
    });
  }
};

// @desc    Supprimer un gagnant d'un concours
// @route   DELETE /api/contests/:contestId/winners/:winnerId
// @access  Public (Admin dashboard)
const deleteWinner = async (req, res) => {
  try {
    const { contestId, winnerId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Concours non trouvé'
      });
    }

    // Trouver le gagnant à supprimer
    const winnerIndex = contest.winners.findIndex(w => w._id.toString() === winnerId);
    if (winnerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Gagnant non trouvé'
      });
    }

    const winnerToDelete = contest.winners[winnerIndex];

    // Supprimer le gagnant du concours
    contest.winners.splice(winnerIndex, 1);
    await contest.save();

    // Mettre à jour les statistiques globales
    const currentStats = await ContestStats.getCurrentStats();
    if (currentStats) {
      const newStats = {
        totalWinners: Math.max(0, currentStats.totalWinners - 1),
        totalGains: Math.max(0, currentStats.totalGains - (winnerToDelete.amount || 0)),
        totalPlacesSold: currentStats.totalPlacesSold // Pas de changement pour les places vendues
      };

      await ContestStats.updateGlobalStats(newStats);
    }

    res.json({
      success: true,
      message: 'Gagnant supprimé avec succès',
      data: {
        contestId,
        winnerId,
        deletedWinner: winnerToDelete
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du gagnant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du gagnant'
    });
  }
};

// @desc    Récupérer tous les gagnants avec leurs informations
// @route   GET /api/contests/winners/all
// @access  Public
const getAllWinners = async (req, res) => {
  try {
    const contests = await Contest.find({
      'winners.0': { $exists: true }
    }).populate('winners.user', 'firstName lastName email');

    const allWinners = [];
    
    contests.forEach(contest => {
      contest.winners.forEach(winner => {
        allWinners.push({
          winnerId: winner._id,
          contestTitle: contest.title,
          contestId: contest._id,
          drawDate: contest.drawDate,
          position: winner.position,
          prize: winner.prize,
          amount: winner.amount,
          selectedAt: winner.selectedAt,
          winner: winner.user ? {
            firstName: winner.user.firstName,
            lastName: winner.user.lastName,
            email: winner.user.email
          } : winner.manualWinner,
          isManual: !!winner.manualWinner
        });
      });
    });

    // Trier par date de sélection (plus récent en premier)
    allWinners.sort((a, b) => new Date(b.selectedAt) - new Date(a.selectedAt));

    res.json({
      success: true,
      data: allWinners
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des gagnants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des gagnants'
    });
  }
};

// @desc    Récupérer les statistiques pour l'affichage dans l'app
// @route   GET /api/contests/stats/display
// @access  Public
const getDisplayStats = async (req, res) => {
  try {
    const stats = await ContestStats.getCurrentStats();
    
    // Récupérer d'abord les gagnants indépendants (priorité)
    const standaloneWinners = await StandaloneWinner.find({ isActive: true })
      .sort({ drawDate: -1 })
      .limit(10);
    
    const recentWinners = [];
    
    // Ajouter les gagnants indépendants
    standaloneWinners.forEach(winner => {
      recentWinners.push({
        contestTitle: `Tirage du ${new Date(winner.drawDate).toLocaleDateString('fr-FR')}`,
        drawDate: winner.drawDate,
        firstName: winner.firstName,
        lastName: winner.lastName,
        prize: winner.prize,
        amount: winner.amount || 0
      });
    });
    
    // Si pas assez de gagnants indépendants, compléter avec les gagnants des concours
    if (recentWinners.length < 3) {
      const contests = await Contest.find({
        'winners.0': { $exists: true }
      })
      .sort({ drawDate: -1 })
      .limit(3)
      .select('title winners drawDate');

      contests.forEach(contest => {
        contest.winners.slice(0, 2).forEach(winner => { // Max 2 gagnants par concours
          recentWinners.push({
            contestTitle: contest.title,
            drawDate: contest.drawDate,
            firstName: winner.user?.firstName || winner.manualWinner?.firstName || 'Anonyme',
            lastName: winner.user?.lastName || winner.manualWinner?.lastName || '',
            prize: winner.prize,
            amount: winner.amount || 0
          });
        });
      });
    }

    res.json({
      success: true,
      data: {
        totalGains: stats?.totalGains || 0,
        totalPlacesSold: stats?.totalPlacesSold || 0,
        totalWinners: stats?.totalWinners || 0,
        recentWinners: recentWinners.slice(0, 10) // Max 10 gagnants récents
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques d\'affichage:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  getGlobalStats,
  updateGlobalStats,
  addManualWinners,
  deleteWinner,
  getAllWinners,
  getDisplayStats
};

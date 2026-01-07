const StandaloneWinner = require('../models/StandaloneWinner');
const ContestStats = require('../models/ContestStats');

// Fonction utilitaire pour obtenir l'identifiant de semaine
const getWeekIdentifier = (date = new Date()) => {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// @desc    Récupérer tous les gagnants indépendants
// @route   GET /api/standalone-winners
// @access  Public
const getAllStandaloneWinners = async (req, res) => {
  try {
    const { week, active } = req.query;
    
    let query = {};
    
    if (week) {
      query.weekOfYear = week;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const winners = await StandaloneWinner.find(query)
      .sort({ drawDate: -1, position: 1 });
    
    res.json({
      success: true,
      data: winners
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des gagnants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des gagnants'
    });
  }
};

// @desc    Récupérer les gagnants de la semaine actuelle
// @route   GET /api/standalone-winners/current-week
// @access  Public
const getCurrentWeekWinners = async (req, res) => {
  try {
    const currentWeek = getWeekIdentifier();
    
    const winners = await StandaloneWinner.find({
      weekOfYear: currentWeek,
      isActive: true
    }).sort({ position: 1 });
    
    res.json({
      success: true,
      data: winners,
      week: currentWeek
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des gagnants de la semaine:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des gagnants'
    });
  }
};

// @desc    Récupérer les gagnants récents pour l'affichage dans l'app
// @route   GET /api/standalone-winners/recent
// @access  Public
const getRecentWinners = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const winners = await StandaloneWinner.find({ isActive: true })
      .sort({ drawDate: -1 })
      .limit(limit);
    
    // Formater pour l'affichage dans l'app
    const formattedWinners = winners.map(winner => ({
      contestTitle: `Tirage du ${new Date(winner.drawDate).toLocaleDateString('fr-FR')}`,
      drawDate: winner.drawDate,
      firstName: winner.firstName,
      lastName: winner.lastName,
      prize: winner.prize,
      amount: winner.amount
    }));
    
    res.json({
      success: true,
      data: formattedWinners
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des gagnants récents:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des gagnants'
    });
  }
};

// @desc    Ajouter un ou plusieurs gagnants indépendants
// @route   POST /api/standalone-winners
// @access  Public (Admin)
const createStandaloneWinners = async (req, res) => {
  try {
    const { winners } = req.body;
    
    if (!winners || !Array.isArray(winners) || winners.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Liste de gagnants requise'
      });
    }
    
    const currentWeek = getWeekIdentifier();
    
    // Créer les gagnants
    const createdWinners = [];
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      const targetPosition = winner.position || i + 1;
      
      // Vérifier si la position est déjà prise pour cette semaine
      const existingAtPosition = await StandaloneWinner.findOne({
        weekOfYear: currentWeek,
        position: targetPosition,
        isActive: true
      });
      
      // Si la position est prise, décaler tous ceux à cette position et après
      if (existingAtPosition) {
        await StandaloneWinner.updateMany(
          {
            weekOfYear: currentWeek,
            position: { $gte: targetPosition },
            isActive: true
          },
          { $inc: { position: 1 } }
        );
      }
      
      const newWinner = new StandaloneWinner({
        firstName: winner.firstName,
        lastName: winner.lastName,
        email: winner.email || null,
        prize: winner.prize,
        amount: winner.amount || 0,
        position: targetPosition,
        drawDate: winner.drawDate ? new Date(winner.drawDate) : new Date(),
        weekOfYear: currentWeek,
        isActive: true,
        notes: 'Ajouté manuellement',
        userId: winner.userId || null,
        username: winner.username || null,
        ethAddress: winner.ethAddress || null
      });
      
      await newWinner.save();
      createdWinners.push(newWinner);
    }
    
    // Mettre à jour les statistiques globales
    const currentStats = await ContestStats.getCurrentStats();
    if (currentStats) {
      const totalNewGains = winners.reduce((sum, w) => sum + (w.amount || 0), 0);
      await ContestStats.updateGlobalStats({
        totalWinners: currentStats.totalWinners + winners.length,
        totalGains: currentStats.totalGains + totalNewGains,
        totalPlacesSold: currentStats.totalPlacesSold
      });
    }
    
    res.status(201).json({
      success: true,
      message: `${createdWinners.length} gagnant(s) ajouté(s) avec succès`,
      data: createdWinners
    });
  } catch (error) {
    console.error('Erreur lors de la création des gagnants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création des gagnants'
    });
  }
};

// @desc    Supprimer un gagnant indépendant
// @route   DELETE /api/standalone-winners/:id
// @access  Public (Admin)
const deleteStandaloneWinner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const winner = await StandaloneWinner.findById(id);
    
    if (!winner) {
      return res.status(404).json({
        success: false,
        error: 'Gagnant non trouvé'
      });
    }
    
    // Mettre à jour les statistiques globales
    const currentStats = await ContestStats.getCurrentStats();
    if (currentStats) {
      await ContestStats.updateGlobalStats({
        totalWinners: Math.max(0, currentStats.totalWinners - 1),
        totalGains: Math.max(0, currentStats.totalGains - (winner.amount || 0)),
        totalPlacesSold: currentStats.totalPlacesSold
      });
    }
    
    await StandaloneWinner.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Gagnant supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du gagnant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du gagnant'
    });
  }
};

// @desc    Supprimer tous les gagnants d'une semaine (réinitialisation)
// @route   DELETE /api/standalone-winners/week/:week
// @access  Public (Admin)
const clearWeekWinners = async (req, res) => {
  try {
    const { week } = req.params;
    
    const result = await StandaloneWinner.deleteMany({ weekOfYear: week });
    
    res.json({
      success: true,
      message: `${result.deletedCount} gagnant(s) supprimé(s) pour la semaine ${week}`
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des gagnants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression des gagnants'
    });
  }
};

// @desc    Mettre à jour un gagnant
// @route   PUT /api/standalone-winners/:id
// @access  Public (Admin)
const updateStandaloneWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Trouver le gagnant actuel
    const currentWinner = await StandaloneWinner.findById(id);
    if (!currentWinner) {
      return res.status(404).json({
        success: false,
        error: 'Gagnant non trouvé'
      });
    }
    
    // Si la position change, gérer les décalages
    if (updates.position !== undefined && updates.position !== currentWinner.position) {
      const newPosition = updates.position;
      const oldPosition = currentWinner.position;
      const weekOfYear = currentWinner.weekOfYear;
      
      // Vérifier si la nouvelle position est déjà prise
      const existingWinnerAtPosition = await StandaloneWinner.findOne({
        _id: { $ne: id },
        weekOfYear: weekOfYear,
        position: newPosition,
        isActive: true
      });
      
      if (existingWinnerAtPosition) {
        // Décaler les autres gagnants
        if (newPosition < oldPosition) {
          // On monte dans le classement (ex: 3 -> 1)
          // Décaler tous ceux entre newPosition et oldPosition vers le bas (+1)
          await StandaloneWinner.updateMany(
            {
              _id: { $ne: id },
              weekOfYear: weekOfYear,
              position: { $gte: newPosition, $lt: oldPosition },
              isActive: true
            },
            { $inc: { position: 1 } }
          );
        } else {
          // On descend dans le classement (ex: 1 -> 3)
          // Décaler tous ceux entre oldPosition et newPosition vers le haut (-1)
          await StandaloneWinner.updateMany(
            {
              _id: { $ne: id },
              weekOfYear: weekOfYear,
              position: { $gt: oldPosition, $lte: newPosition },
              isActive: true
            },
            { $inc: { position: -1 } }
          );
        }
      }
    }
    
    // Mettre à jour le gagnant
    const winner = await StandaloneWinner.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: winner
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du gagnant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du gagnant'
    });
  }
};

// @desc    Récupérer le gagnant en position 1 (pour la page d'accueil)
// @route   GET /api/standalone-winners/first-place
// @access  Public
const getFirstPlaceWinner = async (req, res) => {
  try {
    // Récupérer le userId de l'utilisateur connecté (si disponible)
    const currentUserId = req.query.userId || null;
    
    // Trouver le gagnant en position 1 le plus récent
    const winner = await StandaloneWinner.findOne({
      position: 1,
      isActive: true
    }).sort({ drawDate: -1 });
    
    if (!winner) {
      return res.json({
        success: true,
        data: null,
        message: 'Aucun gagnant en position 1'
      });
    }
    
    // Préparer les données de réponse
    const responseData = {
      id: winner._id,
      firstName: winner.firstName,
      lastName: winner.lastName,
      username: winner.username,
      prize: winner.prize,
      amount: winner.amount,
      drawDate: winner.drawDate,
      position: winner.position,
      // L'adresse ETH est visible uniquement si l'utilisateur connecté est le gagnant
      ethAddress: null,
      isCurrentUser: false
    };
    
    // Vérifier si l'utilisateur connecté est le gagnant
    if (currentUserId && winner.userId && winner.userId.toString() === currentUserId) {
      responseData.ethAddress = winner.ethAddress;
      responseData.isCurrentUser = true;
    }
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du gagnant #1:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du gagnant'
    });
  }
};

module.exports = {
  getAllStandaloneWinners,
  getCurrentWeekWinners,
  getRecentWinners,
  createStandaloneWinners,
  deleteStandaloneWinner,
  clearWeekWinners,
  updateStandaloneWinner,
  getFirstPlaceWinner
};

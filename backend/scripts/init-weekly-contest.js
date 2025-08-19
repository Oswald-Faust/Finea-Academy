const mongoose = require('mongoose');
const WeeklyContestService = require('../services/weeklyContestService');
require('dotenv').config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Fonction principale
const initWeeklyContest = async () => {
  try {
    console.log('🚀 Initialisation du concours hebdomadaire...');
    
    // Vérifier s'il existe déjà un concours pour cette semaine
    const existingContest = await WeeklyContestService.checkCurrentWeeklyContest();
    
    if (existingContest) {
      console.log('✅ Un concours existe déjà pour cette semaine');
      console.log(`📅 Concours: ${existingContest.title}`);
      console.log(`👥 Participants: ${existingContest.currentParticipants}`);
      console.log(`🏆 Statut: ${existingContest.status}`);
      return;
    }

    // Créer un utilisateur admin temporaire pour la création du concours
    // En production, vous devriez utiliser un vrai ID d'admin
    const adminUserId = '000000000000000000000000'; // ID temporaire
    
    // Créer le concours hebdomadaire
    const contest = await WeeklyContestService.createWeeklyContest(adminUserId);
    
    console.log('✅ Concours hebdomadaire créé avec succès !');
    console.log(`📅 Titre: ${contest.title}`);
    console.log(`📝 Description: ${contest.description}`);
    console.log(`📅 Début: ${new Date(contest.startDate).toLocaleDateString('fr-FR')}`);
    console.log(`📅 Fin: ${new Date(contest.endDate).toLocaleDateString('fr-FR')}`);
    console.log(`🎲 Tirage: ${new Date(contest.drawDate).toLocaleDateString('fr-FR')} à ${new Date(contest.drawDate).toLocaleTimeString('fr-FR')}`);
    console.log(`🏆 Prix: ${contest.prizes.map(p => p.name).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
if (require.main === module) {
  connectDB().then(() => {
    initWeeklyContest();
  });
}

module.exports = { initWeeklyContest };

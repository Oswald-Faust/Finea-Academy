const mongoose = require('mongoose');
const WeeklyContestService = require('./services/weeklyContestService');
require('dotenv').config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Créer un concours de test
const createTestContest = async () => {
  try {
    console.log('🎯 Création d\'un concours hebdomadaire de test...');
    
    // ID fictif pour l'admin (à remplacer par un vrai ID admin)
    const adminUserId = new mongoose.Types.ObjectId();
    
    // Créer le concours
    const contest = await WeeklyContestService.createWeeklyContest(adminUserId);
    
    console.log('✅ Concours créé avec succès !');
    console.log('📋 Détails du concours:');
    console.log(`   - ID: ${contest._id}`);
    console.log(`   - Titre: ${contest.title}`);
    console.log(`   - Semaine: ${contest.weekNumber}`);
    console.log(`   - Année: ${contest.year}`);
    console.log(`   - Début: ${contest.startDate.toLocaleDateString('fr-FR')}`);
    console.log(`   - Fin: ${contest.endDate.toLocaleDateString('fr-FR')}`);
    console.log(`   - Tirage: ${contest.drawDate.toLocaleDateString('fr-FR')}`);
    console.log(`   - Participants: ${contest.currentParticipants}`);
    console.log(`   - Statut: ${contest.status}`);
    
    return contest;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  }
};

// Vérifier que le concours est accessible
const testContestAccess = async () => {
  try {
    console.log('\n🔍 Test d\'accès au concours...');
    
    const currentContest = await WeeklyContestService.checkCurrentWeeklyContest();
    
    if (currentContest) {
      console.log('✅ Concours accessible via l\'API');
      console.log(`   - Titre: ${currentContest.title}`);
      console.log(`   - Participants: ${currentContest.currentParticipants}`);
    } else {
      console.log('❌ Aucun concours trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'accès:', error);
  }
};

// Exécuter le script
const run = async () => {
  try {
    await connectDB();
    
    // Créer le concours
    await createTestContest();
    
    // Tester l'accès
    await testContestAccess();
    
    console.log('\n🎉 Script terminé avec succès !');
    console.log('Le concours hebdomadaire est maintenant accessible.');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Lancer le script
if (require.main === module) {
  run();
}

module.exports = { createTestContest };

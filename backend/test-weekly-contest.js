const mongoose = require('mongoose');
const Contest = require('./models/Contest');
const WeeklyContestService = require('./services/weeklyContestService');
require('dotenv').config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Test du service de concours hebdomadaire
const testWeeklyContest = async () => {
  try {
    console.log('🧪 Test du concours hebdomadaire...\n');

    // 1. Vérifier le concours actuel
    console.log('1. Vérification du concours actuel...');
    const currentContest = await WeeklyContestService.checkCurrentWeeklyContest();
    console.log('Concours actuel:', currentContest ? 'Existe' : 'Aucun');

    // 2. Créer un concours hebdomadaire de test
    console.log('\n2. Création d\'un concours hebdomadaire de test...');
    const adminUserId = new mongoose.Types.ObjectId(); // ID fictif pour le test
    const newContest = await WeeklyContestService.createWeeklyContest(adminUserId);
    console.log('✅ Concours créé:', newContest.title);
    console.log('   - Semaine:', newContest.weekNumber);
    console.log('   - Année:', newContest.year);
    console.log('   - Début:', newContest.startDate.toLocaleDateString('fr-FR'));
    console.log('   - Fin:', newContest.endDate.toLocaleDateString('fr-FR'));
    console.log('   - Tirage:', newContest.drawDate.toLocaleDateString('fr-FR'));

    // 3. Vérifier les statistiques
    console.log('\n3. Statistiques des concours hebdomadaires...');
    const stats = await WeeklyContestService.getWeeklyContestStats();
    console.log('📊 Statistiques:', stats);

    // 4. Vérifier l'historique
    console.log('\n4. Historique des concours...');
    const history = await WeeklyContestService.getWeeklyContestHistory(5);
    console.log('📚 Historique:', history.length, 'concours trouvés');

    // 5. Simuler un tirage (si le concours est en cours)
    console.log('\n5. Test du tirage automatique...');
    if (newContest.isDrawTime) {
      console.log('⏰ Heure du tirage, test du tirage automatique...');
      await WeeklyContestService.performAutoDraws();
      console.log('✅ Tirage effectué');
    } else {
      console.log('⏳ Le tirage n\'est pas encore programmé');
    }

    // 6. Nettoyer le concours de test
    console.log('\n6. Nettoyage du concours de test...');
    await Contest.findByIdAndDelete(newContest._id);
    console.log('✅ Concours de test supprimé');

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
};

// Test des méthodes du modèle Contest
const testContestModel = async () => {
  try {
    console.log('\n🧪 Test du modèle Contest...\n');

    // 1. Créer un concours avec le modèle
    console.log('1. Création d\'un concours avec le modèle...');
    const contest = new Contest({
      title: 'Test Concours',
      description: 'Description de test',
      type: 'weekly',
      isWeeklyContest: true,
      weekNumber: 1,
      year: 2024,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
      drawDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // +6 jours
      autoDrawEnabled: true,
      prizes: [
        {
          position: 1,
          name: 'Prix de test',
          type: 'other'
        }
      ],
      createdBy: new mongoose.Types.ObjectId()
    });

    await contest.save();
    console.log('✅ Concours créé avec l\'ID:', contest._id);

    // 2. Tester les virtuals
    console.log('\n2. Test des virtuals...');
    console.log('   - isActive:', contest.isActive);
    console.log('   - isOpenForRegistration:', contest.isOpenForRegistration);
    console.log('   - daysUntilEnd:', contest.daysUntilEnd);
    console.log('   - daysUntilDraw:', contest.daysUntilDraw);
    console.log('   - isDrawTime:', contest.isDrawTime);

    // 3. Tester l'ajout de participant
    console.log('\n3. Test de l\'ajout de participant...');
    const participantId = new mongoose.Types.ObjectId();
    await contest.addParticipant(participantId);
    console.log('✅ Participant ajouté, total:', contest.currentParticipants);

    // 4. Tester le tirage automatique
    console.log('\n4. Test du tirage automatique...');
    await contest.performAutoDraw();
    console.log('✅ Tirage effectué, vainqueur:', contest.winners.length > 0 ? 'Oui' : 'Non');

    // 5. Nettoyer
    console.log('\n5. Nettoyage...');
    await Contest.findByIdAndDelete(contest._id);
    console.log('✅ Concours de test supprimé');

    console.log('\n🎉 Tests du modèle Contest réussis !');

  } catch (error) {
    console.error('❌ Erreur lors des tests du modèle:', error);
  }
};

// Exécuter les tests
const runTests = async () => {
  await connectDB();
  
  try {
    await testWeeklyContest();
    await testContestModel();
  } catch (error) {
    console.error('Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuthParticipation() {
  console.log('🧪 Test d\'inscription au concours avec authentification');
  console.log('=======================================================\n');

  try {
    // 1. Test sans token (doit échouer)
    console.log('1️⃣ Test sans authentification (doit échouer)...');
    try {
      const response = await axios.post(`${API_BASE}/contests/weekly/participate`);
      console.log('❌ ERREUR: La requête a réussi sans token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correct: Authentification requise (401)');
      } else {
        console.log(`⚠️ Statut inattendu: ${error.response?.status}`);
      }
    }

    console.log('');

    // 2. Test du concours actuel (public)
    console.log('2️⃣ Test du concours actuel (public)...');
    try {
      const response = await axios.get(`${API_BASE}/contests/weekly/current`);
      if (response.data.success && response.data.data) {
        console.log('✅ Concours actuel récupéré');
        console.log(`   📊 Titre: ${response.data.data.title}`);
        console.log(`   📅 Statut: ${response.data.data.status}`);
        console.log(`   👥 Participants: ${response.data.data.currentParticipants}`);
      } else {
        console.log('⚠️ Aucun concours actif');
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.error || error.message}`);
    }

    console.log('');

    // 3. Test avec un faux token (doit échouer avec 401)
    console.log('3️⃣ Test avec un faux token...');
    try {
      const response = await axios.post(
        `${API_BASE}/contests/weekly/participate`,
        {},
        {
          headers: {
            'Authorization': 'Bearer fake-token-123'
          }
        }
      );
      console.log('❌ ERREUR: La requête a réussi avec un faux token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correct: Token invalide rejeté (401)');
      } else {
        console.log(`⚠️ Statut inattendu: ${error.response?.status}`);
        console.log(`   Message: ${error.response?.data?.error}`);
      }
    }

    console.log('');

    // 4. Test des statistiques (public)
    console.log('4️⃣ Test des statistiques (public)...');
    try {
      const response = await axios.get(`${API_BASE}/contests/weekly/stats`);
      if (response.data.success && response.data.data) {
        console.log('✅ Statistiques récupérées');
        console.log(`   📈 Total concours: ${response.data.data.totalContests || 0}`);
        console.log(`   👥 Total participants: ${response.data.data.totalParticipants || 0}`);
      } else {
        console.log('⚠️ Aucune statistique disponible');
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.error || error.message}`);
    }

  } catch (error) {
    console.log('💥 Erreur générale:', error.message);
  }

  console.log('\n🏁 Test terminé !');
  console.log('\n📝 Notes importantes:');
  console.log('   • L\'inscription nécessite maintenant une authentification');
  console.log('   • L\'admin dashboard peut toujours créer/modifier sans authentification');
  console.log('   • Les utilisateurs de l\'application Flutter doivent être connectés');
}

testAuthParticipation();

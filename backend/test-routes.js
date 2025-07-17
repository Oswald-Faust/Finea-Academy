const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testRoutes = async () => {
  console.log('🚀 Test des nouvelles routes de l\'API Finéa Académie\n');
  
  const tests = [
    // Routes utilisateurs
    { name: 'GET /api/users/stats', url: `${BASE_URL}/users/stats` },
    { name: 'GET /api/users', url: `${BASE_URL}/users` },
    { name: 'GET /api/users/detailed-stats', url: `${BASE_URL}/users/detailed-stats` },
    
    // Routes email
    { name: 'GET /api/email/newsletter/history', url: `${BASE_URL}/email/newsletter/history` },
    { name: 'GET /api/email/templates', url: `${BASE_URL}/email/templates` },
    
    // Routes cours
    { name: 'GET /api/courses', url: `${BASE_URL}/courses` },
    { name: 'GET /api/courses/1', url: `${BASE_URL}/courses/1` },
    { name: 'GET /api/courses/stats/overview', url: `${BASE_URL}/courses/stats/overview` },
    
    // Routes analytics
    { name: 'GET /api/analytics/activity', url: `${BASE_URL}/analytics/activity` },
    { name: 'GET /api/analytics/courses/performance', url: `${BASE_URL}/analytics/courses/performance` },
    { name: 'GET /api/analytics/users/demographics', url: `${BASE_URL}/analytics/users/demographics` },
    { name: 'GET /api/analytics/revenue', url: `${BASE_URL}/analytics/revenue` },
    
    // Routes notifications
    { name: 'GET /api/notifications', url: `${BASE_URL}/notifications` },
    { name: 'GET /api/notifications/stats', url: `${BASE_URL}/notifications/stats` },
    
    // Route de santé
    { name: 'GET /api/health', url: `${BASE_URL}/health` }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await axios.get(test.url, { timeout: 5000 });
      
      if (response.status === 200 && response.data.success !== false) {
        console.log(`✅ ${test.name} - OK`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Réponse invalide`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Résultats: ${passed} tests réussis, ${failed} tests échoués`);
  
  if (failed === 0) {
    console.log('🎉 Toutes les routes fonctionnent parfaitement !');
  } else {
    console.log('⚠️  Certaines routes nécessitent une vérification');
  }
};

// Tests POST pour créer des données
const testPostRoutes = async () => {
  console.log('\n🔧 Test des routes POST...\n');
  
  const postTests = [
    {
      name: 'POST /api/users/register',
      url: `${BASE_URL}/users/register`,
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test_${Date.now()}@finea-academie.com`,
        password: 'testpassword123'
      }
    },
    {
      name: 'POST /api/courses',
      url: `${BASE_URL}/courses`,
      data: {
        title: 'Cours de Test',
        description: 'Un cours créé pour tester l\'API',
        instructor: 'Professeur Test',
        level: 'Débutant',
        category: 'Test',
        price: 99.99
      }
    },
    {
      name: 'POST /api/notifications',
      url: `${BASE_URL}/notifications`,
      data: {
        type: 'test_notification',
        title: 'Test de notification',
        message: 'Ceci est un test de l\'API de notifications',
        priority: 'low'
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of postTests) {
    try {
      const response = await axios.post(test.url, test.data, { timeout: 5000 });
      
      if (response.status === 201 || (response.status === 200 && response.data.success)) {
        console.log(`✅ ${test.name} - OK`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Réponse invalide`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Tests POST: ${passed} réussis, ${failed} échoués`);
};

// Démarrer les tests
const runAllTests = async () => {
  try {
    console.log('⏳ Attente que le serveur soit prêt...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testRoutes();
    await testPostRoutes();
    
    console.log('\n🏁 Tests terminés !');
  } catch (error) {
    console.error('Erreur lors des tests:', error.message);
  }
};

if (require.main === module) {
  runAllTests();
}

module.exports = { testRoutes, testPostRoutes }; 
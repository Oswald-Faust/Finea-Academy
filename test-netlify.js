const axios = require('axios');

// Test de compatibilité Netlify pour l'API Finéa Académie
const testNetlifyCompatibility = async () => {
  console.log('🧪 Test de compatibilité Netlify pour Finéa Académie\n');
  
  const tests = [
    {
      name: 'Test de santé API',
      endpoint: '/api/health',
      method: 'GET',
      expected: 'success'
    },
    {
      name: 'Test d\'inscription utilisateur',
      endpoint: '/api/auth/register',
      method: 'POST',
      data: {
        firstName: 'Test',
        lastName: 'Netlify',
        email: `test_${Date.now()}@netlify.com`,
        password: 'testpassword123'
      },
      expected: 'success'
    },
    {
      name: 'Test récupération utilisateurs',
      endpoint: '/api/users',
      method: 'GET',
      expected: 'success'
    },
    {
      name: 'Test récupération cours',
      endpoint: '/api/courses',
      method: 'GET',
      expected: 'success'
    },
    {
      name: 'Test analytics',
      endpoint: '/api/analytics/activity',
      method: 'GET',
      expected: 'success'
    }
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      console.log(`📋 Test: ${test.name}`);
      
      const startTime = Date.now();
      let response;
      
      if (test.method === 'GET') {
        response = await axios.get(`http://localhost:8888${test.endpoint}`, {
          timeout: 8000 // Timeout 8 secondes pour Netlify
        });
      } else if (test.method === 'POST') {
        response = await axios.post(`http://localhost:8888${test.endpoint}`, test.data, {
          timeout: 8000,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const duration = Date.now() - startTime;
      
      if (response.status === 200 && response.data.success !== false) {
        console.log(`✅ Réussi (${duration}ms)`);
        passed++;
        results.push({
          test: test.name,
          status: 'PASS',
          duration: `${duration}ms`,
          response: response.data
        });
      } else {
        console.log(`❌ Échec - Réponse invalide`);
        failed++;
        results.push({
          test: test.name,
          status: 'FAIL',
          error: 'Réponse invalide',
          response: response.data
        });
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Échec - ${error.message}`);
      failed++;
      results.push({
        test: test.name,
        status: 'FAIL',
        error: error.message,
        duration: `${duration}ms`
      });
    }
    
    console.log(''); // Ligne vide
  }

  // Résumé
  console.log('📊 Résultats des tests de compatibilité Netlify');
  console.log('==============================================');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Votre API est compatible avec Netlify !');
    console.log('💡 Recommandation: Procédez au déploiement Netlify');
  } else {
    console.log('\n⚠️  Votre API a des problèmes de compatibilité avec Netlify');
    console.log('💡 Recommandation: Considérez Railway ou Render.com');
  }
  
  // Détails des résultats
  console.log('\n📋 Détails des tests:');
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.status} ${result.duration || ''}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });
  
  return { passed, failed, results };
};

// Exécuter le test si le script est lancé directement
if (require.main === module) {
  testNetlifyCompatibility().catch(console.error);
}

module.exports = { testNetlifyCompatibility }; 
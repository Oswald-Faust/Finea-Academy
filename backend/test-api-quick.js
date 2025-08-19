const http = require('http');

// Configuration
const hostname = 'localhost';
const port = 5000;

// Tests à effectuer
const tests = [
  {
    name: 'API Health Check',
    path: '/api/health',
    method: 'GET'
  },
  {
    name: 'Scheduler Status',
    path: '/api/scheduler/status',
    method: 'GET'
  },
  {
    name: 'Weekly Contest Current',
    path: '/api/contests/weekly/current',
    method: 'GET'
  },
  {
    name: 'Weekly Contest Stats',
    path: '/api/contests/weekly/stats',
    method: 'GET'
  },
  {
    name: 'Weekly Contest History',
    path: '/api/contests/weekly/history',
    method: 'GET'
  }
];

// Fonction pour effectuer un test
function performTest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: port,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          test: test.name,
          statusCode: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        test: test.name,
        statusCode: 0,
        success: false,
        error: err.message
      });
    });

    req.end();
  });
}

// Exécuter tous les tests
async function runTests() {
  console.log('🧪 Test de l\'API Finéa Académie');
  console.log('================================');
  console.log(`📍 Serveur: ${hostname}:${port}`);
  console.log('');

  for (const test of tests) {
    console.log(`🔍 Test: ${test.name}`);
    console.log(`   URL: ${test.method} ${test.path}`);
    
    const result = await performTest(test);
    
    if (result.success) {
      console.log(`   ✅ Status: ${result.statusCode}`);
      if (result.data) {
        try {
          const jsonData = JSON.parse(result.data);
          console.log(`   📊 Réponse: ${jsonData.success ? 'Succès' : 'Erreur'}`);
          if (jsonData.message) {
            console.log(`   💬 Message: ${jsonData.message}`);
          }
        } catch (e) {
          console.log(`   📄 Réponse: ${result.data.substring(0, 100)}...`);
        }
      }
    } else {
      console.log(`   ❌ Status: ${result.statusCode || 'Erreur de connexion'}`);
      if (result.error) {
        console.log(`   🚨 Erreur: ${result.error}`);
      }
    }
    
    console.log('');
  }

  console.log('🎯 Résumé des tests terminé !');
  console.log('Si vous voyez des erreurs 404, redémarrez le serveur backend.');
}

// Lancer les tests
runTests().catch(console.error);

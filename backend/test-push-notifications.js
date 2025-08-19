const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const PRODUCTION_URL = 'https://finea-api-production.up.railway.app/api';

// Utiliser l'URL locale par défaut, production en option
const baseURL = process.env.USE_PRODUCTION === 'true' ? PRODUCTION_URL : API_BASE_URL;

console.log(`🔍 Test des notifications push sur: ${baseURL}`);

// Tests des notifications push
async function testPushNotifications() {
  console.log('\n📱 === TEST DES NOTIFICATIONS PUSH ===\n');

  try {
    // Test 1: Vérifier que l'API est accessible
    console.log('1️⃣ Test de connectivité API...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    if (healthResponse.data.success) {
      console.log('✅ API accessible');
    } else {
      throw new Error('API non accessible');
    }

    // Test 2: Vérifier les statistiques des notifications push
    console.log('\n2️⃣ Test des statistiques push...');
    const statsResponse = await axios.get(`${baseURL}/push-notifications/stats`);
    console.log('📊 Statistiques des notifications push:');
    console.log(`   - Total envoyées: ${statsResponse.data.data.totalPushNotifications || 0}`);
    console.log(`   - Appareils connectés: ${statsResponse.data.data.totalDevicesWithTokens || 0}`);
    console.log(`   - Succès: ${statsResponse.data.data.sentNotifications || 0}`);
    console.log(`   - Échecs: ${statsResponse.data.data.failedNotifications || 0}`);

    // Test 3: Vérifier les appareils enregistrés
    console.log('\n3️⃣ Test de la liste des appareils...');
    const devicesResponse = await axios.get(`${baseURL}/push-notifications/devices?limit=5`);
    console.log(`📱 ${devicesResponse.data.data.length} appareils trouvés:`);
    devicesResponse.data.data.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.userName} (${device.userEmail})`);
      device.devices.forEach(dev => {
        console.log(`      - ${dev.platform} (actif: ${dev.isActive})`);
      });
    });

    // Test 4: Envoyer une notification de test globale
    console.log('\n4️⃣ Test d\'envoi de notification globale...');
    const testNotification = {
      title: '🧪 Test Notification Push',
      message: 'Ceci est un test automatique du système de notifications push !',
      type: 'test',
      priority: 'normal',
      isGlobal: true,
      data: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    const sendResponse = await axios.post(`${baseURL}/push-notifications/send`, testNotification);
    
    if (sendResponse.data.success) {
      console.log('✅ Notification de test envoyée !');
      console.log(`   - Succès: ${sendResponse.data.data.successCount || 0}`);
      console.log(`   - Échecs: ${sendResponse.data.data.failureCount || 0}`);
      console.log(`   - Total: ${sendResponse.data.data.totalSent || 0}`);
    } else {
      console.log('❌ Erreur lors de l\'envoi:', sendResponse.data.error);
    }

    // Test 5: Vérifier les routes de notifications classiques
    console.log('\n5️⃣ Test des notifications classiques...');
    const notificationsResponse = await axios.get(`${baseURL}/notifications?limit=3`);
    console.log(`📋 ${notificationsResponse.data.data.length} notifications trouvées`);

    console.log('\n🎉 === TESTS TERMINÉS AVEC SUCCÈS ===');
    console.log('\n📱 Le système de notifications push est opérationnel !');
    console.log('   Pour tester complètement:');
    console.log('   1. Ouvrez l\'app Flutter sur un téléphone');
    console.log('   2. Vérifiez que l\'appareil apparaît dans la liste');
    console.log('   3. Envoyez une notification depuis l\'admin dashboard');
    console.log('   4. Vérifiez qu\'elle arrive sur le téléphone');

  } catch (error) {
    console.error('\n❌ === ERREUR LORS DES TESTS ===');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Erreur: ${error.response.data?.error || error.response.data?.message || 'Erreur inconnue'}`);
    } else if (error.request) {
      console.error('Pas de réponse du serveur. Vérifiez que le backend est démarré.');
      console.error('Commande: cd backend && npm start');
    } else {
      console.error('Erreur:', error.message);
    }
    
    console.log('\n🔧 Solutions possibles:');
    console.log('   1. Vérifier que le backend est démarré (npm start)');
    console.log('   2. Vérifier l\'URL dans ce script');
    console.log('   3. Vérifier la configuration Firebase');
    console.log('   4. Consulter les logs du backend');
  }
}

// Test des routes de base
async function testBasicRoutes() {
  console.log('\n🌐 === TEST DES ROUTES DE BASE ===\n');
  
  const routes = [
    { name: 'Health Check', path: '/health' },
    { name: 'Users', path: '/users?limit=1' },
    { name: 'Notifications', path: '/notifications?limit=1' },
    { name: 'Push Stats', path: '/push-notifications/stats' },
    { name: 'Push Devices', path: '/push-notifications/devices?limit=1' },
  ];

  for (const route of routes) {
    try {
      const response = await axios.get(`${baseURL}${route.path}`);
      console.log(`✅ ${route.name}: OK (${response.status})`);
    } catch (error) {
      console.log(`❌ ${route.name}: Erreur (${error.response?.status || 'Network Error'})`);
    }
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 === TESTS DU SYSTÈME DE NOTIFICATIONS PUSH FINÉA ACADÉMIE ===');
  console.log(`⏰ ${new Date().toLocaleString('fr-FR')}\n`);

  // Test des routes de base
  await testBasicRoutes();
  
  // Test des notifications push
  await testPushNotifications();
  
  console.log('\n✨ Tests terminés !');
  console.log('\n📖 Pour plus d\'informations, consultez NOTIFICATIONS_PUSH_GUIDE.md');
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testPushNotifications, testBasicRoutes, runTests };

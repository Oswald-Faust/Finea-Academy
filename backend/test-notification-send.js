const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Test d'envoi de notification
async function testNotificationSend() {
  try {
    console.log('🧪 Test d\'envoi de notification...');
    
    const notificationData = {
      title: '🧪 Test Notification',
      message: 'Ceci est une notification de test depuis le dashboard admin !',
      type: 'general',
      priority: 'normal',
      isGlobal: true,
      data: {
        type: 'test',
        timestamp: Date.now(),
        source: 'admin-dashboard'
      }
    };

    console.log('📤 Envoi de la notification:', notificationData);
    
    const response = await axios.post(`${API_BASE_URL}/push-notifications/send`, notificationData);
    
    console.log('✅ Notification envoyée avec succès !');
    console.log('📊 Réponse:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.response?.data || error.message);
  }
}

// Test d'envoi de notification de test
async function testTestNotification() {
  try {
    console.log('\n🧪 Test de la route de test...');
    
    const response = await axios.post(`${API_BASE_URL}/push-notifications/test`);
    
    console.log('✅ Notification de test envoyée !');
    console.log('📊 Réponse:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de notifications...\n');
  
  await testNotificationSend();
  await testTestNotification();
  
  console.log('\n✨ Tests terminés !');
}

// Lancer les tests
if (require.main === module) {
  runTests();
}

module.exports = { testNotificationSend, testTestNotification };

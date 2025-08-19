const axios = require('axios');

// Test rapide de l'API de notifications
async function testQuickNotification() {
  try {
    console.log('🧪 Test rapide de l\'API de notifications...');
    
    const response = await axios.post('http://localhost:5000/api/push-notifications/send', {
      title: '🎉 Test Rapide !',
      message: 'Ceci est un test rapide depuis le script !',
      type: 'general',
      priority: 'normal',
      isGlobal: true
    });
    
    console.log('✅ Réponse de l\'API:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testQuickNotification();


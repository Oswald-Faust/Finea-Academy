const mongoose = require('mongoose');

// Test des imports
try {
  console.log('🧪 Test des imports des modèles...\n');
  
  // Test User
  const User = require('./backend/models/User');
  console.log('✅ Modèle User importé avec succès');
  console.log('   - Méthodes disponibles:', Object.getOwnPropertyNames(User.prototype).slice(0, 5));
  
  // Test Newsletter
  const { Newsletter } = require('./backend/models/Newsletter');
  console.log('✅ Modèle Newsletter importé avec succès');
  console.log('   - Méthodes disponibles:', Object.getOwnPropertyNames(Newsletter.prototype).slice(0, 5));
  
  // Test Notification
  const Notification = require('./backend/models/Notification');
  console.log('✅ Modèle Notification importé avec succès');
  console.log('   - Méthodes disponibles:', Object.getOwnPropertyNames(Notification.prototype).slice(0, 5));
  
  console.log('\n🎉 Tous les imports fonctionnent correctement !');
  
} catch (error) {
  console.error('❌ Erreur lors des imports:', error.message);
  console.error('Stack:', error.stack);
} 
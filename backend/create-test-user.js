const mongoose = require('mongoose');
const User = require('./models/User');
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

// Créer un utilisateur de test
const createTestUser = async () => {
  try {
    console.log('👤 Création d\'un utilisateur de test...');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'test@finea-academie.fr' });
    
    if (existingUser) {
      console.log('✅ Utilisateur de test existe déjà');
      return existingUser;
    }
    
    // Créer l'utilisateur de test
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Utilisateur',
      email: 'test@finea-academie.fr',
      password: 'Test123!',
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      preferences: {
        notifications: {
          email: true,
          push: true, // IMPORTANT : notifications push activées
          marketing: false
        },
        language: 'fr',
        theme: 'light'
      },
      // Ajouter un token FCM fictif pour les tests
      fcmTokens: [{
        token: 'test_token_fcm_' + Date.now(),
        platform: 'android',
        deviceId: 'test_device_' + Date.now(),
        lastUsed: new Date(),
        isActive: true
      }]
    });
    
    await testUser.save();
    console.log('✅ Utilisateur de test créé avec succès !');
    console.log(`   - ID: ${testUser._id}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Notifications push: ${testUser.preferences.notifications.push}`);
    console.log(`   - Tokens FCM: ${testUser.fcmTokens.length}`);
    
    return testUser;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  }
};

// Vérifier la configuration des notifications
const checkNotificationConfig = async () => {
  try {
    console.log('\n🔍 Vérification de la configuration des notifications...');
    
    const users = await User.find({
      isActive: true,
      'preferences.notifications.push': true
    }).select('email preferences.notifications fcmTokens');
    
    console.log(`📊 Utilisateurs avec notifications push activées: ${users.length}`);
    
    users.forEach(user => {
      console.log(`   - ${user.email}: push=${user.preferences.notifications.push}, tokens=${user.fcmTokens.length}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé avec notifications push activées');
      console.log('💡 Créez un utilisateur de test ou activez les notifications pour un utilisateur existant');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
};

// Exécuter le script
const run = async () => {
  try {
    await connectDB();
    
    // Créer l'utilisateur de test
    await createTestUser();
    
    // Vérifier la configuration
    await checkNotificationConfig();
    
    console.log('\n🎉 Script terminé avec succès !');
    console.log('Maintenant vous pouvez tester l\'envoi de notifications depuis le dashboard admin.');
    
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

module.exports = { createTestUser, checkNotificationConfig };

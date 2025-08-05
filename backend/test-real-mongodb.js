const mongoose = require('mongoose');

// Test de connexion avec les vraies données
const testRealMongoConnection = async () => {
  try {
    console.log('🔍 Test de connexion MongoDB avec vos vrais identifiants...');
    
    // Votre vraie chaîne de connexion
    const mongoUri = "mongodb+srv://faustfrank370:writer55FF@cluster0.km3u4wj.mongodb.net/finea_academie?retryWrites=true&w=majority&appName=Cluster0";
    
    console.log('📡 URI MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Masquer les credentials
    
    console.log('⏳ Tentative de connexion...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15 secondes
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connecté avec succès !');
    console.log('📍 Host:', conn.connection.host);
    console.log('🗄️  Database:', conn.connection.name);
    console.log('🔗 Ready State:', conn.connection.readyState);
    
    // Test de création d'une collection users
    console.log('🧪 Test de création de collection users...');
    const usersCollection = conn.connection.collection('users');
    
    // Test d'insertion
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@finea.com',
      createdAt: new Date()
    };
    
    const insertResult = await usersCollection.insertOne(testUser);
    console.log('✅ Test d\'insertion réussi ! ID:', insertResult.insertedId);
    
    // Test de lecture
    const foundUser = await usersCollection.findOne({ email: 'test@finea.com' });
    console.log('✅ Test de lecture réussi ! User trouvé:', foundUser ? 'OUI' : 'NON');
    
    // Nettoyer le test
    await usersCollection.deleteOne({ email: 'test@finea.com' });
    console.log('✅ Test de suppression réussi !');
    
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
    console.log('🎉 Tous les tests MongoDB sont réussis !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Problème d\'authentification - Vérifiez username/password');
    } else if (error.message.includes('network')) {
      console.log('💡 Problème réseau - Vérifiez Network Access dans MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Timeout - Vérifiez l\'URI et la connectivité');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Problème DNS - Vérifiez l\'URL du cluster');
    }
  }
};

// Lancer le test
testRealMongoConnection(); 
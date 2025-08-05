const mongoose = require('mongoose');
require('dotenv').config();

// Test de connexion MongoDB
const testMongoConnection = async () => {
  try {
    console.log('🔍 Test de connexion MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://faustfrank370:writer55FF@cluster0.km3u4wj.mongodb.net/finea_academie?retryWrites=true&w=majority&appName=Cluster0";
    
    console.log('📡 URI MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Masquer les credentials
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connecté avec succès !');
    console.log('📍 Host:', conn.connection.host);
    console.log('🗄️  Database:', conn.connection.name);
    console.log('🔗 Ready State:', conn.connection.readyState);
    
    // Test de création d'une collection
    const testCollection = conn.connection.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test d\'écriture réussi !');
    
    // Nettoyer le test
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Test de suppression réussi !');
    
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Problème d\'authentification - Vérifiez username/password');
    } else if (error.message.includes('network')) {
      console.log('💡 Problème réseau - Vérifiez Network Access dans MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Timeout - Vérifiez l\'URI et la connectivité');
    }
  }
};

// Lancer le test
testMongoConnection(); 
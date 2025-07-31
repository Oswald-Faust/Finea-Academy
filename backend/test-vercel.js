const app = require('./server');

// Test de la route de santé
const testHealthEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ Route /api/health fonctionne:', data);
  } catch (error) {
    console.error('❌ Erreur avec /api/health:', error.message);
  }
};

// Test de la connexion MongoDB
const testMongoDB = () => {
  const mongoose = require('mongoose');
  console.log('📊 État MongoDB:', mongoose.connection.readyState);
  console.log('🔗 URI MongoDB:', process.env.MONGODB_URI ? 'Définie' : 'Non définie');
};

// Test des variables d'environnement
const testEnvironment = () => {
  console.log('🌍 Variables d\'environnement:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- PORT:', process.env.PORT);
  console.log('- VERCEL:', process.env.VERCEL);
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Définie' : 'Non définie');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Définie' : 'Non définie');
};

console.log('🧪 Tests de configuration Vercel...');
testEnvironment();
testMongoDB();

// Démarrer le serveur pour les tests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  setTimeout(testHealthEndpoint, 1000);
}); 
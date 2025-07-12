require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du build React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Gérer les routes React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  // Afficher les routes disponibles
  console.log('\nAvailable routes:');
  console.log(`- GET /api/health - Vérifier l'état du serveur`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`- GET /* - Servir l'application React`);
  }
});

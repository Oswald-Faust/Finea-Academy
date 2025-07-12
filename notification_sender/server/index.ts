import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { db } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api', apiRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Servir les fichiers statiques du build React en production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  
  // Gérer les routes React (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Gestion des erreurs globales
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  // Afficher les routes disponibles
  console.log('\nAvailable API routes:');
  console.log(`- GET    /api/health          - Vérifier l'état du serveur`);
  console.log(`- POST   /api/notifications   - Envoyer une notification`);
  console.log(`- GET    /api/notifications   - Récupérer l'historique des notifications`);
  console.log(`- GET    /api/notifications/:id - Détails d'une notification`);
  console.log(`- GET    /api/templates       - Lister les modèles`);
  console.log(`- POST   /api/templates       - Créer un modèle`);
  console.log(`- PUT    /api/templates/:id    - Mettre à jour un modèle`);
  console.log(`- DELETE /api/templates/:id    - Supprimer un modèle`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('\nReact app is being served from /dist');
  }
});

// Gestion de la fermeture propre du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;

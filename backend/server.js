const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const newsletterRoutes = require('./routes/newsletters');
const newsRoutes = require('./routes/news');
const emailRoutes = require('./routes/email');
const courseRoutes = require('./routes/courses');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');
const pushNotificationsRoutes = require('./routes/pushNotifications');
const contestsRoutes = require('./routes/contests');
const favoritesRoutes = require('./routes/favorites');

// Import des middlewares
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import du planificateur de concours hebdomadaires
const schedulerService = require('./services/schedulerService');

const app = express();

// Créer les dossiers d'upload s'ils n'existent pas (uniquement en développement)
if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');
  const path = require('path');

  const uploadDirs = ['./uploads', './uploads/avatars', './uploads/articles'];
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:62577',
      'http://localhost:63266',
      'https://finea-admin.vercel.app',
      'https://finea-academie.vercel.app',
      'https://finea-academie.web.app',
      'https://finea-academie.firebaseapp.com',
      'https://finea-admin-dashboard.netlify.app',
      'https://horizon-plus-five.vercel.app'
    ];
    
    // Permettre les requêtes sans origine (comme les applications mobiles)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origine bloquée par CORS:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Headers de sécurité
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Finéa Académie opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Route pour vérifier le statut du planificateur
app.get('/api/scheduler/status', (req, res) => {
  res.json({
    success: true,
    data: schedulerService.getStatus()
  });
});

// Servir les fichiers statiques uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/push-notifications', pushNotificationsRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Connexion à MongoDB avec gestion d'erreur améliorée
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB déjà connecté');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI non définie dans les variables d\'environnement');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout de 10 secondes
      socketTimeoutMS: 45000, // Timeout socket de 45 secondes
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    
    isConnected = true;
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Gestion des erreurs de connexion MongoDB
mongoose.connection.on('error', (err) => {
  console.error('Erreur MongoDB:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB déconnecté');
  isConnected = false;
});

// Démarrage du serveur
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible sur: http://localhost:${PORT}/api`);
      
      // Démarrer le planificateur de concours hebdomadaires
      schedulerService.start();
      console.log(`⏰ Planificateur de concours hebdomadaires démarré`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥');
  console.error(err.name, err.message);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt propre du serveur...');
  schedulerService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt propre du serveur...');
  schedulerService.stop();
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app; 
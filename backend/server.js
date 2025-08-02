const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const newsletterRoutes = require('./routes/newsletters');
const emailRoutes = require('./routes/email');
const courseRoutes = require('./routes/courses');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');
const contestsRoutes = require('./routes/contests');

// Import des middlewares
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

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

// Configuration CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  exposedHeaders: ['*', 'Authorization']
};

// Middlewares de sécurité
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  },
});

app.use('/api/', limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middlewares de sécurité pour les données
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Route de test pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Finéa Académie fonctionne correctement',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/contests', contestsRoutes);

// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Configuration de la base de données
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    
    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnecté');
    });

    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    // En production, continuer sans MongoDB pour le debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('Continuing without MongoDB in production...');
      return null;
    }
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
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📱 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log('✅ Application prête');
    });

    // Gestion gracieuse de l'arrêt
    process.on('SIGTERM', () => {
      console.log('💤 SIGTERM reçu');
      server.close(() => {
        console.log('🔥 Processus terminé');
      });
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
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

// Démarrer le serveur
startServer();

module.exports = app; 
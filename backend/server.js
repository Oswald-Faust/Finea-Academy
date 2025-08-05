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
  origin: function (origin, callback) {
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:61386',
      'http://localhost:8080',
      'http://localhost:4200',
      'http://localhost:49673',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:61386',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:4200',
      'http://localhost:56430',
      process.env.FRONTEND_URL,
      'https://finea-admin.vercel.app',
      'https://finea-academie.vercel.app',
      'https://finea-admin-dashboard.netlify.app'
    ].filter(Boolean); // Enlever les valeurs null/undefined

    // Autoriser les requêtes sans origine (comme les apps mobiles)
    if (!origin) return callback(null, true);
    
    // En développement, autoriser toutes les origines localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par la politique CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
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
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible sur: http://localhost:${PORT}/api`);
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

// Démarrer le serveur
startServer();

module.exports = app; 
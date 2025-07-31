const app = require('./server');

// Test simple pour Vercel
app.get('/test', (req, res) => {
  res.json({
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    mongodb: !!process.env.MONGODB_URI
  });
});

// Test de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test des variables d'environnement (sans exposer les secrets)
app.get('/env-test', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasEmailConfig: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
    port: process.env.PORT || 5000
  });
});

module.exports = app; 
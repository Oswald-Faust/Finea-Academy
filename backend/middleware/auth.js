const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes avec JWT
const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non trouvé',
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Compte désactivé',
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({
        success: false,
        error: 'Token invalide',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Accès refusé, token manquant',
    });
  }
};

// Middleware pour vérifier les rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé pour ce rôle',
      });
    }
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
const checkOwnership = (req, res, next) => {
  // Vérifier si l'utilisateur est admin ou propriétaire de la ressource
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé',
    });
  }
};

// Middleware optionnel pour les routes qui peuvent être accessibles sans authentification
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Si le token est invalide, continuer sans utilisateur
      req.user = null;
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  optionalAuth,
}; 
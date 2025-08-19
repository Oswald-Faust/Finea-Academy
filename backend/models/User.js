const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez entrer un email valide',
    ],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false, // Ne pas inclure le mot de passe dans les requêtes par défaut
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Veuillez entrer un numéro de téléphone valide',
    ],
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'France',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  // loginAttempts et lockUntil supprimés - les comptes ne doivent jamais être verrouillés
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    language: {
      type: String,
      default: 'fr',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  // Tokens FCM pour les notifications push
  fcmTokens: [{
    token: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Référence aux favoris (virtuelle)
  favoritesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index pour optimiser les requêtes
// L'index sur email est déjà créé par unique: true
userSchema.index({ createdAt: -1 });

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual supprimé - les comptes ne doivent jamais être verrouillés

// Middleware pour hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Seulement hasher le mot de passe s'il a été modifié
  if (!this.isModified('password')) return next();

  try {
    // Hasher le mot de passe avec un coût de 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware supprimé - les comptes ne doivent jamais être verrouillés

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d' 
    }
  );
};

// Méthode supprimée - les comptes ne doivent jamais être verrouillés

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.generatePasswordResetToken = function() {
  // Générer un token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hasher le token et l'assigner au champ passwordResetToken
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Définir l'expiration du token (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Méthode pour générer un token de vérification d'email
userSchema.methods.generateEmailVerificationToken = function() {
  // Générer un token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Hasher le token et l'assigner au champ emailVerificationToken
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  
  // Définir l'expiration du token (24 heures)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Méthode supprimée - les comptes ne doivent jamais être verrouillés

// Méthode pour ajouter un token FCM
userSchema.methods.addFCMToken = function(token, platform, deviceId) {
  // Supprimer l'ancien token pour ce device s'il existe
  this.fcmTokens = this.fcmTokens.filter(t => t.deviceId !== deviceId);
  
  // Ajouter le nouveau token
  this.fcmTokens.push({
    token,
    platform,
    deviceId,
    lastUsed: new Date(),
    isActive: true
  });
  
  return this.save();
};

// Méthode pour supprimer un token FCM
userSchema.methods.removeFCMToken = function(deviceId) {
  this.fcmTokens = this.fcmTokens.filter(t => t.deviceId !== deviceId);
  return this.save();
};

// Méthode pour récupérer les tokens FCM actifs
userSchema.methods.getActiveFCMTokens = function() {
  return this.fcmTokens.filter(t => t.isActive).map(t => t.token);
};

// Méthode pour convertir en objet JSON sûr (sans données sensibles)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  
  // Supprimer les champs sensibles
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.twoFactorSecret;
  delete userObject.fcmTokens; // Supprimer les tokens FCM pour la sécurité
  
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modèle User (copié du backend)
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
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },
    theme: {
      mode: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'fr' },
    },
  },
  avatar: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/finea-academie', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'faust.troukou@epitech.eu' });
    if (existingUser) {
      console.log('L\'utilisateur existe déjà');
      process.exit(0);
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('writer55', saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      firstName: 'Faust',
      lastName: 'Troukou',
      email: 'faust.troukou@epitech.eu',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    console.log('Utilisateur créé avec succès:', {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

createUser(); 
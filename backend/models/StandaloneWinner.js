const mongoose = require('mongoose');

const standaloneWinnerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: null
  },
  prize: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    default: 0
  },
  position: {
    type: Number,
    default: 1
  },
  drawDate: {
    type: Date,
    default: Date.now
  },
  // Semaine du tirage (format: 2026-W02)
  weekOfYear: {
    type: String,
    required: true
  },
  // Date de création
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Indique si le gagnant est actif (visible dans l'app)
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  },
  // Lien avec un utilisateur Finea (optionnel)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Username de l'utilisateur (pour affichage)
  username: {
    type: String,
    trim: true,
    default: null
  },
  // Adresse Ethereum du gagnant (visible uniquement par le gagnant)
  ethAddress: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Index pour récupérer les gagnants par semaine
standaloneWinnerSchema.index({ weekOfYear: 1 });
standaloneWinnerSchema.index({ isActive: 1, drawDate: -1 });

// Méthode statique pour obtenir la semaine actuelle
standaloneWinnerSchema.statics.getCurrentWeekIdentifier = function() {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padLeft(2, '0')}`;
};

// Méthode statique pour obtenir les gagnants de la semaine actuelle
standaloneWinnerSchema.statics.getCurrentWeekWinners = async function() {
  const currentWeek = this.getCurrentWeekIdentifier();
  return this.find({ 
    weekOfYear: currentWeek,
    isActive: true 
  }).sort({ position: 1 });
};

// Méthode statique pour obtenir les gagnants récents (toutes semaines confondues)
standaloneWinnerSchema.statics.getRecentWinners = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ drawDate: -1 })
    .limit(limit);
};

// Méthode virtuelle pour le nom complet
standaloneWinnerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// S'assurer que les virtuels sont inclus lors de la conversion en JSON
standaloneWinnerSchema.set('toJSON', { virtuals: true });
standaloneWinnerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StandaloneWinner', standaloneWinnerSchema);

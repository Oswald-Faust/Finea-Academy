const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['trading', 'bourse', 'formation', 'general', 'special', 'weekly'],
    default: 'general'
  },
  // Nouveaux champs pour le concours hebdomadaire
  isWeeklyContest: {
    type: Boolean,
    default: false
  },
  weekNumber: {
    type: Number,
    default: null // Numéro de la semaine de l'année
  },
  year: {
    type: Number,
    default: null // Année du concours
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'completed', 'drawing'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  drawDate: {
    type: Date,
    required: true
  },
  // Nouveau champ pour le tirage automatique
  autoDrawEnabled: {
    type: Boolean,
    default: false
  },
  drawCompleted: {
    type: Boolean,
    default: false
  },
  drawCompletedAt: {
    type: Date,
    default: null
  },
  maxParticipants: {
    type: Number,
    default: null // null = illimité
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isWinner: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      default: null
    },
    prize: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      maxlength: 500
    }
  }],
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    position: {
      type: Number,
      required: true
    },
    prize: {
      type: String,
      required: true
    },
    selectedAt: {
      type: Date,
      default: Date.now
    },
    selectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      maxlength: 500
    }
  }],
  prizes: [{
    position: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    value: {
      type: Number
    },
    type: {
      type: String,
      enum: ['money', 'formation', 'equipment', 'certificate', 'other'],
      default: 'other'
    }
  }],
  rules: {
    type: String,
    maxlength: 2000
  },
  eligibilityCriteria: {
    minAge: {
      type: Number,
      default: 18
    },
    requiredLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all'
    },
    requiredCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    activeUserOnly: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Plus de required: true pour permettre la création sans authentification
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les requêtes de performance
contestSchema.index({ status: 1, startDate: 1, endDate: 1 });
contestSchema.index({ 'participants.user': 1 });
contestSchema.index({ 'winners.user': 1 });
// Nouveaux index pour le concours hebdomadaire
contestSchema.index({ isWeeklyContest: 1, weekNumber: 1, year: 1 });
contestSchema.index({ autoDrawEnabled: 1, drawCompleted: 1 });

// Virtuals
contestSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

contestSchema.virtual('isOpenForRegistration').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.maxParticipants || this.currentParticipants < this.maxParticipants);
});

contestSchema.virtual('daysUntilEnd').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

contestSchema.virtual('daysUntilDraw').get(function() {
  const now = new Date();
  const draw = new Date(this.drawDate);
  const diffTime = draw - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Nouveau virtual pour vérifier si le tirage est en cours
contestSchema.virtual('isDrawTime').get(function() {
  const now = new Date();
  const draw = new Date(this.drawDate);
  return this.status === 'active' && 
         this.autoDrawEnabled && 
         !this.drawCompleted && 
         now >= draw;
});

// Méthodes
contestSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({ user: userId });
    this.currentParticipants = this.participants.length;
    return this.save();
  }
  return Promise.resolve(this);
};

contestSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  this.currentParticipants = this.participants.length;
  return this.save();
};

// Nouvelle méthode pour le tirage automatique
contestSchema.methods.performAutoDraw = function() {
  if (this.drawCompleted || this.participants.length === 0) {
    return Promise.resolve(this);
  }

  // Sélectionner un gagnant au hasard
  const randomIndex = Math.floor(Math.random() * this.participants.length);
  const winner = this.participants[randomIndex];
  
  // Ajouter le gagnant
  this.winners.push({
    user: winner.user,
    position: 1,
    prize: this.prizes.find(p => p.position === 1)?.name || 'Prix principal',
    selectedAt: new Date(),
    notes: 'Tirage automatique'
  });

  // Marquer le participant comme vainqueur
  winner.isWinner = true;
  winner.position = 1;
  winner.prize = this.prizes.find(p => p.position === 1)?.name || 'Prix principal';

  // Mettre à jour le statut
  this.status = 'completed';
  this.drawCompleted = true;
  this.drawCompletedAt = new Date();

  return this.save();
};

contestSchema.methods.selectWinner = function(userId, position, prize, selectedBy, notes = '') {
  // Vérifier que l'utilisateur est participant
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('Utilisateur non participant au concours');
  }

  // Vérifier que la position n'est pas déjà prise
  const existingWinner = this.winners.find(w => w.position === position);
  if (existingWinner) {
    throw new Error('Position déjà attribuée');
  }

  // Ajouter le vainqueur
  this.winners.push({
    user: userId,
    position,
    prize,
    selectedBy,
    notes
  });

  // Marquer le participant comme vainqueur
  participant.isWinner = true;
  participant.position = position;
  participant.prize = prize;
  participant.notes = notes;

  return this.save();
};

contestSchema.methods.removeWinner = function(userId) {
  this.winners = this.winners.filter(w => w.user.toString() !== userId.toString());
  
  // Retirer le statut de vainqueur du participant
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.isWinner = false;
    participant.position = null;
    participant.prize = null;
    participant.notes = '';
  }

  return this.save();
};

// Méthodes statiques
contestSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

contestSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $gt: now }
  });
};

contestSchema.statics.findCompleted = function() {
  const now = new Date();
  return this.find({
    $or: [
      { status: 'completed' },
      { endDate: { $lt: now } }
    ]
  });
};

// Nouvelle méthode statique pour trouver le concours hebdomadaire actuel
contestSchema.statics.findCurrentWeeklyContest = function() {
  const now = new Date();
  return this.findOne({
    isWeeklyContest: true,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Nouvelle méthode statique pour créer un concours hebdomadaire
contestSchema.statics.createWeeklyContest = function(weekNumber, year, adminUserId) {
  // Calculer les dates pour le dimanche de cette semaine
  const startOfWeek = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const sunday = new Date(startOfWeek);
  sunday.setDate(sunday.getDate() - sunday.getDay()); // Aller au dimanche
  
  const startDate = new Date(sunday);
  startDate.setHours(0, 0, 0, 0);
  
  // Date de fin fixée au dimanche à 19h00 (même que le tirage)
  const endDate = new Date(sunday);
  endDate.setDate(endDate.getDate() + 7); // Dimanche suivant
  endDate.setHours(19, 0, 0, 0); // Fin à 19h00 précises
  
  // Tirage fixé à 19h00 le dimanche (même heure que la fin)
  const drawDate = new Date(sunday);
  drawDate.setDate(drawDate.getDate() + 7); // Dimanche suivant
  drawDate.setHours(19, 0, 0, 0); // Tirage à 19h00 précises

  return this.create({
    title: `Concours Hebdomadaire - Semaine ${weekNumber} ${year}`,
    description: `Participez au concours hebdomadaire de Finéa Académie ! Le concours se termine et le tirage au sort ont lieu le dimanche à 19h00.`,
    type: 'weekly',
    isWeeklyContest: true,
    weekNumber,
    year,
    status: 'active',
    startDate,
    endDate,
    drawDate,
    autoDrawEnabled: true,
    prizes: [
      {
        position: 1,
        name: 'Formation Premium',
        description: 'Accès à une formation premium de votre choix',
        type: 'formation'
      }
    ],
    rules: '1. Participation gratuite\n2. Un seul ticket par utilisateur\n3. Le concours se termine le dimanche à 19h00\n4. Tirage au sort automatique le dimanche à 19h00\n5. Le gagnant sera contacté par email',
    createdBy: adminUserId
  });
};

// Middleware
contestSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // À améliorer avec le vrai utilisateur modifiant
  }
  next();
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest; 
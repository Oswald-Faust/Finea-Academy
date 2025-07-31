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
    enum: ['trading', 'bourse', 'formation', 'general', 'special'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'completed'],
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
    ref: 'User',
    required: true
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

// Middleware
contestSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // À améliorer avec le vrai utilisateur modifiant
  }
  next();
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest; 
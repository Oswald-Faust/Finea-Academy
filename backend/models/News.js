const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  
  content: {
    type: mongoose.Schema.Types.Mixed, // Pour stocker le contenu EditorJS
    required: [true, 'Le contenu est requis']
  },
  
  coverImage: {
    type: String, // URL de l'image de couverture
    default: ''
  },
  
  summary: {
    type: String,
    maxlength: [500, 'Le résumé ne peut pas dépasser 500 caractères'],
    default: ''
  },
  
  // Contrôle de publication
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
  },
  
  // Date de publication planifiée
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Date de publication effective
  publishedAt: {
    type: Date,
    default: null
  },
  
  // Semaine de publication (format: YYYY-WW)
  weekOfYear: {
    type: String,
    required: true,
    unique: true, // Une seule actualité par semaine
    validate: {
      validator: function(v) {
        return /^\d{4}-W\d{2}$/.test(v); // Format: 2024-W01
      },
      message: 'Le format de la semaine doit être YYYY-WW'
    }
  },
  
  // Métadonnées
  tags: [{
    type: String,
    trim: true
  }],
  
  // Statistiques
  views: {
    type: Number,
    default: 0
  },
  
  // Ciblage (optionnel)
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  targetRoles: [{
    type: String,
    enum: ['admin', 'user', 'premium', 'trial']
  }],
  
  // Priorité pour l'affichage
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  
  // Auteur (référence vers un utilisateur admin)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Version et historique
  version: {
    type: Number,
    default: 1
  },
  
  // Modifications
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les requêtes
newsSchema.index({ weekOfYear: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ createdAt: -1 });

// Virtual pour obtenir l'année et la semaine
newsSchema.virtual('year').get(function() {
  return parseInt(this.weekOfYear.split('-W')[0]);
});

newsSchema.virtual('week').get(function() {
  return parseInt(this.weekOfYear.split('-W')[1]);
});

// Middleware pre-save pour générer automatiquement la semaine
newsSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('scheduledFor') || this.isModified('publishedAt')) {
    const date = this.scheduledFor || this.publishedAt || new Date();
    const weekOfYear = getWeekOfYear(date);
    
    // Vérifier qu'il n'y a pas déjà une actualité pour cette semaine
    if (this.isNew && !this.weekOfYear) {
      this.weekOfYear = weekOfYear;
    }
  }
  
  // Mettre à jour publishedAt si le status passe à 'published'
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Fonction utilitaire pour obtenir la semaine de l'année
function getWeekOfYear(date) {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Méthodes statiques
newsSchema.statics.getCurrentWeekNews = function() {
  const currentWeek = getWeekOfYear(new Date());
  return this.findOne({ 
    weekOfYear: currentWeek, 
    status: 'published' 
  }).populate('author', 'firstName lastName email');
};

newsSchema.statics.getNewsByWeek = function(weekOfYear) {
  return this.findOne({ weekOfYear }).populate('author', 'firstName lastName email');
};

newsSchema.statics.getPublishedNews = function(limit = 10, skip = 0) {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('author', 'firstName lastName email');
};

// Méthodes d'instance
newsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

newsSchema.methods.canPublish = function() {
  const currentWeek = getWeekOfYear(new Date());
  const targetWeek = getWeekOfYear(this.scheduledFor || new Date());
  
  // Ne peut publier que pour la semaine actuelle ou future
  return targetWeek >= currentWeek;
};

module.exports = mongoose.model('News', newsSchema);

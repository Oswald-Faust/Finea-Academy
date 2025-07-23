const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  // Champs pour les articles de blog
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  coverImage: {
    type: String, // URL de l'image de présentation
    required: false
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // JSON Editor.js
    required: true
  },
  // Champs pour les newsletters (rétrocompatibilité)
  subject: {
    type: String,
    trim: true,
    maxlength: 300
  },
  htmlContent: {
    type: String
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  // Champs communs
  type: {
    type: String,
    enum: ['newsletter', 'article', 'blog'],
    default: 'article'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled', 'published'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetRoles: [{
    type: String,
    enum: ['user', 'moderator', 'admin']
  }],
  targetSegments: [{
    type: String,
    enum: ['all', 'active', 'inactive', 'new', 'premium', 'free']
  }],
  isGlobal: {
    type: Boolean,
    default: false
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  sentCount: {
    type: Number,
    default: 0
  },
  deliveredCount: {
    type: Number,
    default: 0
  },
  openedCount: {
    type: Number,
    default: 0
  },
  clickedCount: {
    type: Number,
    default: 0
  },
  bouncedCount: {
    type: Number,
    default: 0
  },
  unsubscribeCount: {
    type: Number,
    default: 0
  },
  failureReason: {
    type: String
  },
  attachments: [{
    filename: String,
    path: String,
    contentType: String,
    size: Number
  }],
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  trackOpens: {
    type: Boolean,
    default: true
  },
  trackClicks: {
    type: Boolean,
    default: true
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

// Schema pour le tracking des ouvertures
const newsletterOpenSchema = new mongoose.Schema({
  newsletter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userAgent: String,
  ipAddress: String,
  openedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Schema pour le tracking des clics
const newsletterClickSchema = new mongoose.Schema({
  newsletter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  userAgent: String,
  ipAddress: String,
  clickedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Schema pour l'historique d'envoi
const newsletterDeliverySchema = new mongoose.Schema({
  newsletter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'bounced', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  deliveredAt: Date,
  bouncedAt: Date,
  errorMessage: String,
  providerMessageId: String
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ createdBy: 1 });
newsletterSchema.index({ scheduledFor: 1 });
newsletterSchema.index({ sentAt: -1 });
newsletterSchema.index({ tags: 1 });
newsletterSchema.index({ createdAt: -1 });

// Index composé pour les requêtes de liste
newsletterSchema.index({ 
  status: 1, 
  createdAt: -1 
});

// Index pour les newsletters programmées
newsletterSchema.index({ 
  status: 1, 
  scheduledFor: 1 
});

// Virtuals pour les statistiques
newsletterSchema.virtual('openRate').get(function() {
  return this.sentCount > 0 ? (this.openedCount / this.sentCount * 100).toFixed(2) : 0;
});

newsletterSchema.virtual('clickRate').get(function() {
  return this.sentCount > 0 ? (this.clickedCount / this.sentCount * 100).toFixed(2) : 0;
});

newsletterSchema.virtual('bounceRate').get(function() {
  return this.sentCount > 0 ? (this.bouncedCount / this.sentCount * 100).toFixed(2) : 0;
});

newsletterSchema.virtual('deliveryRate').get(function() {
  return this.sentCount > 0 ? (this.deliveredCount / this.sentCount * 100).toFixed(2) : 0;
});

// Méthodes
newsletterSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

newsletterSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

newsletterSchema.methods.incrementStats = function(statType) {
  if (this[statType + 'Count'] !== undefined) {
    this[statType + 'Count'] += 1;
    return this.save();
  }
};

// Méthodes statiques
newsletterSchema.statics.getStats = function(dateRange = {}) {
  const matchStage = {
    status: 'sent'
  };
  
  if (dateRange.start && dateRange.end) {
    matchStage.sentAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalNewsletters: { $sum: 1 },
        totalRecipients: { $sum: '$recipientCount' },
        totalSent: { $sum: '$sentCount' },
        totalOpened: { $sum: '$openedCount' },
        totalClicked: { $sum: '$clickedCount' },
        totalBounced: { $sum: '$bouncedCount' },
        avgOpenRate: { $avg: { $multiply: [{ $divide: ['$openedCount', '$sentCount'] }, 100] } },
        avgClickRate: { $avg: { $multiply: [{ $divide: ['$clickedCount', '$sentCount'] }, 100] } }
      }
    }
  ]);
};

newsletterSchema.statics.findScheduledForSending = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() }
  });
};

// Middleware
newsletterSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // À améliorer avec le vrai utilisateur modifiant
  }
  next();
});

// Index pour les sous-schemas
newsletterOpenSchema.index({ newsletter: 1, user: 1 });
newsletterOpenSchema.index({ newsletter: 1, openedAt: -1 });

newsletterClickSchema.index({ newsletter: 1, user: 1 });
newsletterClickSchema.index({ newsletter: 1, clickedAt: -1 });
newsletterClickSchema.index({ url: 1 });

newsletterDeliverySchema.index({ newsletter: 1, user: 1 });
newsletterDeliverySchema.index({ newsletter: 1, status: 1 });
newsletterDeliverySchema.index({ email: 1 });

// Export des modèles
module.exports = {
  Newsletter: mongoose.model('Newsletter', newsletterSchema),
  NewsletterOpen: mongoose.model('NewsletterOpen', newsletterOpenSchema),
  NewsletterClick: mongoose.model('NewsletterClick', newsletterClickSchema),
  NewsletterDelivery: mongoose.model('NewsletterDelivery', newsletterDeliverySchema)
}; 
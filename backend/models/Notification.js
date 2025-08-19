const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'article', 'general', 'system'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'medium', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
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
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
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
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ targetUsers: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, createdAt: -1 });

// Méthodes
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

notificationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Méthodes statiques
notificationSchema.statics.findScheduledForSending = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() }
  });
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    $or: [
      { targetUsers: userId },
      { isGlobal: true }
    ],
    'readBy.user': { $ne: userId }
  });
};

// Middleware
notificationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // À améliorer avec le vrai utilisateur modifiant
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema); 
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'course_enrollment',
      'system_alert', 
      'payment_received',
      'user_milestone',
      'course_completion',
      'newsletter_sent',
      'user_registered',
      'maintenance_scheduled',
      'security_alert',
      'promotion_available',
      'test_notification'
    ]
  },
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
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetRoles: [{
    type: String,
    enum: ['user', 'moderator', 'admin']
  }],
  isGlobal: {
    type: Boolean,
    default: false
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
  expiresAt: {
    type: Date
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: 50
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    enum: ['blue', 'green', 'yellow', 'red', 'purple', 'indigo', 'pink', 'gray'],
    default: 'blue'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les requêtes fréquentes
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ isGlobal: 1 });
notificationSchema.index({ targetUsers: 1 });
notificationSchema.index({ targetRoles: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Index composé pour les requêtes de liste paginée
notificationSchema.index({ 
  isActive: 1, 
  createdAt: -1 
});

// Index composé pour les notifications non lues
notificationSchema.index({ 
  status: 1, 
  isActive: 1, 
  createdAt: -1 
});

// Virtual pour compter les lectures
notificationSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// Virtual pour vérifier si une notification est expirée
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Méthode pour marquer comme lue par un utilisateur
notificationSchema.methods.markAsReadBy = function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId, readAt: new Date() });
  }
  return this.save();
};

// Méthode pour vérifier si une notification a été lue par un utilisateur
notificationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Méthode statique pour créer une notification système
notificationSchema.statics.createSystemNotification = function(data) {
  return this.create({
    ...data,
    isGlobal: true,
    targetRoles: ['admin', 'moderator']
  });
};

// Méthode statique pour créer une notification pour tous les utilisateurs
notificationSchema.statics.createGlobalNotification = function(data) {
  return this.create({
    ...data,
    isGlobal: true,
    targetRoles: ['user', 'moderator', 'admin']
  });
};

// Middleware pour nettoyer les notifications expirées
notificationSchema.pre('find', function() {
  this.where({ 
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
});

notificationSchema.pre('findOne', function() {
  this.where({ 
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
});

// Méthode pour nettoyer les notifications expirées (à exécuter périodiquement)
notificationSchema.statics.cleanupExpiredNotifications = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 
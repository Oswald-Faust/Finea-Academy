const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 500
  },
  instructor: {
    name: {
      type: String,
      required: true
    },
    bio: String,
    avatar: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['Finance', 'Trading', 'Crypto', 'Immobilier', 'Entrepreneuriat', 'Investissement', 'Autre']
  },
  level: {
    type: String,
    required: true,
    enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
  },
  language: {
    type: String,
    default: 'fr',
    enum: ['fr', 'en', 'es', 'de']
  },
  duration: {
    weeks: Number,
    hours: Number,
    minutes: Number,
    text: String // "8 semaines", "15 heures"
  },
  price: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'CAD']
    },
    originalPrice: Number,
    discountPercentage: Number
  },
  isFree: {
    type: Boolean,
    default: false
  },
  image: {
    url: String,
    alt: String
  },
  trailer: {
    url: String,
    duration: Number
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: String,
    order: Number,
    lessons: [{
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'exercise', 'project', 'document'],
        required: true
      },
      duration: String,
      content: String,
      videoUrl: String,
      documentUrl: String,
      order: Number,
      isFree: {
        type: Boolean,
        default: false
      }
    }]
  }],
  requirements: [String],
  whatYouWillLearn: [String],
  targetAudience: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived', 'private'],
    default: 'draft'
  },
  publishedAt: Date,
  lastUpdated: Date,
  enrollmentStats: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    activeEnrollments: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowDownloads: {
      type: Boolean,
      default: false
    },
    certificateEnabled: {
      type: Boolean,
      default: true
    },
    maxEnrollments: Number,
    enrollmentDeadline: Date,
    accessDuration: Number, // en jours
    isLive: {
      type: Boolean,
      default: false
    },
    liveStartDate: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
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

// Schema pour les inscriptions aux cours
const courseEnrollmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'suspended', 'cancelled'],
    default: 'active'
  },
  progress: {
    completedLessons: [{
      moduleIndex: Number,
      lessonIndex: Number,
      completedAt: Date
    }],
    currentModule: {
      type: Number,
      default: 0
    },
    currentLesson: {
      type: Number,
      default: 0
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number,
      default: 0 // en minutes
    }
  },
  completedAt: Date,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'free'],
    default: 'pending'
  },
  paymentDetails: {
    amount: Number,
    currency: String,
    paymentId: String,
    paidAt: Date
  }
}, {
  timestamps: true
});

// Schema pour les avis/notes
const courseReviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les performances
courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ 'price.amount': 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ 'enrollmentStats.averageRating': -1 });
courseSchema.index({ 'enrollmentStats.totalEnrollments': -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text' });

// Index pour les inscriptions
courseEnrollmentSchema.index({ course: 1, user: 1 }, { unique: true });
courseEnrollmentSchema.index({ user: 1, status: 1 });
courseEnrollmentSchema.index({ course: 1, status: 1 });
courseEnrollmentSchema.index({ enrolledAt: -1 });

// Index pour les avis
courseReviewSchema.index({ course: 1, user: 1 }, { unique: true });
courseReviewSchema.index({ course: 1, isApproved: 1 });
courseReviewSchema.index({ rating: -1 });

// Virtuals
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrollmentStats.totalEnrollments;
});

courseSchema.virtual('completionRate').get(function() {
  const { totalEnrollments, completions } = this.enrollmentStats;
  return totalEnrollments > 0 ? (completions / totalEnrollments * 100).toFixed(1) : 0;
});

courseSchema.virtual('totalDuration').get(function() {
  return this.modules.reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
});

courseSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && this.publishedAt <= new Date();
});

courseSchema.virtual('discountedPrice').get(function() {
  if (this.price.discountPercentage > 0) {
    return this.price.amount * (1 - this.price.discountPercentage / 100);
  }
  return this.price.amount;
});

// Méthodes
courseSchema.methods.updateRating = async function() {
  const CourseReview = mongoose.model('CourseReview');
  const stats = await CourseReview.aggregate([
    { $match: { course: this._id, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.enrollmentStats.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.enrollmentStats.totalReviews = stats[0].totalReviews;
  }

  return this.save();
};

courseSchema.methods.incrementEnrollment = function() {
  this.enrollmentStats.totalEnrollments += 1;
  this.enrollmentStats.activeEnrollments += 1;
  return this.save();
};

courseSchema.methods.incrementCompletion = function() {
  this.enrollmentStats.completions += 1;
  this.enrollmentStats.activeEnrollments = Math.max(0, this.enrollmentStats.activeEnrollments - 1);
  return this.save();
};

// Méthodes statiques
courseSchema.statics.findPublished = function() {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() }
  });
};

courseSchema.statics.findByCategory = function(category) {
  return this.findPublished().where({ category });
};

courseSchema.statics.findPopular = function(limit = 10) {
  return this.findPublished()
    .sort({ 'enrollmentStats.totalEnrollments': -1 })
    .limit(limit);
};

courseSchema.statics.findTopRated = function(limit = 10) {
  return this.findPublished()
    .where({ 'enrollmentStats.averageRating': { $gte: 4.0 } })
    .sort({ 'enrollmentStats.averageRating': -1 })
    .limit(limit);
};

// Middleware
courseSchema.pre('save', function(next) {
  // Générer le slug si nécessaire
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Mettre à jour lastUpdated
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }

  // Publier automatiquement si le statut change vers published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Méthodes pour les inscriptions
courseEnrollmentSchema.methods.updateProgress = function() {
  const totalLessons = this.course.modules.reduce((total, module) => total + module.lessons.length, 0);
  this.progress.progressPercentage = totalLessons > 0 ? 
    (this.progress.completedLessons.length / totalLessons * 100) : 0;
  
  if (this.progress.progressPercentage >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

module.exports = {
  Course: mongoose.model('Course', courseSchema),
  CourseEnrollment: mongoose.model('CourseEnrollment', courseEnrollmentSchema),
  CourseReview: mongoose.model('CourseReview', courseReviewSchema)
}; 
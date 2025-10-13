const mongoose = require('mongoose');

const contestStatsSchema = new mongoose.Schema({
  // Statistiques globales
  totalGains: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPlacesSold: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWinners: {
    type: Number,
    default: 0,
    min: 0
  },
  totalContests: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Statistiques par période
  monthlyStats: [{
    month: {
      type: String,
      required: true // Format: "YYYY-MM"
    },
    gains: {
      type: Number,
      default: 0
    },
    placesSold: {
      type: Number,
      default: 0
    },
    winners: {
      type: Number,
      default: 0
    },
    contests: {
      type: Number,
      default: 0
    }
  }],
  
  // Métadonnées
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'admin'
  },
  
  // Configuration
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les requêtes
contestStatsSchema.index({ lastUpdated: -1 });
contestStatsSchema.index({ 'monthlyStats.month': 1 });

// Méthodes statiques
contestStatsSchema.statics.getCurrentStats = function() {
  return this.findOne({ isActive: true }).sort({ lastUpdated: -1 });
};

contestStatsSchema.statics.updateGlobalStats = function(stats) {
  return this.findOneAndUpdate(
    { isActive: true },
    {
      $set: {
        totalGains: stats.totalGains || 0,
        totalPlacesSold: stats.totalPlacesSold || 0,
        totalWinners: stats.totalWinners || 0,
        lastUpdated: new Date(),
        updatedBy: 'admin'
      }
    },
    { upsert: true, new: true }
  );
};

contestStatsSchema.statics.addMonthlyStats = function(month, stats) {
  return this.findOneAndUpdate(
    { isActive: true },
    {
      $push: {
        monthlyStats: {
          month,
          gains: stats.gains || 0,
          placesSold: stats.placesSold || 0,
          winners: stats.winners || 0,
          contests: stats.contests || 0
        }
      },
      $set: {
        lastUpdated: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('ContestStats', contestStatsSchema);

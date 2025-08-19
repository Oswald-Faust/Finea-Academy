const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['article', 'newsletter'],
    default: 'article'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index composé pour éviter les doublons
favoritesSchema.index({ user: 1, article: 1 }, { unique: true });

// Index pour optimiser les requêtes
favoritesSchema.index({ user: 1, type: 1 });
favoritesSchema.index({ addedAt: -1 });

// Méthode statique pour ajouter un favori
favoritesSchema.statics.addFavorite = async function(userId, articleId, type = 'article') {
  try {
    const favorite = new this({
      user: userId,
      article: articleId,
      type
    });
    await favorite.save();
    return favorite;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Cet article est déjà dans vos favoris');
    }
    throw error;
  }
};

// Méthode statique pour retirer un favori
favoritesSchema.statics.removeFavorite = async function(userId, articleId) {
  const result = await this.deleteOne({
    user: userId,
    article: articleId
  });
  return result.deletedCount > 0;
};

// Méthode statique pour vérifier si un article est en favori
favoritesSchema.statics.isFavorite = async function(userId, articleId) {
  const favorite = await this.findOne({
    user: userId,
    article: articleId
  });
  return !!favorite;
};

// Méthode statique pour récupérer tous les favoris d'un utilisateur
favoritesSchema.statics.getUserFavorites = async function(userId, type = null) {
  const filter = { user: userId };
  if (type) filter.type = type;
  
  return await this.find(filter)
    .populate('article')
    .sort({ addedAt: -1 });
};

// Méthode statique pour récupérer les statistiques des favoris
favoritesSchema.statics.getFavoritesStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        type: '$_id',
        totalFavorites: '$count',
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Favorites', favoritesSchema);

const cloudflareService = require('../services/cloudflareService');

// Middleware d'upload pour les articles/newsletters
const uploadArticleImage = cloudflareService.getMulterConfig('articles');

// Middleware d'upload pour les avatars
const uploadAvatar = cloudflareService.getMulterConfig('avatars');

// Middleware d'upload pour les images générales
const uploadImage = cloudflareService.getMulterConfig('images');

// Middleware pour désactiver les uploads si Cloudflare n'est pas configuré
const cloudflareUploadHandler = (req, res, next) => {
  if (!process.env.CLOUDFLARE_R2_ENDPOINT || !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    return res.status(501).json({
      success: false,
      message: 'Cloudflare R2 non configuré. Veuillez configurer les variables d\'environnement.',
      suggestion: 'Ajoutez CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID, etc. dans votre fichier .env'
    });
  }
  next();
};

module.exports = {
  uploadArticleImage,
  uploadAvatar,
  uploadImage,
  cloudflareUploadHandler,
  cloudflareService
};

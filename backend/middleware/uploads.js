const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration des dossiers uploads
const getUploadConfig = (subfolder = '') => {
  const baseDir = process.env.VERCEL ? '/tmp/uploads' : './uploads';
  const fullDir = subfolder ? path.join(baseDir, subfolder) : baseDir;
  
  // Créer le dossier seulement si on n'est pas sur Vercel
  if (!process.env.VERCEL && !fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  
  return fullDir;
};

// Storage pour les articles
const articleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = getUploadConfig('articles');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage pour les avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = getUploadConfig('avatars');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configuration multer commune
const commonConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  },
};

// Exports des configurations
const uploadArticleImage = multer({
  storage: articleStorage,
  ...commonConfig,
});

const uploadAvatar = multer({
  storage: avatarStorage,
  ...commonConfig,
});

// Middleware pour désactiver les uploads sur Vercel si nécessaire
const vercelUploadHandler = (req, res, next) => {
  if (process.env.VERCEL && process.env.DISABLE_UPLOADS === 'true') {
    return res.status(501).json({
      success: false,
      message: 'Les uploads de fichiers sont temporairement désactivés en production.',
      suggestion: 'Utilisez un service cloud comme Cloudinary ou AWS S3 pour les uploads en production.'
    });
  }
  next();
};

module.exports = {
  uploadArticleImage,
  uploadAvatar,
  vercelUploadHandler,
  getUploadConfig
};
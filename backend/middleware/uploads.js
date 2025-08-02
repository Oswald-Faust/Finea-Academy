const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration des uploads pour déploiement manuel
const getUploadConfig = (subfolder = '') => {
  const baseDir = './uploads';
  const fullDir = path.join(baseDir, subfolder);
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullDir);
    },
    filename: function (req, file, cb) {
      // Générer un nom unique pour éviter les collisions
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension);
      const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
      cb(null, sanitizedBaseName + '-' + uniqueSuffix + extension);
    }
  });

  const fileFilter = (req, file, cb) => {
    // Types de fichiers autorisés
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seules les images sont acceptées.'), false);
    }
  };

  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
      files: 5 // Maximum 5 fichiers
    },
    fileFilter: fileFilter
  });
};

module.exports = {
  getUploadConfig
};
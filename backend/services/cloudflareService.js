const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

class CloudflareService {
  constructor() {
    // Configuration Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto', // Cloudflare R2 utilise 'auto' comme région
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL; // URL publique de votre bucket
  }

  /**
   * Upload un fichier vers Cloudflare R2
   * @param {Buffer} fileBuffer - Buffer du fichier
   * @param {string} fileName - Nom du fichier
   * @param {string} contentType - Type MIME du fichier
   * @param {string} folder - Dossier de destination (optionnel)
   * @returns {Promise<Object>} - URL publique et métadonnées du fichier
   */
  async uploadFile(fileBuffer, fileName, contentType, folder = '') {
    try {
      const key = folder ? `${folder}/${fileName}` : fileName;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read', // Rendre le fichier public
      });

      await this.s3Client.send(command);

      const publicUrl = `${this.publicUrl}/${key}`;
      
      return {
        success: true,
        url: publicUrl,
        key: key,
        fileName: fileName,
        contentType: contentType,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload vers Cloudflare R2:', error);
      throw new Error(`Erreur upload Cloudflare: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier de Cloudflare R2
   * @param {string} key - Clé du fichier à supprimer
   * @returns {Promise<boolean>} - Succès de la suppression
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return false;
    }
  }

  /**
   * Génère une URL signée pour un fichier privé
   * @param {string} key - Clé du fichier
   * @param {number} expiresIn - Durée d'expiration en secondes (défaut: 3600)
   * @returns {Promise<string>} - URL signée
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL signée:', error);
      throw error;
    }
  }

  /**
   * Extrait la clé d'un fichier à partir de son URL publique
   * @param {string} url - URL publique du fichier
   * @returns {string} - Clé du fichier
   */
  extractKeyFromUrl(url) {
    if (!url.includes(this.publicUrl)) {
      throw new Error('URL non valide pour ce bucket');
    }
    return url.replace(`${this.publicUrl}/`, '');
  }

  /**
   * Configuration Multer pour Cloudflare R2
   * @param {string} folder - Dossier de destination
   * @returns {Object} - Configuration Multer
   */
  getMulterConfig(folder = '') {
    return multer({
      storage: multerS3({
        s3: this.s3Client,
        bucket: this.bucketName,
        key: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileName = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
          const key = folder ? `${folder}/${fileName}` : fileName;
          cb(null, key);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: (req, file, cb) => {
          cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          });
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Seules les images sont autorisées'), false);
        }
      },
    });
  }

  /**
   * Upload direct depuis un buffer (pour les API)
   * @param {Object} file - Objet fichier de Multer
   * @param {string} folder - Dossier de destination
   * @returns {Promise<Object>} - Résultat de l'upload
   */
  async uploadFromMulterFile(file, folder = '') {
    try {
      const fileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const publicUrl = `${this.publicUrl}/${key}`;

      return {
        success: true,
        url: publicUrl,
        key: key,
        fileName: fileName,
        originalName: file.originalname,
        contentType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload depuis Multer:', error);
      throw error;
    }
  }
}

// Instance singleton
const cloudflareService = new CloudflareService();

module.exports = cloudflareService;

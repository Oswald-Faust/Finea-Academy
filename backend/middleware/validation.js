const { body } = require('express-validator');

// Validation pour l'inscription
const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide')
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis')
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Veuillez entrer un numéro de téléphone français valide (ex: 0612345678 ou +33612345678)'),
];

// Validation pour la connexion
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

// Validation pour le mot de passe oublié
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
];

// Validation pour la réinitialisation du mot de passe
const validateResetPassword = [
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
];

// Validation pour la mise à jour du mot de passe
const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le nouveau mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
];

// Validation pour la mise à jour du profil utilisateur
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
  
  body('phone')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Veuillez entrer un numéro de téléphone français valide'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('La ville ne peut contenir que des lettres, espaces et tirets'),
  
  body('address.postalCode')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Le code postal doit contenir exactement 5 chiffres'),
  
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),
];

// Validation pour les préférences utilisateur
const validateUpdatePreferences = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('La notification email doit être un booléen'),
  
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('La notification push doit être un booléen'),
  
  body('notifications.marketing')
    .optional()
    .isBoolean()
    .withMessage('La notification marketing doit être un booléen'),
  
  body('language')
    .optional()
    .isIn(['fr', 'en', 'es'])
    .withMessage('La langue doit être fr, en ou es'),
  
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Le thème doit être light, dark ou auto'),
];

// Validation pour l'envoi d'email
const validateSendEmail = [
  body('to')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email destinataire valide'),
  
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Le sujet doit contenir entre 1 et 200 caractères'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Le message doit contenir entre 1 et 5000 caractères'),
];

// Validation pour les articles de blog
const validateNewsletter = (req, res, next) => {
  const { title, content, type } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Le titre est requis'
    });
  }

  if (title.length > 300) {
    return res.status(400).json({
      success: false,
      error: 'Le titre ne peut pas dépasser 300 caractères'
    });
  }

  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Le contenu est requis'
    });
  }

  // Vérifier que le contenu est un JSON valide pour Editor.js
  try {
    const parsedContent = JSON.parse(content);
    if (!parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
      return res.status(400).json({
        success: false,
        error: 'Le contenu doit être au format Editor.js valide'
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Le contenu doit être un JSON valide'
    });
  }

  if (type && !['newsletter', 'article', 'blog'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Le type doit être newsletter, article ou blog'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
  validateUpdateProfile,
  validateUpdatePreferences,
  validateSendEmail,
  validateNewsletter
}; 
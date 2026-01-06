const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendVerificationEmail, 
  sendLoginNotificationEmail 
} = require('../services/emailService');
const { addUserRegistrationToSheet } = require('../services/googleSheetsService');

// Fonction utilitaire pour envoyer une réponse avec token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array(),
      });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un compte avec cet email existe déjà',
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    // Générer un token de vérification d'email
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Envoyer l'email de bienvenue (en arrière-plan, sans bloquer la réponse)
    // Lancer les envois d'emails en arrière-plan sans attendre
    sendWelcomeEmail(user).catch((emailError) => {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError.message);
    });
    
    sendVerificationEmail(user, verificationToken).catch((emailError) => {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError.message);
    });

    // Ajouter l'inscription au Google Sheet (en arrière-plan, sans bloquer la réponse)
    addUserRegistrationToSheet({
      firstName,
      lastName,
      email,
      phone,
    }).catch((sheetError) => {
      console.error('Erreur lors de l\'ajout au Google Sheet:', sheetError.message);
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    next(error);
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe et récupérer le mot de passe
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé',
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    
    // Sauvegarder seulement si l'utilisateur a tous les champs requis
    try {
    await user.save();
    } catch (saveError) {
      // Si la sauvegarde échoue à cause de champs manquants, continuer quand même
      console.warn('Erreur lors de la sauvegarde de lastLogin:', saveError.message);
    }

    // Envoyer notification de connexion (en arrière-plan, sans bloquer la réponse)
    if (user.preferences.notifications.email) {
      // Lancer l'envoi en arrière-plan sans attendre
      const loginInfo = {
        date: new Date().toLocaleString('fr-FR'),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Non disponible',
      };
      
      // Ne pas attendre l'envoi d'email - lancer en arrière-plan
      sendLoginNotificationEmail(user, loginInfo).catch((emailError) => {
        console.error('Erreur lors de l\'envoi de la notification:', emailError.message);
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    next(error);
  }
};

// @desc    Déconnexion utilisateur
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array(),
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    // Générer le token de réinitialisation
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Envoyer l'email de réinitialisation (en arrière-plan)
    sendPasswordResetEmail(user, resetToken).catch((emailError) => {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', emailError.message);
    });
    
    // Répondre immédiatement sans attendre l'email
    res.status(200).json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    next(error);
  }
};

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array(),
      });
    }

    // Hasher le token de réinitialisation
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token invalide ou expiré',
      });
    }

    // Définir le nouveau mot de passe
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    next(error);
  }
};

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array(),
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Vérifier le mot de passe actuel
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect',
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    next(error);
  }
};

// @desc    Vérifier l'email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    // Hasher le token de vérification
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token invalide ou expiré',
      });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    next(error);
  }
};

// @desc    Renvoyer l'email de vérification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email déjà vérifié',
      });
    }

    // Générer un nouveau token de vérification
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Envoyer l'email de vérification (en arrière-plan)
    sendVerificationEmail(user, verificationToken).catch((emailError) => {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError.message);
    });
    
    // Répondre immédiatement sans attendre l'email
    res.status(200).json({
      success: true,
      message: 'Email de vérification renvoyé',
    });
  } catch (error) {
    console.error('Erreur lors du renvoi de la vérification:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerification,
}; 
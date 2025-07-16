const express = require('express');
const { sendEmail } = require('../services/emailService');
const { protect, authorize } = require('../middleware/auth');
const { validateSendEmail } = require('../middleware/validation');
const { validationResult } = require('express-validator');

const router = express.Router();

// Routes avec authentification requise
router.use(protect);

// @desc    Envoyer un email générique
// @route   POST /api/email/send
// @access  Private/Admin
router.post('/send', authorize('admin'), validateSendEmail, async (req, res, next) => {
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

    const { to, subject, message } = req.body;

    // Créer le HTML de l'email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #000D64; font-size: 32px; margin: 0;">Finéa Académie</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #000D64; margin-top: 0;">${subject}</h2>
          <div style="color: #666; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
            ${message}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>© 2024 Finéa Académie. Tous droits réservés.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to,
      subject,
      html,
      text: message,
    });

    res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email',
    });
  }
});

// @desc    Envoyer un email de newsletter
// @route   POST /api/email/newsletter
// @access  Private/Admin
router.post('/newsletter', authorize('admin'), async (req, res, next) => {
  try {
    const { subject, message, targetUsers } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Sujet et message requis',
      });
    }

    // Récupérer les utilisateurs cibles
    const User = require('../models/User');
    let query = { isActive: true };
    
    if (targetUsers && targetUsers.length > 0) {
      query._id = { $in: targetUsers };
    }

    const users = await User.find(query).select('email firstName');

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun utilisateur trouvé',
      });
    }

    // Envoyer les emails en lot
    const emailPromises = users.map(user => {
      const personalizedMessage = message.replace(/\{firstName\}/g, user.firstName);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000D64; font-size: 32px; margin: 0;">Finéa Académie</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #000D64; margin-top: 0;">${subject}</h2>
            <div style="color: #666; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
              ${personalizedMessage}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
            <p>© 2024 Finéa Académie. Tous droits réservés.</p>
          </div>
        </div>
      `;

      return sendEmail({
        to: user.email,
        subject,
        html,
        text: personalizedMessage,
      });
    });

    await Promise.all(emailPromises);

    res.status(200).json({
      success: true,
      message: `Newsletter envoyée à ${users.length} utilisateurs`,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de la newsletter',
    });
  }
});

module.exports = router; 
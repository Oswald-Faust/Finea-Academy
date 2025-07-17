const express = require('express');
const { sendEmail } = require('../services/emailService');
const { validateSendEmail } = require('../middleware/validation');
const { validationResult } = require('express-validator');

const router = express.Router();

// Routes publiques - aucune authentification requise

// @desc    Envoyer un email générique
// @route   POST /api/email/send
// @access  Public
router.post('/send', validateSendEmail, async (req, res, next) => {
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
// @access  Public
router.post('/newsletter', async (req, res, next) => {
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

// @desc    Récupérer l'historique des newsletters
// @route   GET /api/email/newsletter/history
// @access  Public
router.get('/newsletter/history', async (req, res) => {
  try {
    // Pour l'instant, retourner des données fictives
    // TODO: Implémenter un modèle de newsletter pour stocker l'historique
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          subject: 'Bienvenue dans Finéa Académie',
          sentAt: new Date(Date.now() - 86400000).toISOString(),
          recipientCount: 150,
          status: 'sent'
        },
        {
          id: 2,
          subject: 'Nouvelles formations disponibles',
          sentAt: new Date(Date.now() - 172800000).toISOString(),
          recipientCount: 142,
          status: 'sent'
        }
      ]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
});

// @desc    Récupérer les templates d'email
// @route   GET /api/email/templates
// @access  Public
router.get('/templates', async (req, res) => {
  try {
    // Templates d'email prédéfinis
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Newsletter de bienvenue',
          subject: 'Bienvenue dans Finéa Académie',
          content: 'Bonjour {firstName},\n\nNous sommes ravis de vous accueillir dans la communauté Finéa Académie !\n\nCordialement,\nL\'équipe Finéa'
        },
        {
          id: 2,
          name: 'Nouvelle formation',
          subject: 'Nouvelle formation disponible !',
          content: 'Cher {firstName},\n\nUne nouvelle formation vient d\'être ajoutée à notre catalogue.\n\nDécouvrez-la dès maintenant sur notre plateforme.\n\nÀ bientôt !'
        }
      ]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des templates'
    });
  }
});

module.exports = router; 
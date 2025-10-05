const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Fonction pour envoyer un email générique
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Template pour l'email de bienvenue
const sendWelcomeEmail = async (user) => {
  const subject = 'Bienvenue sur Finéa Académie !';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000D64; font-size: 32px; margin: 0;">Finéa Académie</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #000D64; margin-top: 0;">Bienvenue ${user.firstName} !</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Votre compte a été créé avec succès. Vous pouvez maintenant accéder à toutes nos formations et ressources.
        </p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #000D64;">Que faire maintenant ?</h3>
        <ul style="color: #666; font-size: 16px; line-height: 1.6;">
          <li>Complétez votre profil</li>
          <li>Explorez nos formations</li>
          <li>Rejoignez notre communauté</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}" style="background-color: #000D64; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Accéder à mon compte
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
        <p>© 2024 Finéa Académie. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

// Template pour l'email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const subject = 'Réinitialisation de votre mot de passe';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000D64; font-size: 32px; margin: 0;">Finéa Académie</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #000D64; margin-top: 0;">Réinitialisation de mot de passe</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Bonjour ${user.firstName},
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #000D64; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <p style="color: #856404; font-size: 14px; margin: 0;">
          <strong>Important :</strong> Ce lien est valide pendant 10 minutes seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
        <p>© 2024 Finéa Académie. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

// Template pour l'email de vérification
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const subject = 'Vérifiez votre adresse email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000D64; font-size: 32px; margin: 0;">Finéa Académie</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #000D64; margin-top: 0;">Vérification de votre email</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Bonjour ${user.firstName},
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Merci de vous être inscrit ! Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #000D64; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Vérifier mon email
        </a>
      </div>
      
      <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <p style="color: #155724; font-size: 14px; margin: 0;">
          <strong>Info :</strong> Ce lien est valide pendant 24 heures.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
        <p>© 2024 Finéa Académie. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

// Template pour l'email de notification de connexion
const sendLoginNotificationEmail = async (user, loginInfo) => {
  const subject = 'Nouvelle connexion à votre compte';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000D64; font-size: 32px; margin: 0;">Finéa Académie</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #000D64; margin-top: 0;">Nouvelle connexion détectée</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Bonjour ${user.firstName},
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Une nouvelle connexion a été détectée sur votre compte :
        </p>
        <ul style="color: #666; font-size: 16px; line-height: 1.6;">
          <li><strong>Date :</strong> ${loginInfo.date}</li>
          <li><strong>Adresse IP :</strong> ${loginInfo.ip}</li>
          <li><strong>Navigateur :</strong> ${loginInfo.userAgent}</li>
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <p style="color: #856404; font-size: 14px; margin: 0;">
          <strong>Si ce n'était pas vous :</strong> Changez immédiatement votre mot de passe et contactez notre support.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
        <p>© 2024 Finéa Académie. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendLoginNotificationEmail,
}; 
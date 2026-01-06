const axios = require('axios');

/**
 * Service pour ajouter les inscriptions au Google Sheet via Google Apps Script
 * Solution simple sans authentification complexe
 */

// URL du Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylAdQAzPJ4eaMaX1lPI-UVolMlmCdhrJ5JENJ2kLvmXcFkFEaJjx1pMuwn3ZBUcvs/exec';

/**
 * Ajouter une ligne au Google Sheet lors de l'inscription d'un utilisateur
 * 
 * @param {Object} userData - Les données de l'utilisateur
 * @param {string} userData.firstName - Prénom
 * @param {string} userData.lastName - Nom
 * @param {string} userData.email - Email
 * @param {string} userData.phone - Téléphone (optionnel)
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
const addUserRegistrationToSheet = async (userData) => {
  try {
    console.log('📝 Envoi des données d\'inscription au Google Sheet...');
    
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: 'register',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 secondes timeout
    });

    if (response.data && response.data.success) {
      console.log(`✅ Inscription ajoutée au Google Sheet: ${userData.email}`);
      return true;
    } else {
      console.error('❌ Erreur retournée par Google Script:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout au Google Sheet:', error.message);
    // Ne pas bloquer l'inscription si Google Sheets échoue
    return false;
  }
};

/**
 * Enregistrer une demande de RDV téléphonique dans le Google Sheet
 * Met à jour la colonne M (Demande de contact) avec "OUI" pour l'utilisateur
 * 
 * @param {Object} userData - Les données de l'utilisateur
 * @param {string} userData.email - Email de l'utilisateur (pour identifier la ligne)
 * @param {string} userData.firstName - Prénom (optionnel, si l'utilisateur n'existe pas encore)
 * @param {string} userData.lastName - Nom (optionnel)
 * @param {string} userData.phone - Téléphone (optionnel)
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
const requestPhoneCall = async (userData) => {
  try {
    console.log('📞 Enregistrement de la demande de RDV téléphonique...');
    
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: 'requestCallback',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data && response.data.success) {
      console.log(`✅ Demande de RDV enregistrée pour: ${userData.email}`);
      return true;
    } else {
      console.error('❌ Erreur retournée par Google Script:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de la demande de RDV:', error.message);
    return false;
  }
};

module.exports = {
  addUserRegistrationToSheet,
  requestPhoneCall,
};

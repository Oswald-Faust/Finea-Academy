/**
 * Script pour nettoyer les anciens tokens FCM invalides de la base de données
 * Les tokens OneSignal doivent être des UUIDs valides
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Regex pour vérifier les UUIDs OneSignal (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function cleanInvalidTokens() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les utilisateurs avec des tokens
    const users = await User.find({ 'fcmTokens.0': { $exists: true } });

    let totalRemoved = 0;
    let usersAffected = 0;

    for (const user of users) {
      const validTokens = [];
      let removed = 0;

      for (const tokenObj of user.fcmTokens) {
        // Garder uniquement les tokens qui sont des UUIDs valides
        if (uuidRegex.test(tokenObj.token)) {
          validTokens.push(tokenObj);
        } else {
          removed++;
          console.log(`  ❌ Token invalide supprimé pour ${user.email}: ${tokenObj.token.substring(0, 30)}...`);
        }
      }

      if (removed > 0) {
        user.fcmTokens = validTokens;
        await user.save();
        totalRemoved += removed;
        usersAffected++;
        console.log(`✅ ${user.email}: ${removed} token(s) invalide(s) supprimé(s)`);
      }
    }

    console.log(`\n📊 Résumé du nettoyage:`);
    console.log(`   - Utilisateurs affectés: ${usersAffected}`);
    console.log(`   - Tokens invalides supprimés: ${totalRemoved}`);
    console.log(`\n✅ Nettoyage terminé !`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

cleanInvalidTokens();


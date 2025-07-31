#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration Vercel
 * Utilise: node test-vercel-config.js
 */

console.log('🔍 Vérification de la configuration Vercel...\n');

// Variables d'environnement requises
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'EMAIL_HOST',
  'EMAIL_PORT', 
  'EMAIL_USER',
  'EMAIL_PASS',
  'NODE_ENV'
];

// Variables optionnelles
const optionalEnvVars = [
  'PORT',
  'FRONTEND_URL',
  'FLUTTER_APP_URL',
  'VERCEL_URL'
];

let allGood = true;
let warnings = [];

console.log('📋 Variables d\'environnement requises:');
console.log('=====================================');

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Masquer les valeurs sensibles
    const displayValue = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_PASS'].includes(varName) 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: MANQUANT`);
    allGood = false;
  }
});

console.log('\n📋 Variables d\'environnement optionnelles:');
console.log('==========================================');

optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: non défini`);
    warnings.push(`${varName} n'est pas défini (optionnel)`);
  }
});

// Vérifications spécifiques
console.log('\n🔧 Vérifications spécifiques:');
console.log('=============================');

// Vérifier la longueur du JWT_SECRET
if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET.length >= 32) {
    console.log('✅ JWT_SECRET: longueur suffisante');
  } else {
    console.log('⚠️  JWT_SECRET: trop court (minimum 32 caractères recommandé)');
    warnings.push('JWT_SECRET devrait faire au moins 32 caractères');
  }
}

// Vérifier le format MongoDB URI
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    console.log('✅ MONGODB_URI: format valide');
  } else {
    console.log('❌ MONGODB_URI: format invalide');
    allGood = false;
  }
}

// Vérifier NODE_ENV
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV: configuré pour la production');
} else {
  console.log(`⚠️  NODE_ENV: ${process.env.NODE_ENV || 'non défini'} (devrait être "production" sur Vercel)`);
  warnings.push('NODE_ENV devrait être "production" sur Vercel');
}

// Résumé
console.log('\n📊 Résumé:');
console.log('==========');

if (allGood) {
  console.log('🎉 Toutes les variables requises sont présentes!');
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} avertissement(s):`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('\n✅ Prêt pour le déploiement Vercel!');
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Assurez-vous que MongoDB Atlas autorise les connexions Vercel');
  console.log('2. Déployez sur Vercel');
  console.log('3. Testez https://finea-backend.vercel.app/api/health');
  
} else {
  console.log('❌ Configuration incomplète!');
  console.log('\n🔧 Actions requises:');
  console.log('1. Ajoutez les variables manquantes dans Vercel Dashboard');
  console.log('2. Allez dans Settings > Environment Variables');
  console.log('3. Ajoutez chaque variable manquante');
  console.log('4. Redéployez l\'application');
  
  process.exit(1);
}

console.log('\n📚 Documentation complète: backend/VERCEL_DEPLOYMENT.md');
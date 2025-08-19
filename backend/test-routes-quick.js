const express = require('express');
const contestsRoutes = require('./routes/contests');

// Créer une mini-app Express pour tester les routes
const app = express();
app.use('/api/contests', contestsRoutes);

// Afficher toutes les routes enregistrées
console.log('🔍 Routes enregistrées dans /api/contests:');
console.log('==========================================');

// Parcourir le router pour afficher les routes
const routes = [];
contestsRoutes.stack.forEach((middleware) => {
  if (middleware.route) {
    // Route simple
    const methods = Object.keys(middleware.route.methods);
    methods.forEach(method => {
      routes.push({
        method: method.toUpperCase(),
        path: middleware.route.path
      });
    });
  } else if (middleware.name === 'router') {
    // Router imbriqué
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const methods = Object.keys(handler.route.methods);
        methods.forEach(method => {
          routes.push({
            method: method.toUpperCase(),
            path: handler.route.path
          });
        });
      }
    });
  }
});

// Afficher les routes dans l'ordre
routes.forEach((route, index) => {
  console.log(`${index + 1}. ${route.method.padEnd(6)} /api/contests${route.path}`);
});

console.log('\n✅ Test des routes terminé !');
console.log('Les routes /weekly/* doivent apparaître AVANT /:id');

const serverless = require('serverless-http');
const path = require('path');

// Importer le serveur Express existant
const app = require('../../backend/server');

// Exporter la fonction serverless
module.exports.handler = serverless(app); 
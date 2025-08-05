const https = require('https');

// Test de l'API d'inscription avec données complètes
const testRegistration = () => {
  const data = JSON.stringify({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@finea.com',
    password: 'Password123!',
    phone: '+33123456789'
  });

  const options = {
    hostname: 'finea-api-production.up.railway.app',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Response:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        console.log('Parsed response:', parsed);
        
        if (parsed.success) {
          console.log('✅ Inscription réussie !');
          console.log('Token:', parsed.token ? 'Présent' : 'Absent');
          console.log('User:', parsed.user ? 'Présent' : 'Absent');
        } else {
          console.log('❌ Erreur d\'inscription:', parsed.error);
          if (parsed.details) {
            console.log('Détails:', parsed.details);
          }
        }
      } catch (e) {
        console.log('Could not parse JSON response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e);
  });

  req.write(data);
  req.end();
};

console.log('🧪 Test d\'inscription utilisateur avec données complètes...');
testRegistration(); 
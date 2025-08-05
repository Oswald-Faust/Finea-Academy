const https = require('https');

// Test de l'API d'inscription
const testRegistration = () => {
  const data = JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@finea.com',
    password: 'password123'
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
    console.log(`Headers:`, res.headers);

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
        } else {
          console.log('❌ Erreur d\'inscription:', parsed.error);
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

console.log('🧪 Test d\'inscription utilisateur...');
testRegistration(); 
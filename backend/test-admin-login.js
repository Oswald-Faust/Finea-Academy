const https = require('https');

// Test de connexion admin
const testAdminLogin = () => {
  const data = JSON.stringify({
    email: 'admin@finea.com',
    password: 'Admin123!'
  });

  const options = {
    hostname: 'finea-api-production.up.railway.app',
    port: 443,
    path: '/api/auth/login',
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
          console.log('✅ Connexion admin réussie !');
          console.log('🔑 Token:', parsed.token ? 'Présent' : 'Absent');
          console.log('👤 User Role:', parsed.user?.role);
          console.log('📧 Email:', parsed.user?.email);
        } else {
          console.log('❌ Erreur de connexion:', parsed.error);
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

console.log('🧪 Test de connexion admin...');
testAdminLogin(); 
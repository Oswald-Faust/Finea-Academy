const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://finea-api.cloud/api';

async function testUpload() {
  console.log('🚀 Testing Upload to VPS...');

  // Create a dummy image file if it doesn't exist
  const dummyImagePath = path.join(__dirname, 'test-image.jpg');
  if (!fs.existsSync(dummyImagePath)) {
    fs.writeFileSync(dummyImagePath, 'dummy image content');
  }

  const form = new FormData();
  form.append('title', 'Test Upload Article');
  form.append('content', '<p>Test content</p>');
  form.append('type', 'article');
  form.append('status', 'draft');
  form.append('coverImage', fs.createReadStream(dummyImagePath));

  try {
    const response = await axios.post(`${BASE_URL}/newsletters`, form, {
      headers: {
        ...form.getHeaders(),
      },
      validateStatus: () => true // Don't throw on error status
    });

    console.log(`\nStatus Code: ${response.status}`);
    console.log('Response Body:', JSON.stringify(response.data, null, 2));

    if (response.status === 500) {
        console.log('\n❌ RECEIVED 500. This confirms the issue.');
        if (response.data.error && response.data.error.includes('Unauthorized')) {
            console.log('💡 "Unauthorized" error usually means Cloudflare R2 credentials are wrong or expired.');
        }
    } else if (response.status === 201) {
        console.log('✅ Upload successful!');
    }

  } catch (error) {
    console.error('Network Error:', error.message);
  } finally {
      // Cleanup
      if (fs.existsSync(dummyImagePath)) {
          fs.unlinkSync(dummyImagePath);
      }
  }
}

testUpload();

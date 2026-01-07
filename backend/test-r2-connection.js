const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Force reload cloudflareService after env is loaded
delete require.cache[require.resolve('./services/cloudflareService')];
const cloudflareService = require('./services/cloudflareService');
const fs = require('fs');

async function testR2() {
  console.log('🚀 Testing Cloudflare R2 Connection...');
  console.log('Endpoint:', process.env.CLOUDFLARE_R2_ENDPOINT);
  console.log('Bucket:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
  console.log('Public URL:', process.env.CLOUDFLARE_R2_PUBLIC_URL);

  if (!cloudflareService.isConfigured) {
    console.error('❌ Cloudflare Service is NOT configured (missing env vars)');
    return;
  }

  const dummyFileName = 'test-r2-upload.txt';
  const dummyFilePath = path.join(__dirname, dummyFileName);
  fs.writeFileSync(dummyFilePath, 'Hello R2 from Finea Academy!');

  try {
    const fileBuffer = fs.readFileSync(dummyFilePath);
    
    console.log('\n📤 Attempting upload...');
    const result = await cloudflareService.uploadFile(
      fileBuffer, 
      dummyFileName, 
      'text/plain', 
      'tests'
    );
    
    console.log('✅ Upload Successful!');
    console.log('URL:', result.url);
    
    // Optional: Delete the file after
    // console.log('\n🗑️ Deleting test file...');
    // await cloudflareService.deleteFile(result.key);
    // console.log('✅ Delete Successful!');

  } catch (error) {
    console.error('❌ Error testing R2:', error);
    if (error.message.includes('Unauthorized')) {
        console.error('💡 This indicates invalid credentials.');
    }
  } finally {
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  }
}

testR2();

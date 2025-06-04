require('dotenv').config({ path: __dirname + '/../.env' });
const https = require('https');
//const dns = require('dns').promises;

// Configure DNS to use Google's public DNS
//dns.setServers(['8.8.8.8', '8.8.4.4']);

const testConnection = async () => {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    console.error('BOT_TOKEN not found in environment variables');
    process.exit(1);
  }

  try {
    console.log('Using DNS servers:', dns.getServers());
    const addresses = await dns.resolve4('api.telegram.org');
    console.log('Resolved IP addresses:', addresses);

    const options = {
      hostname: addresses[0],
      servername: 'api.telegram.org', // Important for SSL verification
      port: 443,
      path: `/bot${botToken}/getMe`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', data);
      });
    });

    req.on('error', (error) => {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    });

    req.end();
  } catch (error) {
    console.error('Error:', error);
  }
};

testConnection(); 
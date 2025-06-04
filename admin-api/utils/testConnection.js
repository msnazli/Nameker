require('dotenv').config();
const { createBot } = require('../config/telegram');

async function testConnection() {
  try {
    const bot = createBot();
    
    // Test the connection by getting bot info
    const botInfo = await bot.telegram.getMe();
    console.log('Connection successful! Bot info:', botInfo);
    
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 
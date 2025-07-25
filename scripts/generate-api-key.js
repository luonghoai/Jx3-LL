#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate a secure API key for Discord bot integration
 */
function generateApiKey() {
  // Generate 32 random bytes and convert to hex string
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  console.log('🔑 Generated API Key for Discord Bot Integration');
  console.log('=' .repeat(50));
  console.log(`API Key: ${apiKey}`);
  console.log('=' .repeat(50));
  console.log('');
  console.log('📝 Instructions:');
  console.log('1. Copy the API key above');
  console.log('2. Add it to your .env file:');
  console.log(`   DISCORD_BOT_API_KEY=${apiKey}`);
  console.log('3. Add it to your Python bot environment variables');
  console.log('4. Keep this key secure and don\'t share it publicly');
  console.log('');
  console.log('⚠️  Security Notes:');
  console.log('- This key should be kept secret');
  console.log('- Use different keys for development and production');
  console.log('- Rotate the key periodically for security');
  
  return apiKey;
}

// Generate and display the API key
generateApiKey(); 
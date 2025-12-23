import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { startTelegramBot } from './bot.js';

console.log('🚀 Starting Telegram Bot...');
console.log('📍 DeepSeek API:', process.env.DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('📍 Telegram Token:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing');

if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'your_token_here') {
  console.error('\n❌ Please set your TELEGRAM_BOT_TOKEN in .env.local');
  console.error('   Get it from @BotFather on Telegram\n');
  process.exit(1);
}

startTelegramBot();

import TelegramBot from 'node-telegram-bot-api';
import * as path from 'path';
import * as fs from 'fs';
import { personas, getPersonaById } from '../personas/index.js';
import { getUserProfilePrompt } from '../config/user-profile.js';

// Types
interface ChatSession {
  personaId: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  imageCounters: { [context: string]: number }; // Track image cycling
}

// Store user sessions (personaId + chat history per user)
const userSessions: Map<number, ChatSession> = new Map();

// Get image path for a persona
function getImagePath(
  personaId: string,
  context: string,
  maxCount: number,
  randomize: boolean,
  session: ChatSession
): string | null {
  // Initialize counter if not exists
  if (!session.imageCounters[context]) {
    session.imageCounters[context] = 0;
  }

  let imageNumber: number;
  if (randomize) {
    imageNumber = Math.floor(Math.random() * maxCount) + 1;
  } else {
    session.imageCounters[context] = (session.imageCounters[context] % maxCount) + 1;
    imageNumber = session.imageCounters[context];
  }

  const imagePath = path.resolve(
    process.cwd(),
    'public',
    'personas',
    personaId,
    `${imageNumber}.jpg`
  );

  // Check if file exists
  if (fs.existsSync(imagePath)) {
    return imagePath;
  }

  // Try png
  const pngPath = imagePath.replace('.jpg', '.png');
  if (fs.existsSync(pngPath)) {
    return pngPath;
  }

  console.log(`❌ Image not found: ${imagePath}`);
  return null;
}

// DeepSeek API call (reusing your existing logic)
async function callDeepSeek(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1000,
      temperature: 0.9,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not respond.';
}

// Start the bot
export function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set in .env.local');
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log('🤖 Telegram bot started!');

  // /start command - show welcome and persona selection
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = buildPersonaKeyboard();

    bot.sendMessage(
      chatId,
      `👋 Welcome to RP Chat Bot!\n\nChoose a persona to chat with:`,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  });

  // /personas command - show persona list
  bot.onText(/\/personas/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = buildPersonaKeyboard();

    bot.sendMessage(chatId, `🎭 Select a persona:`, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  });

  // /reset command - clear chat history
  bot.onText(/\/reset/, (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);

    if (session) {
      session.history = [];
      const persona = getPersonaById(session.personaId);
      bot.sendMessage(
        chatId,
        `🔄 Chat reset! Starting fresh with ${persona?.name || 'your persona'}.`
      );
    } else {
      bot.sendMessage(chatId, `No active session. Use /start to begin.`);
    }
  });

  // /current command - show current persona
  bot.onText(/\/current/, (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);

    if (session) {
      const persona = getPersonaById(session.personaId);
      if (persona) {
        bot.sendMessage(
          chatId,
          `🎭 Current persona: ${persona.emoji} **${persona.name}**\n_${persona.tagline}_`,
          { parse_mode: 'Markdown' }
        );
      }
    } else {
      bot.sendMessage(chatId, `No persona selected. Use /start to choose one.`);
    }
  });

  // Handle persona selection callback
  bot.on('callback_query', async (query) => {
    if (!query.data || !query.message) return;

    const chatId = query.message.chat.id;
    const personaId = query.data;
    const persona = getPersonaById(personaId);

    if (!persona) {
      bot.answerCallbackQuery(query.id, { text: 'Persona not found!' });
      return;
    }

    // Set user session
    userSessions.set(chatId, {
      personaId: persona.id,
      history: [],
      imageCounters: {},
    });

    bot.answerCallbackQuery(query.id, { text: `Selected ${persona.name}!` });

    // Send greeting
    bot.sendMessage(
      chatId,
      `${persona.emoji} **${persona.name}**\n_${persona.tagline}_\n\n${persona.greeting}`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle regular messages
  bot.on('message', async (msg) => {
    // Ignore commands
    if (msg.text?.startsWith('/')) return;
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);

    if (!session) {
      bot.sendMessage(
        chatId,
        `Please use /start to select a persona first.`
      );
      return;
    }

    const persona = getPersonaById(session.personaId);
    if (!persona) {
      bot.sendMessage(chatId, `Persona not found. Use /personas to select one.`);
      return;
    }

    // Show typing indicator
    bot.sendChatAction(chatId, 'typing');

    try {
      // Add user message to history
      session.history.push({ role: 'user', content: msg.text });

      // Keep only last 10 messages
      if (session.history.length > 20) {
        session.history = session.history.slice(-20);
      }

      // Build system prompt with user profile
      const userProfilePrompt = getUserProfilePrompt(persona.id);
      const systemPrompt = `${persona.systemPrompt}\n\n${userProfilePrompt}`;

      // Call DeepSeek
      let response = await callDeepSeek(session.history, systemPrompt);

      // Check for image tags
      const imageTagRegex = /\[IMAGE:(\w+)\]/g;
      const match = imageTagRegex.exec(response);
      let imagePath: string | null = null;

      if (match && persona.images) {
        const context = match[1];
        const maxCount = persona.images[context] || 0;

        if (maxCount > 0) {
          imagePath = getImagePath(
            persona.id,
            context,
            maxCount,
            persona.randomizeImages || false,
            session
          );
          console.log(`📸 Image requested: ${context}, path: ${imagePath}`);
        }
      }

      // Remove image tags from text response
      response = response.replace(/\[IMAGE:\w+\]/g, '').trim();

      // Add assistant response to history
      session.history.push({ role: 'assistant', content: response });

      // Send text response first
      if (response) {
        await bot.sendMessage(chatId, response);
      }

      // Send image if found
      if (imagePath) {
        try {
          await bot.sendPhoto(chatId, imagePath);
          console.log(`✅ Image sent successfully`);
        } catch (imgError) {
          console.error(`❌ Failed to send image:`, imgError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      bot.sendMessage(chatId, `❌ Sorry, something went wrong. Try again.`);
    }
  });

  // Error handling
  bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error);
  });
}

// Build persona selection keyboard (3 per row)
function buildPersonaKeyboard() {
  const keyboard: TelegramBot.InlineKeyboardButton[][] = [];
  let row: TelegramBot.InlineKeyboardButton[] = [];

  for (const persona of personas) {
    row.push({
      text: `${persona.emoji} ${persona.name}`,
      callback_data: persona.id,
    });

    if (row.length === 3) {
      keyboard.push(row);
      row = [];
    }
  }

  if (row.length > 0) {
    keyboard.push(row);
  }

  return keyboard;
}

# 🎭 Roleplay Chat - AI Companions

Chat with multiple AI personas including girlfriend, boyfriend, best friend, and life coach!

## ✨ Features

- **4 Unique Personas**: Each with distinct personalities and speaking styles
  - 💕 **Emily** - Your caring girlfriend
  - ❤️ **Alex** - Your supportive boyfriend
  - 😎 **Jordan** - Your brutally honest best friend
  - 🎓 **Dr. Sarah Chen** - Your wise life coach

- **Natural Conversations**: Powered by DeepSeek AI
- **Persona Switching**: Easily switch between different companions
- **Beautiful UI**: Modern gradient design with persona-specific colors
- **Context Memory**: Remembers your conversation history

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Environment

Create a `.env.local` file:

\`\`\`bash
DEEPSEEK_API_KEY=your-deepseek-api-key-here
\`\`\`

Get your free API key from: https://platform.deepseek.com

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📝 Adding New Personas

Edit `src/lib/personas.ts` to add more characters. Each persona needs:

- **id**: Unique identifier
- **name**: Character name
- **emoji**: Display emoji
- **tagline**: Short description
- **description**: Longer description
- **color**: Tailwind gradient classes
- **greeting**: First message
- **placeholderText**: Input placeholder
- **systemPrompt**: Character personality and behavior

## 🎨 Customization

### Modify Persona Behavior

Edit the `systemPrompt` in `src/lib/personas.ts` to change how a persona acts.

### Change UI Colors

Update the `color` property for each persona (Tailwind gradient classes).

### Adjust AI Settings

Edit `src/lib/deepseek.ts` to modify:
- `temperature`: Creativity (0.1-1.0)
- `max_tokens`: Response length

## 📦 Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `DEEPSEEK_API_KEY`: Your API key
4. Deploy!

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **DeepSeek AI** - Language model
- **Vercel** - Deployment

## 📄 License

MIT

## 🤝 Contributing

Feel free to add more personas or improve the existing ones!

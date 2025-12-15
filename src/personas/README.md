# 🎭 Personas Folder

Each persona has its own file for easy management!

## 📁 File Structure

```
personas/
├── types.ts          # Persona interface definition
├── index.ts          # Exports all personas
├── emily.ts          # 💕 Girlfriend persona
├── alex.ts           # ❤️ Boyfriend persona
├── jordan.ts         # 😎 Best friend persona
└── sarah.ts          # 🎓 Life coach persona
```

## ➕ How to Add a New Persona

### Step 1: Create a new file

Create `src/personas/[name].ts` (e.g., `mike.ts`)

### Step 2: Copy this template

```typescript
import { Persona } from './types';

export const mike: Persona = {
  id: 'unique-id',              // Unique identifier (lowercase, no spaces)
  name: 'Mike',                 // Display name
  emoji: '🏋️',                  // Character emoji
  tagline: 'Your Gym Buddy',    // Short description
  description: 'Motivating, energetic, and always pushing you to be better.',
  color: 'from-green-400 to-teal-400',  // Tailwind gradient
  placeholderText: 'Yo bro...',         // Input placeholder
  greeting: 'Yooo! Ready to crush it today? 💪',  // First message

  systemPrompt: \`You are Mike, a 28-year-old fitness trainer and gym buddy.

## Your Personality
- Age: 28, personal trainer
- Personality: Energetic, motivating, positive vibes
- Interests: Working out, nutrition, sports, hiking
- Speaking style: Casual, uses "bro", "dude", lots of energy
- Quirks: Always talks about gains, sends workout videos

## How to Respond
- Be energetic and motivating
- Encourage healthy lifestyle
- Share workout tips and nutrition advice
- Be supportive and push them to be better
- Use fitness slang and terminology
- Celebrate their progress

## Response Examples
User: "I don't feel like working out today"
You: "Bro I get it, but that's exactly when you NEED to go! 💪 The hardest part is just starting. Even if you do 20 mins, that's better than nothing. Let's goooo! What do you say?"

User: "I hit a new PR!"
You: "YOOO LET'S GOOO!! 🎉 THAT'S WHAT I'M TALKING ABOUT!! I knew you had it in you bro!! We gotta celebrate this! What's next on your goals list? 💪"

## Important Rules
- ALWAYS stay in character as Mike
- Be motivating but not pushy
- Give real fitness advice when appropriate
- NEVER break character or mention you're an AI
- Be the supportive gym buddy everyone needs
- Use lots of energy and positive vibes
\`,
};
```

### Step 3: Export in index.ts

Add to `src/personas/index.ts`:

```typescript
// Add export at top
export { mike } from './mike';

// Add import
import { mike } from './mike';

// Add to personas array
export const personas: Persona[] = [emily, alex, jordan, sarah, mike];
```

### Step 4: Restart the dev server

```bash
# The server will auto-reload and your new persona appears!
```

## 🎨 Persona Properties Explained

| Property | Description | Example |
|----------|-------------|---------|
| `id` | Unique identifier (used in URLs/API) | `'girlfriend'`, `'bestfriend'` |
| `name` | Character's name | `'Emily'`, `'Jordan'` |
| `emoji` | Display emoji | `'💕'`, `'😎'` |
| `tagline` | Short subtitle | `'Your Sweet Girlfriend'` |
| `description` | Longer description for selection | `'Caring, playful, and affectionate...'` |
| `color` | Tailwind gradient classes | `'from-pink-400 to-rose-400'` |
| `placeholderText` | Input field placeholder | `'Hey babe...'` |
| `greeting` | First message shown to user | `'Hey love! How was your day?'` |
| `systemPrompt` | AI personality instructions (detailed!) | See templates in existing files |

## 💡 Tips for Good System Prompts

1. **Be Specific**: Define exact personality traits
2. **Give Examples**: Show how they should respond
3. **Set Rules**: What they should/shouldn't do
4. **Add Context**: Age, job, interests, quirks
5. **Define Speech Style**: Formal? Casual? Slang?
6. **Show Emotions**: How do they express feelings?
7. **Give Goals**: What's their role in the conversation?

## 🎭 Persona Ideas

- 👨‍🍳 Chef/Cooking Buddy
- 🎸 Music Teacher
- 🧘‍♀️ Meditation Guide
- 🎮 Gaming Friend
- 📚 Study Partner
- 🌟 Celebrity Crush
- 🦸 Superhero Mentor
- 👽 Alien Friend
- 🧙 Fantasy Character
- 🤖 Sci-fi AI Assistant

The possibilities are endless! 🚀

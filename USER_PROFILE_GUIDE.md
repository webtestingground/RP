# 👤 User Profile System

## What is This?

The User Profile lets you define **who YOU are** so all AI personas can chat with you in a personalized way!

## 📍 Location

**File to edit:** `/src/config/user-profile.ts`

## ✏️ How to Set Up Your Profile

### Step 1: Open the file

```
/Users/elw/Documents/App_Design/RP/src/config/user-profile.ts
```

### Step 2: Edit the `userProfile` object

```typescript
export const userProfile: UserProfile = {
  // Basic Info
  name: 'Alex',              // ← Change to YOUR name
  age: 28,                   // ← Your age
  gender: 'male',            // ← Your gender

  // Personality
  personality: [
    'confident',
    'caring',
    'funny',
    // ← Add traits that describe YOU
  ],

  // And so on...
}
```

### Step 3: Save the file

That's it! The AI personas will now know about you.

## 🎯 What Can You Define?

### Basic Info
- **name** - Your name (personas will use it)
- **age** - Your age
- **gender** - How you identify

### Personality
List traits that describe you:
- `'funny'`, `'serious'`, `'caring'`, `'ambitious'`
- `'shy'`, `'outgoing'`, `'creative'`, `'logical'`

### Interests
What you enjoy:
- `'gaming'`, `'movies'`, `'cooking'`, `'sports'`
- `'travel'`, `'music'`, `'art'`, `'technology'`

### Preferences

**lovesWhen** - Things you appreciate:
```typescript
lovesWhen: [
  'someone remembers details about me',
  'they make me laugh',
  'they show genuine interest',
]
```

**hatesWhen** - Things that annoy you:
```typescript
hatesWhen: [
  'people are dishonest',
  'they ignore what I say',
  'they are too clingy',
]
```

### Communication Style
- **preferredTone**: `'casual'` | `'formal'` | `'playful'` | `'romantic'`
- **usesEmojis**: `true` or `false`

### Romantic Preferences (for romantic personas)

```typescript
romanticPreferences: {
  petNames: ['babe', 'baby', 'love'],  // What you like to be called
  loveLanguage: ['physical touch', 'words of affirmation'],
  idealDate: 'A cozy night at home with wine and movies',
}
```

### Background
Tell your story:
```typescript
background: `I'm a software developer who loves gaming and travel.
I'm working on building my own startup.`
```

### Current Goals
What you're working towards:
```typescript
currentGoals: [
  'Launch my startup',
  'Get in better shape',
  'Learn Spanish',
]
```

### Custom Instructions
Any special instructions:
```typescript
customInstructions: `
- I prefer direct communication
- I love when people challenge me intellectually
- I respond well to humor
`
```

## 🌟 How Personas Use This

When you chat with **any persona**, they will:

✅ Call you by your name
✅ Remember your interests and reference them
✅ Adapt to your communication style
✅ Avoid things you hate
✅ Do things you love
✅ Make the conversation feel personal and real

## 💡 Example

If your profile says:
```typescript
name: 'Jake',
interests: ['gaming', 'pizza'],
lovesWhen: ['someone makes me laugh'],
```

**Sophia (Wife) might say:**
> "Hey Jake! I ordered your favorite pizza for tonight 🍕 Thought we could play some games together after dinner? I know you've been stressed, and I want to see you smile 😊"

**Jordan (Best Friend) might say:**
> "Yooo Jake! Dude I just saw the funniest meme about gamers and pizza. It's literally you 😂 Wanna squad up tonight?"

## 🔄 Making Changes

1. Edit `/src/config/user-profile.ts`
2. Save the file
3. Refresh your browser
4. Start a new conversation (or continue existing)

The personas will use your new profile immediately!

## 🚨 Important Notes

- **Be honest** - The more accurate your profile, the better the conversations
- **Update it** - As you change, update your profile
- **Experiment** - Try different preferences to see what works best
- **Have fun** - Make it reflect who you really are!

## 🎭 Works with ALL Personas

This profile works with:
- 💕 Emily (Girlfriend)
- ❤️ Alex (Boyfriend)
- 😎 Jordan (Best Friend)
- 🎓 Dr. Sarah (Life Coach)
- 💋 Sophia (Wife)
- And any future personas you add!

---

**Ready to personalize your experience? Edit your profile now!** 🚀

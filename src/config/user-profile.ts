/**
 * USER PROFILE CONFIGURATION
 *
 * Edit this file to define who YOU are so AI personas can chat with you accordingly.
 * All personas will read this profile and adapt their responses to match your preferences.
 */

export interface UserProfile {
  // Basic Info
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';

  // Personality
  personality: string[];  // e.g., ['funny', 'caring', 'ambitious']

  // Interests & Hobbies
  interests: string[];    // e.g., ['gaming', 'cooking', 'traveling']

  // Preferences
  lovesWhen: string[];    // Things you love when people do
  hatesWhen: string[];    // Things you hate when people do

  // Communication Style
  preferredTone: 'casual' | 'formal' | 'playful' | 'romantic';
  usesEmojis: boolean;

  // Relationship Preferences (for romantic personas)
  romanticPreferences?: {
    petNames: string[];      // What you like to be called
    loveLanguage: string[];  // e.g., ['words of affirmation', 'physical touch']
    idealDate: string;       // Describe your ideal date
  };

  // Additional Context
  background?: string;      // Your background/story
  currentGoals?: string[];  // What you're working on

  // Custom Instructions
  customInstructions?: string;  // Any special instructions for AI
}

/**
 * 👤 YOUR PROFILE - EDIT THIS!
 */
export const userProfile: UserProfile = {
  // Basic Info
  name: 'User',              // Change to your name
  age: 25,                   // Your age
  gender: 'male',           // Your gender

  // Personality
  personality: [
    'confident',
    'caring',
    'funny',
    'ambitious',
    // Add more traits that describe you
  ],

  // Interests & Hobbies
  interests: [
    'technology',
    'movies',
    'music',
    'traveling',
    // Add your real interests
  ],

  // Preferences
  lovesWhen: [
    'someone shows genuine interest in my day',
    'they remember small details I mentioned',
    'they make me laugh',
    'they support my goals',
    // What makes you happy in conversations?
  ],

  hatesWhen: [
    'people are fake or dishonest',
    'they ignore what I say',
    'they are too clingy',
    // What annoys you?
  ],

  // Communication Style
  preferredTone: 'casual',   // casual | formal | playful | romantic
  usesEmojis: true,          // Do you like emojis in responses?

  // Relationship Preferences (for romantic personas)
  romanticPreferences: {
    petNames: [
      'babe',
      'baby',
      'love',
      // What do you like to be called?
    ],

    loveLanguage: [
      'words of affirmation',
      'quality time',
      // Your love languages
    ],

    idealDate: 'A cozy evening at home with good food, wine, and a movie',
  },

  // Additional Context
  background: `I'm a professional who loves technology and enjoys meaningful conversations.
  I value honesty and genuine connections.`,

  currentGoals: [
    'Build my career',
    'Stay healthy and fit',
    'Travel more',
    // What are you working towards?
  ],

  // Custom Instructions
  customInstructions: `
  - I prefer direct communication
  - I appreciate when people are genuine and authentic
  - I like a good balance of fun and serious conversation
  - I respond well to humor and playfulness
  `,
};

/**
 * Generate a system prompt addition based on user profile
 */
export function getUserProfilePrompt(): string {
  const p = userProfile;

  return `
## ABOUT THE USER (IMPORTANT!)

**Name:** ${p.name}
**Age:** ${p.age}
**Gender:** ${p.gender}

**Personality Traits:** ${p.personality.join(', ')}
**Interests:** ${p.interests.join(', ')}

**Communication Preferences:**
- Preferred tone: ${p.preferredTone}
- Uses emojis: ${p.usesEmojis ? 'Yes' : 'No'}

**The user LOVES when you:**
${p.lovesWhen.map(item => `- ${item}`).join('\n')}

**The user HATES when you:**
${p.hatesWhen.map(item => `- ${item}`).join('\n')}

${p.romanticPreferences ? `
**Romantic Preferences:**
- Likes to be called: ${p.romanticPreferences.petNames.join(', ')}
- Love languages: ${p.romanticPreferences.loveLanguage.join(', ')}
- Ideal date: ${p.romanticPreferences.idealDate}
` : ''}

${p.background ? `**Background:** ${p.background}` : ''}

${p.currentGoals && p.currentGoals.length > 0 ? `
**Current Goals:**
${p.currentGoals.map(goal => `- ${goal}`).join('\n')}
` : ''}

${p.customInstructions ? `
**Special Instructions:**
${p.customInstructions}
` : ''}

**IMPORTANT:** Use this information to personalize your responses. Remember these details and reference them naturally in conversation. Make ${p.name} feel understood and valued.
`;
}

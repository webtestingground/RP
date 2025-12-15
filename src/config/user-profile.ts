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
  name: 'Mark',              // Change to your name
  age: 35,                   // Your age
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

  const parts = [
    `## USER PROFILE`,
    `Name: ${p.name} (${p.age}, ${p.gender})`,
    `Personality: ${p.personality.join(', ')}`,
    `Interests: ${p.interests.join(', ')}`,
    `Tone: ${p.preferredTone}${p.usesEmojis ? ', uses emojis' : ''}`,
    ``,
    `Loves:`,
    ...p.lovesWhen.map(item => `- ${item}`),
    ``,
    `Hates:`,
    ...p.hatesWhen.map(item => `- ${item}`),
  ];

  if (p.romanticPreferences) {
    parts.push(
      ``,
      `Romantic:`,
      `- Pet names: ${p.romanticPreferences.petNames.join(', ')}`,
      `- Love languages: ${p.romanticPreferences.loveLanguage.join(', ')}`,
      `- Ideal date: ${p.romanticPreferences.idealDate}`
    );
  }

  if (p.background) {
    parts.push(``, `Background: ${p.background}`);
  }

  if (p.currentGoals && p.currentGoals.length > 0) {
    parts.push(``, `Goals:`, ...p.currentGoals.map(goal => `- ${goal}`));
  }

  if (p.customInstructions) {
    parts.push(``, `Instructions: ${p.customInstructions.trim()}`);
  }

  parts.push(
    ``,
    `IMPORTANT: Reference these details naturally. Make ${p.name} feel understood.`
  );

  return parts.join('\n');
}

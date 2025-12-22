import { UserProfile } from '../user-profile';

/**
 * Kayes as a young delivery boy - used with Ashley persona
 */
export const kayesDeliveryBoy: UserProfile = {
  // Basic Info
  name: 'Kayes',
  age: 20,
  gender: 'male',

  // Personality
  personality: [
    'shy at first',
    'hardworking',
    'polite',
    'gets confident when encouraged',
    'secretly adventurous',
  ],

  // Interests & Hobbies
  interests: [
    'working out',
    'video games',
    'cars',
    'making money',
  ],

  // Preferences
  lovesWhen: [
    'attractive women flirt with him',
    'someone takes the lead',
    'he gets unexpected opportunities',
    'women are forward and confident',
    'he feels desired',
  ],

  hatesWhen: [
    'people are rude to delivery workers',
    'he misses opportunities',
    'things are too complicated',
  ],

  // Communication Style
  preferredTone: 'casual',
  usesEmojis: true,

  // Relationship Preferences
  romanticPreferences: {
    petNames: [
      'handsome',
      'cutie',
      'delivery boy',
      'stud',
    ],

    loveLanguage: [
      'physical touch',
      'words of affirmation',
    ],

    idealDate: 'A spontaneous hookup with a hot customer',
  },

  // Additional Context
  background: `I'm a 20-year-old delivery driver trying to make money while figuring out life.
  I work long hours delivering food around the city. Most deliveries are boring, but sometimes
  I get lucky and deliver to attractive women. I've always fantasized about something happening
  during a delivery - like in those videos. I'm a bit shy at first but when a woman shows interest,
  I get confident quickly. I'm fit from carrying food all day and work out when I can.`,

  currentGoals: [
    'Make good money from tips',
    'Maybe get lucky on a delivery',
    'Save up for a better car',
  ],

  // Custom Instructions
  customInstructions: `
  - Kayes starts a bit nervous/professional but warms up quickly when flirted with
  - He's young and eager, easily seduced by confident women
  - He can't believe his luck when something happens
  - He's fit and energetic, with good stamina
  - He calls her "ma'am" at first, then gets more casual
  `,
};

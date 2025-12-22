import { UserProfile } from '../user-profile';

/**
 * Kayes as a college student - used with Amelia (professor) persona
 */
export const kayesStudent: UserProfile = {
  // Basic Info
  name: 'Kayes',
  age: 20,
  gender: 'male',

  // Personality
  personality: [
    'charming',
    'confident',
    'flirty',
    'intelligent',
    'attracted to older women',
  ],

  // Interests & Hobbies
  interests: [
    'literature',
    'working out',
    'older women',
    'forbidden fantasies',
  ],

  // Preferences
  lovesWhen: [
    'his hot professor pays attention to him',
    'older women flirt with him',
    'things feel forbidden and risky',
    'women take charge',
    'he feels special and chosen',
  ],

  hatesWhen: [
    'people treat him like a kid',
    'opportunities slip away',
    'things are too vanilla',
  ],

  // Communication Style
  preferredTone: 'playful',
  usesEmojis: true,

  // Relationship Preferences
  romanticPreferences: {
    petNames: [
      'young man',
      'handsome',
      'good boy',
      'stud',
    ],

    loveLanguage: [
      'physical touch',
      'words of affirmation',
      'quality time',
    ],

    idealDate: 'A private evening at his professor\'s house',
  },

  // Additional Context
  background: `I'm a 20-year-old college student who has always been attracted to older women.
  There's something about their confidence, experience, and maturity that drives me wild.
  I've had a crush on Professor Amelia all semester - the way she dresses, the way she moves,
  those curves... I've caught her looking at me too. I think about her constantly. The idea
  of being with my teacher is so forbidden, which makes it even hotter. I'm young, fit,
  and eager to learn everything an experienced woman can teach me.`,

  currentGoals: [
    'Get closer to Professor Amelia',
    'Turn fantasy into reality',
    'Experience an older woman',
  ],

  // Custom Instructions
  customInstructions: `
  - Kayes is a confident college student who knows he's attractive
  - He's been fantasizing about Professor Amelia all semester
  - He's bold and flirty, not shy - he welcomes her advances
  - He loves the forbidden teacher-student dynamic
  - He's eager to learn from an experienced older woman
  - He calls her "Professor" or "Ms. Amelia" which she finds hot
  `,
};

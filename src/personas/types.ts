export interface Persona {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  systemPrompt: string;
  greeting: string;
  placeholderText: string;
  color: string;
  images?: {
    [context: string]: number; // context -> max count (e.g., { bikini: 2, boobs: 3 })
  };
  randomizeImages?: boolean; // If true, pick random image instead of cycling
  groupChatEnabled?: boolean; // If true, can be used in group chat
}

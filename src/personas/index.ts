export { type Persona } from './types';
export { emily } from './emily';
export { alex } from './alex';
export { jordan } from './jordan';
export { sarah } from './sarah';
export { sophia } from './sophia';
export { nsfw } from './nsfw';
export { ana } from './Ana';
export { diana } from './Diana';
export { olivia } from './Olivia';
export { nicki } from './Nicki';
export { savita } from './Savita';
export { maria } from './Maria';
export { rika } from './Rika';
export { emma } from './Emma';
export { natalia } from './Natalia';
export { lamis } from './Lamis';
export { maya } from './Maya';
export { jessica } from './Jessica';
export { ashley } from './Ashley';
export { amelia } from './Amelia';

import { emily } from './emily';
import { alex } from './alex';
import { jordan } from './jordan';
import { sarah } from './sarah';
import { sophia } from './sophia';
import { nsfw } from './nsfw';
import { ana } from './Ana';
import { diana } from './Diana';
import { olivia } from './Olivia';
import { nicki } from './Nicki';
import { savita } from './Savita';
import { maria } from './Maria';
import { rika } from './Rika';
import { emma } from './Emma';
import { natalia } from './Natalia';
import { lamis } from './Lamis';
import { maya } from './Maya';
import { jessica } from './Jessica';
import { ashley } from './Ashley';
import { amelia } from './Amelia';
import { Persona } from './types';

export const personas: Persona[] = [emily, alex, jordan, sarah, sophia, nsfw, ana, diana, olivia, nicki, savita, maria, rika, emma, natalia, lamis, maya, jessica, ashley, amelia];

// Get only personas enabled for group chat
export const groupChatPersonas: Persona[] = personas.filter(p => p.groupChatEnabled);

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

export function getDefaultPersona(): Persona {
  return emily;
}

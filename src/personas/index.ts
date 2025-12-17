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
import { Persona } from './types';

export const personas: Persona[] = [emily, alex, jordan, sarah, sophia, nsfw, ana, diana, olivia, nicki, savita, maria, rika];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

export function getDefaultPersona(): Persona {
  return emily;
}

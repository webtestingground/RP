export { type Persona } from './types';
export { emily } from './emily';
export { alex } from './alex';
export { jordan } from './jordan';
export { sarah } from './sarah';

import { emily } from './emily';
import { alex } from './alex';
import { jordan } from './jordan';
import { sarah } from './sarah';
import { Persona } from './types';

export const personas: Persona[] = [emily, alex, jordan, sarah];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

export function getDefaultPersona(): Persona {
  return emily;
}

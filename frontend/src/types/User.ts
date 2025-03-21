import { ApiCharacter } from './Characters';

export type User = {
  userId: string;
  createdAt: string;
  updatedAt: string;
  region: string;
  authorized: boolean;
  characters: ApiCharacter[];
  forcedUpdate: string;
};

export enum Views {
  LIST = 'list',
  CHARACTER = 'character',
  TALENTS = 'talents',
  RAIDS = 'raids',
  DUNGEON = 'dungeon',
  PVP = 'pvp',
}

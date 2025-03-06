import { ApiCharacter } from './Characters';

export type User = {
  userId: string;
  createdAt: string;
  updatedAt: string;
  region: string;
  authorized: boolean;
  characters: ApiCharacter[];
};

export enum Views {
  LIST = 'list',
  ITEM = 'item',
  TALENTS = 'talents',
}

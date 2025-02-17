import { Item } from './BattleNet';

export type ddbProfile = {
  user_id: number;
  created_at: string;
  expires_in: number;
  region: string;
  state: string;
  updated_at: string;
}

export type DynamoCharacter = {
  character_id: number;
  achievement_points: number;
  avatar: string;
  avg_item_level: number;
  back: Item | null;
  chest: Item | null;
  class: string;
  equip_item_level: number;
  faction: string;
  feet: Item;
  finger_1: Item | null;
  finger_2: Item | null;
  gender: string;
  guild_id: number | null;
  guild_name: string | null;
  hands: Item | null;
  head: Item | null;
  inset: string;
  is_valid: boolean;
  last_login: number;
  legs: Item | null;
  level: number;
  main_hand: Item;
  'main-raw': string;
  name: string;
  namespace: string;
  neck: Item | null;
  offhand: Item | null;
  race: string;
  realm: number;
  realm_name: string;
  region: string;
  shoulder: Item | null;
  spec: string | null;
  tabard: Item | null;
  title: string | null;
  trinket_1: Item | null;
  trinket_2: Item | null;
  user_id: number;
  waist: Item | null;
  wrist: Item | null;
};

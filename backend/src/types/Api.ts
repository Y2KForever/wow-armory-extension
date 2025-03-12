export type ApiResultResponse = {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
};

export type PostFetchCharacters = {
  namespaces: string[];
  region: string;
};

export type PostImportCharactersBody = {
  characters: ApiCharacter[];
  region: string;
};

export type ApiCharacter = {
  id: number;
  name: string;
  realm: {
    name: string;
    id: number;
  };
  class: string;
  race: string;
  gender: string;
  faction: string;
  level: number;
  namespace: string;
};

type CharacterItem = {
  item_upgrade: {
    description: string;
    color: string;
  } | null;
  image: string;
  setBonus: {
    name: string;
    amount: string;
    effects: {
      display_string: string;
      required_count: number;
      is_active: boolean;
    }[];
    items: {
      name: string;
      is_equipped: boolean;
    }[];
  } | null;
  sockets: {
    type: string;
    item: {
      name?: string;
      value: string;
    };
    image?: string;
  }[];
  type: string;
  quality: string;
  name: string;
  stats: {
    name: string;
    value: number;
    color: string;
    display_string?: string;
    is_equipped_bonus: boolean;
  }[];
  spells:
    | {
        name: string;
        description: string;
      }[]
    | null;
  requirement: string | null;
  level: number;
  transmog: string | null;
  enchantments: string[] | null;
};

export type ApiItems = Record<string, CharacterItem>;

export type ApiCharacterSummary = {
  title: string | null;
  spec: string | null;
  achievement_points: number;
  avg_item_level: number;
  equip_item_level: number;
  guild_name: string | null;
  guild_id: number | null;
  last_login: number;
  dead: boolean | null;
  self_found: boolean | null;
};

export type ApiCharacterStatus = {
  is_valid: boolean;
};

export type ApiCharacterTalents = {
  talents: {
    id: number;
    hero_id: number;
    class_talents: number[];
    spec_talents: number[];
    hero_talents: number[];
    loadout_code: string;
  };
};

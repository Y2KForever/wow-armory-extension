export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  sub?: string;
};

export type CharactersResponse = {
  id: number;
  wow_accounts: WowAccount[];
};

enum Gender {
  FEMALE = 'female',
  MALE = 'male',
}

enum Faction {
  ALLIANCE = 'alliance',
  HORDE = 'horde',
}

type WowCharacter = {
  name: string;
  id: number;
  realm: {
    key: {
      href: string;
    };
    name: string;
    id: number;
    slug: string;
  };
  playable_class: {
    key: {
      href: string;
    };
    name: string;
    id: number;
  };
  playable_race: {
    key: {
      href: string;
    };
    name: string;
    id: number;
  };
  gender: {
    type: Gender;
    name: string;
  };
  faction: {
    type: Faction;
    name: string;
  };
  level: number;
  is_valid: boolean;
};

type WowAccount = {
  id: number;
  characters: WowCharacter[];
};

export type MediaResponse = {
  assets: Asset[];
};

type Asset = {
  key: string;
  value: string;
};

export type ItemResponse = {
  equipped_items: Item[];
};

export type Item = {
  item: {
    id: number;
  };
  name_description?: {
    display_string: string;
    color: { r: number; g: number; b: number; a: number };
  };
  item_subclass: { name: string };
  quality: { name: string };
  name: string;
  media: {
    key: {
      href: string;
    };
  };
  enchantments:
    | {
        display_string: string;
      }[]
    | null;
  set?: {
    name: string;
    id: number;
    items: {
      name: string;
      is_equipped: boolean;
    }[];
    effects: {
      display_string: string;
      required_count: number;
      is_active: boolean;
    }[];
    display_string: string;
  };
  sockets: {
    socket_type: {
      type: string;
      name: string;
    };
    item?: {
      name: string;
    };
    display_string: string;
    media: {
      key: {
        href: string;
      };
    };
  }[];
  stats: {
    type: { name: string };
    value: number;
    display: { color: { r: number; g: number; b: number; a: number } };
    is_equip_bonus?: boolean;
  }[];
  spells?: {
    spell: { name: string };
    description: string;
  }[];
  requirements?: { level: { display_string: string }; display_string?: string };
  level: { value: number };
  transmog?: { item: { name: string } };
  slot: { type: string; name: string };
};

export type CharacterSummary = {
  id: number;
  name: string;
  gender: Gender;
  faction: Faction;
  active_spec: {
    name: string;
  };
  guild?: {
    name: string;
    id: number;
  };
  achievement_points: number;
  last_login_timestamp: number;
  average_item_level: number;
  equipped_item_level: number;
  active_title?: {
    name: string;
  };
};

export type CharacterStatus = {
  is_valid: boolean;
};

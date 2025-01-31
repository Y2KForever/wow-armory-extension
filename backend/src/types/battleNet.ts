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

type Item = {
  item_subclass: { name: string };
  quality: { name: string };
  name: string;
  sockets: {
    socket_type: {
      type: string;
      name: string;
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
  requirements?: { level: { display_string: string } };
  level: { value: number };
  transmog?: { item: { name: string } };
  slot: { type: string };
};

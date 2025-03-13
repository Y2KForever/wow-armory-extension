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
  is_ghost?: boolean;
  is_self_found?: boolean;
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
    display: { color: { r: number; g: number; b: number; a: number }, display_string?: string };
    is_equip_bonus?: boolean;
  }[];
  spells?: {
    spell: { name: string };
    description: string;
  }[];
  requirements?: { level: { display_string: string }; display_string?: string };
  level?: { value: number | null };
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
  is_ghost?: boolean;
  is_self_found?: boolean;
  active_title?: {
    name: string;
  };
};

export type CharacterStatus = {
  is_valid: boolean;
};

export type CharacterSpecializationsClassic = {
  specialization_groups: {
    is_active: boolean;
    specializations: {
      talents: {
        talent: {
          id: number;
        };
        spell_tooltip: {
          spell: {
            name: string;
            id: number;
          };
          description: string;
          cast_time?: string;
          cooldown?: string;
          range?: string;
          power_cost?: string | null;
        };
      }[];
      specialization_name: string;
      spent_points?: number;
    }[];
  }[];
};

export type CharacterSpecializations = {
  specializations: {
    specialization: {
      name: string;
      id: number;
    };
    loadouts: {
      is_active: boolean;
      talent_loadout_code: string;
      selected_class_talents: Talents[];
      selected_spec_talents: Talents[];
      selected_hero_talents: Talents[];
    }[];
  }[];
  active_specialization: {
    name: string;
    id: number;
  };
  active_hero_talent_tree: {
    name: string;
    id: number;
  };
};

export type Talents = {
  id: number;
  rank: number;
  tooltip?: {
    talent: {
      name: string;
      id: number;
    };
    spell_tooltip: {
      spell: {
        key: {
          href: string;
        };
        name: string;
        id: number;
      };
      description: string;
      cast_time: string;
      cooldown: string;
      range?: string;
      power_cost?: string;
    };
    default_points?: number;
  };
};

export enum Slots {
  HEAD = 'head',
  NECK = 'neck',
  SHOULDER = 'shoulder',
  BACK = 'back',
  CHEST = 'chest',
  SHIRT = 'shirt',
  TABARD = 'tabard',
  WRIST = 'wrist',
  HANDS = 'hands',
  WAIST = 'waist',
  LEGS = 'legs',
  FEET = 'feet',
  FINGER_1 = 'finger_1',
  FINGER_2 = 'finger_2',
  TRINKET_1 = 'trinket_1',
  TRINKET_2 = 'trinket_2',
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
}

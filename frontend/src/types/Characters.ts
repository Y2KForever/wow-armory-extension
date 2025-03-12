import { Namespaces } from './Namspaces';

type WowCharacter = {
  name: string;
  id: number;
  realm: {
    name: string;
    id: number;
  };
  class: string;
  race: string;
  gender: Gender;
  faction: Faction;
  level: number;
  namespace: Namespaces | string;
  is_valid: boolean;
};

enum Gender {
  FEMALE = 'female',
  MALE = 'male',
}

enum Faction {
  ALLIANCE = 'alliance',
  HORDE = 'horde',
}

enum Slot {
  HEAD = 'head',
  CHEST = 'chest',
  BACK = 'back',
  FEET = 'feet',
  HANDS = 'hands',
  LEGS = 'legs',
  MAIN_HAND = 'main-hand',
  NECK = 'neck',
  OFF_HAND = 'off-hand',
  RANGED = 'ranged',
  RELIC = 'relic',
  FINGER_1 = 'finger-1',
  FINGER_2 = 'finger-2',
  SHIRT = 'shirt',
  SHOULDER = 'shoulder',
  TABARD = 'tabard',
  TRINKET_1 = 'trinket-1',
  TRINKET_2 = 'trinket-2',
  WAIST = 'waist',
  WRIST = 'wrist',
}

type ApiCharacter = {
  'main-raw': string;
  avatar: string;
  realm: number;
  realm_name: string;
  faction: string;
  inset: string;
  class: string;
  spec: string;
  title: string;
  name: string;
  namespace: string;
  level: number;
  character_id: number;
  race: string;
  equip_item_level: number;
  dead: boolean | null;
  self_found: boolean | null;
  talents: {
    class_talents: number[];
    hero_id: number;
    id: number;
    hero_talents: number[];
    spec_talents: number[];
    loadout_code: string;
  };
} & {
  [slot: string]: {
    sockets?: {
      image: string;
      type: string;
      item: {
        name: string;
        value: string;
      };
    }[];
    type: string;
    quality: string;
    name: string;
    image: string;
    stats?: {
      name: string;
      value: string;
      color: string;
      is_equpped_bonus: boolean;
      display_string?: string;
    }[];
    spells?:
      | {
          name: string;
          description: string;
        }[]
      | null;
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
    requirement: string | null;
    level: number | null;
    transmog: string | null;
    enchantments: string[] | null;
  };
};

const slotsOrderLeft: Slot[] = [
  Slot.HEAD,
  Slot.NECK,
  Slot.SHOULDER,
  Slot.BACK, // Back
  Slot.CHEST,
  Slot.SHIRT,
  Slot.TABARD,
  Slot.WRIST,
];

const slotsOrderRight: Slot[] = [
  Slot.HANDS,
  Slot.WAIST,
  Slot.LEGS,
  Slot.FEET,
  Slot.FINGER_1,
  Slot.FINGER_2,
  Slot.TRINKET_1,
  Slot.TRINKET_2,
];

const slotsOrderBottom: Slot[] = [Slot.MAIN_HAND, Slot.OFF_HAND];

const typeMap: Record<string, string> = {
  'finger-1': 'ring',
  'finger-2': 'ring',
  'trinket-1': 'trinket',
  'trinket-2': 'trinket',
  back: 'chest',
  'off-hand': 'offhand',
};

type SpellTooltip = {
  spell: Spell;
  description: string;
  current_rank: number;
  cast_time?: string;
  cooldown?: string;
  range?: string;
  power_cost?: string;
  talent?: {
    name: string;
    key: {
      href: string;
    };
    id: number;
  };
};

type Tooltip = {
  spell_tooltip: SpellTooltip;
  choice_of_tooltips?: {
    spell_tooltip: SpellTooltip;
  }[];
};

type Rank = {
  rank: number;
  tooltip?: Tooltip;
};

type Talent = {
  name?: string;
  col: number;
  locked_by: number[];
  ranks: Rank[];
  row: number;
  id: number;
  unlocks: number[];
  type: string;
};

type HeroTalent = {
  id: number;
  name: string;
  talents: Talent[];
};

type ApiTalents = {
  hero_talents: HeroTalent[];
  spec_talents: Talent[];
  class_talents: Talent[];
  class: string;
  spec: string;
};

type Spell = {
  name: string;
  id: number;
  key: {
    href: string;
  };
};

interface UniqueTalent {
  col: number;
  row: number;
  spells: {
    spell?: Spell;
    description: string;
    castTime?: string;
    cooldown?: string;
    powercost?: string;
    range?: string;
    talent_id: number | null;
    rank: number;
  }[];
}

enum TalentType {
  SPEC = 'spec',
  CLASS = 'class',
  HERO = 'hero',
}

export type { WowCharacter, ApiCharacter, ApiTalents, Talent, HeroTalent, Rank, Tooltip, UniqueTalent };
export { Slot, slotsOrderLeft, slotsOrderRight, slotsOrderBottom, Faction, typeMap, type Spell, TalentType };

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
};

enum Gender {
  FEMALE = 'female',
  MALE = 'male',
}

enum Faction {
  ALLIANCE = 'alliance',
  HORDE = 'horde',
}

export type { WowCharacter };

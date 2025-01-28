export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
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

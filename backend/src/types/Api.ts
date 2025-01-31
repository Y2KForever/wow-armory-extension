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
  type: string;
  quality: string;
  name: string;
  stats: {
    name: string;
    value: number;
    color: string;
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
};

export type ApiItems = Record<string, CharacterItem>;

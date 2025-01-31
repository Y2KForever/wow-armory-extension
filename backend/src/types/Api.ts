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

type ApiCharacter = {
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

/*
      account.characters.map((character) => ({
        id: character.id,
        name: character.name,
        realm: character.realm.name,
        class: character.playable_class.name,
        race: character.playable_race.name,
        gender: character.gender.name,
        faction: character.faction.name,
        level: character.level,
        namespace: namespace,
      })),

*/

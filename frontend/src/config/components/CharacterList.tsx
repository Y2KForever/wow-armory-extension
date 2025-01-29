import { WowCharacter } from '@/types/Characters';
import { columns } from './CharacterTable/columns';
import { DataTable } from './CharacterTable/data-table';
import { useMemo } from 'react';
import { Namespaces } from '@/types/Namspaces';
import { Capitalize } from '@/lib/utils';

interface CharacterListProps {
  data: WowCharacter[];
}

export const CharacterList = ({ data }: CharacterListProps) => {
  const characterData = useMemo(
    () =>
      data.map((character) => ({
        ...character,
        namespace:
          Capitalize(Namespaces[character.namespace as keyof typeof Namespaces]) || Capitalize(character.namespace),
      })),
    [data],
  );

  return <DataTable columns={columns} data={characterData} />;
};

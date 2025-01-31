import { WowCharacter } from '@/types/Characters';
import { columns } from './CharacterTable/columns';
import { DataTable } from './CharacterTable/data-table';
import { useMemo } from 'react';
import { Namespaces } from '@/types/Namspaces';
import { Capitalize } from '@/lib/utils';
import { RowSelectionState, Updater } from '@tanstack/react-table';

interface CharacterListProps {
  data: WowCharacter[];
  rowSelection: {};
  handleOnRowChange: (valueFn: Updater<RowSelectionState>) => void;
}

export const CharacterList = ({ data, rowSelection, handleOnRowChange }: CharacterListProps) => {
  const characterData = useMemo(
    () =>
      data.map((character) => ({
        ...character,
        namespace:
          Capitalize(Namespaces[character.namespace as keyof typeof Namespaces]) || Capitalize(character.namespace),
      })),
    [data],
  );

  return (
    <DataTable
      columns={columns}
      data={characterData}
      handleOnRowChange={handleOnRowChange}
      rowSelection={rowSelection}
    />
  );
};

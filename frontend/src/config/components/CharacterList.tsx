import { WowCharacter } from '@/types/Characters';
import { columns } from './CharacterTable/columns';
import { DataTable } from './CharacterTable/data-table';

interface CharacterListProps {
  data: WowCharacter[];
}

export const CharacterList = ({ data }: CharacterListProps) => {
  return <DataTable columns={columns} data={data} />;
};

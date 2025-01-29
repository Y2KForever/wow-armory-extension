import { Sort } from '@/assets/icons/Sort';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WowCharacter } from '@/types/Characters';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<WowCharacter>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const index = column.getSortIndex();
      return (
        <Button
          className={`text-xs`}
          variant={`${index === 0 ? 'secondary' : 'ghost'}`}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <Sort className="stroke-current" width={12} height={12} />
        </Button>
      );
    },
    enableSorting: true,
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'realm',
    header: ({ column }) => {
      const index = column.getSortIndex();
      return (
        <Button
          variant={`${index === 0 ? 'secondary' : 'ghost'}`}
          className="text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Realm
          <Sort className="stroke-current" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'level',
    header: ({ column }) => {
      const index = column.getSortIndex();
      return (
        <Button
          variant={`${index === 0 ? 'secondary' : 'ghost'}`}
          className="text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Level
          <Sort className="stroke-current" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'class',
    header: ({ column }) => {
      const index = column.getSortIndex();
      return (
        <Button
          variant={`${index === 0 ? 'secondary' : 'ghost'}`}
          className="text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Class
          <Sort className="stroke-current" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'faction',
    header: ({ column }) => {
      const index = column.getSortIndex();
      return (
        <Button
          variant={`${index === 0 ? 'secondary' : 'ghost'}`}
          className="text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Faction
          <Sort className="stroke-current" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'namespace',
    header: ({ column }) => {
      const index = column.getSortIndex();
      return (
        <Button
          variant={`${index === 0 ? 'secondary' : 'ghost'}`}
          className="text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Version
          <Sort className="stroke-current" />
        </Button>
      );
    },
  },
];

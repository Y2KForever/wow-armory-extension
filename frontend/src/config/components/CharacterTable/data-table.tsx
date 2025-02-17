import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  Updater,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  handleOnRowChange: (valueFn: Updater<RowSelectionState>) => void;
  rowSelection: {};
}

export function DataTable<TData, TValue>({
  columns,
  data,
  handleOnRowChange,
  rowSelection,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    enableRowSelection: (row) => (row.original as { is_valid: boolean }).is_valid === true,
    enableSorting: true,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: handleOnRowChange,
    state: {
      sorting,
      columnFilters,
      rowSelection: rowSelection,
    },
    initialState: {
      sorting: [
        {
          id: 'name',
          desc: false,
        },
      ],
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });
  return (
    <div className="w-full text-xs">
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-white">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
      </div>
      <div className="flex items-center py-2 space-x-2">
        <Input
          placeholder="Filter charaters..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="text-xs"
        />
        <Button
          variant="outline"
          className="text-xs min-w-[86px]"
          size="default"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          className="text-xs min-w-[86px]"
          variant="outline"
          size="default"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <div className="rounded-md bg-background">
        <Table className="text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="text-xs" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-xs" key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) =>
                row.getCanSelect() ? (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    data-disabled={true}
                    className="data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="[&:has([role=checkbox])]:pl-4" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ) : (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipContent>
                        Disabled characters cannot be imported. Login to the character and wait an hour, then try again.
                      </TooltipContent>
                      <TooltipTrigger asChild>
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          data-disabled={false}
                          className="data-[state=selected]:bg-muted data-[disabled=false]:bg-black data-[disabled=false]:text-blizzard-gray"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell className="[&:has([role=checkbox])]:pl-4" key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                ),
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

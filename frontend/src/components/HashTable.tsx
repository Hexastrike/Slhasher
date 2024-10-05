import React from 'react';
import { NavLink } from 'react-router-dom'

import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { FiDownload } from 'react-icons/fi';
import { CiViewColumn } from 'react-icons/ci';

interface HashTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  slhasherCSVDownloadURL: string;
}

export function HashTable<TData, TValue>({
  columns,
  data,
  slhasherCSVDownloadURL,
}: HashTableProps<TData, TValue>) {

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    vt_status: false,
    vt_filenames: false,
    vt_md5: false,
    vt_sha1: false,
    vt_sha256: false,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div>
      <div className='flex items-center py-4'>
        {/* TODO: Table filter */}
        {/* <Input
          placeholder='Search filename...'
          value={(table.getColumn('vt_filename')?.getFilterValue() as string) ?? '}
          onChange={(event) =>
            table.getColumn('vt_filename')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
          /> */}
        {/* Table column visibility */}
        <div className='ml-auto space-x-2'>
          <Button asChild variant='outline' className='text-foreground bg-secondary hover:bg-background'>
            <NavLink to={slhasherCSVDownloadURL} target='_blank' >
              <FiDownload className='mr-2 h-4 w-4' /> Download CSV
            </NavLink>

          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <CiViewColumn className='mr-2 h-4 w-4' /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {/* https://github.com/TanStack/table/discussions/4857 */}
                      {column.columnDef.header?.toString()}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Table content */}
      <div className='rounded-md border overflow-x-scroll'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                    key={header.id} 
                    style={{
                      color: 'hsl(var(--foreground))'
                    }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  style={{
                    backgroundColor: row.index % 2 === 0 ? 'hsl(var(--secondary))' : 'hsl(var(--background))',
                    color: 'hsl(var(--secondary-foreground))'
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Table pagination */}
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Select value={table.getState().pagination.pageSize.toString()} onValueChange={(value) => {table.setPageSize(Number(value))}}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Columns' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Columns</SelectLabel>
              {[10, 25, 50, 100].map(pageSize => (
                <SelectItem key={pageSize.toString()} value={pageSize.toString()}>{pageSize}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

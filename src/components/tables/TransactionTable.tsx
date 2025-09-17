'use client'

import { useRef, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleQuestionMark,
  Columns3Icon,
} from 'lucide-react'
import { formatNumberToReadableString } from '@/lib/utils'
import Image from 'next/image'
import { ITransaction } from '@/actions/database/transaction.action'
import MultipleSelector from '../ui/multiselect'
import { TransactionDoc } from '@/models/Transaction'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination'
import { Label } from '../ui/label'

interface TransactionTableProps {
  transactions: ITransaction[]
  guildId: string
  managerId: string
  page: number
  limit: number
  total: number
}

const multiColumnUserFilter: FilterFn<ITransaction> = (
  row,
  columnId,
  filterValue
) => {
  const searchable = `${row.original.userId} ${row.original.username} ${
    row.original.nickname ?? ''
  }`.toLowerCase()
  return searchable.includes((filterValue ?? '').toLowerCase())
}

const multiColumnAdminFilter: FilterFn<ITransaction> = (
  row,
  columnId,
  filterValue
) => {
  const searchable = `${row.original.betId} ${row.original.handledBy} ${
    row.original.handledByUsername ?? ''
  }`.toLowerCase()
  return searchable.includes((filterValue ?? '').toLowerCase())
}

const typeFilter: FilterFn<ITransaction> = (row, columnId, filterValue) => {
  if (!filterValue || !filterValue.length) return true
  const cellValue = row.getValue(columnId) as string
  return filterValue.includes(cellValue)
}

const typeBadgeMap: Record<TransactionDoc['type'], string> = {
  deposit: 'bg-emerald-500 text-white',
  withdraw: 'bg-rose-500 text-white',
  bet: 'bg-indigo-500 text-white',
  win: 'bg-green-700 text-white',
  refund: 'bg-violet-500 text-white',
  bonus: 'bg-amber-500 text-white',
  vip: 'bg-pink-500 text-white',
}

const sourceBadgeMap: Record<TransactionDoc['source'], string> = {
  casino: 'bg-orange-500 text-white',
  command: 'bg-cyan-500 text-white',
  manual: 'bg-gray-500 text-white',
  system: 'bg-slate-700 text-white',
  web: 'bg-sky-500 text-white',
}

const TransactionTable = ({
  transactions,
}: // guildId,
// managerId,
// page,
// limit,
// total,
TransactionTableProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    betId: false,
  })

  const columns: ColumnDef<ITransaction>[] = [
    {
      header: 'Avatar',
      accessorKey: 'avatar',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      size: 45,
      cell: ({ row }) => (
        <Image
          className="ml-2 rounded-full"
          width={36}
          height={36}
          alt={row.getValue('username')}
          src={row.getValue('avatar')}
        />
      ),
    },
    {
      header: 'Username',
      accessorKey: 'username',
      enableHiding: false,
      size: 130,
      filterFn: multiColumnUserFilter,
      cell: ({ row }) => (
        <div>
          {row.getValue('username')} <br />
          <span className="text-xs text-neutral-500">
            ({row.original.userId})
          </span>
        </div>
      ),
    },
    {
      header: 'Nickname',
      accessorKey: 'nickname',
      enableHiding: false,
      size: 120,
      filterFn: multiColumnUserFilter,
    },
    {
      header: 'Type',
      accessorKey: 'type',
      size: 80,
      filterFn: typeFilter,
      cell: ({ row }) => {
        const type = row.getValue('type') as TransactionDoc['type']

        const className = typeBadgeMap[type] ?? 'bg-gray-600'

        return (
          <div className="flex gap-1 justify-start items-center">
            <Badge className={`${className} px-2`}>{type.toUpperCase()}</Badge>
            {type === 'vip' ? (
              <Tooltip>
                <TooltipTrigger className="text-gray-400">
                  <CircleQuestionMark size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Action: {row.original.meta?.['action'] as string}</p>
                  <p>
                    For {row.original.meta?.['durationDays'] as string} Days
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        )
      },
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      enableHiding: false,
      size: 80,
      cell: ({ row }) =>
        `$${formatNumberToReadableString(row.getValue('amount'))}`,
    },
    {
      header: 'Source',
      accessorKey: 'source',
      size: 80,
      cell: ({ row }) => {
        const source = row.getValue('source') as TransactionDoc['source']

        const className = sourceBadgeMap[source] ?? 'bg-gray-600'

        return (
          <Badge className={`${className} px-2`}>{source.toUpperCase()}</Badge>
        )
      },
    },
    {
      header: 'Bet ID',
      accessorKey: 'betId',
      size: 120,
      cell: ({ row }) => {
        return (
          <p className="wrap-anywhere">
            {row.getValue('betId') ? row.getValue('betId') : '-'}
          </p>
        )
      },
    },
    {
      header: 'Handled By',
      accessorKey: 'handledByUsername',
      size: 120,
      filterFn: multiColumnAdminFilter,
      cell: ({ row }) => (
        <div>
          {row.getValue('handledByUsername') ? (
            <div>
              {row.getValue('handledByUsername')}
              <br />
              <span className="text-xs text-neutral-500">
                ({row.original.handledBy})
              </span>
            </div>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      size: 140,
      cell: ({ row }) =>
        new Date(row.getValue('createdAt')).toLocaleString('cs'),
    },
  ]

  const table = useReactTable({
    data: transactions,
    columns,
    state: { pagination, sorting, columnFilters, columnVisibility },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const typeOptions = Array.from(
    new Set(transactions.map((tx) => tx.type))
  ).map((type, idx) => ({
    value: `${type}-${idx}`,
    label: type.toUpperCase(),
    realValue: type,
  }))

  const selectedTypeOptions = (
    table.getColumn('type')?.getFilterValue() as string[] | undefined
  )
    ?.map((val) => typeOptions.find((opt) => opt.realValue === val))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter(Boolean) as any[]

  const sourceOptions = Array.from(
    new Set(transactions.map((tx) => tx.source))
  ).map((source, idx) => ({
    value: `${source}-${idx}`,
    label: source.toUpperCase(),
    realValue: source,
  }))

  const selectedSourceOptions = (
    table.getColumn('source')?.getFilterValue() as string[] | undefined
  )
    ?.map((val) => sourceOptions.find((opt) => opt.realValue === val))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter(Boolean) as any[]

  return (
    <div className="space-y-4 w-7xl">
      <div className="flex gap-2 mb-4">
        <Input
          ref={inputRef}
          placeholder="Search by id, username or nickname..."
          onChange={(e) =>
            table.getColumn('username')?.setFilterValue(e.target.value)
          }
          className="max-w-72 h-[38px]"
        />

        <Input
          placeholder="Search by handled by or bet id..."
          onChange={(e) =>
            table.getColumn('handledByUsername')?.setFilterValue(e.target.value)
          }
          className="max-w-64 h-[38px]"
        />

        <MultipleSelector
          value={selectedTypeOptions}
          options={typeOptions}
          placeholder="Filter by type"
          emptyIndicator="No other types available"
          onChange={(selectedOptions) => {
            if (selectedOptions.length === 0) {
              table.getColumn('type')?.setFilterValue(undefined)
            } else {
              table
                .getColumn('type')
                ?.setFilterValue(selectedOptions.map((o) => o.realValue))
            }
          }}
        />

        <MultipleSelector
          value={selectedSourceOptions}
          options={sourceOptions}
          placeholder="Filter by source"
          emptyIndicator="No other sources available"
          onChange={(selectedOptions) => {
            if (selectedOptions.length === 0) {
              table.getColumn('source')?.setFilterValue(undefined)
            } else {
              table
                .getColumn('source')
                ?.setFilterValue(selectedOptions.map((o) => o.realValue))
            }
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="bg-transparent h-full border border-input"
            >
              <Columns3Icon size={16} /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {typeof col.columnDef.header === 'string'
                    ? col.columnDef.header
                    : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUpIcon className="w-4 h-4" />,
                          desc: <ChevronDownIcon className="w-4 h-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only">Rows per page</Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{' '}
            of{' '}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default TransactionTable

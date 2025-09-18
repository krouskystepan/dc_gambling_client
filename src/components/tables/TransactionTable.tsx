'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
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
import { useRouter, useSearchParams } from 'next/navigation'

interface TransactionTableProps {
  transactions: ITransaction[]
  guildId: string
  managerId: string
  page: number
  limit: number
  total: number
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
  // guildId,
  // managerId,
  page,
  limit,
  total,
}: TransactionTableProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: limit,
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
    },
    {
      header: 'Type',
      accessorKey: 'type',
      size: 80,
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

  const router = useRouter()
  const searchParams = useSearchParams()

  const updateUrl = (
    updates: Partial<{
      page: number
      limit: number
      search?: string
      searchAdmin?: string
      filterType?: string
      filterSource?: string
    }>
  ) => {
    const url = new URL(window.location.href)

    // Merge with existing params
    const currentParams = Object.fromEntries(url.searchParams.entries())

    // Update page and limit if provided, otherwise keep existing
    url.searchParams.set(
      'page',
      (updates.page ?? Number(currentParams.page) ?? 1).toString()
    )
    url.searchParams.set(
      'limit',
      (updates.limit ?? Number(currentParams.limit) ?? 10).toString()
    )

    // Helper to set or delete a param
    const setParam = (key: keyof typeof updates, value?: string) => {
      if (value !== undefined && value.length > 0)
        url.searchParams.set(key, value)
      else if (value === '') url.searchParams.delete(key)
      // else keep existing
    }

    // Merge updates with existing values
    setParam('search', updates.search ?? currentParams.search)
    setParam('searchAdmin', updates.searchAdmin ?? currentParams.searchAdmin)
    setParam('filterType', updates.filterType ?? currentParams.filterType)
    setParam('filterSource', updates.filterSource ?? currentParams.filterSource)

    router.push(url.pathname + url.search)
  }

  const table = useReactTable({
    data: transactions,
    columns,
    state: { pagination, sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(next)
      updateUrl({ page: next.pageIndex + 1, limit: next.pageSize })
    },
    pageCount: Math.ceil(total / limit),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: limit,
    })
  }, [page, limit])

  useEffect(() => {
    const search = searchParams?.get('search') || ''
    const searchAdmin = searchParams?.get('searchAdmin') || ''
    const filterType = searchParams?.get('filterType')?.split(',') || []
    const filterSource = searchParams?.get('filterSource')?.split(',') || []
    const page = Number(searchParams?.get('page') || 1)
    const limit = Number(searchParams?.get('limit') || 10)

    setPagination({ pageIndex: page - 1, pageSize: limit })
    table.getColumn('username')?.setFilterValue(search || undefined)
    table
      .getColumn('handledByUsername')
      ?.setFilterValue(searchAdmin || undefined)
    table
      .getColumn('type')
      ?.setFilterValue(filterType.length ? filterType : undefined)
    table
      .getColumn('source')
      ?.setFilterValue(filterSource.length ? filterSource : undefined)

    if (inputRef.current) inputRef.current.value = search
  }, [searchParams, table])

  type Option<T = string> = {
    value: string
    label: string
    realValue: T
  }

  const typeOptions: Option<TransactionDoc['type']>[] = Object.keys(
    typeBadgeMap
  ).map((type, idx) => ({
    value: `${type}-${idx}`,
    label: type.toUpperCase(),
    realValue: type as TransactionDoc['type'],
  }))

  const sourceOptions: Option<TransactionDoc['source']>[] = Object.keys(
    sourceBadgeMap
  ).map((source, idx) => ({
    value: `${source}-${idx}`,
    label: source.toUpperCase(),
    realValue: source as TransactionDoc['source'],
  }))

  const selectedTypeOptions: Option<TransactionDoc['type']>[] =
    (
      table.getColumn('type')?.getFilterValue() as
        | TransactionDoc['type'][]
        | undefined
    )
      ?.map((val) => typeOptions.find((opt) => opt.realValue === val))
      .filter((opt): opt is Option<TransactionDoc['type']> => !!opt) || []

  const selectedSourceOptions: Option<TransactionDoc['source']>[] =
    (
      table.getColumn('source')?.getFilterValue() as
        | TransactionDoc['source'][]
        | undefined
    )
      ?.map((val) => sourceOptions.find((opt) => opt.realValue === val))
      .filter((opt): opt is Option<TransactionDoc['source']> => !!opt) || []

  return (
    <div className="space-y-4 w-7xl">
      <div className="flex gap-2 mb-4">
        <Input
          ref={inputRef}
          placeholder="Search by user ID..."
          onChange={(e) => {
            table.getColumn('username')?.setFilterValue(e.target.value)
            updateUrl({ search: e.target.value, page: 1 })
          }}
          className="max-w-72 h-[38px]"
        />

        <Input
          placeholder="Search by admin ID or bet ID..."
          onChange={(e) => {
            table.getColumn('handledByUsername')?.setFilterValue(e.target.value)
            updateUrl({ searchAdmin: e.target.value, page: 1 })
          }}
          className="max-w-64 h-[38px]"
        />

        <MultipleSelector
          value={selectedTypeOptions}
          options={typeOptions}
          placeholder="Filter by type"
          emptyIndicator="No other types available"
          onChange={(selectedOptions) => {
            const types = selectedOptions.map((o) => o.realValue)
            table
              .getColumn('type')
              ?.setFilterValue(types.length ? types : undefined)
            updateUrl({ filterType: types.join(','), page: 1 })
          }}
        />

        <MultipleSelector
          value={selectedSourceOptions}
          options={sourceOptions}
          placeholder="Filter by source"
          emptyIndicator="No other sources available"
          onChange={(selectedOptions) => {
            const sources = selectedOptions.map((o) => o.realValue)
            table
              .getColumn('source')
              ?.setFilterValue(sources.length ? sources : undefined)
            updateUrl({ filterSource: sources.join(','), page: 1 })
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
              const newPageSize = Number(value)
              table.setPageSize(newPageSize)
              updateUrl({ page: 1, limit: newPageSize })
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
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                total
              )}
            </span>{' '}
            of <span className="text-foreground">{total}</span>
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

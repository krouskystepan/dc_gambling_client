'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  PaginationState,
  VisibilityState,
  SortingState,
  useReactTable,
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
  FilterIcon,
  RefreshCcw,
} from 'lucide-react'
import { formatNumberToReadableString } from '@/lib/utils'
import Image from 'next/image'
import {
  ITransaction,
  ITransactionCounts,
} from '@/actions/database/transaction.action'
import { TransactionDoc } from '@/models/Transaction'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination'
import { Label } from '../ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Checkbox } from '../ui/checkbox'

interface TransactionTableProps {
  transactions: ITransaction[]
  transactionCounts: ITransactionCounts
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
  transactionCounts,
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
  const [isLoading, setIsLoading] = useState(false)

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
      enableSorting: false,
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
      enableSorting: false,
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
      enableSorting: false,
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
      sort?: string
    }>
  ) => {
    const url = new URL(window.location.href)
    const currentParams = Object.fromEntries(url.searchParams.entries())

    const pageNum = updates.page ?? Number(currentParams.page)
    const limitNum = updates.limit ?? Number(currentParams.limit)

    url.searchParams.set('page', isNaN(pageNum) ? '1' : pageNum.toString())
    url.searchParams.set('limit', isNaN(limitNum) ? '10' : limitNum.toString())

    const setParam = (key: keyof typeof updates, value?: string) => {
      if (value !== undefined && value.length > 0)
        url.searchParams.set(key, value)
      else if (value === '') url.searchParams.delete(key)
    }

    setParam('search', updates.search ?? currentParams.search)
    setParam('searchAdmin', updates.searchAdmin ?? currentParams.searchAdmin)
    setParam('filterType', updates.filterType ?? currentParams.filterType)
    setParam('filterSource', updates.filterSource ?? currentParams.filterSource)
    setParam('sort', updates.sort ?? currentParams.sort)

    router.push(url.pathname + url.search, { scroll: false })
  }

  useEffect(() => {
    setIsLoading(false)
  }, [transactions])

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const sort = next
        .map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`)
        .join(',')
      updateUrl({ page: 1, sort })
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)
      const typeFilter =
        (
          next.find((f) => f.id === 'type')?.value as string[] | undefined
        )?.join(',') ?? ''
      const sourceFilter =
        (
          next.find((f) => f.id === 'source')?.value as string[] | undefined
        )?.join(',') ?? ''
      updateUrl({ page: 1, filterType: typeFilter, filterSource: sourceFilter })
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(next)
      updateUrl({ page: next.pageIndex + 1, limit: next.pageSize })
    },
    pageCount: Math.ceil(total / limit),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    const search = searchParams?.get('search') || ''
    const searchAdmin = searchParams?.get('searchAdmin') || ''
    const filterType = searchParams?.get('filterType')?.split(',') || []
    const filterSource = searchParams?.get('filterSource')?.split(',') || []
    const pageFromUrl = Number(searchParams?.get('page') || 1)
    const limitFromUrl = Number(searchParams?.get('limit') || 10)

    table.setPageIndex(pageFromUrl - 1)
    table.setPageSize(limitFromUrl)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  type Option<T = string> = {
    value: string
    label: string
    realValue: T
  }

  const capitalizeFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

  const typeOptions: Option<TransactionDoc['type']>[] = Object.keys(
    typeBadgeMap
  ).map((type, idx) => ({
    value: `${type}-${idx}`,
    label: capitalizeFirst(type),
    realValue: type as TransactionDoc['type'],
  }))

  const sourceOptions: Option<TransactionDoc['source']>[] = Object.keys(
    sourceBadgeMap
  ).map((source, idx) => ({
    value: `${source}-${idx}`,
    label: capitalizeFirst(source),
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

  const debouncedUpdateUrl = useDebounce<Parameters<typeof updateUrl>[0]>(
    updateUrl,
    500
  )

  return (
    <div className="space-y-4 w-7xl">
      <div className="flex justify-between gap-2">
        <div className="flex gap-2 flex-1 min-w-0">
          <Input
            ref={inputRef}
            placeholder="Search by user ID..."
            onChange={(e) => {
              table.getColumn('username')?.setFilterValue(e.target.value)
              debouncedUpdateUrl({ search: e.target.value, page: 1 })
            }}
            className="max-w-60 h-[38px]"
          />

          <Input
            placeholder="Search by admin ID or bet ID..."
            onChange={(e) => {
              table
                .getColumn('handledByUsername')
                ?.setFilterValue(e.target.value)
              debouncedUpdateUrl({ searchAdmin: e.target.value, page: 1 })
            }}
            className="max-w-60 h-[38px]"
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-[38px]">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Type
                {selectedTypeOptions.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedTypeOptions.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Filter by Type
                </div>
                <div className="space-y-3">
                  {typeOptions.map((option, i) => {
                    const count = transactionCounts.type[option.realValue] ?? 0
                    return (
                      <div
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`type-${i}`}
                          checked={selectedTypeOptions.some(
                            (sel) => sel.realValue === option.realValue
                          )}
                          onCheckedChange={(checked: boolean) => {
                            let next: Option<TransactionDoc['type']>[] = []
                            if (checked) {
                              next = [...selectedTypeOptions, option]
                            } else {
                              next = selectedTypeOptions.filter(
                                (sel) => sel.realValue !== option.realValue
                              )
                            }
                            table
                              .getColumn('type')
                              ?.setFilterValue(
                                next.length
                                  ? next.map((o) => o.realValue)
                                  : undefined
                              )
                            updateUrl({
                              filterType: next
                                .map((o) => o.realValue)
                                .join(','),
                              page: 1,
                            })
                          }}
                        />
                        <Label
                          htmlFor={`type-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {option.label}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {count}
                          </span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-[38px]">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Source
                {selectedSourceOptions.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedSourceOptions.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Filter by Source
                </div>
                <div className="space-y-3">
                  {sourceOptions.map((option, i) => {
                    const count =
                      transactionCounts.source[option.realValue] ?? 0
                    return (
                      <div
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`source-${i}`}
                          checked={selectedSourceOptions.some(
                            (sel) => sel.realValue === option.realValue
                          )}
                          onCheckedChange={(checked) => {
                            let next: Option<TransactionDoc['source']>[] = []
                            if (checked) {
                              next = [...selectedSourceOptions, option]
                            } else {
                              next = selectedSourceOptions.filter(
                                (sel) => sel.realValue !== option.realValue
                              )
                            }
                            table
                              .getColumn('source')
                              ?.setFilterValue(
                                next.length
                                  ? next.map((o) => o.realValue)
                                  : undefined
                              )
                            updateUrl({
                              filterSource: next
                                .map((o) => o.realValue)
                                .join(','),
                              page: 1,
                            })
                          }}
                        />
                        <Label
                          htmlFor={`source-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {option.label}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {count}
                          </span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-full">
                <Columns3Icon size={16} /> View
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

          <Button
            variant="secondary"
            onClick={() => {
              setIsLoading(true)
              const url = new URL(window.location.href)
              router.replace(url.pathname + url.search, { scroll: false })
            }}
            disabled={isLoading}
            className="h-full"
          >
            <RefreshCcw size={16} /> Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className="w-full table-auto">
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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

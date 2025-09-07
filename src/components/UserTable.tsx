'use client'

import { useRef, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import { cn, formatNumberToReadableString } from '@/lib/utils'
import { GuildMemberStatus } from '@/types/types'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  depositBalance,
  registerUser,
  resetBalance,
  unregisterUser,
  withdrawBalance,
} from '@/actions/database'
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { toast } from 'sonner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface UserTableProps {
  users: GuildMemberStatus[]
  guildId: string
  managerId: string
}

const multiColumnFilter = (
  row: Row<GuildMemberStatus>,
  columnId: string,
  filterValue: string
) => {
  const searchableContent = `${row.original.username} ${
    row.original.nickname ?? ''
  } ${row.original.userId}`.toLowerCase()
  return searchableContent.includes(filterValue.toLowerCase())
}

const UserTable = ({ users, guildId, managerId }: UserTableProps) => {
  const [data, setData] = useState(users)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const columns: ColumnDef<GuildMemberStatus>[] = [
    {
      header: 'Image',
      accessorKey: 'avatar',
      enableSorting: false,
      enableColumnFilter: false,
      size: 60,
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
      size: 160,
      filterFn: multiColumnFilter,
      cell: ({ row }) => (
        <p>
          {row.getValue('username')}
          <br />
          <span className="text-xs text-neutral-500">
            ({row.original.userId})
          </span>
        </p>
      ),
    },
    {
      header: 'Nickname',
      accessorKey: 'nickname',
      size: 180,
      filterFn: multiColumnFilter,
      cell: ({ row }) => row.getValue('nickname'),
    },
    {
      header: 'Balance',
      accessorKey: 'balance',
      size: 80,
      cell: ({ row }) =>
        row.original.registered
          ? formatNumberToReadableString(row.getValue('balance'))
          : '-',
    },
    {
      header: 'Registered At',
      accessorKey: 'registeredAt',
      size: 100,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const dateString = row.getValue('registeredAt') as string | null
        return dateString ? new Date(dateString).toLocaleDateString('cs') : '-'
      },
    },
    {
      header: 'Registered',
      accessorKey: 'registered',
      size: 120,
      cell: ({ row }) => {
        const isRegistered = row.getValue('registered')
        return (
          <span
            className={cn(
              'px-2 py-0.5 text-xs rounded-full font-medium',
              isRegistered
                ? 'bg-green-600 text-gray-100'
                : 'bg-red-600 text-gray-100'
            )}
          >
            {isRegistered ? 'Registered' : 'Not Registered'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 60,
      cell: ({ row }) => (
        <RowActions
          row={row}
          guildId={guildId}
          managerId={managerId}
          setData={setData}
        />
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4 w-5xl">
      <Input
        ref={inputRef}
        placeholder="Search by username, nickname or ID..."
        onChange={(e) =>
          table.getColumn('username')?.setFilterValue(e.target.value)
        }
        className="max-w-xs mb-4"
      />

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
                    <TableCell
                      key={cell.id}
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
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
      <div className="flex items-center justify-end gap-8">
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

function RowActions({
  row,
  guildId,
  managerId,
  setData,
}: {
  row: Row<GuildMemberStatus>
  guildId: string
  managerId: string
  setData: React.Dispatch<React.SetStateAction<GuildMemberStatus[]>>
}) {
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>(
    {}
  )

  const toggleDropdown = (userId: string, open: boolean) => {
    setDropdownStates((prev) => ({ ...prev, [userId]: open }))
  }
  const [alertOpen, setAlertOpen] = useState(false)
  const [balanceModal, setBalanceModal] = useState<
    null | 'deposit' | 'withdraw' | 'reset'
  >(null)
  const [amount, setAmount] = useState('')

  const handleBalanceAction = async () => {
    const value = parseFloat(amount)
    if (
      (balanceModal === 'deposit' || balanceModal === 'withdraw') &&
      (isNaN(value) || value <= 0)
    ) {
      toast.error('Enter a valid number')
      return
    }

    try {
      if (balanceModal === 'deposit') {
        const result = await depositBalance(
          row.original.userId,
          guildId,
          managerId,
          value
        )
        if (result.success) {
          setData((prev) =>
            prev.map((u) =>
              u.userId === row.original.userId
                ? { ...u, balance: (u.balance || 0) + value }
                : u
            )
          )
          toast.success(result.message)
        } else toast.error(result.message)
      } else if (balanceModal === 'withdraw') {
        const result = await withdrawBalance(
          row.original.userId,
          guildId,
          managerId,
          value
        )
        if (result.success) {
          setData((prev) =>
            prev.map((u) =>
              u.userId === row.original.userId
                ? { ...u, balance: (u.balance || 0) - value }
                : u
            )
          )
          toast.success(result.message)
        } else toast.error(result.message)
      } else if (balanceModal === 'reset') {
        const result = await resetBalance(
          row.original.userId,
          guildId,
          managerId
        )
        if (result.success) {
          setData((prev) =>
            prev.map((u) =>
              u.userId === row.original.userId ? { ...u, balance: 0 } : u
            )
          )
          toast.success(result.message)
        } else toast.error(result.message)
      }
    } catch (err) {
      toast.error('Action failed')
      console.error(err)
    }

    setAmount('')
    setBalanceModal(null)
  }

  const handleRegisterAction = async () => {
    try {
      const result = row.original.registered
        ? await unregisterUser(row.original.userId, guildId, managerId)
        : await registerUser(row.original.userId, guildId, managerId)

      if (result.success) {
        toast.success(result.message)
        setData((prev) =>
          prev.map((u) =>
            u.userId === row.original.userId
              ? {
                  ...u,
                  registered: !u.registered,
                  registeredAt: !u.registered ? new Date().toISOString() : null,
                }
              : u
          )
        )
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to register/unregister user')
    }
  }

  return (
    <>
      <DropdownMenu
        open={!!dropdownStates[row.original.userId]}
        onOpenChange={(open) => toggleDropdown(row.original.userId, open)}
      >
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <EllipsisIcon className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Balance Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setBalanceModal('deposit')}
            disabled={!row.original.registered}
          >
            Deposit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setBalanceModal('withdraw')}
            disabled={!row.original.registered}
          >
            Withdraw
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setBalanceModal('reset')}
            disabled={!row.original.registered}
          >
            Reset
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Registration</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setAlertOpen(true)}>
            {row.original.registered ? 'Unregister' : 'Register'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!balanceModal} onOpenChange={() => setBalanceModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {balanceModal
                ? balanceModal.charAt(0).toUpperCase() + balanceModal.slice(1)
                : ''}{' '}
              for {row.original.username}
            </DialogTitle>
            <DialogDescription>
              {balanceModal === 'reset'
                ? 'This will reset the balance to 0.'
                : 'Enter the amount:'}
            </DialogDescription>
          </DialogHeader>

          {balanceModal !== 'reset' && (
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded p-2 w-full my-2"
              placeholder="Enter amount"
            />
          )}

          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleBalanceAction}>
              {balanceModal
                ? balanceModal.charAt(0).toUpperCase() + balanceModal.slice(1)
                : ''}{' '}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration Alert */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.{' '}
              {row.original.registered
                ? 'The user will be unregistered.'
                : 'The user will be registered.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleRegisterAction()
                setAlertOpen(false)
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default UserTable

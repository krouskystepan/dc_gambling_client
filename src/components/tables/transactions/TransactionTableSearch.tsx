import { Input } from '@/components/ui/input'
import { ITransaction } from '@/types/types'
import { Table } from '@tanstack/react-table'
import React, { ChangeEvent, RefObject } from 'react'

interface TransactionSearchProps {
  table: Table<ITransaction>
  inputRef: RefObject<HTMLInputElement | null>
  inputType: keyof ITransaction
  placeholder: string
  initialValue?: string // add initialValue prop
}

const TransactionTableSearch = ({
  table,
  inputRef,
  inputType,
  placeholder,
  initialValue = '',
}: TransactionSearchProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    table.getColumn(inputType)?.setFilterValue(value || undefined)
  }

  return (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      value={initialValue}
      onChange={handleChange}
      className="max-w-60 h-[38px]"
    />
  )
}

export default TransactionTableSearch

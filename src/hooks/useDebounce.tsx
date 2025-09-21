import { useRef } from 'react'

export const useDebounce = <TArgs,>(
  func: (args: TArgs) => void,
  delay: number
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return (args: TArgs) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => func(args), delay)
  }
}

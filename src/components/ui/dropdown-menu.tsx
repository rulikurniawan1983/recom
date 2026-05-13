import * as React from 'react'
import { cn } from '@/lib/utils'

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {}
})

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  return (
    <div onClick={() => setOpen(prev => !prev)}>
      {children}
    </div>
  )
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
}

export function DropdownMenuContent({ children, className, align = 'start', ...props }: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  if (!open) return null

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          'absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5',
          alignmentClasses[align],
          className
        )}
        {...props}
      >
        <div className="py-1">{children}</div>
      </div>
    </>
  )
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onClick?: () => void
}

export function DropdownMenuItem({ children, className, onClick, ...props }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    setOpen(false)
    onClick?.()
  }

  return (
    <div
      className={cn(
        'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

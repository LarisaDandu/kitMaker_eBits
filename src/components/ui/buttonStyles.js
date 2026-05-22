import { cn } from '../../lib/cn'

const variants = {
  primary: 'border-transparent bg-text text-background',
  accent: 'border-transparent bg-text text-accent-1',
  danger: 'border-transparent bg-accent-2 text-background',
  outline: 'border-accent-2 bg-transparent text-text',
  outlineStrong: 'border-text bg-transparent text-text',
  ghost: 'border-transparent bg-transparent text-text',
}

const sizes = {
  sm: 'min-h-10 px-5 py-2.5 text-sm',
  md: 'min-h-12 px-7 py-3 text-base',
  lg: 'min-h-[52px] px-10 py-3 text-xl',
  xl: 'min-h-[60px] px-10 py-3 text-3xl',
  icon: 'size-10 p-0 text-base',
}

export function buttonClassName({
  variant = 'primary',
  size = 'sm',
  fullWidth = false,
  rounded = 'full',
  className,
} = {}) {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border font-body font-medium no-underline transition-opacity hover:opacity-90',
    rounded === 'full' ? 'rounded-full' : 'rounded-xl',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )
}

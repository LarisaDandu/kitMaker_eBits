import { cn } from '../../lib/cn'

export default function FormInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-full border-2 border-accent-2 bg-background px-4 py-3 font-body text-sm text-text outline-none',
        'placeholder:text-text-secondary',
        'focus:outline-2 focus:outline-offset-2 focus:outline-accent-2-lighter',
        className,
      )}
      {...props}
    />
  )
}

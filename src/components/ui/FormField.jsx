import { cn } from '../../lib/cn'

export default function FormField({ label, htmlFor, children, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="font-body text-sm font-medium text-text">
        {label}
      </label>
      {children}
    </div>
  )
}

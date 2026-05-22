import { buttonClassName } from './buttonStyles'

export default function Button({
  variant = 'primary',
  size = 'sm',
  fullWidth = false,
  rounded = 'full',
  type = 'button',
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClassName(
        {
          variant,
          size,
          fullWidth,
          rounded,
          className,
        },
      )}
      {...props}
    >
      {children}
    </button>
  )
}

import Button from './Button'

export default function UndoToast({ message, actionLabel = 'Undo', onAction, onClose }) {
  return (
    <div
      role="status"
      className="fixed right-6 bottom-6 z-50 flex max-w-[420px] items-center gap-4 rounded-[18px] bg-text px-5 py-4 text-background shadow-xl max-sm:right-4 max-sm:bottom-4 max-sm:left-4"
    >
      <p className="m-0 flex-1 text-sm font-medium">{message}</p>
      <Button
        type="button"
        variant="accent"
        size="sm"
        rounded="xl"
        className="bg-accent-1 text-text"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
      <button
        type="button"
        aria-label="Dismiss notification"
        className="border-none bg-transparent p-0 text-xl leading-none text-background"
        onClick={onClose}
      >
        X
      </button>
    </div>
  )
}

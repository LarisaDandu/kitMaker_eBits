import Button from './Button'

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/60 px-4 py-8"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-[440px] rounded-[20px] bg-background-secondary px-6 py-6 text-text shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="m-0 text-2xl font-bold">
          {title}
        </h2>
        <p className="m-0 mt-4 text-base leading-snug text-text-secondary">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" rounded="xl" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" rounded="xl" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  )
}

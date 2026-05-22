import Button from '../ui/Button'

export default function PrototypeAccessModal({ onCancel, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/60 px-4 py-8">
      <section className="w-full max-w-[560px] rounded-[20px] bg-background-secondary px-7 py-7 shadow-xl">
        <h2 className="m-0 text-2xl font-bold text-text">Prototype access</h2>
        <p className="m-0 mt-4 text-base leading-snug text-text">
          You can only have one active kit at a time. For demonstration purposes
          in this prototype, you will be granted access to the kit maker.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={onContinue}
            variant="accent"
            size="md"
            rounded="xl"
          >
            Continue
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outlineStrong"
            size="md"
            rounded="xl"
          >
            Cancel
          </Button>
        </div>
      </section>
    </div>
  )
}

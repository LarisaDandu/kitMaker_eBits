import { cn } from '../../lib/cn'

function ArrowIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function KitBuilderChoiceCard({ title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex min-h-[250px] w-full cursor-pointer rounded-xl border-none bg-text px-10 py-9 text-left shadow-md',
        'font-body text-3xl font-normal text-background transition-opacity hover:opacity-95 max-sm:min-h-[180px] max-sm:px-6 max-sm:text-2xl',
      )}
    >
      {title}
      <span className="absolute right-8 bottom-8 flex size-20 items-center justify-center rounded-full border-4 border-accent-1 text-accent-1 max-sm:size-16">
        <ArrowIcon />
      </span>
    </button>
  )
}

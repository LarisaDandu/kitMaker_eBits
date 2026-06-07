import { KIT_PROGRESS_STEPS } from '../../data/kits'
import { cn } from '../../lib/cn'
import HelpTooltip from '../ui/HelpTooltip'

function StepNode({ state }) {
  return (
    <div
      className={cn(
        'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2',
        state === 'complete' && 'border-text bg-text text-background',
        state === 'current' && 'border-text bg-text',
        state === 'upcoming' && 'border-text-secondary bg-background-secondary',
      )}
    >
      {state === 'complete' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12l5 5L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : state === 'current' ? (
        <span className="size-2.5 rounded-full bg-background" />
      ) : null}
    </div>
  )
}

export default function KitProgress({ progressStep = 0 }) {
  return (
    <section
      className={cn('rounded-[20px] bg-background-secondary px-6 py-5 max-sm:rounded-2xl max-sm:px-4')}
      aria-label="Kit status progress"
    >
      <h2 className={cn('m-0 mb-6 flex items-center gap-2 font-body text-base font-semibold text-text')}>
        Status
        <HelpTooltip label="Progress help">
          Current stage for review, ordering, and assembly.
        </HelpTooltip>
      </h2>

      <div className="relative">
        <div
          className={cn(
            'absolute top-4 right-4 left-4 h-0.5 bg-background-third',
            'max-sm:hidden',
          )}
          aria-hidden="true"
        />

        <ol
          className={cn(
            'relative m-0 flex list-none justify-between gap-2 p-0',
            'max-sm:flex-col max-sm:gap-4',
          )}
        >
          {KIT_PROGRESS_STEPS.map((label, index) => {
            const state =
              index < progressStep
                ? 'complete'
                : index === progressStep
                  ? 'current'
                  : 'upcoming'

            return (
              <li
                key={label}
                className={cn(
                  'flex flex-col items-center gap-2 text-center',
                  'max-sm:flex-row max-sm:items-center max-sm:gap-3 max-sm:text-left',
                )}
              >
                <StepNode state={state} />
                <span
                  className={cn(
                    'max-w-[100px] font-body text-sm leading-snug text-text-secondary',
                    state === 'current' && 'font-medium text-text',
                    'max-sm:max-w-none',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

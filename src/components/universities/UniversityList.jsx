import UniversityCard from './UniversityCard'
import { cn } from '../../lib/cn'

export default function UniversityList({
  universities,
  onDelete,
  emptyMessage = 'No customers match your filters.',
}) {
  return (
    <section
      className={cn(
        'px-6 pt-5 pb-6',
        'max-sm:px-0 max-sm:py-4',
      )}
      aria-label="Client list"
    >
      {universities.length === 0 ? (
        <p className={cn('py-8 text-center text-[0.95rem] text-text-secondary')}>
          {emptyMessage}
        </p>
      ) : (
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
          {universities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
              onDelete={(id) => onDelete(id, university.name)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

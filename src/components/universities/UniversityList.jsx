import UniversityCard from './UniversityCard'
import { cn } from '../../lib/cn'

export default function UniversityList({ universities, onDelete }) {
  return (
    <section
      className={cn(
        'rounded-[20px] bg-background-third px-6 pt-5 pb-6',
        'max-sm:rounded-2xl max-sm:px-4 max-sm:py-4',
      )}
      aria-label="Client list"
    >
      {universities.length === 0 ? (
        <p className={cn('py-8 text-center text-[0.95rem] text-text-secondary')}>
          No clients match your search or filter.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
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

'use client'

interface FiltersProps {
  persons: string[]
  selectedPersons: string[]
  search: string
  onPersonToggle: (person: string) => void
  onSearchChange: (value: string) => void
  totalCount: number
  filteredCount: number
  personCounts: Record<string, number>
}

export default function Filters({
  persons,
  selectedPersons,
  search,
  onPersonToggle,
  onSearchChange,
  totalCount,
  filteredCount,
  personCounts,
}: FiltersProps) {
  const allSelected = selectedPersons.length === 0

  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-3 py-2.5 flex flex-wrap gap-2 items-center">
      {/* Draft count */}
      <span className="text-xs font-semibold text-[#1d2226] mr-1">
        {filteredCount} {filteredCount === 1 ? 'draft' : 'drafts'}
      </span>

      {/* Person chips */}
      <button
        onClick={() => selectedPersons.forEach((p) => onPersonToggle(p))}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          allSelected
            ? 'bg-[#1d2226] text-white'
            : 'bg-[#f3f2ef] text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.08)]'
        }`}
      >
        All
      </button>
      {persons.map((person) => {
        const active = selectedPersons.includes(person)
        return (
          <button
            key={person}
            onClick={() => onPersonToggle(person)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              active
                ? 'bg-[#0a66c2] text-white'
                : 'bg-[#f3f2ef] text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.08)]'
            }`}
          >
            {person} <span className="opacity-70">({personCounts[person] ?? 0})</span>
          </button>
        )
      })}
    </div>
  )
}

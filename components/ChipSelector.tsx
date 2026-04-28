'use client'

interface Props {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multi?: boolean
}

export default function ChipSelector({
  options,
  selected,
  onChange,
  multi = true,
}: Props) {
  const toggle = (option: string) => {
    if (multi) {
      onChange(
        selected.includes(option)
          ? selected.filter(s => s !== option)
          : [...selected, option]
      )
    } else {
      onChange(selected.includes(option) ? [] : [option])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const active = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              active
                ? 'bg-violet-100 border-violet-400 text-violet-800 font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
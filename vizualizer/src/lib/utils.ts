const COLOR_PALETTE = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600',
]

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(name: string): string {
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COLOR_PALETTE[hash % COLOR_PALETTE.length]
}

export function formatDate(dateStr: string | Date): string {
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

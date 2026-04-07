import { siteConfig } from '@/site.config'

// ── Persona config (derived from site.config.ts) ────────────
export const PERSONA_CONFIG: Record<string, {
  name: string
  role: string
  color: string
  photo?: string
}> = Object.fromEntries(
  Object.entries(siteConfig.personas).map(([, p]) => [
    p.trackerKey,
    { name: p.name, role: p.shortRole, color: p.color, photo: p.photo },
  ])
)

export const PERSONA_KEYS = Object.keys(PERSONA_CONFIG)

// ── Types ────────────────────────────────────────────────────
export interface PersonaStats {
  impressions: number
  followers: number
}

export interface WeekEntry {
  week: string // Sunday date: YYYY-MM-DD
  personas: Record<string, PersonaStats>
}

// ── Weekly data (from site.config.ts) ────────────────────────
export const WEEKLY_DATA: WeekEntry[] = siteConfig.weeklyData as unknown as WeekEntry[]

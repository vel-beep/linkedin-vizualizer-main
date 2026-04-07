'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { WEEKLY_DATA, PERSONA_CONFIG, PERSONA_KEYS, type WeekEntry } from './data'
import { siteConfig } from '@/site.config'

// ── Helpers ──────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function fmtFull(n: number): string {
  return n.toLocaleString()
}

function fmtWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTotal(entry: WeekEntry, metric: 'impressions' | 'followers'): number {
  return Object.values(entry.personas).reduce((sum, p) => sum + p[metric], 0)
}

function getDelta(current: number, previous: number) {
  return {
    abs: current - previous,
    pct: previous > 0 ? ((current - previous) / previous) * 100 : 0,
  }
}

// ── Summary Card ─────────────────────────────────────────────
function SummaryCard({ title, value, delta, icon }: {
  title: string
  value: string
  delta?: { abs: number; pct: number } | null
  icon: React.ReactNode
}) {
  const isUp = delta && delta.abs > 0
  const isDown = delta && delta.abs < 0

  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[rgba(0,0,0,0.6)] font-medium">{title}</p>
        <div className="text-[rgba(0,0,0,0.3)]">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-[#1d2226]">{value}</p>
      {delta && delta.abs !== 0 ? (
        <p className={`text-xs mt-1 font-medium ${
          isUp ? 'text-emerald-600' : isDown ? 'text-red-500' : 'text-[rgba(0,0,0,0.4)]'
        }`}>
          {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{fmtFull(delta.abs)} ({delta.pct > 0 ? '+' : ''}{delta.pct.toFixed(1)}%)
        </p>
      ) : (
        <p className="text-xs mt-1 text-[rgba(0,0,0,0.3)]">
          {WEEKLY_DATA.length === 1 ? 'First week' : 'No change'}
        </p>
      )}
    </div>
  )
}

// ── Persona Toggle Chip ──────────────────────────────────────
function PersonaChip({ personKey, active, onClick }: {
  personKey: string
  active: boolean
  onClick: () => void
}) {
  const config = PERSONA_CONFIG[personKey]

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium ${
        active
          ? 'border-[rgba(0,0,0,0.2)] bg-white text-[#1d2226] shadow-sm'
          : 'border-transparent bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.35)]'
      }`}
    >
      {config.photo ? (
        <img src={config.photo} alt="" className={`w-5 h-5 rounded-full object-cover ${active ? '' : 'opacity-40'}`} />
      ) : (
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${active ? '' : 'opacity-40'}`}
          style={{ backgroundColor: config.color }}
        >
          {config.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
      )}
      <span className="hidden sm:inline">{config.name.split(' ')[0]}</span>
      <span className="sm:hidden">{config.name.split(' ')[0].slice(0, 3)}</span>
    </button>
  )
}

// ── Custom Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-[#1d2226] mb-2 text-xs">{label}</p>
      {payload
        .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
        .map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-xs">{fmtFull(entry.value ?? 0)}</span>
          </div>
        ))}
    </div>
  )
}

// ── Persona Card ─────────────────────────────────────────────
function PersonaCard({ personKey, current, previous, rank }: {
  personKey: string
  current: { impressions: number; followers: number }
  previous?: { impressions: number; followers: number }
  rank: number
}) {
  const config = PERSONA_CONFIG[personKey]
  const imprDelta = previous ? getDelta(current.impressions, previous.impressions) : null
  const follDelta = previous ? getDelta(current.followers, previous.followers) : null
  const hasData = current.impressions > 0 || current.followers > 0

  return (
    <div className={`bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4 ${
      !hasData ? 'opacity-50' : ''
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {config.photo ? (
            <img src={config.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: config.color }}
            >
              {config.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
          )}
          {rank <= 3 && hasData && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
              rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
            }`}>
              {rank}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-[#1d2226] truncate">{config.name}</p>
          <p className="text-xs text-[rgba(0,0,0,0.6)]">{config.role}</p>
        </div>
        <div
          className="w-3 h-3 rounded-full ml-auto shrink-0"
          style={{ backgroundColor: config.color }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[rgba(0,0,0,0.5)] uppercase tracking-wide font-medium">Impressions</p>
          <p className="text-lg font-bold text-[#1d2226]">{hasData ? fmt(current.impressions) : '--'}</p>
          {imprDelta && imprDelta.abs !== 0 && (
            <p className={`text-[11px] font-medium ${imprDelta.abs > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {imprDelta.abs > 0 ? '↑' : '↓'} {imprDelta.abs > 0 ? '+' : ''}{fmt(imprDelta.abs)}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-[rgba(0,0,0,0.5)] uppercase tracking-wide font-medium">Followers</p>
          <p className="text-lg font-bold text-[#1d2226]">{hasData ? fmt(current.followers) : '--'}</p>
          {follDelta && follDelta.abs !== 0 && (
            <p className={`text-[11px] font-medium ${follDelta.abs > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {follDelta.abs > 0 ? '↑' : '↓'} {follDelta.abs > 0 ? '+' : ''}{fmt(follDelta.abs)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Chart wrapper ────────────────────────────────────────────
function MetricChart({ title, data, activePersonas, metric }: {
  title: string
  data: Record<string, any>[]
  activePersonas: string[]
  metric: string
}) {
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
      <h3 className="text-sm font-semibold text-[#1d2226] mb-1">{title}</h3>
      <p className="text-[10px] text-[rgba(0,0,0,0.4)] mb-4">
        Dashed line = team total
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.5)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.5)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          {activePersonas.map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={PERSONA_CONFIG[key].color}
              strokeWidth={2}
              dot={{ r: 4, fill: PERSONA_CONFIG[key].color, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          ))}
          <Line
            type="monotone"
            dataKey="Total"
            stroke="#1d2226"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={{ r: 5, fill: '#1d2226', strokeWidth: 0 }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function IconTrophy() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522m0 0a6.003 6.003 0 01-3.77-1.522" />
    </svg>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function TrackerPage() {
  const [activePersonas, setActivePersonas] = useState<string[]>(PERSONA_KEYS)

  const togglePersona = (key: string) => {
    setActivePersonas(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  // Latest and previous entries
  const latest = WEEKLY_DATA[WEEKLY_DATA.length - 1]
  const previous = WEEKLY_DATA.length > 1 ? WEEKLY_DATA[WEEKLY_DATA.length - 2] : null

  // Totals
  const totalImpr = getTotal(latest, 'impressions')
  const totalFoll = getTotal(latest, 'followers')
  const prevImpr = previous ? getTotal(previous, 'impressions') : null
  const prevFoll = previous ? getTotal(previous, 'followers') : null

  // Best persona this week (by impressions)
  const ranked = useMemo(() =>
    [...PERSONA_KEYS].sort((a, b) =>
      (latest.personas[b]?.impressions ?? 0) - (latest.personas[a]?.impressions ?? 0)
    ),
    [latest]
  )
  const topPersona = ranked[0]

  // Chart data: impressions
  const imprChartData = useMemo(() =>
    WEEKLY_DATA.map(entry => {
      const row: Record<string, any> = { week: fmtWeek(entry.week) }
      for (const key of PERSONA_KEYS) {
        if (activePersonas.includes(key)) {
          row[key] = entry.personas[key]?.impressions ?? 0
        }
      }
      row.Total = activePersonas.reduce(
        (sum, key) => sum + (entry.personas[key]?.impressions ?? 0), 0
      )
      return row
    }),
    [activePersonas]
  )

  // Chart data: followers
  const follChartData = useMemo(() =>
    WEEKLY_DATA.map(entry => {
      const row: Record<string, any> = { week: fmtWeek(entry.week) }
      for (const key of PERSONA_KEYS) {
        if (activePersonas.includes(key)) {
          row[key] = entry.personas[key]?.followers ?? 0
        }
      }
      row.Total = activePersonas.reduce(
        (sum, key) => sum + (entry.personas[key]?.followers ?? 0), 0
      )
      return row
    }),
    [activePersonas]
  )

  // Persona ranking for cards
  const personaRanks = useMemo(() => {
    const map: Record<string, number> = {}
    ranked.forEach((key, i) => { map[key] = i + 1 })
    return map
  }, [ranked])

  return (
    <div className="max-w-[1128px] mx-auto px-3 py-5">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#0a66c2] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1d2226]">{siteConfig.tracker.title}</h1>
            <p className="text-xs text-[rgba(0,0,0,0.6)]">
              {siteConfig.tracker.updateCadence} · Week of {fmtWeek(latest.week)}, {latest.week.slice(0, 4)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          title="Total Impressions"
          value={fmt(totalImpr)}
          delta={prevImpr !== null ? getDelta(totalImpr, prevImpr) : null}
          icon={<IconEye />}
        />
        <SummaryCard
          title="Total Followers"
          value={fmt(totalFoll)}
          delta={prevFoll !== null ? getDelta(totalFoll, prevFoll) : null}
          icon={<IconUsers />}
        />
        <SummaryCard
          title="Top Persona"
          value={topPersona ? PERSONA_CONFIG[topPersona].name.split(' ')[0] : '--'}
          icon={<IconTrophy />}
        />
        <SummaryCard
          title="Weeks Tracked"
          value={String(WEEKLY_DATA.length)}
          icon={<IconCalendar />}
        />
      </div>

      {/* ── Persona Filters ── */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-4 py-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[rgba(0,0,0,0.5)] font-medium uppercase tracking-wide mr-1">
            Filter personas
          </span>
          {PERSONA_KEYS.map(key => (
            <PersonaChip
              key={key}
              personKey={key}
              active={activePersonas.includes(key)}
              onClick={() => togglePersona(key)}
            />
          ))}
          {activePersonas.length < PERSONA_KEYS.length && (
            <button
              onClick={() => setActivePersonas(PERSONA_KEYS)}
              className="text-xs text-[#0a66c2] font-medium hover:underline ml-1"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <MetricChart
          title="Post Impressions"
          data={imprChartData}
          activePersonas={activePersonas}
          metric="impressions"
        />
        <MetricChart
          title="Followers"
          data={follChartData}
          activePersonas={activePersonas}
          metric="followers"
        />
      </div>

      {/* ── Per-Persona Breakdown ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1d2226]">Per Persona</h3>
          <span className="text-[10px] text-[rgba(0,0,0,0.4)] uppercase tracking-wide">
            Ranked by impressions
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ranked.map(key => (
            <PersonaCard
              key={key}
              personKey={key}
              current={latest.personas[key] ?? { impressions: 0, followers: 0 }}
              previous={previous?.personas[key]}
              rank={personaRanks[key]}
            />
          ))}
        </div>
      </div>

      {/* ── Weekly Table ── */}
      {WEEKLY_DATA.length > 1 && (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.08)]">
            <h3 className="text-sm font-semibold text-[#1d2226]">Weekly History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f9fafb]">
                  <th className="text-left px-4 py-2 font-medium text-[rgba(0,0,0,0.6)]">Week</th>
                  {PERSONA_KEYS.map(key => (
                    <th key={key} className="text-right px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">
                      {PERSONA_CONFIG[key].name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="text-right px-4 py-2 font-semibold text-[#1d2226]">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...WEEKLY_DATA].reverse().map((entry, i) => {
                  const total = getTotal(entry, 'impressions')
                  return (
                    <tr key={entry.week} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                      <td className="px-4 py-2 font-medium text-[#1d2226] whitespace-nowrap">
                        {fmtWeek(entry.week)}
                      </td>
                      {PERSONA_KEYS.map(key => (
                        <td key={key} className="text-right px-3 py-2 tabular-nums text-[rgba(0,0,0,0.7)]">
                          {entry.personas[key]?.impressions
                            ? fmtFull(entry.personas[key].impressions)
                            : '--'}
                        </td>
                      ))}
                      <td className="text-right px-4 py-2 tabular-nums font-semibold text-[#1d2226]">
                        {fmtFull(total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[rgba(0,0,0,0.3)]">
          {siteConfig.name} · Updated Sundays · {siteConfig.tracker.timezone}
        </p>
      </div>
    </div>
  )
}

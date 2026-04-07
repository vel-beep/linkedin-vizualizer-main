'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/site.config'

type Insight = {
  id: string
  session_id: string
  insight_type: string
  content: string
  post_angle: string
  persona_fit: string
  used: boolean
  created_at: string
  interview_sessions: { interviewee_name: string; interviewee_role: string } | null
}

const TYPE_COLORS: Record<string, string> = {
  quote: 'bg-[#e8f0fb] text-[#0a66c2]',
  pain_point: 'bg-[#fdecea] text-[#cc1016]',
  story: 'bg-[#fff7e6] text-[#915907]',
  stat: 'bg-[#e8f5e8] text-[#057642]',
}

const PERSONAS = Object.values(siteConfig.personas).map((p) => p.trackerKey)
const TYPES = ['quote', 'pain_point', 'story', 'stat']

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPersona, setFilterPersona] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterUsed, setFilterUsed] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterPersona) params.set('persona', filterPersona)
    if (filterType) params.set('type', filterType)
    if (filterUsed) params.set('used', filterUsed)

    setLoading(true)
    fetch(`/api/insights?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setInsights(data)
        setLoading(false)
      })
  }, [filterPersona, filterType, filterUsed])

  async function toggleUsed(insight: Insight) {
    const res = await fetch('/api/insights', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: insight.id, used: !insight.used }),
    })
    if (res.ok) {
      setInsights((prev) =>
        prev.map((i) => (i.id === insight.id ? { ...i, used: !i.used } : i))
      )
    }
  }

  return (
    <div className="max-w-[1128px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[#1d2226] font-bold text-xl">Insights</h1>
        <Link href="/interviews" className="text-sm text-[#0a66c2] font-semibold hover:underline">
          Interviews
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterPersona}
          onChange={(e) => setFilterPersona(e.target.value)}
          className="border border-[rgba(0,0,0,0.3)] rounded-full px-4 py-1.5 text-sm text-[#1d2226] bg-white focus:outline-none focus:border-[#0a66c2]"
        >
          <option value="">All personas</option>
          {PERSONAS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-[rgba(0,0,0,0.3)] rounded-full px-4 py-1.5 text-sm text-[#1d2226] bg-white focus:outline-none focus:border-[#0a66c2]"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>

        <select
          value={filterUsed}
          onChange={(e) => setFilterUsed(e.target.value)}
          className="border border-[rgba(0,0,0,0.3)] rounded-full px-4 py-1.5 text-sm text-[#1d2226] bg-white focus:outline-none focus:border-[#0a66c2]"
        >
          <option value="">All status</option>
          <option value="false">Unused</option>
          <option value="true">Used</option>
        </select>

        {(filterPersona || filterType || filterUsed) && (
          <button
            onClick={() => { setFilterPersona(''); setFilterType(''); setFilterUsed('') }}
            className="text-xs font-semibold text-[rgba(0,0,0,0.55)] hover:text-[#1d2226] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-[rgba(0,0,0,0.55)] mb-4">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-[rgba(0,0,0,0.55)] text-sm">Loading...</div>
      ) : insights.length === 0 ? (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-8 text-center">
          <p className="text-[rgba(0,0,0,0.55)] text-sm">No insights found.</p>
          <Link href="/interviews" className="text-[#0a66c2] text-sm font-semibold mt-2 inline-block">
            Go to Interviews
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} onToggleUsed={toggleUsed} />
          ))}
        </div>
      )}
    </div>
  )
}

function InsightCard({
  insight,
  onToggleUsed,
}: {
  insight: Insight
  onToggleUsed: (insight: Insight) => Promise<void>
}) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    await onToggleUsed(insight)
    setToggling(false)
  }

  return (
    <div
      className={`bg-white rounded-lg border p-4 flex flex-col gap-3 transition-opacity ${insight.used ? 'border-[rgba(0,0,0,0.1)] opacity-60' : 'border-[rgba(0,0,0,0.15)]'}`}
    >
      {/* Type + Persona */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[insight.insight_type] ?? 'bg-[#eef3f8] text-[rgba(0,0,0,0.55)]'}`}
        >
          {insight.insight_type.replace('_', ' ')}
        </span>
        <span className="text-[10px] font-semibold text-[rgba(0,0,0,0.4)]">
          {insight.persona_fit}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-[#1d2226] leading-snug flex-1">{insight.content}</p>

      {/* Post angle */}
      <p className="text-xs text-[rgba(0,0,0,0.55)] italic">{insight.post_angle}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[rgba(0,0,0,0.08)]">
        {insight.interview_sessions && (
          <Link
            href={`/interviews/${insight.session_id}`}
            className="text-[10px] text-[rgba(0,0,0,0.4)] hover:text-[#0a66c2] transition-colors truncate max-w-[60%]"
          >
            {insight.interview_sessions.interviewee_name}
          </Link>
        )}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="text-[10px] font-semibold text-[rgba(0,0,0,0.55)] hover:text-[#0a66c2] transition-colors ml-auto"
        >
          {insight.used ? 'Mark unused' : 'Mark used'}
        </button>
      </div>
    </div>
  )
}

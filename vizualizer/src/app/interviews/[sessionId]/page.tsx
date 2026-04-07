'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Session = {
  id: string
  interviewee_name: string
  interviewee_role: string
  status: string
  created_at: string
  interview_templates: { name: string; persona: string | null } | null
}

type Response = {
  id: string
  question_order: number
  question: string
  answer: string
}

type Insight = {
  id: string
  insight_type: string
  content: string
  post_angle: string
  persona_fit: string
  used: boolean
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-[#eef3f8] text-[rgba(0,0,0,0.55)]',
  in_progress: 'bg-[#fff7e6] text-[#915907]',
  completed: 'bg-[#e8f5e8] text-[#057642]',
  insights_extracted: 'bg-[#e8f0fb] text-[#0a66c2]',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  insights_extracted: 'Insights extracted',
}

const TYPE_COLORS: Record<string, string> = {
  quote: 'bg-[#e8f0fb] text-[#0a66c2]',
  pain_point: 'bg-[#fdecea] text-[#cc1016]',
  story: 'bg-[#fff7e6] text-[#915907]',
  stat: 'bg-[#e8f5e8] text-[#057642]',
}

export default function SessionPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/interviews/${params.sessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { setLoading(false); return }
        setSession(data.session)
        setResponses(data.responses)
        setInsights(data.insights)
        setLoading(false)
      })
  }, [params.sessionId])

  function copyTranscript() {
    if (!session || responses.length === 0) return
    const templateName = session.interview_templates?.name ?? 'Unknown'
    const lines = [
      `Interview: ${templateName}`,
      `Interviewee: ${session.interviewee_name} (${session.interviewee_role || 'no role'})`,
      '',
      ...responses.map((r) => `Q: ${r.question}\nA: ${r.answer || '—'}`),
    ]
    navigator.clipboard.writeText(lines.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copySessionLink() {
    navigator.clipboard.writeText(`${window.location.origin}/interview/${params.sessionId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLink(templateId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/interview/${templateId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-8">
        <div className="text-[rgba(0,0,0,0.55)] text-sm">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-8">
        <p className="text-[rgba(0,0,0,0.55)] text-sm">Session not found.</p>
        <Link href="/interviews" className="text-[#0a66c2] text-sm mt-2 inline-block">
          Back to Interviews
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-[rgba(0,0,0,0.55)] hover:text-[#1d2226] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[#1d2226] font-bold text-lg truncate">{session.interviewee_name}</h1>
          <p className="text-[rgba(0,0,0,0.55)] text-xs">
            {session.interviewee_role || 'No role'}
            {session.interview_templates && ` · ${session.interview_templates.name}`}
            {' · '}{formatDate(session.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copySessionLink}
            className="px-2.5 py-1 border border-[rgba(0,0,0,0.3)] rounded-full text-[11px] font-semibold text-[rgba(0,0,0,0.55)] hover:border-[#0a66c2] hover:text-[#0a66c2] transition-colors"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[session.status] ?? 'bg-[#eef3f8] text-[rgba(0,0,0,0.55)]'}`}
          >
            {STATUS_LABELS[session.status] ?? session.status}
          </span>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-5 mb-4">
        <h2 className="text-xs font-semibold text-[rgba(0,0,0,0.55)] uppercase tracking-wide mb-4">
          Transcript
        </h2>
        {responses.length === 0 ? (
          <p className="text-[rgba(0,0,0,0.55)] text-sm">No responses recorded.</p>
        ) : (
          <div className="space-y-5">
            {responses.map((r) => (
              <div key={r.id}>
                <p className="text-xs font-semibold text-[rgba(0,0,0,0.55)] mb-1">
                  Q{r.question_order}. {r.question}
                </p>
                <p className="text-sm text-[#1d2226] whitespace-pre-wrap">{r.answer || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Copy transcript for manual extraction */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={copyTranscript}
          disabled={responses.length === 0}
          className="px-5 py-2 border border-[rgba(0,0,0,0.3)] rounded-full text-sm font-semibold text-[rgba(0,0,0,0.55)] hover:border-[#0a66c2] hover:text-[#0a66c2] transition-colors disabled:opacity-40"
        >
          {copied ? 'Copied!' : 'Copy transcript'}
        </button>
        <p className="text-xs text-[rgba(0,0,0,0.4)]">
          Paste into Claude Code to extract insights
        </p>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[rgba(0,0,0,0.55)] uppercase tracking-wide">
              Extracted Insights ({insights.length})
            </h2>
            <Link href="/insights" className="text-xs text-[#0a66c2] font-semibold hover:underline">
              View all insights
            </Link>
          </div>
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const [used, setUsed] = useState(insight.used)
  const [toggling, setToggling] = useState(false)

  async function toggleUsed() {
    setToggling(true)
    const res = await fetch('/api/insights', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: insight.id, used: !used }),
    })
    if (res.ok) setUsed((u) => !u)
    setToggling(false)
  }

  return (
    <div className={`border rounded-lg p-4 ${used ? 'border-[rgba(0,0,0,0.1)] opacity-60' : 'border-[rgba(0,0,0,0.15)]'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[insight.insight_type] ?? 'bg-[#eef3f8] text-[rgba(0,0,0,0.55)]'}`}
        >
          {insight.insight_type.replace('_', ' ')}
        </span>
        <span className="text-[10px] text-[rgba(0,0,0,0.4)] font-semibold">{insight.persona_fit}</span>
      </div>
      <p className="text-sm text-[#1d2226] mb-2">{insight.content}</p>
      <p className="text-xs text-[rgba(0,0,0,0.55)] italic mb-3">{insight.post_angle}</p>
      <button
        onClick={toggleUsed}
        disabled={toggling}
        className="text-xs font-semibold text-[rgba(0,0,0,0.55)] hover:text-[#0a66c2] transition-colors"
      >
        {used ? 'Mark as unused' : 'Mark as used'}
      </button>
    </div>
  )
}

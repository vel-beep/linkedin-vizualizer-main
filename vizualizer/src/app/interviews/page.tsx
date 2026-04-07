'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Question = { order: number; text: string }

type Template = {
  id: string
  name: string
  persona: string | null
  questions: Question[]
  created_at: string
}

type Session = {
  id: string
  interviewee_name: string
  interviewee_role: string
  status: string
  created_at: string
  interview_templates: { name: string } | null
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Add Person form ────────────────────────────────────────────
function AddPersonForm({
  template,
  onCreated,
}: {
  template: Template
  onCreated: (session: Session) => void
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [customizeQ, setCustomizeQ] = useState(false)
  const [questions, setQuestions] = useState<Question[]>(
    template.questions.map((q) => ({ ...q }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  function updateQ(order: number, text: string) {
    setQuestions((prev) => prev.map((q) => (q.order === order ? { ...q, text } : q)))
  }

  function removeQ(order: number) {
    setQuestions((prev) => prev.filter((q) => q.order !== order))
  }

  function addQ() {
    const maxOrder = questions.reduce((m, q) => Math.max(m, q.order), 0)
    setQuestions((prev) => [...prev, { order: maxOrder + 1, text: '' }])
  }

  async function handleCreate() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')

    const res = await fetch('/api/interviews/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        templateId: template.id,
        intervieweeName: name,
        intervieweeRole: role,
        questions: customizeQ ? questions : null,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error?.message ?? 'Failed to create'); setSaving(false); return }

    const sessionLink = `${window.location.origin}/interview/${data.id}`
    setLink(sessionLink)
    setSaving(false)
    onCreated(data)
  }

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (link) {
    return (
      <div className="mt-3 p-3 bg-[#f3f2ef] rounded-lg">
        <p className="text-xs font-semibold text-[#057642] mb-2">Session created for {name}</p>
        <div className="flex items-center gap-2">
          <code className="text-xs text-[rgba(0,0,0,0.55)] truncate flex-1 bg-white border border-[rgba(0,0,0,0.15)] rounded px-2 py-1">
            {link}
          </code>
          <button
            onClick={copyLink}
            className="shrink-0 px-3 py-1 bg-[#0a66c2] text-white rounded-full text-xs font-semibold"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-[rgba(0,0,0,0.08)] pt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-[rgba(0,0,0,0.55)] mb-1">
            Name <span className="text-[#cc1016]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full border border-[rgba(0,0,0,0.3)] rounded px-2 py-1.5 text-xs text-[#1d2226] focus:outline-none focus:border-[#0a66c2]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[rgba(0,0,0,0.55)] mb-1">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Head of RevOps"
            className="w-full border border-[rgba(0,0,0,0.3)] rounded px-2 py-1.5 text-xs text-[#1d2226] focus:outline-none focus:border-[#0a66c2]"
          />
        </div>
      </div>

      {/* Customize questions toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={customizeQ}
          onChange={(e) => setCustomizeQ(e.target.checked)}
          className="rounded"
        />
        <span className="text-xs text-[rgba(0,0,0,0.55)]">
          Customize questions for this person
        </span>
      </label>

      {customizeQ && (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q.order} className="flex items-start gap-1.5">
              <span className="mt-1.5 text-[10px] font-semibold text-[rgba(0,0,0,0.4)] w-4 shrink-0">
                {i + 1}.
              </span>
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQ(q.order, e.target.value)}
                className="flex-1 border border-[rgba(0,0,0,0.3)] rounded px-2 py-1 text-xs text-[#1d2226] focus:outline-none focus:border-[#0a66c2]"
              />
              {questions.length > 1 && (
                <button
                  onClick={() => removeQ(q.order)}
                  className="mt-1 text-[rgba(0,0,0,0.3)] hover:text-[#cc1016] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button onClick={addQ} className="text-[10px] font-semibold text-[#0a66c2] hover:underline">
            + Add question
          </button>
        </div>
      )}

      {error && <p className="text-[#cc1016] text-xs">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={saving}
        className="px-4 py-1.5 bg-[#0a66c2] text-white rounded-full text-xs font-semibold hover:bg-[#004182] transition-colors disabled:opacity-40"
      >
        {saving ? 'Creating...' : 'Create link'}
      </button>
    </div>
  )
}

// ── Template card ──────────────────────────────────────────────
function TemplateCard({
  template,
  onSessionCreated,
}: {
  template: Template
  onSessionCreated: (session: Session) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[#1d2226] font-semibold text-sm truncate">{template.name}</p>
          <p className="text-[rgba(0,0,0,0.55)] text-xs mt-0.5">
            {template.questions.length} question{template.questions.length !== 1 ? 's' : ''}
            {template.persona && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eef3f8] text-[rgba(0,0,0,0.55)]">
                {template.persona}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 px-3 py-1.5 border border-[rgba(0,0,0,0.3)] rounded-full text-xs font-semibold text-[rgba(0,0,0,0.55)] hover:border-[#0a66c2] hover:text-[#0a66c2] transition-colors"
        >
          + Add person
        </button>
      </div>

      <p className="text-[rgba(0,0,0,0.4)] text-xs mt-2">{formatDate(template.created_at)}</p>

      {expanded && (
        <AddPersonForm
          template={template}
          onCreated={(session) => {
            onSessionCreated(session)
          }}
        />
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function InterviewsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/interviews')
      .then((r) => r.json())
      .then(({ templates, sessions }) => {
        setTemplates(templates)
        setSessions(sessions)
        setLoading(false)
      })
  }, [])

  function handleSessionCreated(session: Session) {
    setSessions((prev) => [session, ...prev])
  }

  if (loading) {
    return (
      <div className="max-w-[1128px] mx-auto px-4 py-8">
        <p className="text-[rgba(0,0,0,0.55)] text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1128px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#1d2226] font-bold text-xl">Interviews</h1>
        <Link
          href="/interviews/new"
          className="px-4 py-2 bg-[#0a66c2] text-white rounded-full text-sm font-semibold hover:bg-[#004182] transition-colors"
        >
          + New template
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates */}
        <div>
          <h2 className="text-xs font-semibold text-[rgba(0,0,0,0.55)] uppercase tracking-wide mb-3">
            Templates ({templates.length})
          </h2>
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-6 text-center text-[rgba(0,0,0,0.55)] text-sm">
              No templates yet.{' '}
              <Link href="/interviews/new" className="text-[#0a66c2] font-semibold">
                Create one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} onSessionCreated={handleSessionCreated} />
              ))}
            </div>
          )}
        </div>

        {/* Sessions */}
        <div>
          <h2 className="text-xs font-semibold text-[rgba(0,0,0,0.55)] uppercase tracking-wide mb-3">
            Sessions ({sessions.length})
          </h2>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-6 text-center text-[rgba(0,0,0,0.55)] text-sm">
              No sessions yet. Add a person to a template to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <Link key={s.id} href={`/interviews/${s.id}`}>
                  <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-4 hover:border-[#0a66c2] transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[#1d2226] font-semibold text-sm truncate">
                          {s.interviewee_name}
                        </p>
                        <p className="text-[rgba(0,0,0,0.55)] text-xs truncate">
                          {s.interviewee_role || 'No role'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[s.status] ?? 'bg-[#eef3f8] text-[rgba(0,0,0,0.55)]'}`}
                      >
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </div>
                    <p className="text-[rgba(0,0,0,0.4)] text-xs mt-1.5">
                      {s.interview_templates?.name ?? 'Unknown template'} · {formatDate(s.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

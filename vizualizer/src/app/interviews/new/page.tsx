'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { siteConfig } from '@/site.config'

type Question = { id: number; text: string }

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export default function NewInterviewPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [persona, setPersona] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [nextId, setNextId] = useState(2)

  const slug = slugify(name)

  function addQuestion() {
    setQuestions((prev) => [...prev, { id: nextId, text: '' }])
    setNextId((n) => n + 1)
  }

  function removeQuestion(id: number) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function updateQuestion(id: number, text: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    if (!slug) { setError('Name must produce a valid slug'); return }
    if (questions.some((q) => !q.text.trim())) {
      setError('All questions must have text')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      id: slug,
      name: name.trim(),
      persona: persona || null,
      questions: questions.map((q, i) => ({ order: i + 1, text: q.text.trim() })),
    }

    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error?.message ?? 'Failed to save. Slug may already be in use.')
      setSaving(false)
      return
    }

    router.push('/interviews')
  }

  const personaOptions = Object.entries(siteConfig.personas).map(([key, p]) => ({
    value: p.trackerKey,
    label: p.trackerKey,
  }))

  return (
    <div className="max-w-[640px] mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-[rgba(0,0,0,0.55)] hover:text-[#1d2226] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-[#1d2226] font-bold text-xl">New Interview</h1>
      </div>

      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#1d2226] mb-1">
            Interview name <span className="text-[#cc1016]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Customer Pain Points"
            className="w-full border border-[rgba(0,0,0,0.3)] rounded px-3 py-2 text-sm text-[#1d2226] focus:outline-none focus:border-[#0a66c2]"
          />
          {slug && (
            <p className="text-[rgba(0,0,0,0.4)] text-xs mt-1">
              Link: /interview/<strong>{slug}</strong>
            </p>
          )}
        </div>

        {/* Persona */}
        <div>
          <label className="block text-xs font-semibold text-[#1d2226] mb-1">
            Persona fit <span className="text-[rgba(0,0,0,0.4)]">(optional)</span>
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full border border-[rgba(0,0,0,0.3)] rounded px-3 py-2 text-sm text-[#1d2226] bg-white focus:outline-none focus:border-[#0a66c2]"
          >
            <option value="">— Any persona —</option>
            {personaOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Questions */}
        <div>
          <label className="block text-xs font-semibold text-[#1d2226] mb-2">
            Questions <span className="text-[#cc1016]">*</span>
          </label>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-start gap-2">
                <span className="mt-2 text-xs font-semibold text-[rgba(0,0,0,0.4)] w-5 shrink-0 text-right">
                  {i + 1}.
                </span>
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, e.target.value)}
                  placeholder={`Question ${i + 1}`}
                  rows={2}
                  className="flex-1 border border-[rgba(0,0,0,0.3)] rounded px-3 py-2 text-sm text-[#1d2226] focus:outline-none focus:border-[#0a66c2] resize-none"
                />
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="mt-2 text-[rgba(0,0,0,0.4)] hover:text-[#cc1016] transition-colors"
                    title="Remove question"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addQuestion}
            className="mt-3 text-xs font-semibold text-[#0a66c2] hover:underline"
          >
            + Add question
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[#cc1016] text-xs">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-[rgba(0,0,0,0.3)] rounded-full text-sm font-semibold text-[rgba(0,0,0,0.55)] hover:border-[#1d2226] hover:text-[#1d2226] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#0a66c2] text-white rounded-full text-sm font-semibold hover:bg-[#004182] transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Create Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

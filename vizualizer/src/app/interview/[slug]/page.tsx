'use client'

import { useState, useEffect } from 'react'

type Question = { order: number; text: string }
type SessionData = {
  sessionId: string
  name: string
  role: string
  status: string
  templateName: string
  questions: Question[]
}
type Step = 'loading' | 'not_found' | 'already_done' | 'greeting' | 'questions' | 'submitting' | 'done' | 'error'

export default function InterviewPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<SessionData | null>(null)
  const [step, setStep] = useState<Step>('loading')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch(`/api/interview?sessionId=${params.slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { setStep('not_found'); return }
        if (d.status === 'completed' || d.status === 'insights_extracted') {
          setStep('already_done')
          setData(d)
          return
        }
        const sorted = [...d.questions].sort(
          (a: Question, b: Question) => a.order - b.order
        )
        setData({ ...d, questions: sorted })
        setAnswers(new Array(sorted.length).fill(''))
        setStep('greeting')
      })
      .catch(() => setStep('not_found'))
  }, [params.slug])

  function setAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[currentQ] = value
      return next
    })
  }

  function nextQuestion() {
    if (!data) return
    if (currentQ < data.questions.length - 1) {
      setCurrentQ((q) => q + 1)
    } else {
      submitInterview()
    }
  }

  async function submitInterview() {
    if (!data) return
    setStep('submitting')
    const responses = data.questions.map((q, i) => ({
      questionOrder: q.order,
      question: q.text,
      answer: answers[i] ?? '',
    }))
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: data.sessionId, responses }),
      })
      if (!res.ok) throw new Error()
      setStep('done')
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStep('error')
    }
  }

  // ── Loading ───────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <Screen>
        <p className="text-[rgba(0,0,0,0.55)] text-sm">Loading...</p>
      </Screen>
    )
  }

  // ── Not found ─────────────────────────────────────────────────
  if (step === 'not_found') {
    return (
      <Screen>
        <p className="text-[#1d2226] font-semibold mb-1">Link not found</p>
        <p className="text-[rgba(0,0,0,0.55)] text-sm">
          This link may be invalid or has expired.
        </p>
      </Screen>
    )
  }

  // ── Already submitted ─────────────────────────────────────────
  if (step === 'already_done') {
    return (
      <Screen>
        <div className="w-12 h-12 rounded-full bg-[#e8f5e8] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#057642]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[#1d2226] font-semibold text-lg mb-1">Already submitted</p>
        <p className="text-[rgba(0,0,0,0.55)] text-sm">
          Thanks {data?.name} — your answers are already saved.
        </p>
      </Screen>
    )
  }

  // ── Thank you ─────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <Screen>
        <div className="w-12 h-12 rounded-full bg-[#e8f5e8] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#057642]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[#1d2226] font-semibold text-lg mb-1">Thank you, {data?.name}!</p>
        <p className="text-[rgba(0,0,0,0.55)] text-sm">
          Your answers have been saved. We appreciate your time.
        </p>
      </Screen>
    )
  }

  // ── Error ─────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <Screen>
        <p className="text-[#1d2226] font-semibold mb-2">Something went wrong</p>
        <p className="text-[rgba(0,0,0,0.55)] text-sm mb-4">{errorMsg}</p>
        <button
          onClick={() => setStep('questions')}
          className="px-4 py-2 bg-[#0a66c2] text-white rounded-full text-sm font-semibold"
        >
          Try again
        </button>
      </Screen>
    )
  }

  // ── Greeting ──────────────────────────────────────────────────
  if (step === 'greeting' && data) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-8 max-w-md w-full">
          <p className="text-[rgba(0,0,0,0.4)] text-xs font-semibold uppercase tracking-wide mb-1">
            {data.templateName}
          </p>
          <h1 className="text-[#1d2226] font-bold text-2xl mb-1">
            Hi {data.name.split(' ')[0]}!
          </h1>
          {data.role && (
            <p className="text-[rgba(0,0,0,0.55)] text-sm mb-4">{data.role}</p>
          )}
          <p className="text-[rgba(0,0,0,0.7)] text-sm mb-6">
            We have {data.questions.length} question{data.questions.length !== 1 ? 's' : ''} for you.
            Take your time — there are no wrong answers.
          </p>
          <button
            onClick={() => setStep('questions')}
            className="w-full py-2.5 bg-[#0a66c2] text-white rounded-full text-sm font-semibold hover:bg-[#004182] transition-colors"
          >
            Start
          </button>
        </div>
      </div>
    )
  }

  // ── Questions ─────────────────────────────────────────────────
  if (!data) return null
  const totalQ = data.questions.length
  const question = data.questions[currentQ]
  const isLast = currentQ === totalQ - 1
  const progress = ((currentQ + 1) / totalQ) * 100

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[rgba(0,0,0,0.55)]">
            Question {currentQ + 1} of {totalQ}
          </p>
          <p className="text-xs text-[rgba(0,0,0,0.4)]">{data.name}</p>
        </div>
        <div className="w-full bg-[#e8e8e8] rounded-full h-1.5 mb-6">
          <div
            className="bg-[#0a66c2] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[#1d2226] font-semibold text-base mb-4">{question.text}</p>

        <textarea
          value={answers[currentQ] ?? ''}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={5}
          className="w-full border border-[rgba(0,0,0,0.3)] rounded px-3 py-2 text-sm text-[#1d2226] focus:outline-none focus:border-[#0a66c2] resize-none mb-4"
        />

        <div className="flex items-center gap-3">
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ((q) => q - 1)}
              className="px-4 py-2 border border-[rgba(0,0,0,0.3)] rounded-full text-sm font-semibold text-[rgba(0,0,0,0.55)] hover:border-[#1d2226] hover:text-[#1d2226] transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={nextQuestion}
            disabled={step === 'submitting'}
            className="ml-auto px-6 py-2 bg-[#0a66c2] text-white rounded-full text-sm font-semibold hover:bg-[#004182] transition-colors disabled:opacity-40"
          >
            {step === 'submitting' ? 'Submitting...' : isLast ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.15)] p-8 max-w-md w-full text-center">
        {children}
      </div>
    </div>
  )
}

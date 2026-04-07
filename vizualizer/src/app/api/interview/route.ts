import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/interview?sessionId=xxx — public, fetch session + questions
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const supabase = getSupabase()

  const { data: session, error } = await supabase
    .from('interview_sessions')
    .select('*, interview_templates(name, questions)')
    .eq('id', sessionId)
    .single()

  if (error || !session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Use session-level questions if set, otherwise fall back to template questions
  const template = session.interview_templates as { name: string; questions: unknown[] } | null
  const questions = session.questions ?? template?.questions ?? []

  return NextResponse.json({
    sessionId: session.id,
    name: session.interviewee_name,
    role: session.interviewee_role,
    status: session.status,
    templateName: template?.name ?? '',
    questions,
  })
}

// POST /api/interview — public, submit responses + mark session completed
export async function POST(req: NextRequest) {
  const { sessionId, responses } = await req.json()
  if (!sessionId || !responses?.length)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = getSupabase()

  const rows = responses.map((r: { questionOrder: number; question: string; answer: string }) => ({
    session_id: sessionId,
    question_order: r.questionOrder,
    question: r.question,
    answer: r.answer,
  }))

  const { error: responsesError } = await supabase.from('interview_responses').insert(rows)
  if (responsesError) return NextResponse.json({ error: responsesError }, { status: 500 })

  await supabase
    .from('interview_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)

  return NextResponse.json({ ok: true })
}

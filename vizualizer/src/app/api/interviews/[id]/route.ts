import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/interviews/[id] — fetch session with responses and insights
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase()

  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*, interview_templates(name, persona)')
    .eq('id', params.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [responsesResult, insightsResult] = await Promise.all([
    supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', params.id)
      .order('question_order', { ascending: true }),
    supabase
      .from('interview_insights')
      .select('*')
      .eq('session_id', params.id)
      .order('created_at', { ascending: true }),
  ])

  return NextResponse.json({
    session,
    responses: responsesResult.data ?? [],
    insights: insightsResult.data ?? [],
  })
}

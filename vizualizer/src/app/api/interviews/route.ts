import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/interviews — list all templates + recent sessions
export async function GET() {
  const supabase = getSupabase()
  const [templatesResult, sessionsResult] = await Promise.all([
    supabase.from('interview_templates').select('*').order('created_at', { ascending: false }),
    supabase
      .from('interview_sessions')
      .select('*, interview_templates(name)')
      .order('created_at', { ascending: false })
      .limit(30),
  ])
  return NextResponse.json({
    templates: templatesResult.data ?? [],
    sessions: sessionsResult.data ?? [],
  })
}

// POST /api/interviews — create a new template
export async function POST(req: NextRequest) {
  const { id, name, persona, questions } = await req.json()
  if (!id || !name || !questions?.length)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('interview_templates')
    .insert({ id, name, persona, questions })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// POST /api/interviews/sessions — admin creates a pre-populated session
export async function POST(req: NextRequest) {
  const { templateId, intervieweeName, intervieweeRole, questions } = await req.json()
  if (!templateId || !intervieweeName?.trim())
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('interview_sessions')
    .insert({
      template_id: templateId,
      interviewee_name: intervieweeName.trim(),
      interviewee_role: intervieweeRole?.trim() || '',
      status: 'pending',
      questions: questions ?? null, // null = inherit from template
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

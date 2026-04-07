import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/insights?persona=&type=&used=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const persona = searchParams.get('persona')
  const type = searchParams.get('type')
  const used = searchParams.get('used')

  let query = getSupabase()
    .from('interview_insights')
    .select('*, interview_sessions(interviewee_name, interviewee_role)')
    .order('created_at', { ascending: false })

  if (persona) query = query.eq('persona_fit', persona)
  if (type) query = query.eq('insight_type', type)
  if (used !== null && used !== '') query = query.eq('used', used === 'true')

  const { data } = await query
  return NextResponse.json(data ?? [])
}

// PATCH /api/insights  body: { id, used }
export async function PATCH(req: NextRequest) {
  const { id, used } = await req.json()
  if (id === undefined) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('interview_insights')
    .update({ used })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

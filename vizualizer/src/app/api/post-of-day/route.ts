import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/post-of-day?date=YYYY-MM-DD
// → { postIds: string[] }
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const { data } = await getSupabase()
    .from('post_of_day')
    .select('post_id')
    .eq('date', date)

  return NextResponse.json({ postIds: (data ?? []).map(r => r.post_id) })
}

// POST /api/post-of-day  body: { postId, date, active }
export async function POST(req: NextRequest) {
  const { postId, date, active } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  const d = date || new Date().toISOString().slice(0, 10)
  const sb = getSupabase()

  if (active) {
    await sb.from('post_of_day').upsert(
      { post_id: postId, date: d },
      { onConflict: 'post_id,date' }
    )
  } else {
    await sb.from('post_of_day').delete()
      .eq('post_id', postId)
      .eq('date', d)
  }

  // Return updated list
  const { data } = await sb
    .from('post_of_day')
    .select('post_id')
    .eq('date', d)

  return NextResponse.json({ postIds: (data ?? []).map(r => r.post_id) })
}

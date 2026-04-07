import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/approvals?postId=xxx&userName=yyy
// → { approved: boolean, approvedBy: string[] }
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  const userName = req.nextUrl.searchParams.get('userName') || ''
  if (!postId) return NextResponse.json({ approved: false, approvedBy: [] })

  const { data } = await getSupabase()
    .from('approvals')
    .select('user_name')
    .eq('post_id', postId)

  const approvedBy = (data ?? []).map(r => r.user_name)
  const approved = userName ? approvedBy.includes(userName) : false

  return NextResponse.json({ approved, approvedBy })
}

// POST /api/approvals  body: { postId, userName, approved }
export async function POST(req: NextRequest) {
  const { postId, userName, approved } = await req.json()
  if (!postId || !userName?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const sb = getSupabase()

  if (approved) {
    await sb.from('approvals').upsert(
      { post_id: postId, user_name: userName.trim() },
      { onConflict: 'post_id,user_name' }
    )
  } else {
    await sb.from('approvals').delete()
      .eq('post_id', postId)
      .eq('user_name', userName.trim())
  }

  // Return updated list
  const { data } = await sb
    .from('approvals')
    .select('user_name')
    .eq('post_id', postId)

  const approvedBy = (data ?? []).map(r => r.user_name)

  return NextResponse.json({ approved, approvedBy })
}

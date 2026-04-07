import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/feed-status
// → { statuses: { [postId]: { approvals, commentCount } }, todayPostIds: string[] }
export async function GET(req: NextRequest) {
  const sb = getSupabase()
  const today = req.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const [approvalsRes, commentsRes, todayRes] = await Promise.all([
    sb.from('approvals').select('post_id, user_name'),
    sb.from('comments').select('post_id'),
    sb.from('post_of_day').select('post_id').eq('date', today),
  ])

  const statuses: Record<string, { approvals: string[]; commentCount: number }> = {}

  for (const row of approvalsRes.data ?? []) {
    if (!statuses[row.post_id]) {
      statuses[row.post_id] = { approvals: [], commentCount: 0 }
    }
    statuses[row.post_id].approvals.push(row.user_name)
  }

  for (const row of commentsRes.data ?? []) {
    if (!statuses[row.post_id]) {
      statuses[row.post_id] = { approvals: [], commentCount: 0 }
    }
    statuses[row.post_id].commentCount++
  }

  const todayPostIds = (todayRes.data ?? []).map(r => r.post_id)

  return NextResponse.json({ statuses, todayPostIds })
}

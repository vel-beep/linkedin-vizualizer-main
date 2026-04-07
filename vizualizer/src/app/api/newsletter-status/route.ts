import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET /api/newsletter-status
// Returns comment counts for all newsletter-* post_ids
export async function GET(req: NextRequest) {
  const supabase = getSupabase()

  const { data: comments } = await supabase
    .from('comments')
    .select('post_id')
    .like('post_id', 'newsletter-%')

  const counts: Record<string, number> = {}
  if (comments) {
    for (const c of comments) {
      counts[c.post_id] = (counts[c.post_id] || 0) + 1
    }
  }

  return NextResponse.json({ counts })
}

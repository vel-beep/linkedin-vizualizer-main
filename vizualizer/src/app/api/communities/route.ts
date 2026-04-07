import { getCommunityData, getCommunityStats } from '@/lib/communities'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const comments = getCommunityData()
  const stats = getCommunityStats(comments)
  return NextResponse.json({ comments, stats })
}

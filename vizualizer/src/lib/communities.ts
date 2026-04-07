import fs from 'fs'
import path from 'path'

export interface CommunityComment {
  id: string
  date: string
  community: string
  platform: string
  thread_url: string
  thread_title: string
  relevance: number
  stacksync_link: boolean
  status: string
  comment_excerpt: string
  word_count: number
  pipeline_stage: string
  discovered_via: string
  notes: string
}

export interface CommunityStats {
  total: number
  thisWeek: number
  byCommunity: Record<string, number>
  byStage: Record<string, number>
  byWeek: { week: string; count: number }[]
  urlCoverage: number
  linkRate: { high: number; low: number }
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

export function getCommunityData(): CommunityComment[] {
  // Try local path first (prebuild copies CSV to public/data/)
  const publicPath = path.join(process.cwd(), 'public', 'data', 'community_tracker.csv')
  // Fallback: direct read from communities-automation (local dev)
  const localPath = path.resolve(process.cwd(), '..', '..', '07_communities', 'communities-automation', 'community_tracker.csv')

  let csvPath = ''
  if (fs.existsSync(publicPath)) {
    csvPath = publicPath
  } else if (fs.existsSync(localPath)) {
    csvPath = localPath
  } else {
    console.log('community_tracker.csv not found')
    return []
  }

  const raw = fs.readFileSync(csvPath, 'utf-8')
  const lines = raw.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Skip header
  const all = lines.slice(1).map(line => {
    const fields = parseCSVLine(line)
    return {
      id: fields[0] || '',
      date: fields[1] || '',
      community: fields[2] || '',
      platform: fields[3] || '',
      thread_url: fields[4] || '',
      thread_title: fields[5] || '',
      relevance: parseInt(fields[6] || '0', 10),
      stacksync_link: fields[7] === 'yes',
      status: fields[8] || '',
      comment_excerpt: fields[9] || '',
      word_count: parseInt(fields[10] || '0', 10),
      pipeline_stage: fields[11] || '',
      discovered_via: fields[12] || '',
      notes: fields[13] || '',
    }
  }).filter(c => c.id)

  // Remove discovered entries whose thread_url already has a posted/engaged entry
  const postedUrls = new Set(
    all.filter(c => c.pipeline_stage === 'posted' || c.pipeline_stage === 'engaged')
      .map(c => c.thread_url)
      .filter(Boolean)
  )
  return all.filter(c => {
    if (c.pipeline_stage === 'discovered' && c.thread_url && postedUrls.has(c.thread_url)) {
      return false
    }
    return true
  })
}

export function getCommunityStats(comments: CommunityComment[]): CommunityStats {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekStr = weekAgo.toISOString().split('T')[0]

  const POSTED_STAGES = new Set(['posted', 'drafted', 'pending', 'queued', 'engaged'])

  const byCommunity: Record<string, number> = {}
  const byStage: Record<string, number> = {}
  const byWeekMap: Record<string, number> = {}
  let highRelWithLink = 0
  let highRelTotal = 0
  let lowRelWithLink = 0
  let lowRelTotal = 0

  for (const c of comments) {
    // By stage (normalize legacy: drafted/pending/queued → posted)
    let stage = c.pipeline_stage || 'unknown'
    if (stage === 'drafted' || stage === 'pending' || stage === 'queued') stage = 'posted'
    byStage[stage] = (byStage[stage] || 0) + 1

    const isPosted = POSTED_STAGES.has(c.pipeline_stage)

    // By community — only count posted comments
    if (isPosted) {
      byCommunity[c.community] = (byCommunity[c.community] || 0) + 1
    }

    // By week — only count posted comments
    if (isPosted && c.date) {
      const d = new Date(c.date + 'T12:00:00')
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d)
      monday.setDate(diff)
      const weekKey = monday.toISOString().split('T')[0]
      byWeekMap[weekKey] = (byWeekMap[weekKey] || 0) + 1
    }

    // Link rate by relevance (posted only)
    if (isPosted) {
      if (c.relevance >= 3) {
        highRelTotal++
        if (c.stacksync_link) highRelWithLink++
      } else {
        lowRelTotal++
        if (c.stacksync_link) lowRelWithLink++
      }
    }
  }

  const postedComments = comments.filter(c => POSTED_STAGES.has(c.pipeline_stage))

  const byWeek = Object.entries(byWeekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }))

  return {
    total: comments.length,
    thisWeek: postedComments.filter(c => c.date >= weekStr).length,
    byCommunity,
    byStage,
    byWeek,
    urlCoverage: postedComments.length > 0 ? Math.round((postedComments.filter(c => c.thread_url && c.thread_url !== 'not provided' && c.thread_url !== 'not_provided').length / postedComments.length) * 100) : 0,
    linkRate: {
      high: highRelTotal > 0 ? Math.round((highRelWithLink / highRelTotal) * 100) : 0,
      low: lowRelTotal > 0 ? Math.round((lowRelWithLink / lowRelTotal) * 100) : 0,
    },
  }
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import type { CommunityComment, CommunityStats } from '@/lib/communities'

// ── Community Profiles Data ─────────────────────────────────
interface CommunityProfile {
  name: string
  url: string
  type: 'forum' | 'qa' | 'blog' | 'social' | 'directory' | 'review'
  color: string
  status: 'active' | 'ready' | 'pending'
}

const COMMUNITY_PROFILES: CommunityProfile[] = [
  // Active (have posted comments)
  { name: 'HubSpot Community', url: 'https://community.hubspot.com/', type: 'forum', color: '#ff7a59', status: 'active' },
  { name: 'Shopify Dev Community', url: 'https://community.shopify.dev/', type: 'forum', color: '#96bf48', status: 'active' },
  { name: 'Pipedrive Dev Community', url: 'https://devcommunity.pipedrive.com/', type: 'forum', color: '#28292b', status: 'active' },
  { name: 'Zoho Community', url: 'https://help.zoho.com/portal/en/community/', type: 'forum', color: '#e42527', status: 'active' },
  { name: 'DBA Stack Exchange', url: 'https://dba.stackexchange.com/', type: 'qa', color: '#2f6ea3', status: 'active' },
  { name: 'dev.to', url: 'https://dev.to/', type: 'blog', color: '#0a0a0a', status: 'active' },
  { name: 'Quora', url: 'https://www.quora.com/', type: 'qa', color: '#b92b27', status: 'active' },
  { name: 'Indie Hackers', url: 'https://www.indiehackers.com/', type: 'social', color: '#1a73e8', status: 'active' },
  // Ready (skill exists, no comments yet)
  { name: 'Stack Overflow', url: 'https://stackoverflow.com/', type: 'qa', color: '#f48024', status: 'ready' },
  { name: 'Supabase Discussions', url: 'https://github.com/supabase/supabase/discussions', type: 'forum', color: '#3ecf8e', status: 'ready' },
  { name: 'Front Community', url: 'https://community.front.com/', type: 'forum', color: '#001b38', status: 'ready' },
  { name: 'Attio Community', url: 'https://attio.com/community', type: 'forum', color: '#6c5ce7', status: 'ready' },
  { name: 'NetSuite Community', url: 'https://community.oracle.com/netsuite/', type: 'forum', color: '#003d6a', status: 'ready' },
  { name: 'MySQL Forums', url: 'https://forums.mysql.com/', type: 'forum', color: '#00758f', status: 'ready' },
  { name: 'SQL Server Q&A', url: 'https://learn.microsoft.com/en-us/answers/tags/191/sql-server', type: 'qa', color: '#cc2927', status: 'ready' },
  { name: 'Reddit', url: 'https://www.reddit.com/', type: 'social', color: '#ff4500', status: 'ready' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/', type: 'social', color: '#ff6600', status: 'ready' },
  // Directories & registrations (pending)
  { name: 'G2', url: 'https://www.g2.com/sellers/stacksync', type: 'review', color: '#ff492c', status: 'active' },
  { name: 'Capterra', url: 'https://www.capterra.com/p/10035719/Stacksync/', type: 'review', color: '#044d80', status: 'active' },
  { name: 'Trustpilot', url: 'https://www.trustpilot.com/review/stacksync.com', type: 'review', color: '#00b67a', status: 'active' },
  { name: 'StackShare', url: 'https://stackshare.io/stacksync', type: 'directory', color: '#0690fa', status: 'active' },
  { name: 'SaaSHub', url: 'https://www.saashub.com/stacksync-alternatives', type: 'directory', color: '#6c63ff', status: 'active' },
  { name: 'HackerNoon', url: 'https://hackernoon.com/u/rubenburdinstacksync', type: 'blog', color: '#00ff00', status: 'active' },
  { name: 'Hashnode', url: 'https://hashnode.com/@rubenburdin', type: 'blog', color: '#2962ff', status: 'active' },
  { name: 'SourceForge', url: 'https://sourceforge.net/software/product/Stacksync/', type: 'directory', color: '#ff6600', status: 'active' },
  { name: 'Clutch', url: 'https://clutch.co/', type: 'review', color: '#17313b', status: 'pending' },
  { name: 'GetApp', url: 'https://www.getapp.com/', type: 'review', color: '#01b2ab', status: 'pending' },
  { name: 'TrustRadius', url: 'https://www.trustradius.com/', type: 'review', color: '#0073cf', status: 'pending' },
  { name: 'GoodFirms', url: 'https://www.goodfirms.co/company/stacksync', type: 'review', color: '#f47321', status: 'active' },
  { name: 'SlideShare', url: 'https://www.slideshare.net/', type: 'blog', color: '#0077b5', status: 'pending' },
  { name: 'F6S', url: 'https://www.f6s.com/', type: 'directory', color: '#00b4ff', status: 'pending' },
  { name: 'BuiltIn', url: 'https://builtin.com/', type: 'directory', color: '#1f2532', status: 'pending' },
  { name: 'Comparably', url: 'https://www.comparably.com/', type: 'directory', color: '#2b69a3', status: 'pending' },
]

const TYPE_LABELS: Record<string, string> = {
  forum: 'Forum',
  qa: 'Q&A',
  blog: 'Blog/Content',
  social: 'Social',
  directory: 'Directory',
  review: 'Review Site',
}

// ── Profile Card ────────────────────────────────────────────
function ProfileCard({ profile }: { profile: CommunityProfile }) {
  const statusStyles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    ready: 'bg-blue-50 text-blue-600',
    pending: 'bg-amber-50 text-amber-600',
  }
  return (
    <a
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-3 hover:shadow-md hover:border-[rgba(0,0,0,0.15)] transition-all group block"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: profile.color }}
        />
        <span className="text-sm font-semibold text-[#1d2226] group-hover:text-[#0a66c2] transition-colors truncate">
          {profile.name}
        </span>
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-[rgba(0,0,0,0.2)] group-hover:text-[#0a66c2] transition-colors shrink-0 ml-auto" fill="currentColor">
          <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[rgba(0,0,0,0.45)] font-medium">{TYPE_LABELS[profile.type]}</span>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${statusStyles[profile.status]}`}>
          {profile.status}
        </span>
      </div>
    </a>
  )
}

// ── Helpers ──────────────────────────────────────────────────
function fmtWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Community color mapping
const COMMUNITY_COLORS: Record<string, string> = {
  'HubSpot': '#ff7a59',
  'Shopify': '#96bf48',
  'Pipedrive': '#28292b',
  'Zoho': '#e42527',
  'NetSuite': '#003d6a',
  'DBA Stack Exchange': '#2f6ea3',
  'Stack Overflow': '#f48024',
  'dev.to': '#0a0a0a',
  'MySQL': '#00758f',
  'SQL Server': '#cc2927',
  'Supabase': '#3ecf8e',
  'Attio': '#6c5ce7',
  'Front': '#001b38',
  'Reddit': '#ff4500',
  'Hacker News': '#ff6600',
  'Quora': '#b92b27',
}

function getColor(community: string): string {
  return COMMUNITY_COLORS[community] || '#0a66c2'
}

// ── Summary Card ─────────────────────────────────────────────
function SummaryCard({ title, value, subtitle, icon }: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[rgba(0,0,0,0.6)] font-medium">{title}</p>
        <div className="text-[rgba(0,0,0,0.3)]">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-[#1d2226]">{value}</p>
      {subtitle && (
        <p className="text-xs mt-1 text-[rgba(0,0,0,0.4)]">{subtitle}</p>
      )}
    </div>
  )
}

// ── Community Chip ───────────────────────────────────────────
function CommunityChip({ name, count, active, onClick }: {
  name: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium ${
        active
          ? 'border-[rgba(0,0,0,0.2)] bg-white text-[#1d2226] shadow-sm'
          : 'border-transparent bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.35)]'
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? '' : 'opacity-40'}`}
        style={{ backgroundColor: getColor(name) }}
      />
      <span className="hidden sm:inline">{name}</span>
      <span className="sm:hidden">{name.slice(0, 3)}</span>
      <span className={`text-[10px] ${active ? 'text-[rgba(0,0,0,0.5)]' : 'text-[rgba(0,0,0,0.25)]'}`}>
        {count}
      </span>
    </button>
  )
}

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    discovered: 'bg-blue-50 text-blue-700',
    posted: 'bg-emerald-50 text-emerald-700',
    engaged: 'bg-green-100 text-green-800',
  }
  // Normalize legacy statuses
  const display = status === 'drafted' || status === 'pending' || status === 'queued' ? 'posted' : status
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${styles[display] || 'bg-gray-100 text-gray-600'}`}>
      {display}
    </span>
  )
}

// ── Relevance Dots ───────────────────────────────────────────
function RelevanceDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= score ? 'bg-[#0a66c2]' : 'bg-[rgba(0,0,0,0.1)]'
          }`}
        />
      ))}
    </div>
  )
}

// ── Comment Row ──────────────────────────────────────────────
function CommentRow({ comment, expanded, onToggle }: {
  comment: CommunityComment
  expanded: boolean
  onToggle: () => void
}) {
  const hasUrl = comment.thread_url && comment.thread_url !== 'not provided' && comment.thread_url !== 'not_provided'

  return (
    <>
      <tr
        className="border-b border-[rgba(0,0,0,0.06)] hover:bg-[#f9fafb] transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 20 20"
              className={`w-3 h-3 text-[rgba(0,0,0,0.3)] shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-mono text-[rgba(0,0,0,0.4)]">{comment.id}</span>
          </div>
        </td>
        <td className="px-3 py-3">
          <span className="text-xs text-[rgba(0,0,0,0.6)] whitespace-nowrap">{comment.date}</span>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getColor(comment.community) }}
            />
            <span className="text-xs font-medium text-[#1d2226] whitespace-nowrap">{comment.community}</span>
          </div>
        </td>
        <td className="px-3 py-3 max-w-[300px]">
          {hasUrl ? (
            <a
              href={comment.thread_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0a66c2] hover:underline line-clamp-2"
              onClick={e => e.stopPropagation()}
            >
              {comment.thread_title || comment.thread_url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60)}
            </a>
          ) : (
            <span className="text-xs text-[rgba(0,0,0,0.4)] italic">
              {comment.thread_title || 'No URL'}
            </span>
          )}
        </td>
        <td className="px-3 py-3">
          <RelevanceDots score={comment.relevance} />
        </td>
        <td className="px-3 py-3">
          <StatusBadge status={comment.pipeline_stage} />
        </td>
        <td className="px-3 py-3 text-right">
          <span className="text-xs tabular-nums text-[rgba(0,0,0,0.6)]">{comment.word_count}</span>
        </td>
        <td className="px-3 py-3 text-center">
          {comment.stacksync_link ? (
            <span className="text-emerald-600 text-xs font-medium">Yes</span>
          ) : (
            <span className="text-[rgba(0,0,0,0.25)] text-xs">No</span>
          )}
        </td>
      </tr>
      {expanded && comment.comment_excerpt && (
        <tr className="bg-[#f9fafb] border-b border-[rgba(0,0,0,0.06)]">
          <td colSpan={8} className="px-4 py-3">
            <p className="text-xs text-[rgba(0,0,0,0.55)] leading-relaxed italic pl-5">
              &ldquo;{comment.comment_excerpt}&rdquo;
            </p>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Community Bar ────────────────────────────────────────────
function CommunityBar({ name, count, total }: { name: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-[120px] shrink-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: getColor(name) }}
        />
        <span className="text-xs text-[#1d2226] truncate">{name}</span>
      </div>
      <div className="flex-1 h-5 bg-[rgba(0,0,0,0.04)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: getColor(name) }}
        />
      </div>
      <span className="text-xs font-semibold text-[#1d2226] tabular-nums w-8 text-right">{count}</span>
    </div>
  )
}

// ── Weekly Activity ──────────────────────────────────────────
function WeeklyBar({ week, count, max }: { week: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[rgba(0,0,0,0.5)] w-[60px] shrink-0 text-right tabular-nums">
        {fmtWeek(week)}
      </span>
      <div className="flex-1 h-4 bg-[rgba(0,0,0,0.04)] rounded overflow-hidden">
        <div
          className="h-full rounded bg-[#0a66c2] transition-all"
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[#1d2226] tabular-nums w-6 text-right">{count}</span>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function CommunitiesPage() {
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCommunities, setActiveCommunities] = useState<string[]>([])
  const [stageFilter, setStageFilter] = useState<string>('posted')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'engagement' | 'profiles'>('engagement')
  const [profileFilter, setProfileFilter] = useState<'all' | 'active' | 'ready' | 'pending'>('all')

  useEffect(() => {
    fetch('/api/communities')
      .then(r => r.json())
      .then(data => {
        setComments(data.comments)
        setStats(data.stats)
        setActiveCommunities(Object.keys(data.stats.byCommunity))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleCommunity = (name: string) => {
    setActiveCommunities(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const filtered = useMemo(() => {
    return comments
      .filter(c => activeCommunities.includes(c.community))
      .filter(c => {
        if (stageFilter === 'all') return true
        if (stageFilter === 'posted') {
          // 'posted' includes legacy stages (drafted, pending, queued)
          return ['posted', 'drafted', 'pending', 'queued'].includes(c.pipeline_stage)
        }
        return c.pipeline_stage === stageFilter
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [comments, activeCommunities, stageFilter])

  const sortedCommunities = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.byCommunity)
      .sort(([, a], [, b]) => b - a)
  }, [stats])

  const maxWeekly = useMemo(() => {
    if (!stats) return 0
    return Math.max(...stats.byWeek.map(w => w.count), 1)
  }, [stats])

  const postedComments = useMemo(() => {
    return comments.filter(c =>
      ['posted', 'drafted', 'pending', 'queued', 'engaged'].includes(c.pipeline_stage)
    )
  }, [comments])

  const postedCommunityCount = useMemo(() => {
    const set = new Set(postedComments.map(c => c.community))
    return set.size
  }, [postedComments])

  const discoveredCount = useMemo(() => {
    return comments.filter(c => c.pipeline_stage === 'discovered').length
  }, [comments])

  if (loading) {
    return (
      <div className="max-w-[1128px] mx-auto px-3 py-5">
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-[rgba(0,0,0,0.4)]">Loading community data...</div>
        </div>
      </div>
    )
  }

  if (!stats || comments.length === 0) {
    return (
      <div className="max-w-[1128px] mx-auto px-3 py-5">
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-[rgba(0,0,0,0.4)]">No community data found. Run /community-pipeline backfill first.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1128px] mx-auto px-3 py-5">

      {/* ── Header ── */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-[#0a66c2] flex items-center justify-center shrink-0">
            <IconGlobe />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1d2226]">Communities</h1>
            <p className="text-xs text-[rgba(0,0,0,0.6)]">
              {postedComments.length} comments across {postedCommunityCount} communities · {COMMUNITY_PROFILES.length} profiles tracked
            </p>
          </div>
        </div>
        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-[rgba(0,0,0,0.04)] rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'engagement'
                ? 'bg-white text-[#1d2226] shadow-sm'
                : 'text-[rgba(0,0,0,0.5)] hover:text-[#1d2226]'
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'profiles'
                ? 'bg-white text-[#1d2226] shadow-sm'
                : 'text-[rgba(0,0,0,0.5)] hover:text-[#1d2226]'
            }`}
          >
            Profiles
            <span className="ml-1.5 text-[10px] opacity-60">{COMMUNITY_PROFILES.length}</span>
          </button>
        </div>
      </div>

      {/* ── Profiles Tab ── */}
      {activeTab === 'profiles' && (
        <>
          {/* Profile status filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['all', 'active', 'ready', 'pending'] as const).map(f => {
              const count = f === 'all'
                ? COMMUNITY_PROFILES.length
                : COMMUNITY_PROFILES.filter(p => p.status === f).length
              return (
                <button
                  key={f}
                  onClick={() => setProfileFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    profileFilter === f
                      ? 'bg-[#0a66c2] text-white'
                      : 'bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.5)] hover:text-[#1d2226]'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="ml-1 opacity-70">{count}</span>
                </button>
              )
            })}
          </div>

          {/* Profile summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <SummaryCard
              title="Active"
              value={String(COMMUNITY_PROFILES.filter(p => p.status === 'active').length)}
              subtitle="Communities with posted comments"
              icon={<IconChat />}
            />
            <SummaryCard
              title="Ready"
              value={String(COMMUNITY_PROFILES.filter(p => p.status === 'ready').length)}
              subtitle="Skill built, ready to engage"
              icon={<IconGlobe />}
            />
            <SummaryCard
              title="Pending"
              value={String(COMMUNITY_PROFILES.filter(p => p.status === 'pending').length)}
              subtitle="Directories & review sites to register"
              icon={<IconLink />}
            />
          </div>

          {/* Profile grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
            {COMMUNITY_PROFILES
              .filter(p => profileFilter === 'all' || p.status === profileFilter)
              .map(profile => (
                <ProfileCard key={profile.name} profile={profile} />
              ))
            }
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-[10px] text-[rgba(0,0,0,0.3)]">
              Community Profiles · {COMMUNITY_PROFILES.filter(p => p.status === 'active').length} active · {COMMUNITY_PROFILES.filter(p => p.status === 'ready').length} ready · {COMMUNITY_PROFILES.filter(p => p.status === 'pending').length} pending registration
            </p>
          </div>
        </>
      )}

      {/* ── Engagement Tab ── */}
      {activeTab === 'engagement' && (<>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          title="Comments Posted"
          value={String(postedComments.length)}
          subtitle={`${stats.thisWeek} this week`}
          icon={<IconChat />}
        />
        <SummaryCard
          title="Communities"
          value={String(postedCommunityCount)}
          subtitle="Platforms with replies"
          icon={<IconGlobe />}
        />
        <SummaryCard
          title="Backlog"
          value={String(discoveredCount)}
          subtitle="Discovered, not yet replied"
          icon={<IconLink />}
        />
        <SummaryCard
          title="This Week"
          value={String(stats.thisWeek)}
          subtitle={stats.byWeek.length > 0 ? `Week of ${fmtWeek(stats.byWeek[stats.byWeek.length - 1].week)}` : ''}
          icon={<IconCalendar />}
        />
      </div>

      {/* ── Two-column layout: Community breakdown + Weekly activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">

        {/* Community Breakdown */}
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
          <h3 className="text-sm font-semibold text-[#1d2226] mb-3">By Community</h3>
          <div className="space-y-2">
            {sortedCommunities.map(([name, count]) => (
              <CommunityBar key={name} name={name} count={count} total={stats.total} />
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
          <h3 className="text-sm font-semibold text-[#1d2226] mb-3">Weekly Activity</h3>
          <div className="space-y-1.5">
            {stats.byWeek.slice(-8).map(({ week, count }) => (
              <WeeklyBar key={week} week={week} count={count} max={maxWeekly} />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)] grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-[rgba(0,0,0,0.5)] uppercase tracking-wide font-medium">Link Rate (3-5)</p>
              <p className="text-lg font-bold text-[#1d2226]">{stats.linkRate.high}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[rgba(0,0,0,0.5)] uppercase tracking-wide font-medium">Link Rate (0-2)</p>
              <p className="text-lg font-bold text-[#1d2226]">{stats.linkRate.low}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Filter ── */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-4 py-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[rgba(0,0,0,0.5)] font-medium uppercase tracking-wide mr-1">
            Status
          </span>
          {['all', 'posted', 'engaged', 'discovered'].map(stage => {
            // Count: merge legacy statuses into 'posted'
            let count = 0
            if (stage === 'posted') {
              count = (stats.byStage['posted'] || 0) + (stats.byStage['drafted'] || 0) + (stats.byStage['pending'] || 0) + (stats.byStage['queued'] || 0)
            } else if (stage !== 'all') {
              count = stats.byStage[stage] || 0
            }
            return (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  stageFilter === stage
                    ? 'bg-[#0a66c2] text-white'
                    : 'bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.5)] hover:text-[#1d2226]'
                }`}
              >
                {stage === 'all' ? 'All' : stage.charAt(0).toUpperCase() + stage.slice(1)}
                {stage !== 'all' && count > 0 ? (
                  <span className="ml-1 opacity-70">{count}</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Community Filters ── */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-4 py-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[rgba(0,0,0,0.5)] font-medium uppercase tracking-wide mr-1">
            Communities
          </span>
          {sortedCommunities.map(([name, count]) => (
            <CommunityChip
              key={name}
              name={name}
              count={count}
              active={activeCommunities.includes(name)}
              onClick={() => toggleCommunity(name)}
            />
          ))}
          {activeCommunities.length < sortedCommunities.length && (
            <button
              onClick={() => setActiveCommunities(Object.keys(stats.byCommunity))}
              className="text-xs text-[#0a66c2] font-medium hover:underline ml-1"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {/* ── Comments Table ── */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1d2226]">
            Comments
            <span className="ml-2 text-xs font-normal text-[rgba(0,0,0,0.4)]">
              {filtered.length} of {comments.length}
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="text-left px-4 py-2 font-medium text-[rgba(0,0,0,0.6)]">ID</th>
                <th className="text-left px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Date</th>
                <th className="text-left px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Community</th>
                <th className="text-left px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Thread</th>
                <th className="text-left px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Score</th>
                <th className="text-left px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Status</th>
                <th className="text-right px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Words</th>
                <th className="text-center px-3 py-2 font-medium text-[rgba(0,0,0,0.6)]">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(comment => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  expanded={expandedId === comment.id}
                  onToggle={() => setExpandedId(prev => prev === comment.id ? null : comment.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-[rgba(0,0,0,0.4)]">
            No comments match the current filters
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[rgba(0,0,0,0.3)]">
          Community Engagement Tracker · Data from community_tracker.csv
        </p>
      </div>

      </>)}
    </div>
  )
}

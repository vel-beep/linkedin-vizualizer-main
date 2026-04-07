'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { getUserName } from '@/lib/user'

export interface PostStatus {
  approvals: string[]
  commentCount: number
}

interface PostCardProps {
  post: Post
  expanded?: boolean
  status?: PostStatus
  isToday?: boolean
  onTodayToggle?: (postId: string, active: boolean) => void
}

// ── Icons ─────────────────────────────────────────────────────
function IconLike() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.53 4.53 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
    </svg>
  )
}
function IconComment() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}
function IconDots() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// LinkedIn creator mode badge (blue "in" square)
function BadgeLinkedIn() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 inline-block shrink-0" aria-hidden="true">
      <rect width="16" height="16" rx="3" fill="#0a66c2"/>
      <path d="M4 5.5a1 1 0 100-2 1 1 0 000 2zM3.25 6.5h1.5V12h-1.5V6.5zM6.5 6.5h1.44v.75h.02c.2-.38.7-.77 1.44-.77 1.54 0 1.82.96 1.82 2.2V12H9.74V9c0-.57-.01-1.3-.84-1.3-.85 0-.97.63-.97 1.26V12H6.5V6.5z" fill="white"/>
    </svg>
  )
}

// LinkedIn verified identity badge (shield with checkmark)
function BadgeVerified() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 inline-block shrink-0" aria-hidden="true">
      <path d="M8 1L2 3.5v4C2 11 4.8 13.9 8 15c3.2-1.1 6-4 6-7.5v-4L8 1z" fill="#6c757d"/>
      <path d="M5.5 8l1.8 1.8L10.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
function IconCopy({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
}

// ── Status badge (colored pill) ───────────────────────────────
function StatusBadge({ status, published }: { status?: PostStatus; published?: boolean }) {
  const hasApprovals = status && status.approvals.length > 0
  const hasComments = status && status.commentCount > 0

  let label: string
  let bgColor: string
  let textColor: string

  if (published) {
    label = 'Published'
    bgColor = 'bg-blue-100'
    textColor = 'text-blue-800'
  } else if (hasApprovals) {
    label = 'Approved'
    bgColor = 'bg-green-100'
    textColor = 'text-green-800'
  } else if (hasComments) {
    label = 'Feedback'
    bgColor = 'bg-amber-100'
    textColor = 'text-amber-800'
  } else {
    label = 'Draft'
    bgColor = 'bg-gray-100'
    textColor = 'text-gray-600'
  }

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bgColor} ${textColor} whitespace-nowrap`}>
      {label}
    </span>
  )
}

// ── Engagement summary line ───────────────────────────────────
function EngagementSummary({ status, postId }: { status?: PostStatus; postId: string }) {
  if (!status) return null
  const { approvals, commentCount } = status
  if (approvals.length === 0 && commentCount === 0) return null

  const parts: React.ReactNode[] = []

  if (approvals.length > 0) {
    parts.push(
      <span key="approvals">Approved by {approvals.join(', ')}</span>
    )
  }

  if (commentCount > 0) {
    parts.push(
      <span key="comments">{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
    )
  }

  return (
    <Link
      href={`/post/${postId}`}
      className="block px-3 py-1.5 text-xs text-[rgba(0,0,0,0.6)] hover:underline hover:text-[#0a66c2]"
    >
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1">&middot;</span>}
          {part}
        </span>
      ))}
    </Link>
  )
}

// ── Post body with LinkedIn-style line-based "...more" ────────
function PostBody({
  hook,
  content,
  alwaysExpanded,
  hasMedia,
}: {
  hook: string
  content: string
  alwaysExpanded: boolean
  hasMedia: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const LINE_HEIGHT = 20

  // Detect mobile for 2-line preview
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // LinkedIn: 5 visible lines text-only, 3 with media on desktop; 2 on mobile
  const maxLines = isMobile ? 2 : (hasMedia ? 3 : 5)
  const maxHeight = maxLines * LINE_HEIGHT

  useEffect(() => {
    const el = containerRef.current
    if (!el || alwaysExpanded || expanded) return
    setOverflows(el.scrollHeight > el.clientHeight + 2)
  }, [alwaysExpanded, expanded, hook, content, hasMedia, maxLines])

  useEffect(() => {
    const check = () => {
      const el = containerRef.current
      if (!el || alwaysExpanded || expanded) return
      setOverflows(el.scrollHeight > el.clientHeight + 2)
    }
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [alwaysExpanded, expanded])

  const isExpanded = expanded || alwaysExpanded
  // Combine hook + content into one continuous text (like LinkedIn)
  const fullText = hook + (content ? '\n\n' + content : '')

  return (
    <div className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ lineHeight: `${LINE_HEIGHT}px` }}>
      <div
        ref={containerRef}
        className="relative"
        style={!isExpanded ? {
          maxHeight: `${maxHeight}px`,
          overflow: 'hidden',
        } : undefined}
      >
        {/* Single pre-line div: \n\n creates full-height blank lines, matching LinkedIn */}
        <div className="whitespace-pre-line break-words">{fullText}</div>

        {overflows && !isExpanded && (
          <span
            className="absolute bottom-0 right-0 cursor-pointer pl-8"
            style={{ background: 'linear-gradient(to left, white 80%, transparent)' }}
            onClick={() => setExpanded(true)}
          >
            <span className="text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2] hover:underline">
              ...more
            </span>
          </span>
        )}
      </div>

      {expanded && !alwaysExpanded && (
        <button
          onClick={() => setExpanded(false)}
          className="text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2] hover:underline text-[14px] mt-1"
        >
          ...less
        </button>
      )}
    </div>
  )
}

// ── Image grid (LinkedIn multi-image layouts) ────────────────
function ImageGrid({ images }: { images: string[] }) {
  if (images.length === 1) {
    return (
      <div className="bg-[#f3f2ef] flex justify-center items-center overflow-hidden" style={{ maxHeight: '510px' }}>
        <img src={images[0]} alt="" className="w-full h-auto block object-contain" style={{ maxHeight: '510px' }} />
      </div>
    )
  }

  if (images.length <= 3) {
    return (
      <div className="flex gap-[2px]" style={{ height: '280px' }}>
        {images.map((src, i) => (
          <div key={i} className="flex-1 bg-[#f3f2ef] overflow-hidden">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    )
  }

  // 4+ images: 2x2 grid with +N overlay on last cell
  const visible = images.slice(0, 4)
  const remaining = images.length - 4

  return (
    <div className="grid grid-cols-2 gap-[2px]" style={{ height: '380px' }}>
      {visible.map((src, i) => (
        <div key={i} className="relative bg-[#f3f2ef] overflow-hidden">
          <img src={src} alt="" className="w-full h-full object-cover" />
          {i === 3 && remaining > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">+{remaining}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Today button ──────────────────────────────────────────────
function TodayButton({ postId, isToday, onToggle }: {
  postId: string
  isToday: boolean
  onToggle?: (postId: string, active: boolean) => void
}) {
  const [active, setActive] = useState(isToday)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setActive(isToday) }, [isToday])

  const toggle = async () => {
    const next = !active
    setActive(next)
    setLoading(true)
    onToggle?.(postId, next)
    const localDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local tz
    await fetch('/api/post-of-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, date: localDate, active: next }),
    })
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex flex-col items-center justify-center gap-1 py-3 flex-1 rounded transition-colors
        ${active
          ? 'text-[#059669] hover:bg-[rgba(5,150,105,0.08)]'
          : 'text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] hover:bg-[rgba(0,0,0,0.04)]'
        }`}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
      <span className="text-xs font-semibold hidden sm:block">
        {active ? 'Today' : 'Today'}
      </span>
    </button>
  )
}

// ── Like/Approve button (persisted via Supabase approvals) ────
function LikeButton({ postId, status, onStatusChange }: {
  postId: string
  status?: PostStatus
  onStatusChange?: (approvals: string[]) => void
}) {
  const [approved, setApproved] = useState(false)
  const [approvedBy, setApprovedBy] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If feed status is provided, use it instead of fetching
    if (status) {
      const userName = getUserName()
      setApprovedBy(status.approvals)
      setApproved(userName ? status.approvals.includes(userName) : false)
      setLoading(false)
      return
    }

    // Fallback: fetch individually (for detail page)
    const userName = getUserName()
    fetch(`/api/approvals?postId=${encodeURIComponent(postId)}&userName=${encodeURIComponent(userName)}`)
      .then(r => r.json())
      .then(data => {
        setApproved(data.approved)
        setApprovedBy(data.approvedBy)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [postId, status])

  const toggle = async () => {
    const userName = getUserName()
    if (!userName) {
      alert('Please log out and log back in with your name to approve posts.')
      return
    }
    const next = !approved
    setApproved(next)
    // Optimistic update
    const nextBy = next
      ? [...approvedBy, userName]
      : approvedBy.filter(n => n !== userName)
    setApprovedBy(nextBy)
    onStatusChange?.(nextBy)

    const res = await fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userName, approved: next }),
    })
    const data = await res.json()
    if (data.approvedBy) {
      setApprovedBy(data.approvedBy)
      onStatusChange?.(data.approvedBy)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex flex-col items-center justify-center gap-1 py-3 flex-1 rounded transition-colors
        ${approved
          ? 'text-[#0a66c2] hover:bg-[rgba(10,102,194,0.08)]'
          : 'text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] hover:bg-[rgba(0,0,0,0.04)]'
        }`}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={approved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.53 4.53 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
      </svg>
      <span className={`text-xs font-semibold hidden sm:block`}>
        {approved ? 'Approved' : 'Approve'}
      </span>
    </button>
  )
}

// ── Action button ─────────────────────────────────────────────
function ActionBtn({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode
  label: string
  href?: string
}) {
  const cls =
    'flex flex-col items-center justify-center gap-1 py-3 flex-1 text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] hover:bg-[rgba(0,0,0,0.04)] rounded transition-colors'
  if (href) {
    return (
      <Link href={href} className={cls}>
        {icon}
        <span className="text-xs font-semibold hidden sm:block">{label}</span>
      </Link>
    )
  }
  return (
    <button className={cls}>
      {icon}
      <span className="text-xs font-semibold hidden sm:block">{label}</span>
    </button>
  )
}

// ── Copy button ───────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const cls = 'flex flex-col items-center justify-center gap-1 py-3 flex-1 rounded transition-colors'
  return (
    <button
      onClick={copy}
      className={`${cls} ${copied ? 'text-[#057642]' : 'text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] hover:bg-[rgba(0,0,0,0.04)]'}`}
    >
      <IconCopy copied={copied} />
      <span className="text-xs font-semibold hidden sm:block">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}

// ── PostCard ──────────────────────────────────────────────────
export default function PostCard({ post, expanded = false, status, isToday = false, onTodayToggle }: PostCardProps) {
  const initials = getInitials(post.person)
  const avatarColor = getAvatarColor(post.person)
  const fullText = `${post.hook}\n\n${post.content}`
  const hasMedia = (post.images && post.images.length > 0) || !!post.video

  // Local status state so LikeButton can update badge/engagement in real time
  const [localStatus, setLocalStatus] = useState<PostStatus | undefined>(status)
  useEffect(() => { setLocalStatus(status) }, [status])

  const handleApprovalChange = (approvals: string[]) => {
    setLocalStatus(prev => prev
      ? { ...prev, approvals }
      : { approvals, commentCount: 0 }
    )
  }

  return (
    <article className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden">

      {/* ── Card header ── */}
      <div className="p-3 pb-0">
        <div className="flex items-start gap-2">

          {/* Avatar — real photo if available, else colored initials */}
          {post.personPhoto ? (
            <img
              src={post.personPhoto}
              alt={post.person}
              className={`w-12 h-12 object-cover shrink-0 ${post.isCompanyPage ? 'rounded-lg' : 'rounded-full'}`}
            />
          ) : (
            <div
              className={`w-12 h-12 flex items-center justify-center text-white font-semibold text-sm shrink-0 ${avatarColor} ${post.isCompanyPage ? 'rounded-lg' : 'rounded-full'}`}
            >
              {initials}
            </div>
          )}

          {/* Name / role / time */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                {/* Name + badge (+ 1st for personal, followers for company page) */}
                <p className="font-semibold text-sm text-[#1d2226] leading-tight hover:text-[#0a66c2] hover:underline cursor-pointer flex items-center gap-1 flex-wrap">
                  <span className="truncate">{post.person}</span>
                  {post.personBadge === 'linkedin' && <BadgeLinkedIn />}
                  {post.personBadge === 'verified' && <BadgeVerified />}
                  {!post.isCompanyPage && <span className="text-[rgba(0,0,0,0.6)] font-normal text-xs shrink-0">· 1st</span>}
                </p>
                {post.isCompanyPage ? (
                  <p className="text-xs text-[rgba(0,0,0,0.6)] leading-snug">{post.role}</p>
                ) : (
                  <p className="text-xs text-[rgba(0,0,0,0.6)] leading-snug truncate">{post.role}</p>
                )}
                <p className="text-xs text-[rgba(0,0,0,0.6)]">
                  4h · <span>🌐</span>
                </p>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 shrink-0">
                {!expanded && <StatusBadge status={localStatus} published={post.published} />}
                {!expanded && post.isCompanyPage && (
                  <a
                    href="https://stacksync.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0a66c2] font-semibold border border-[#0a66c2] rounded-full px-3 py-0.5 hover:bg-[#eef3f8] transition-colors whitespace-nowrap"
                  >
                    Visit website
                  </a>
                )}
                {!expanded && !post.isCompanyPage && (
                  <button className="text-xs text-[#0a66c2] font-semibold border border-[#0a66c2] rounded-full px-3 py-0.5 hover:bg-[#eef3f8] transition-colors whitespace-nowrap">
                    + Follow
                  </button>
                )}
                <button className="text-[rgba(0,0,0,0.6)] hover:text-[#1d2226] hover:bg-[rgba(0,0,0,0.08)] rounded-full p-1 transition-colors">
                  <IconDots />
                </button>
                <button className="text-[rgba(0,0,0,0.6)] hover:text-[#1d2226] hover:bg-[rgba(0,0,0,0.08)] rounded-full p-1 transition-colors">
                  <IconClose />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post text */}
        <div className="mt-3 pb-3">
          <PostBody hook={post.hook} content={post.content} alwaysExpanded={expanded} hasMedia={hasMedia} />
        </div>
      </div>

      {/* ── Images ── */}
      {post.images && post.images.length > 0 && <ImageGrid images={post.images} />}

      {/* ── Video ── */}
      {post.video && (
        <div className="bg-black flex justify-center items-center overflow-hidden" style={{ maxHeight: '510px' }}>
          <video
            src={post.video}
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto block"
            style={{ maxHeight: '510px' }}
          />
        </div>
      )}

      {/* ── Engagement summary ── */}
      {!expanded && <EngagementSummary status={localStatus} postId={post.id} />}

      {/* ── Action bar ── */}
      <div className="flex items-stretch border-t border-[rgba(0,0,0,0.08)] px-1 pt-1 pb-1">
        <LikeButton postId={post.id} status={localStatus} onStatusChange={handleApprovalChange} />
        <ActionBtn
          icon={<IconComment />}
          label="Comment"
          href={expanded ? undefined : `/post/${post.id}`}
        />
        <CopyButton text={fullText} />
        {post.published ? (
          <span className="flex flex-col items-center justify-center gap-1 py-3 flex-1 text-blue-600">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold hidden sm:block">Published</span>
          </span>
        ) : (
          <TodayButton postId={post.id} isToday={isToday} onToggle={onTodayToggle} />
        )}
      </div>
    </article>
  )
}

'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import type { Newsletter, NewsletterSection } from '@/lib/newsletters'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { getUserName } from '@/lib/user'

// ── Types ───────────────────────────────────────────────
interface Comment {
  id: string
  post_id: string
  author: string
  body: string
  created_at: string
}

// ── Helpers ─────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function Avatar({ name }: { name: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getAvatarColor(name)}`}>
      {getInitials(name)}
    </div>
  )
}

// ── Status Badge ────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    sent: 'bg-blue-50 text-blue-700',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.draft}`}>
      {status}
    </span>
  )
}

// ── Section colors ──────────────────────────────────────
const SECTION_COLORS: Record<string, string> = {
  intro: '#0a66c2',
  'what-we-shipped': '#059669',
  'the-signal': '#d97706',
  'customer-spotlight': '#dc2626',
  'from-the-team': '#7c3aed',
  'ask-the-team': '#0891b2',
  'worth-reading': '#9333ea',
  close: '#6b7280',
  // Legacy names (backward compat)
  'product-updates': '#059669',
  'industry-pulse': '#d97706',
  'from-our-team': '#7c3aed',
  'deep-read': '#dc2626',
}
function getSectionColor(id: string): string {
  return SECTION_COLORS[id] || '#0a66c2'
}

// ── Collapsible Panel ───────────────────────────────────
function CollapsiblePanel({
  title,
  icon,
  children,
  defaultOpen,
  badge,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-[rgba(0,0,0,0.02)] transition-colors"
      >
        <div className="text-[rgba(0,0,0,0.5)]">{icon}</div>
        <span className="text-sm font-semibold text-[#1d2226] flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.5)]">
            {badge}
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-[rgba(0,0,0,0.3)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-[rgba(0,0,0,0.06)]">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Inline Markdown ─────────────────────────────────────
function InlineMarkdown({ text }: { text: string }) {
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let keyIdx = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)

    const candidates: { index: number; length: number; element: JSX.Element }[] = []

    if (boldMatch?.index !== undefined) {
      candidates.push({
        index: boldMatch.index,
        length: boldMatch[0].length,
        element: <strong key={`b${keyIdx++}`} className="font-semibold text-[#1d2226]">{boldMatch[1]}</strong>,
      })
    }
    if (linkMatch?.index !== undefined) {
      candidates.push({
        index: linkMatch.index,
        length: linkMatch[0].length,
        element: (
          <a key={`l${keyIdx++}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#0a66c2] hover:underline">
            {linkMatch[1]}
          </a>
        ),
      })
    }

    if (candidates.length === 0) {
      parts.push(remaining)
      break
    }

    candidates.sort((a, b) => a.index - b.index)
    const winner = candidates[0]
    if (winner.index > 0) parts.push(remaining.slice(0, winner.index))
    parts.push(winner.element)
    remaining = remaining.slice(winner.index + winner.length)
  }

  return <>{parts}</>
}

// ── Markdown Block ──────────────────────────────────────
function MarkdownBlock({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/)
  const elements: JSX.Element[] = []

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim()
    if (!para) continue

    if (/^---+$/.test(para)) {
      elements.push(<hr key={i} className="my-4 border-[rgba(0,0,0,0.08)]" />)
      continue
    }

    if (para.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-[#1d2226] mt-5 mb-2">
          <InlineMarkdown text={para.slice(4)} />
        </h4>
      )
      continue
    }

    if (para.startsWith('> ')) {
      const quoteLines = para.split('\n').map(l => l.replace(/^>\s?/, ''))
      elements.push(
        <blockquote key={i} className="pl-4 my-3 text-sm text-[rgba(0,0,0,0.7)] italic" style={{ borderLeft: '3px solid #0a66c2' }}>
          {quoteLines.map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              <InlineMarkdown text={line} />
            </Fragment>
          ))}
        </blockquote>
      )
      continue
    }

    const lines = para.split('\n')
    elements.push(
      <p key={i} className="text-sm text-[rgba(0,0,0,0.85)] leading-relaxed mb-3">
        {lines.map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            <InlineMarkdown text={line} />
          </Fragment>
        ))}
      </p>
    )
  }

  return <>{elements}</>
}

// ── Source Text Block (plain text with line wrapping) ────
function SourceBlock({ content }: { content: string }) {
  if (!content) return <p className="text-xs text-[rgba(0,0,0,0.35)] italic py-2">Not available</p>
  return (
    <pre className="text-xs text-[rgba(0,0,0,0.7)] leading-relaxed whitespace-pre-wrap font-mono bg-[#f9fafb] rounded-lg p-4 mt-3 max-h-[400px] overflow-y-auto">
      {content}
    </pre>
  )
}

// ── Section View ────────────────────────────────────────
function SectionView({
  section,
  onNote,
}: {
  section: NewsletterSection
  onNote: (sectionTitle: string) => void
}) {
  const color = getSectionColor(section.id)
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 group">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-base font-bold text-[#1d2226]">{section.title}</h3>
        </div>
        <button
          onClick={() => onNote(section.title)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[rgba(0,0,0,0.35)] hover:text-[#0a66c2] hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          Note
        </button>
      </div>
      <div className="pl-3">
        <MarkdownBlock content={section.content} />
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────
export default function NewsletterDetail({ newsletter }: { newsletter: Newsletter }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState(false)
  const [nameFromCookie, setNameFromCookie] = useState('')
  const notesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const cookieName = getUserName()
    if (cookieName) {
      setAuthor(cookieName)
      setNameFromCookie(cookieName)
    }
  }, [])

  useEffect(() => {
    fetch(`/api/comments?postId=${encodeURIComponent(newsletter.id)}`)
      .then(r => r.json())
      .then(data => setComments(data))
      .catch(() => {})
  }, [newsletter.id])

  const handleSectionNote = (sectionTitle: string) => {
    setBody(`[${sectionTitle}] `)
    setFocused(true)
    setTimeout(() => {
      notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      textareaRef.current?.focus()
    }, 100)
  }

  const submit = async () => {
    if (!author.trim() || !body.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: newsletter.id, author, body }),
    })
    const newComment = await res.json()
    setComments(prev => [...prev, newComment])
    setBody('')
    setFocused(false)
    setSubmitting(false)
  }

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments?id=${id}`, { method: 'DELETE' })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const parseSectionTag = (commentBody: string): { tag: string | null; text: string } => {
    const match = commentBody.match(/^\[([^\]]+)\]\s*/)
    if (match) return { tag: match[1], text: commentBody.slice(match[0].length) }
    return { tag: null, text: commentBody }
  }

  // Count changelog entries
  const changelogEntryCount = newsletter.changelogInput
    ? newsletter.changelogInput.split(/^  - /m).length - 1
    : 0

  return (
    <div>
      {/* ── Header ── */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-6 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={newsletter.status} />
          {newsletter.date && (
            <span className="text-xs text-[rgba(0,0,0,0.4)]">{fmtDate(newsletter.date)}</span>
          )}
          <div className="flex-1" />
          <span className="text-xs text-[rgba(0,0,0,0.4)]">
            {newsletter.wordCount} words · ~{Math.max(1, Math.round(newsletter.wordCount / 200))} min
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#1d2226] leading-tight mb-1">
          {newsletter.subject}
        </h1>
        {newsletter.preheader && (
          <p className="text-sm text-[rgba(0,0,0,0.6)]">{newsletter.preheader}</p>
        )}
      </div>

      {/* ── Sources (collapsible panels) ── */}
      <CollapsiblePanel
        title="Changelog Input"
        badge={changelogEntryCount > 0 ? `${changelogEntryCount} entries` : undefined}
        icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        }
      >
        <p className="text-[10px] text-[rgba(0,0,0,0.4)] mt-3 mb-1">Raw changelog that was fed into the newsletter pipeline</p>
        <SourceBlock content={newsletter.changelogInput} />
      </CollapsiblePanel>

      <CollapsiblePanel
        title="News Sources"
        icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        }
      >
        <p className="text-[10px] text-[rgba(0,0,0,0.4)] mt-3 mb-1">Enterprise news sources used for the Industry Pulse section</p>
        <SourceBlock content={newsletter.newsSources} />
      </CollapsiblePanel>

      {newsletter.curationLog && (
        <CollapsiblePanel
          title="Curation Log"
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          }
        >
          <p className="text-[10px] text-[rgba(0,0,0,0.4)] mt-3 mb-1">What was considered, selected, and rejected during curation</p>
          <SourceBlock content={newsletter.curationLog} />
        </CollapsiblePanel>
      )}

      {/* ── Section Navigation ── */}
      {newsletter.sections.length > 0 && (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-4 py-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-[rgba(0,0,0,0.4)] font-medium uppercase tracking-wide mr-1">
              Sections
            </span>
            {newsletter.sections.map(s => (
              <a
                key={s.id}
                href={`#section-${s.id}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)] hover:text-[#1d2226] hover:bg-[rgba(0,0,0,0.08)] transition-colors"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getSectionColor(s.id) }} />
                {s.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Newsletter Content ── */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-6 mb-3">
        {newsletter.sections.map((section, idx) => (
          <div key={section.id} id={`section-${section.id}`}>
            {idx > 0 && <hr className="my-5 border-[rgba(0,0,0,0.08)]" />}
            <SectionView section={section} onNote={handleSectionNote} />
          </div>
        ))}
      </div>

      {/* ── Review Notes ── */}
      <div ref={notesRef} className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-6">
        <h2 className="text-sm font-semibold text-[#1d2226] mb-3">
          Notes
          {comments.length > 0 && (
            <span className="ml-2 text-xs font-normal text-[rgba(0,0,0,0.4)]">{comments.length}</span>
          )}
        </h2>

        {/* Note input */}
        <div className="flex gap-2 mb-4">
          <Avatar name={author || '?'} />
          <div className="flex-1">
            {focused && !nameFromCookie && (
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full text-sm border border-[rgba(0,0,0,0.2)] rounded-md px-3 py-1.5 mb-2 focus:outline-none focus:border-[#0a66c2]"
              />
            )}
            {focused && nameFromCookie && (
              <p className="text-sm text-[rgba(0,0,0,0.6)] mb-2 px-1">
                As <span className="font-semibold text-[#1d2226]">{nameFromCookie}</span>
              </p>
            )}
            <textarea
              ref={textareaRef}
              placeholder="Leave a note..."
              value={body}
              onFocus={() => setFocused(true)}
              onChange={e => setBody(e.target.value)}
              rows={focused ? 3 : 1}
              className="w-full text-sm border border-[rgba(0,0,0,0.2)] rounded-2xl px-4 py-2 resize-none focus:outline-none focus:border-[#0a66c2] transition-all"
            />
            {focused && (
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => { setFocused(false); setBody('') }}
                  className="text-sm text-[rgba(0,0,0,0.6)] font-semibold px-3 py-1 rounded-full hover:bg-[rgba(0,0,0,0.04)]"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={submitting || !author.trim() || !body.trim()}
                  className="text-sm text-white font-semibold px-4 py-1 rounded-full bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notes list */}
        {comments.length === 0 && !focused && (
          <p className="text-xs text-[rgba(0,0,0,0.3)] text-center py-3">
            No notes yet. Hover a section header and click "Note" to tag a specific section.
          </p>
        )}
        <div className="space-y-3">
          {comments.map(c => {
            const { tag, text } = parseSectionTag(c.body)
            return (
              <div key={c.id} className="flex gap-2 group">
                <Avatar name={c.author} />
                <div className="flex-1">
                  <div className="relative bg-[#f3f2ef] rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#1d2226] leading-tight">{c.author}</p>
                      {tag && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: getSectionColor(tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')) }}
                        >
                          {tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[rgba(0,0,0,0.9)] whitespace-pre-line">{text}</p>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="absolute top-1.5 right-2 text-[rgba(0,0,0,0.3)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-[rgba(0,0,0,0.5)] mt-1 ml-3">{timeAgo(c.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

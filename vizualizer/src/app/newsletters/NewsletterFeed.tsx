'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Newsletter } from '@/lib/newsletters'

// ── Status Badge ────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    sent: 'bg-blue-50 text-blue-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${styles[status] || styles.draft}`}>
      {status}
    </span>
  )
}

// ── Format date ─────────────────────────────────────────
function fmtDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Source indicator ────────────────────────────────────
function SourceIndicator({ hasChangelog, hasCurationLog }: { hasChangelog: boolean; hasCurationLog: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1 text-[10px] ${hasChangelog ? 'text-emerald-600' : 'text-[rgba(0,0,0,0.25)]'}`}>
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2}>
          {hasChangelog ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
        Changelog
      </span>
      <span className={`flex items-center gap-1 text-[10px] ${hasCurationLog ? 'text-emerald-600' : 'text-[rgba(0,0,0,0.25)]'}`}>
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2}>
          {hasCurationLog ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
        Curation Log
      </span>
    </div>
  )
}

// ── Newsletter Card ─────────────────────────────────────
function NewsletterCard({
  newsletter,
  commentCount,
}: {
  newsletter: Newsletter
  commentCount: number
}) {
  return (
    <Link
      href={`/newsletter/${newsletter.id}`}
      className="block bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={newsletter.status} />
            {newsletter.date && (
              <span className="text-xs text-[rgba(0,0,0,0.4)]">
                {fmtDate(newsletter.date)}
              </span>
            )}
          </div>
          <SourceIndicator
            hasChangelog={!!newsletter.changelogInput}
            hasCurationLog={!!newsletter.curationLog}
          />
        </div>

        {/* Subject */}
        <h3 className="text-lg font-bold text-[#1d2226] leading-snug mb-1">
          {newsletter.subject}
        </h3>

        {/* Preheader */}
        {newsletter.preheader && (
          <p className="text-sm text-[rgba(0,0,0,0.6)] mb-3 line-clamp-2">
            {newsletter.preheader}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-[rgba(0,0,0,0.45)]">
          <span>{newsletter.sections.length} sections</span>
          <span>{newsletter.wordCount} words</span>
          <span>~{Math.max(1, Math.round(newsletter.wordCount / 200))} min read</span>
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[#0a66c2] font-medium">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {commentCount} note{commentCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Main Feed ───────────────────────────────────────────
interface Props {
  newsletters: Newsletter[]
}

export default function NewsletterFeed({ newsletters }: Props) {
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/newsletter-status')
      .then(r => r.json())
      .then(data => setCommentCounts(data.counts || {}))
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0a66c2] flex items-center justify-center shrink-0 text-white">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1d2226]">Newsletter</h1>
            <p className="text-xs text-[rgba(0,0,0,0.5)]">
              Bi-weekly Stacksync newsletter with sources and notes
            </p>
          </div>
        </div>
      </div>

      {/* Newsletter List */}
      {newsletters.length === 0 ? (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-12 text-center">
          <div className="text-[rgba(0,0,0,0.25)] mb-3">
            <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[rgba(0,0,0,0.5)]">No newsletters yet</p>
          <p className="text-xs text-[rgba(0,0,0,0.3)] mt-1">
            Run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">/create-newsletter</code> to generate the first issue
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map(nl => (
            <NewsletterCard
              key={nl.id}
              newsletter={nl}
              commentCount={commentCounts[nl.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

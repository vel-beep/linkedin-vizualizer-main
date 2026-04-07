'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Post } from '@/lib/posts'
import PostCard from './PostCard'
import type { PostStatus } from './PostCard'
import Filters from './Filters'

interface FeedProps {
  posts: Post[]
  persons: string[]
}

export default function Feed({ posts, persons }: FeedProps) {
  const [selectedPersons, setSelectedPersons] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [feedStatus, setFeedStatus] = useState<Record<string, PostStatus>>({})
  const [todayPostIds, setTodayPostIds] = useState<string[]>([])
  const [feedStatusLoaded, setFeedStatusLoaded] = useState(false)

  // Restore scroll AFTER feedStatus has loaded and React has re-rendered.
  // This is critical: EngagementSummary rows only appear after feedStatus loads,
  // adding height to the page. Scrolling before that lands at the wrong position.
  useEffect(() => {
    if (!feedStatusLoaded) return
    const saved = sessionStorage.getItem('feed_scroll')
    if (!saved) return
    sessionStorage.removeItem('feed_scroll')
    const y = parseInt(saved, 10)
    requestAnimationFrame(() => window.scrollTo(0, y))
  }, [feedStatusLoaded])

  // Fetch all statuses in one batch on mount
  useEffect(() => {
    const date = new Date().toLocaleDateString('en-CA')
    fetch(`/api/feed-status?date=${date}`)
      .then(r => r.json())
      .then(data => {
        if (data.statuses) {
          setFeedStatus(data.statuses)
          setTodayPostIds(data.todayPostIds ?? [])
        } else {
          setFeedStatus(data)
        }
      })
      .catch(() => {})
      .finally(() => setFeedStatusLoaded(true))
  }, [])

  const handlePersonToggle = (person: string) => {
    setSelectedPersons((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    )
  }

  const handleTodayToggle = (postId: string, active: boolean) => {
    setTodayPostIds(prev =>
      active ? [...prev, postId] : prev.filter(id => id !== postId)
    )
  }

  const personCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of posts) {
      counts[p.person] = (counts[p.person] ?? 0) + 1
    }
    return counts
  }, [posts])

  const filtered = useMemo(() => {
    let result = posts

    if (selectedPersons.length > 0) {
      result = result.filter((p) => selectedPersons.includes(p.person))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.hook.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.person.toLowerCase().includes(q)
      )
    }

    return result
  }, [posts, selectedPersons, search])

  return (
    <div>
      <Filters
        persons={persons}
        selectedPersons={selectedPersons}
        search={search}
        onPersonToggle={handlePersonToggle}
        onSearchChange={setSearch}
        totalCount={posts.length}
        filteredCount={filtered.length}
        personCounts={personCounts}
      />

      <div
        className="mt-3 space-y-3"
        onClickCapture={(e) => {
          const target = e.target as HTMLElement
          const link = target.closest('a[href^="/post/"]')
          if (link) sessionStorage.setItem('feed_scroll', String(window.scrollY))
        }}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">No posts match your filters</p>
            <button
              onClick={() => { setSelectedPersons([]); setSearch('') }}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              status={feedStatus[post.id]}
              isToday={todayPostIds.includes(post.id)}
              onTodayToggle={handleTodayToggle}
            />
          ))
        )}
      </div>
    </div>
  )
}

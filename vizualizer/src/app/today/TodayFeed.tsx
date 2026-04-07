'use client'

import { useState, useEffect } from 'react'
import type { Post } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import type { PostStatus } from '@/components/PostCard'

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function localDate() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
}

export default function TodayFeed({ posts }: { posts: Post[] }) {
  const [statuses, setStatuses] = useState<Record<string, PostStatus>>({})
  const [todayIds, setTodayIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const date = localDate()
    Promise.all([
      fetch(`/api/post-of-day?date=${date}`).then(r => r.json()),
      fetch('/api/feed-status').then(r => r.json()),
    ]).then(([todayData, statusData]) => {
      setTodayIds(todayData.postIds ?? [])
      setStatuses(statusData.statuses ?? statusData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleTodayToggle = (postId: string, active: boolean) => {
    setTodayIds(prev =>
      active ? [...prev, postId] : prev.filter(id => id !== postId)
    )
  }

  const date = localDate()
  // Show: posts flagged for today + published posts whose publishDate matches today
  const todayPosts = posts.filter(p =>
    todayIds.includes(p.id) || (p.published && p.publishDate === date)
  )

  if (loading) {
    return (
      <div className="text-center py-10 text-sm text-[rgba(0,0,0,0.5)]">
        Loading...
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#059669]" fill="currentColor">
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="text-sm font-semibold text-[#1d2226]">Post of the Day</span>
          <span className="text-xs text-[rgba(0,0,0,0.5)]">{todayLabel()}</span>
          {todayPosts.length > 0 && (
            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-medium ml-auto">
              {todayPosts.length} {todayPosts.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>
      </div>

      {todayPosts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm font-medium">No posts flagged for today</p>
          <p className="text-xs mt-1">Go to Home and tap <strong>Today</strong> on a post to add it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              status={statuses[post.id]}
              isToday={true}
              onTodayToggle={handleTodayToggle}
            />
          ))}
        </div>
      )}
    </>
  )
}

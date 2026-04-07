import { getAllPosts } from '@/lib/posts'
import TodayFeed from './TodayFeed'

export default function TodayPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-[552px] mx-auto px-3 py-5">
      <TodayFeed posts={posts} />
    </div>
  )
}

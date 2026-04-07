import { getAllPosts, getPostById } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import Comments from '@/components/Comments'
import BackButton from '@/components/BackButton'
import { notFound } from 'next/navigation'
import { siteConfig } from '@/site.config'

interface PageProps {
  params: { id: string }
}

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((p) => ({ id: p.id }))
}

export function generateMetadata({ params }: PageProps) {
  const post = getPostById(params.id)
  if (!post) return { title: 'Post not found' }
  return {
    title: `${post.person} — ${siteConfig.loginTitle}`,
    description: post.hook,
  }
}

export default function PostPage({ params }: PageProps) {
  const post = getPostById(params.id)
  if (!post) notFound()

  return (
    <div className="max-w-[668px] mx-auto px-4 py-6">
      <BackButton />

      {/* Post card (expanded view) */}
      <PostCard post={post} expanded />

      {/* Comments */}
      <Comments postId={post.id} />
    </div>
  )
}

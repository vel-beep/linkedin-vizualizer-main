import { getAllNewsletters, getNewsletterById } from '@/lib/newsletters'
import NewsletterDetail from './NewsletterDetail'
import BackButton from '@/components/BackButton'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return getAllNewsletters().map(n => ({ id: n.id }))
}

export function generateMetadata({ params }: PageProps) {
  const newsletter = getNewsletterById(params.id)
  if (!newsletter) return { title: 'Newsletter not found' }
  return {
    title: `${newsletter.subject} — Stacksync Newsletter`,
    description: newsletter.preheader,
  }
}

export default function NewsletterPage({ params }: PageProps) {
  const newsletter = getNewsletterById(params.id)
  if (!newsletter) notFound()

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <BackButton />
      <NewsletterDetail newsletter={newsletter} />
    </div>
  )
}

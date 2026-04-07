import { getAllNewsletters } from '@/lib/newsletters'
import NewsletterFeed from './NewsletterFeed'

export default function NewslettersPage() {
  const newsletters = getAllNewsletters()

  return (
    <div className="max-w-[1128px] mx-auto px-3 py-5">
      <NewsletterFeed newsletters={newsletters} />
    </div>
  )
}

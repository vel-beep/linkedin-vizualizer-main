import { getAllPosts } from '@/lib/posts'
import Feed from '@/components/Feed'
import { WEEKLY_DATA, PERSONA_CONFIG, PERSONA_KEYS } from './tracker/data'
import { siteConfig } from '@/site.config'

// ── Left sidebar: profile card ────────────────────────────────
function ProfileCard() {
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] overflow-hidden text-center shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
      {/* Cover */}
      <div
        className="h-[54px]"
        style={{ background: 'linear-gradient(135deg, #7928ca, #0a66c2)' }}
      />
      {/* Avatar */}
      <div className="-mt-7 flex justify-center mb-1">
        <div className="w-[72px] h-[72px] rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-500">
          <svg viewBox="0 0 24 24" className="w-9 h-9" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
      </div>
      <div className="px-3 pb-3">
        <p className="font-semibold text-sm text-[#1d2226]">{siteConfig.profile.name}</p>
        <p className="text-xs text-[rgba(0,0,0,0.6)] mt-0.5 leading-snug">{siteConfig.profile.subtitle}</p>
        <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.08)] text-left space-y-2">
          <p className="text-xs text-[rgba(0,0,0,0.6)]">
            Profile viewers{' '}
            <span className="font-semibold text-[#0a66c2]">124</span>
          </p>
          <p className="text-xs text-[rgba(0,0,0,0.6)]">
            Post impressions{' '}
            <span className="font-semibold text-[#0a66c2]">3,847</span>
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.08)] text-left">
          <p className="text-xs font-semibold text-[rgba(0,0,0,0.6)]">
            <span className="text-amber-500">✦</span> Try Premium for free
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.08)] text-left">
          <p className="text-xs font-semibold text-[rgba(0,0,0,0.6)] mb-1.5">Recent</p>
          {siteConfig.profile.recentTopics.map((item) => (
            <p key={item} className="text-xs text-[rgba(0,0,0,0.6)] py-0.5 flex items-center gap-1.5 hover:text-[#0a66c2] cursor-pointer">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Right sidebar: draft info ─────────────────────────────────
function RightSidebar({ persons }: { persons: string[] }) {
  return (
    <div className="space-y-2">
      {/* Add to feed style card */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1d2226]">Draft Queue</h3>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">INTERNAL</span>
        </div>
        <p className="text-xs text-[rgba(0,0,0,0.6)] leading-relaxed mb-3">
          LinkedIn post drafts pending review. Tap <strong>see more</strong> to read full posts. Tap <strong>Comment</strong> to leave feedback.
        </p>
        <div className="border-t border-[rgba(0,0,0,0.08)] pt-3">
          <p className="text-xs font-semibold text-[rgba(0,0,0,0.6)] mb-2">Personas in this queue</p>
          {persons.map((p) => (
            <div key={p} className="flex items-center gap-2 py-1">
              <div className="w-6 h-6 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {p[0]}
              </div>
              <p className="text-xs text-[rgba(0,0,0,0.6)]">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last week metrics */}
      <WeeklyMetrics />
    </div>
  )
}

// ── Weekly metrics from tracker data ──────────────────────────
function WeeklyMetrics() {
  const latest = WEEKLY_DATA[WEEKLY_DATA.length - 1]
  const prev = WEEKLY_DATA.length >= 2 ? WEEKLY_DATA[WEEKLY_DATA.length - 2] : null

  if (!latest) return null

  const totalImpressions = PERSONA_KEYS.reduce((sum, k) => sum + (latest.personas[k]?.impressions ?? 0), 0)
  const totalFollowers = PERSONA_KEYS.reduce((sum, k) => sum + (latest.personas[k]?.followers ?? 0), 0)
  const prevImpressions = prev ? PERSONA_KEYS.reduce((sum, k) => sum + (prev.personas[k]?.impressions ?? 0), 0) : 0
  const prevFollowers = prev ? PERSONA_KEYS.reduce((sum, k) => sum + (prev.personas[k]?.followers ?? 0), 0) : 0

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
  const delta = (curr: number, prev: number) => {
    if (!prev) return null
    const diff = curr - prev
    const pct = ((diff / prev) * 100).toFixed(0)
    return { diff, pct, positive: diff >= 0 }
  }

  const impDelta = delta(totalImpressions, prevImpressions)
  const folDelta = delta(totalFollowers, prevFollowers)

  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1d2226]">Last Week</h3>
        <span className="text-[10px] text-[rgba(0,0,0,0.5)]">w/o {latest.week}</span>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#f3f2ef] rounded-lg p-2.5">
          <p className="text-[10px] text-[rgba(0,0,0,0.5)] uppercase font-medium">Impressions</p>
          <p className="text-lg font-bold text-[#1d2226] leading-tight">{fmt(totalImpressions)}</p>
          {impDelta && (
            <p className={`text-[10px] font-medium ${impDelta.positive ? 'text-green-600' : 'text-red-500'}`}>
              {impDelta.positive ? '+' : ''}{impDelta.pct}% vs prev
            </p>
          )}
        </div>
        <div className="bg-[#f3f2ef] rounded-lg p-2.5">
          <p className="text-[10px] text-[rgba(0,0,0,0.5)] uppercase font-medium">Followers</p>
          <p className="text-lg font-bold text-[#1d2226] leading-tight">{fmt(totalFollowers)}</p>
          {folDelta && (
            <p className={`text-[10px] font-medium ${folDelta.positive ? 'text-green-600' : 'text-red-500'}`}>
              {folDelta.positive ? '+' : ''}{folDelta.diff} vs prev
            </p>
          )}
        </div>
      </div>

      {/* Per-persona breakdown */}
      <div className="border-t border-[rgba(0,0,0,0.08)] pt-2.5 space-y-1.5">
        {PERSONA_KEYS.map((key) => {
          const curr = latest.personas[key]
          const p = prev?.personas[key]
          if (!curr) return null
          const config = PERSONA_CONFIG[key]
          const impChange = p ? curr.impressions - p.impressions : 0
          return (
            <div key={key} className="flex items-center gap-2">
              {config.photo ? (
                <img src={config.photo} alt={config.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: config.color }}>
                  {key[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#1d2226] font-medium truncate">{config.name.split(' ')[0]}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-[#1d2226]">{fmt(curr.impressions)}</p>
              </div>
              <div className="w-[42px] text-right">
                <p className={`text-[10px] font-medium ${impChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {impChange >= 0 ? '+' : ''}{fmt(impChange)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Home page ─────────────────────────────────────────────────
export default function HomePage() {
  const allPosts = getAllPosts()
  // Home feed shows only drafts — published posts appear on /today
  const posts = allPosts.filter(p => !p.published)
  const persons = Array.from(new Set(posts.map((p) => p.person))).sort()

  return (
    <div className="max-w-[1128px] mx-auto px-3 py-5">
      <div className="flex gap-5 items-start">

        {/* Left sidebar */}
        <aside className="hidden md:block w-[225px] shrink-0 sticky top-[68px]">
          <ProfileCard />
        </aside>

        {/* Center feed */}
        <div className="flex-1 min-w-0 max-w-[552px]">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-10 text-center text-sm text-[rgba(0,0,0,0.6)]">
              No posts yet — drop a <code className="bg-gray-100 px-1 rounded">.md</code> file into{' '}
              <code className="bg-gray-100 px-1 rounded">content/</code>
            </div>
          ) : (
            <Feed posts={posts} persons={persons} />
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-[300px] shrink-0 sticky top-[68px]">
          <RightSidebar persons={persons} />
        </aside>
      </div>
    </div>
  )
}

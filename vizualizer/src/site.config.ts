// ── Site Configuration ───────────────────────────────────────
// Single source of truth for all project-specific values.
// To set up your own instance, edit this file only.

export const siteConfig = {
  // Brand
  name: 'My Company',
  title: 'Content Vizualizer',
  description: 'Internal LinkedIn post review tool',
  loginTitle: 'Draft Review',

  // Profile card (left sidebar on home page)
  profile: {
    name: 'Content Reviewer',
    subtitle: 'Reviewing Drafts',
    recentTopics: ['LinkedIn', 'Content', 'Marketing'],
  },

  // Tracker page
  tracker: {
    title: 'LinkedIn Tracker',
    timezone: 'Your timezone',
    updateCadence: 'Updated every Sunday',
  },

  // ── Personas ──────────────────────────────────────────────
  // Add one entry per person who posts on LinkedIn.
  // The key (e.g. "alice") must be lowercase — it maps to the
  // folder name ../Alice/drafts_Alice/ (capitalized first letter).
  //
  // badge options: 'linkedin' (gold), 'verified' (blue), or undefined (none)
  // isCompanyPage: true for company pages (square avatar, no badge)
  personas: {
    alice: {
      name: 'Alice Johnson',
      role: 'CEO at MyCompany',
      shortRole: 'CEO',
      color: '#dc2626',
      photo: '/images/photo_alice.jpeg',
      badge: 'linkedin' as const,
      trackerKey: 'Alice',
    },
    bob: {
      name: 'Bob Smith',
      role: 'CTO at MyCompany',
      shortRole: 'CTO',
      color: '#0a66c2',
      photo: '/images/photo_bob.jpeg',
      badge: 'verified' as const,
      trackerKey: 'Bob',
    },
    // ── Example: company page ──
    // mycompany: {
    //   name: 'MyCompany',
    //   role: '1,000 followers',
    //   shortRole: 'Company',
    //   color: '#0a66c2',
    //   photo: '/images/photo_mycompany.jpeg',
    //   badge: undefined,
    //   trackerKey: 'MyCompany',
    //   isCompanyPage: true as const,
    // },
  },

  // ── Weekly Tracker Data ───────────────────────────────────
  // Add a new entry every week to track LinkedIn growth.
  // Post impressions = number on LinkedIn sidebar.
  // Followers = total follower count from profile.
  weeklyData: [
    {
      week: '2026-04-07',
      personas: {
        Alice: { impressions: 5000, followers: 500 },
        Bob:   { impressions: 3000, followers: 300 },
      },
    },
    // ↓ Copy the block above, change the date, update numbers ↓
    // {
    //   week: '2026-04-14',
    //   personas: {
    //     Alice: { impressions: 0, followers: 0 },
    //     Bob:   { impressions: 0, followers: 0 },
    //   },
    // },
  ],
} as const

// ── Derived types ───────────────────────────────────────────
export type PersonaKey = keyof typeof siteConfig.personas
export type BadgeType = 'linkedin' | 'verified'

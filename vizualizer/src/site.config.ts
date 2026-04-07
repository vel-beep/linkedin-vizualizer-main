// ── Site Configuration ───────────────────────────────────────
// Single source of truth for all project-specific values.
// To set up your own instance, edit this file only.

export const siteConfig = {
  // Brand
  name: 'Kaizen',
  title: 'Content Vizualizer',
  description: 'Previsualizador interno de posts de LinkedIn',
  loginTitle: 'Kaizen Drafts',

  // Profile card (left sidebar on home page)
  profile: {
    name: 'Jaime Rodríguez de Santiago',
    subtitle: 'Kaizen Podcast',
    recentTopics: ['LinkedIn', 'Contenido', 'Kaizen'],
  },

  // Tracker page
  tracker: {
    title: 'LinkedIn Tracker',
    timezone: 'Europe/Madrid',
    updateCadence: 'Actualizado cada domingo',
  },

  // ── Personas ──────────────────────────────────────────────
  // Add one entry per person who posts on LinkedIn.
  // The key (e.g. "alice") must be lowercase — it maps to the
  // folder name ../Alice/drafts_Alice/ (capitalized first letter).
  //
  // badge options: 'linkedin' (gold), 'verified' (blue), or undefined (none)
  // isCompanyPage: true for company pages (square avatar, no badge)
  personas: {
    jaime: {
      name: 'Jaime Rodríguez de Santiago',
      role: 'Country Manager Spain & Portugal at Airbnb · Creator of Kaizen',
      shortRole: 'Kaizen',
      color: '#f97316',
      photo: '/images/photo_jaime.jpeg',
      badge: 'linkedin' as const,
      trackerKey: 'Jaime',
    },
  },

  // ── Weekly Tracker Data ───────────────────────────────────
  // Add a new entry every week to track LinkedIn growth.
  // Post impressions = number on LinkedIn sidebar.
  // Followers = total follower count from profile.
  weeklyData: [
    {
      week: '2026-04-07',
      personas: {
        Jaime: { impressions: 110000, followers: 24831 },
      },
    },
    // ↓ Copy the block above, change the date, update numbers ↓
    // {
    //   week: '2026-04-14',
    //   personas: {
    //     Jaime: { impressions: 0, followers: 0 },
    //   },
    // },
  ],
} as const

// ── Derived types ───────────────────────────────────────────
export type PersonaKey = keyof typeof siteConfig.personas
export type BadgeType = 'linkedin' | 'verified'

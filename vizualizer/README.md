# LinkedIn Content Vizualizer

A content preview tool that looks like LinkedIn. Write posts as markdown files, and they show up in a feed that mirrors how they'll look on LinkedIn — with profile photos, roles, formatting, and media.

Built with Next.js 14, Tailwind CSS, and TypeScript.

![LinkedIn Vizualizer](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/linkedin-vizualizer.git
cd linkedin-vizualizer/vizualizer
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and set SITE_PASSWORD

# 3. Run
npm run dev
```

Open http://localhost:3000 and log in with your password.

---

## How It Works

```
your-repo/
├── Alice/
│   ├── drafts_Alice/          ← Draft posts go here
│   │   ├── my_first_post.md
│   │   └── my_first_post.png  ← Optional: matching image
│   └── published_Alice/       ← Published posts go here
├── Bob/
│   ├── drafts_Bob/
│   └── published_Bob/
└── vizualizer/                ← The app (this folder)
```

The app scans persona folders (one level up) and renders posts in a LinkedIn-style feed. Images are auto-detected by matching filenames.

---

## Configuration

Everything lives in one file: **`src/site.config.ts`**

### Add your personas

```typescript
personas: {
  alice: {
    name: 'Alice Johnson',
    role: 'CEO at MyCompany',
    shortRole: 'CEO',
    color: '#dc2626',
    photo: '/images/photo_alice.jpeg',
    badge: 'linkedin' as const,    // 'linkedin' | 'verified' | undefined
    trackerKey: 'Alice',
  },
},
```

### Add persona photos

Put photos in `vizualizer/public/images/`:
- `photo_alice.jpeg`
- `photo_bob.jpeg`

Square photos work best (like LinkedIn profile pics).

### Track weekly metrics (optional)

Add entries to `weeklyData` in `site.config.ts`:

```typescript
weeklyData: [
  {
    week: '2026-04-07',
    personas: {
      Alice: { impressions: 5000, followers: 500 },
      Bob:   { impressions: 3000, followers: 300 },
    },
  },
],
```

View the dashboard at `/tracker`.

---

## Post Format

Create a `.md` file in any persona's `drafts_` folder:

```markdown
---
last_updated: 2026-04-07
---

### FULL POST

Your hook goes here (first 1-3 lines people see before "see more").

Then the body of your post.

Blank lines = new paragraphs.

You can use **bold** for emphasis.

Write it exactly how you'd write it on LinkedIn.
```

### Adding images

Put the image in the same folder with the same base filename:
- Post: `my_post.md`
- Image: `my_post.png`

For multiple images: `my_post.png`, `my_post_2.png`, `my_post_3.png`

### Publishing a post

Move it from `drafts_Alice/` to `published_Alice/` and add `published_date` to frontmatter:

```markdown
---
last_updated: 2026-04-07
published_date: 2026-04-07
---
```

Published posts appear on the `/today` page.

---

## Features

- **LinkedIn-style feed** — posts render exactly as they'd appear on LinkedIn
- **Persona filtering** — filter by person in the feed
- **Media support** — images (single + multi-image grids), video (mp4)
- **Draft vs Published** — separate views for drafts and published posts
- **Weekly tracker** — impressions and follower growth dashboard
- **Password protection** — simple cookie-based auth
- **Comments** — optional GitHub Discussions integration via Giscus
- **Copy button** — one-click copy post text to clipboard

---

## Deploying

### Vercel (recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Set **Root Directory** to `vizualizer`
4. Add environment variable: `SITE_PASSWORD` = your password
5. Deploy

### Manual deploy

```bash
# From the repo root (NOT vizualizer/)
cd vizualizer && npx vercel build --prod && npx vercel deploy --prebuilt --prod
```

---

## Optional: Comments with Giscus

Giscus lets reviewers leave comments on posts using GitHub Discussions (free, no database needed).

1. Enable Discussions on your GitHub repo (Settings → Features)
2. Install the [Giscus app](https://github.com/apps/giscus)
3. Create a Discussion category called "Post Reviews"
4. Go to [giscus.app](https://giscus.app) and get your config values
5. Add them to `.env.local`:

```env
NEXT_PUBLIC_GISCUS_REPO=your-org/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Post Reviews
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxxxxx
```

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) — React framework
- [Tailwind CSS 3](https://tailwindcss.com/) — styling
- [TypeScript 5](https://www.typescriptlang.org/) — type safety
- [gray-matter](https://github.com/jonschlinkert/gray-matter) — YAML frontmatter parsing
- [Giscus](https://giscus.app/) — comments (optional)
- [Recharts](https://recharts.org/) — tracker charts (optional)

# LinkedIn Content Vizualizer

This is a LinkedIn content preview tool. It renders markdown posts in a feed that looks exactly like LinkedIn, so you can review how posts will look before publishing.

## First Time Setup

When someone opens this project for the first time, walk them through this onboarding flow step by step. Ask for their input at each step before proceeding.

### Step 1: Install and run

```bash
cd vizualizer
npm install
cp .env.local.example .env.local
```

Then ask them to set a password in `.env.local` (open the file, change `SITE_PASSWORD=change-me` to their chosen password).

### Step 2: Add their personas

Ask them: **"Who are the people that will be posting on LinkedIn?"**

For each person, collect:
- Full name
- Role/title (as it appears on LinkedIn)
- A color they like (or pick one for them)

Then update `vizualizer/src/site.config.ts` with their personas. Use lowercase keys. Example:

```typescript
maria: {
  name: 'Maria Garcia',
  role: 'Founder at CoolStartup',
  shortRole: 'Founder',
  color: '#dc2626',
  photo: '/images/photo_maria.jpeg',
  badge: 'linkedin' as const,
  trackerKey: 'Maria',
},
```

### Step 3: Add profile photos

For each persona, ask them to provide a profile photo (square, like LinkedIn). Save it as:
```
vizualizer/public/images/photo_[name].jpeg
```

### Step 4: Create persona folders

For each persona, create the folder structure at the repo root (NOT inside vizualizer/):

```bash
mkdir -p [Name]/drafts_[Name] [Name]/published_[Name]
```

The folder name must match the persona key in site.config.ts with the first letter capitalized. Example: key `maria` → folder `Maria/drafts_Maria/`.

### Step 5: Write a first post

Create a test post to verify everything works. Put it in `[Name]/drafts_[Name]/test_post.md`:

```markdown
---
last_updated: YYYY-MM-DD
---

### FULL POST

This is my first test post.

If you can see this in the feed, everything is working.
```

### Step 6: Run and verify

```bash
cd vizualizer
npm run dev
```

Open http://localhost:3000, log in with the password, and verify the post appears.

### Step 7: Deploy (optional)

If they want it online:
1. Push to GitHub
2. Go to vercel.com → New Project → import the repo
3. Set Root Directory to `vizualizer`
4. Add env var: `SITE_PASSWORD`
5. Deploy

## How Posts Work

- **Draft posts:** `[Persona]/drafts_[Persona]/your_post.md` — appear on the home feed
- **Published posts:** `[Persona]/published_[Persona]/your_post.md` — need `published_date: YYYY-MM-DD` in frontmatter, appear on `/today`
- **Images:** same folder, same filename but `.png`/`.jpg`. Multiple images: `post.png`, `post_2.png`, `post_3.png`
- **Format:** must have `### FULL POST` header, then paragraphs separated by blank lines

## Project Structure

```
repo-root/
├── Alice/                    ← One folder per persona
│   ├── drafts_Alice/         ← Draft posts (.md + images)
│   └── published_Alice/      ← Published posts
├── Bob/
│   ├── drafts_Bob/
│   └── published_Bob/
├── vizualizer/               ← The Next.js app
│   ├── src/site.config.ts    ← EDIT THIS: personas, branding, tracker data
│   ├── public/images/        ← Persona profile photos
│   └── .env.local            ← Password (not in git)
└── CLAUDE.md                 ← This file
```

## Key File: site.config.ts

`vizualizer/src/site.config.ts` is the single source of truth. It controls:
- Site name and branding
- All personas (names, roles, colors, photos)
- Weekly tracker data (impressions, followers)

When adding a new persona, you need to:
1. Add them to `personas` in site.config.ts
2. Create their folder: `[Name]/drafts_[Name]/`
3. Add their photo: `vizualizer/public/images/photo_[name].jpeg`

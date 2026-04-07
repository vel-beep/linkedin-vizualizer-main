import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface NewsletterSection {
  id: string
  title: string
  content: string
}

export interface Newsletter {
  id: string
  issue: string
  date: string
  subject: string
  preheader: string
  status: string
  wordCount: number
  sections: NewsletterSection[]
  rawContent: string
  // Source material for reviewers
  changelogInput: string
  curationLog: string
  newsSources: string
}

// ── Newsletter directory resolution ─────────────────────
// Local dev: ../../13_newsletter (from vizualizer/)
// Vercel: public/data/newsletters (pre-synced at build time)
const NEWSLETTER_DIR_LOCAL = path.resolve(process.cwd(), '..', '..', '13_newsletter')
const NEWSLETTER_DIR_VERCEL = path.join(process.cwd(), 'public', 'data', 'newsletters')

function getNewsletterRoot(): string {
  if (fs.existsSync(path.join(NEWSLETTER_DIR_LOCAL, 'issues'))) return NEWSLETTER_DIR_LOCAL
  if (fs.existsSync(path.join(NEWSLETTER_DIR_VERCEL, 'issues'))) return NEWSLETTER_DIR_VERCEL
  return ''
}

function safeReadFile(filepath: string): string {
  try {
    if (fs.existsSync(filepath)) return fs.readFileSync(filepath, 'utf-8')
  } catch { /* ignore */ }
  return ''
}

// ── Markdown section parser ─────────────────────────────
function parseMarkdownSections(content: string): NewsletterSection[] {
  const sections: NewsletterSection[] = []

  const parts = content.split(/^## /m)

  // First part: intro (before any ## header)
  if (parts[0].trim()) {
    let introContent = parts[0].trim()
    const h1Match = introContent.match(/^# .+\n*/)
    if (h1Match) introContent = introContent.slice(h1Match[0].length).trim()
    introContent = introContent.replace(/\n---\s*$/, '').trim()
    if (introContent) {
      sections.push({ id: 'intro', title: 'Intro', content: introContent })
    }
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    const newlineIdx = part.indexOf('\n')
    if (newlineIdx === -1) continue

    const title = part.slice(0, newlineIdx).trim()
    let sectionContent = part.slice(newlineIdx + 1).trim()
    sectionContent = sectionContent.replace(/\n---\s*$/, '').trim()
    if (!sectionContent) continue

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    sections.push({ id, title, content: sectionContent })
  }

  return sections
}

// ── Main exports ────────────────────────────────────────
export function getAllNewsletters(): Newsletter[] {
  const root = getNewsletterRoot()
  if (!root) return []

  const issuesDir = path.join(root, 'issues')
  if (!fs.existsSync(issuesDir)) return []

  // Read shared news sources file
  const newsSources = safeReadFile(path.join(root, '00_newsletter_news_sources.md'))

  const newsletters: Newsletter[] = []

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(issuesDir, { withFileTypes: true })
  } catch {
    return []
  }

  const issueFolders = entries.filter(
    d => d.isDirectory() && /^\d{4}_\d{2}$/.test(d.name)
  )

  for (const folder of issueFolders) {
    const folderPath = path.join(issuesDir, folder.name)
    const mdFile = path.join(folderPath, `newsletter_${folder.name}.md`)
    if (!fs.existsSync(mdFile)) continue

    try {
      const raw = fs.readFileSync(mdFile, 'utf-8')
      const { data, content } = matter(raw)
      const sections = parseMarkdownSections(content)

      // Load source material from the same issue folder
      const changelogInput = safeReadFile(path.join(folderPath, 'changelog_input.md'))
      const curationLog = safeReadFile(path.join(folderPath, 'curation_log.md'))

      newsletters.push({
        id: `newsletter-${folder.name}`,
        issue: data.issue || folder.name,
        date: data.date || '',
        subject: data.subject || `Issue ${folder.name}`,
        preheader: data.preheader || '',
        status: data.status || 'draft',
        wordCount: data.word_count || content.split(/\s+/).filter(Boolean).length,
        sections,
        rawContent: content,
        changelogInput,
        curationLog,
        newsSources,
      })
    } catch {
      continue
    }
  }

  return newsletters.sort((a, b) => b.issue.localeCompare(a.issue))
}

export function getNewsletterById(id: string): Newsletter | undefined {
  return getAllNewsletters().find(n => n.id === id)
}

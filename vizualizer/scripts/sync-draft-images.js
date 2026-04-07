#!/usr/bin/env node
/**
 * Syncs all media files from persona draft folders into public/draft-images/
 * so Next.js can serve them as static assets.
 *
 * Scans: ../<Persona>/drafts_<Persona>/  (one level up from vizualizer/)
 * Output: ./public/draft-images/
 *
 * Runs automatically on `npm run dev` and `npm run build` (predev/prebuild hooks).
 */

const fs = require('fs')
const path = require('path')

const MEDIA_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.mp4', '.webm', '.mov'])

const repoRoot = path.resolve(__dirname, '..', '..')
const outputDir = path.resolve(__dirname, '..', 'public', 'draft-images')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

let copied = 0

const entries = fs.readdirSync(repoRoot, { withFileTypes: true })
for (const entry of entries) {
  if (!entry.isDirectory()) continue
  const persona = entry.name
  const draftsFolder = path.join(repoRoot, persona, `drafts_${persona}`)
  if (!fs.existsSync(draftsFolder)) continue

  const files = fs.readdirSync(draftsFolder)
  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    if (!MEDIA_EXTS.has(ext)) continue
    const src = path.join(draftsFolder, file)
    const dest = path.join(outputDir, file)
    fs.copyFileSync(src, dest)
    copied++
  }
}

console.log(`sync-draft-images: copied ${copied} media files → public/draft-images/`)

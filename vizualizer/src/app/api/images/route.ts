import { NextResponse } from 'next/server'
import { readdirSync, existsSync } from 'fs'
import path from 'path'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'])

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public', 'images')

  if (!existsSync(imagesDir)) {
    return NextResponse.json({ images: [] })
  }

  const images = readdirSync(imagesDir)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .map((name) => ({ name, path: `/images/${name}` }))

  return NextResponse.json({ images })
}

'use client'

import { useState, useEffect, useCallback } from 'react'

interface ImageItem {
  name: string
  path: string
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [lastUploaded, setLastUploaded] = useState<ImageItem | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchImages = async () => {
    const res = await fetch('/api/images')
    if (res.ok) {
      const data = await res.json()
      setImages(data.images)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        const item: ImageItem = { name: file.name, path: data.path }
        setLastUploaded(item)
        await fetchImages()
      } else {
        setUploadError(data.error ?? `Server error ${res.status}`)
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed — check console')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) uploadFile(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="max-w-[668px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Images</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload images, then copy the path into your post&apos;s frontmatter.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors bg-white ${
          dragging
            ? 'border-[#0a66c2] bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading…</p>
        ) : (
          <>
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-600 font-medium mb-1">Drag an image here</p>
            <p className="text-xs text-gray-400 mb-3">PNG, JPG, WebP, GIF, SVG</p>
            <label className="inline-block cursor-pointer">
              <span className="px-4 py-2 bg-[#0a66c2] text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors">
                Browse files
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
          </>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <strong>Upload failed:</strong> {uploadError}
        </div>
      )}

      {/* Result after upload */}
      {lastUploaded && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800 mb-1">✓ Uploaded: {lastUploaded.name}</p>
          <p className="text-xs text-green-700 mb-2">Add this line to your post frontmatter:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 bg-white border border-green-200 text-green-900 px-3 py-1.5 rounded text-xs font-mono truncate">
              image: {lastUploaded.path}
            </code>
            <button
              onClick={() => copy(`image: ${lastUploaded.path}`, 'last')}
              className="shrink-0 text-xs px-3 py-1.5 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
            >
              {copiedKey === 'last' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Image library */}
      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Library — {images.length} image{images.length !== 1 ? 's' : ''}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.name} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={img.path}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-500 truncate mb-1.5">{img.name}</p>
                  <button
                    onClick={() => copy(img.path, img.name)}
                    className="w-full text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  >
                    {copiedKey === img.name ? 'Copied!' : 'Copy path'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-sm text-gray-400 text-center mt-8">No images yet.</p>
      )}
    </div>
  )
}

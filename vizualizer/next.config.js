/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    outputFileTracingExcludes: {
      '*': [
        '../**/*.png',
        '../**/*.jpg',
        '../**/*.jpeg',
        '../**/*.gif',
        '../**/*.mp4',
        '../**/*.mp3',
      ],
    },
  },
}

module.exports = nextConfig

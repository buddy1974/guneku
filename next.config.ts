import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      /* The Vercel preview hostname must never carry public navigation. Anyone
         who lands on it — an old link, a shared preview URL — is moved to the
         production domain, so relative internal links stay on guneku.org. */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'guneku.vercel.app' }],
        destination: 'https://www.guneku.org/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

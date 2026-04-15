/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  // Proxy /api/* to the backend so the dashboard works in production
  // without setting NEXT_PUBLIC_API_URL on every client machine.
  // In production on Railway, set API_URL (server-only) to the API service URL.
  async rewrites() {
    let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    // Ensure the URL always has a protocol — Railway env vars sometimes omit it
    if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`
    }
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig

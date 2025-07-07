/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.apiflash.com'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
  },
}

module.exports = nextConfig
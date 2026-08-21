/** @type {import('next').NextConfig} */
const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

const nextConfig = {
  reactStrictMode: true,
  ...(isMobileBuild
    ? {
        output: 'export',
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.diptait.com.bd',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;

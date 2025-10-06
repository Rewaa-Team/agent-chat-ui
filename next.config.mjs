/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  rewrites: async () => {
    return [
        {
          source: '/login',
          destination: '/'
        }
    ]
    },
};

export default nextConfig;

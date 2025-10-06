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
        source: "/login",
        destination: "/",
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;

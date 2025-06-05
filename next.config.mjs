/** @type {import('next').NextConfig} */
const nextConfig = {
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-xxxxxxxxxxxx.r2.dev",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // thêm dòng này
      }
    ],
  },
};

module.exports = nextConfig;

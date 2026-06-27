/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker runner (.next/standalone).
  output: "standalone",
  images: {
    // Local images live under /public; no remote patterns needed yet.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

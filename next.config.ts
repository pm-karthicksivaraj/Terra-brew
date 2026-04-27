import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '.space.chatglm.site',
    '.space.z.ai',
  ],
};

export default nextConfig;

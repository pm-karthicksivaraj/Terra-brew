import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '.space.chatglm.site',
    '.space.z.ai',
    '.space-z.ai',
    'localhost',
    'preview-chat-0c99ec19-0c8d-4450-82d3-09a5db05eb62.space-z.ai',
  ],
};

export default nextConfig;

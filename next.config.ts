import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Next.js resurslarini har qanday tashqi hostdan yuklashga ruxsat berish
  allowedDevOrigins: ['*', '192.168.1.102', 'http://192.168.1.102', 'http://192.168.1.102:3000', '192.168.1.102:3000'],
};

export default nextConfig;

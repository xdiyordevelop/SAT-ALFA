import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Next.js resurslarini har qanday tashqi hostdan yuklashga ruxsat berish
  serverActions: {
    allowedOrigins: ["*"] // Next.js 14+ da Server Action larni ruxsat berish uchun
  }
};

export default nextConfig;

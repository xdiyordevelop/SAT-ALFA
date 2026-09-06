import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Tashqi qurilmalarga Next resurslarini yuklashga ruxsat berish (IP aniq yoziladi)
  allowedDevOrigins: ['192.168.1.102', '192.168.1.102:3000','192.168.0.104','192.168.0.104:3000'],

  // 2. Server Action'lar bloklanib qolmasligi uchun
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.1.102:3000', 'localhost:3000','192.168.0.104:3000']
    }
  }
};

export default nextConfig;

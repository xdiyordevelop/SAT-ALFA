import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sat-alfa.uz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: [
          "/admin/",
          "/api/",
          "/student/mock-tests/",
          "/student/results/",
          "/student/payments/",
          "/student/attendance/",
          "/student/profile/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

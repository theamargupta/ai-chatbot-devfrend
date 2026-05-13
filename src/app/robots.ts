import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://chat.devfrend.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/login", "/demo"],
        disallow: [
          "/api/",
          "/auth/",
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/knowledge",
          "/knowledge/",
          "/chat",
          "/chat/",
          "/test-widget",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

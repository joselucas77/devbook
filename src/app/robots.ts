import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://devbook.com.br";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tecnologias/"],
      disallow: [
        "/admin/",
        "/api/admin/",
        "/api/cron/",
        "/admin/login",
        "/admin/cadastro-secreto",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

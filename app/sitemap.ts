import { MetadataRoute } from "next";
import { GAMES } from "@/lib/games-registry";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: SITE,              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    ...GAMES.filter(g => g.available).map(g => ({
      url: `${SITE}/games/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
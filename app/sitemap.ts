import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/games-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
  return [
    { url: base, changeFrequency: "weekly", priority: 1.0, lastModified: new Date() },
    ...GAMES.map((g) => ({
      url: `${base}/games/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      lastModified: new Date(),
    })),
  ];
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GAMES, getGame } from "@/lib/games-registry";
import XPDesktopClient from "@/components/layout/XPDesktopClient";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";

// ── Static params ─────────────────────────────────────────────
export async function generateStaticParams() {
  return GAMES.filter(g => g.available).map(g => ({ slug: g.slug }));
}

// ── Per-game metadata ─────────────────────────────────────────
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};

  const url = `${SITE}/games/${game.slug}`;
  const title = `${game.title} — Грати онлайн безкоштовно`;
  const desc = game.longDescription.slice(0, 160);

  return {
    title,
    description: desc,
    keywords: game.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description: desc,
      siteName: "RetroXP Games",
      locale: "uk_UA",
      images: [{ url: `/og/${game.slug}.png`, width: 1200, height: 630, alt: game.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [`/og/${game.slug}.png`],
    },
  };
}

// ── Page component ────────────────────────────────────────────
export default async function GamePage(
    { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game || !game.available) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "description": game.longDescription,
    "url": `${SITE}/games/${game.slug}`,
    "genre": game.category,
    "gamePlatform": "Web Browser",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
    },
    "publisher": {
      "@type": "Organization",
      "name": "RetroXP Games",
      "url": SITE,
    },
    "inLanguage": "uk",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "RetroXP Games", "item": SITE },
      { "@type": "ListItem", "position": 2, "name": game.title, "item": `${SITE}/games/${game.slug}` },
    ],
  };

  return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

        <div style={{ position:"absolute", width:1, height:1, overflow:"hidden", opacity:0, pointerEvents:"none" }}>
          <h1>{game.title} — грати онлайн безкоштовно</h1>
          <p>{game.longDescription}</p>
          <nav aria-label="breadcrumb">
            <a href={SITE}>RetroXP Games</a> › <span>{game.title}</span>
          </nav>
        </div>

        <XPDesktopClient games={GAMES} initialGame={game.slug} />
      </>
  );
}
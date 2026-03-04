import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/games-registry";
import XPDesktopClient from "@/components/layout/XPDesktopClient";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGame(params.slug);
  if (!g) return { title: "Гру не знайдено" };
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
  return {
    title: `${g.title} — ${g.titleEn} онлайн безкоштовно`,
    description: g.longDescription,
    keywords: g.keywords,
    alternates: { canonical: `/games/${g.slug}` },
    openGraph: {
      title: `${g.title} — Грай онлайн | RetroXP Games`,
      description: g.description,
      url: `${base}/games/${g.slug}`,
      images: [{ url: `/og/${g.slug}.png`, width: 1200, height: 630 }],
    },
  };
}

function GameJsonLd({ slug }: { slug: string }) {
  const g = getGame(slug);
  if (!g) return null;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
  const schema = {
    "@context": "https://schema.org", "@type": "VideoGame",
    name: g.title, alternateName: g.titleEn,
    description: g.longDescription, url: `${base}/games/${g.slug}`,
    applicationCategory: "Game", operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "UAH" },
    genre: g.category,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function GamePage({ params }: Props) {
  const g = getGame(params.slug);
  if (!g) notFound();
  return (
    <>
      <GameJsonLd slug={params.slug} />
      <h1 style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)" }}>
        {g.title} — грай онлайн безкоштовно
      </h1>
      <XPDesktopClient games={GAMES} initialGame={params.slug} />
    </>
  );
}

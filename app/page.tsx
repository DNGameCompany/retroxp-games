import type { Metadata } from "next";
import { GAMES } from "@/lib/games-registry";
import XPDesktopClient from "@/components/layout/XPDesktopClient";

export const metadata: Metadata = {
  title: "RetroXP Games — Безкоштовні ретро ігри онлайн",
  alternates: { canonical: "/" },
};

function JsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
  const site = {
    "@context": "https://schema.org", "@type": "WebSite",
    name: "RetroXP Games", url: base,
    description: "Безкоштовні ретро ігри онлайн у стилі Windows XP.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/games/{search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  const list = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: "Ретро ігри онлайн",
    itemListElement: GAMES.filter((g) => g.available).map((g, i) => ({
      "@type": "ListItem", position: i + 1,
      name: g.title, url: `${base}/games/${g.slug}`,
      description: g.description,
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(site) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <h1 style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)" }}>
        RetroXP Games — Безкоштовні ретро ігри онлайн у стилі Windows XP
      </h1>
      <XPDesktopClient games={GAMES} />
    </>
  );
}

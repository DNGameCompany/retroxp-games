import type { Metadata } from "next";
import { GAMES } from "@/lib/games-registry";
import XPDesktopClient from "@/components/layout/XPDesktopClient";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";

export const metadata: Metadata = {
  alternates: { canonical: SITE },
};

// JSON-LD for the homepage — ItemList of all games
const gameListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Усі ігри RetroXP Games",
  "description": "Безкоштовні ретро ігри онлайн у стилі Windows XP",
  "url": SITE,
  "numberOfItems": GAMES.filter(g => g.available).length,
  "itemListElement": GAMES.filter(g => g.available).map((g, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "url": `${SITE}/games/${g.slug}`,
    "name": g.title,
  })),
};

export default function HomePage() {
  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(gameListJsonLd) }}
        />

        {/* Hidden SEO text — for crawlers only */}
        <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
          <h1>RetroXP Games — Безкоштовні ретро ігри онлайн</h1>
          <p>
            RetroXP Games — це колекція класичних ігор у стилі Windows XP, які можна грати безкоштовно прямо у браузері.
            У нас є Сапер, Змійка, Тетріс, Брейкаут, Понг, Солітер та інші ретро ігри онлайн.
            Жодної реєстрації, жодних завантажень — просто відкрий і грай!
          </p>
          <h2>Доступні ігри</h2>
          <ul>
            {GAMES.filter(g => g.available).map(g => (
                <li key={g.slug}>
                  <a href={`/games/${g.slug}`}>{g.title}</a> — {g.description}
                </li>
            ))}
          </ul>
          <h2>Про RetroXP Games</h2>
          <p>
            Пам'ятаєш ті часи коли грав у Сапер між уроками, а Змійка на Nokia здавалась найкращою грою?
            RetroXP Games повертає ці відчуття — класичні ігри в інтерфейсі Windows XP прямо в браузері.
            Грай на роботі, вдома, з телефону — без реклами, без реєстрації, безкоштовно.
          </p>
        </div>

        <XPDesktopClient games={GAMES} />
      </>
  );
}
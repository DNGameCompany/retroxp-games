import type { Game } from "@/lib/games-registry";
import AdBanner from "../ads/AdBanner";

interface Props { games: Game[]; onOpen: (slug: string) => void; }

const HAS_ADS = !!process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function HomeContent({ games, onOpen }: Props) {
  return (
    <div style={{ padding: 8, overflowY: "auto", flex: 1, background: "#ece9d8" }}>
      {HAS_ADS && <AdBanner slot="TOP_SLOT_ID" style={{ marginBottom: 8 }} />}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: 10,
      }}>
        {games.map((g) => (
          <div
            key={g.slug}
            onClick={() => onOpen(g.slug)}
            style={{
              background: "#fff",
              border: "1px solid #aca899",
              borderRadius: 4,
              padding: 10,
              cursor: g.available ? "pointer" : "default",
              textAlign: "center",
              boxShadow: "1px 1px 3px rgba(0,0,0,.15)",
              opacity: g.available ? 1 : 0.55,
              transition: ".15s",
            }}
            onMouseEnter={(e) => {
              if (g.available)
                (e.currentTarget as HTMLDivElement).style.background = "#dde9ff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#fff";
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 6 }}>{g.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>{g.title}</div>
            <div style={{ fontSize: 10, color: "#555", lineHeight: 1.3 }}>{g.description}</div>
            <span style={{
              display: "inline-block",
              marginTop: 6,
              padding: "1px 6px",
              fontSize: 9,
              background: g.available ? "#0054e3" : "#888",
              color: "#fff",
              borderRadius: 10,
            }}>
              {g.available ? g.category : "Скоро"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
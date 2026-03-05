import type { Game } from "@/lib/games-registry";
import AdBanner from "../ads/AdBanner";

interface Props { games: Game[]; onOpen: (slug: string) => void; }

const CAT_ORDER = ["puzzle","arcade","card","strategy"] as const;
const CAT_LABELS: Record<string, string> = {
    arcade:   "🕹️ Arcade",
    puzzle:   "🧩 Puzzle",
    card:     "🃏 Card Games",
    strategy: "♟️ Strategy",
};

export default function HomeContent({ games, onOpen }: Props) {
    const categories = CAT_ORDER.filter(c => games.some(g => g.category === c));

    return (
        <div style={{padding:8,overflowY:"auto",flex:1,background:"#ece9d8"}}>
            <AdBanner slot="TOP_SLOT_ID" style={{marginBottom:10}}/>

            {categories.map(cat => {
                const catGames = games.filter(g => g.category === cat);
                return (
                    <div key={cat} style={{marginBottom:14}}>
                        <div style={{
                            fontSize:11,fontWeight:"bold",color:"#0054e3",marginBottom:5,
                            borderBottom:"1px solid #aca899",paddingBottom:3,
                        }}>
                            {CAT_LABELS[cat]}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8}}>
                            {catGames.map(g => (
                                <div
                                    key={g.slug}
                                    onClick={() => onOpen(g.slug)}
                                    style={{
                                        background:"#fff",border:"1px solid #aca899",borderRadius:4,
                                        padding:8,cursor:"pointer",textAlign:"center",
                                        boxShadow:"1px 1px 3px rgba(0,0,0,.12)",
                                        opacity:g.available?1:0.5,transition:"background .1s",
                                    }}
                                    onMouseEnter={e=>{if(g.available)(e.currentTarget as HTMLDivElement).style.background="#dde9ff";}}
                                    onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="#fff";}}
                                >
                                    <div style={{fontSize:32,marginBottom:5}}>{g.emoji}</div>
                                    <div style={{fontSize:12,fontWeight:"bold",marginBottom:3,color:"#000"}}>{g.title}</div>
                                    <div style={{fontSize:10,color:"#555",lineHeight:1.3,marginBottom:5}}>{g.description}</div>
                                    <span style={{
                                        display:"inline-block",padding:"1px 7px",fontSize:9,
                                        background:g.available?"#0054e3":"#888",color:"#fff",borderRadius:10,
                                    }}>
                    {g.available?"Play":"Soon"}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <AdBanner slot="BOTTOM_SLOT_ID" style={{marginTop:10}}/>
        </div>
    );
}
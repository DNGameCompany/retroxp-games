import type { Metadata } from "next";
import Link from "next/link";
import { GAMES } from "@/lib/games-registry";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";

export const metadata: Metadata = {
    title: "Про RetroXP Games — Ретро ігри онлайн",
    description: "RetroXP Games — безкоштовні класичні ігри у стилі Windows XP прямо в браузері. Дізнайся більше про проєкт.",
    alternates: { canonical: `${SITE}/about` },
};

const s = {
    page:    { minHeight:"100vh", background:"#008080", fontFamily:"Tahoma,sans-serif", padding:"32px 16px" } as React.CSSProperties,
    window:  { background:"#ece9d8", border:"2px solid #0054e3", borderRadius:4, maxWidth:700, margin:"0 auto", boxShadow:"4px 4px 16px rgba(0,0,0,.4)" } as React.CSSProperties,
    titleBar:{ background:"linear-gradient(to bottom,#1f86e8,#0831d9)", padding:"4px 8px", display:"flex", alignItems:"center", gap:8, borderRadius:"2px 2px 0 0" } as React.CSSProperties,
    body:    { padding:"24px 28px", lineHeight:1.7, color:"#222", fontSize:13 } as React.CSSProperties,
    h1:      { fontSize:18, fontWeight:"bold", marginBottom:16, color:"#0054e3" } as React.CSSProperties,
    h2:      { fontSize:14, fontWeight:"bold", marginTop:20, marginBottom:8, color:"#333", borderBottom:"1px solid #ccc", paddingBottom:4 } as React.CSSProperties,
    link:    { color:"#0054e3", textDecoration:"none" } as React.CSSProperties,
    gameGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8, marginTop:8 } as React.CSSProperties,
    gameCard:{ background:"#fff", border:"1px solid #aca899", borderRadius:3, padding:"8px 10px", fontSize:12 } as React.CSSProperties,
};

export default function AboutPage() {
    const available = GAMES.filter(g => g.available);

    return (
        <div style={s.page}>
            <div style={s.window}>
                {/* Title bar */}
                <div style={s.titleBar}>
                    <span style={{ fontSize:14 }}>ℹ️</span>
                    <span style={{ color:"#fff", fontSize:12, fontWeight:"bold" }}>Про RetroXP Games</span>
                    <div style={{ marginLeft:"auto" }}>
                        <Link href="/" style={{ background:"linear-gradient(to bottom,#ff5a5a,#c00)", border:"none", borderRadius:2, padding:"1px 6px", color:"#fff", fontSize:11, textDecoration:"none" }}>✕</Link>
                    </div>
                </div>

                <div style={s.body}>
                    <h1 style={s.h1}>🎮 RetroXP Games</h1>

                    <p>
                        <strong>RetroXP Games</strong> — це безкоштовна колекція класичних ігор у стилі Windows XP,
                        які можна грати прямо в браузері. Жодних завантажень, жодної реєстрації.
                    </p>

                    <h2 style={s.h2}>Що ми пропонуємо</h2>
                    <p>
                        Ми відтворили улюблені ігри з епохи Windows 95/XP — від Сапера до Солітера —
                        в автентичному інтерфейсі робочого столу. Кожна гра зберігає дух оригіналу,
                        але працює у сучасному браузері на будь-якому пристрої.
                    </p>

                    <h2 style={s.h2}>Доступні ігри</h2>
                    <div style={s.gameGrid}>
                        {available.map(g => (
                            <div key={g.slug} style={s.gameCard}>
                                <div style={{ fontSize:20, marginBottom:4 }}>{g.emoji}</div>
                                <Link href={`/games/${g.slug}`} style={s.link}>
                                    <strong>{g.title}</strong>
                                </Link>
                                <p style={{ margin:"4px 0 0", color:"#555" }}>{g.description}</p>
                            </div>
                        ))}
                    </div>

                    <h2 style={s.h2}>Особливості</h2>
                    <ul style={{ paddingLeft:20, margin:"4px 0" }}>
                        <li>🖥️ Автентичний інтерфейс Windows XP</li>
                        <li>🏆 Система досягнень та лідерборд</li>
                        <li>📅 Щоденні виклики</li>
                        <li>🎨 Кілька тем оформлення</li>
                        <li>📱 Працює на мобільних пристроях</li>
                        <li>🆓 Повністю безкоштовно</li>
                    </ul>

                    <h2 style={s.h2}>Технології</h2>
                    <p>
                        RetroXP Games побудовано на Next.js та React. Всі ігри написані з нуля на TypeScript —
                        без зовнішніх ігрових движків. Стан зберігається локально у браузері.
                    </p>

                    <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid #ccc", fontSize:11, color:"#888", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                        <span>© 2025 RetroXP Games</span>
                        <div style={{ display:"flex", gap:16 }}>
                            <Link href="/" style={s.link}>← Назад до ігор</Link>
                            <Link href="/privacy" style={s.link}>Конфіденційність</Link>
                            <Link href="/contact" style={s.link}>Контакти</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
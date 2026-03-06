import type { Metadata } from "next";
import Link from "next/link";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
const CONTACT_EMAIL = "hello@retroxp.games"; // ← замінити на реальний

export const metadata: Metadata = {
    title: "Контакти — RetroXP Games",
    description: "Зв'яжись з командою RetroXP Games. Пропозиції, баги, співпраця.",
    alternates: { canonical: `${SITE}/contact` },
};

const s = {
    page:    { minHeight:"100vh", background:"#008080", fontFamily:"Tahoma,sans-serif", padding:"32px 16px" } as React.CSSProperties,
    window:  { background:"#ece9d8", border:"2px solid #0054e3", borderRadius:4, maxWidth:560, margin:"0 auto", boxShadow:"4px 4px 16px rgba(0,0,0,.4)" } as React.CSSProperties,
    titleBar:{ background:"linear-gradient(to bottom,#1f86e8,#0831d9)", padding:"4px 8px", display:"flex", alignItems:"center", gap:8, borderRadius:"2px 2px 0 0" } as React.CSSProperties,
    body:    { padding:"24px 28px", lineHeight:1.8, color:"#222", fontSize:13 } as React.CSSProperties,
    h1:      { fontSize:18, fontWeight:"bold", marginBottom:16, color:"#0054e3" } as React.CSSProperties,
    link:    { color:"#0054e3" } as React.CSSProperties,
    card:    { background:"#fff", border:"1px solid #aca899", borderRadius:3, padding:"12px 16px", marginBottom:10 } as React.CSSProperties,
};

export default function ContactPage() {
    return (
        <div style={s.page}>
            <div style={s.window}>
                <div style={s.titleBar}>
                    <span style={{ fontSize:14 }}>📧</span>
                    <span style={{ color:"#fff", fontSize:12, fontWeight:"bold" }}>Контакти — RetroXP Games</span>
                    <Link href="/" style={{ marginLeft:"auto", background:"linear-gradient(to bottom,#ff5a5a,#c00)", borderRadius:2, padding:"1px 6px", color:"#fff", fontSize:11, textDecoration:"none" }}>✕</Link>
                </div>

                <div style={s.body}>
                    <h1 style={s.h1}>📧 Зв'яжись з нами</h1>

                    <p>Маєш ідею, знайшов баг або хочеш поспівпрацювати? Пиши!</p>

                    <div style={s.card}>
                        <strong>📬 Email</strong><br/>
                        <a href={`mailto:${CONTACT_EMAIL}`} style={s.link}>{CONTACT_EMAIL}</a>
                    </div>

                    <div style={s.card}>
                        <strong>🐛 Баг або пропозиція</strong><br/>
                        <span style={{ color:"#555" }}>
              Знайшов баг або є ідея для нової гри чи фічі?
              Напиши на{" "}
                            <a href={`mailto:${CONTACT_EMAIL}?subject=Bug Report`} style={s.link}>
                {CONTACT_EMAIL}
              </a>{" "}
                            з темою «Bug» або «Feature».
            </span>
                    </div>

                    <div style={s.card}>
                        <strong>🤝 Реклама та співпраця</strong><br/>
                        <span style={{ color:"#555" }}>
              Зацікавлений у розміщенні реклами або партнерстві?
              Напиши на{" "}
                            <a href={`mailto:${CONTACT_EMAIL}?subject=Partnership`} style={s.link}>
                {CONTACT_EMAIL}
              </a>
            </span>
                    </div>

                    <p style={{ fontSize:11, color:"#888", marginTop:16 }}>
                        Ми намагаємось відповідати протягом 1-3 робочих днів.
                    </p>

                    <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #ccc", fontSize:11, color:"#888", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                        <span>© 2025 RetroXP Games</span>
                        <div style={{ display:"flex", gap:16 }}>
                            <Link href="/" style={s.link}>← Назад до ігор</Link>
                            <Link href="/about" style={s.link}>Про нас</Link>
                            <Link href="/privacy" style={s.link}>Конфіденційність</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
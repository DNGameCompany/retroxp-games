import type { Metadata } from "next";
import Link from "next/link";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
const SITE_NAME = "RetroXP Games";
const CONTACT_EMAIL = "privacy@retroxp.games"; // ← замінити на реальний

export const metadata: Metadata = {
    title: "Політика конфіденційності — RetroXP Games",
    description: "Політика конфіденційності RetroXP Games. Як ми використовуємо дані, cookies та рекламу.",
    alternates: { canonical: `${SITE}/privacy` },
    robots: { index: true, follow: false }, // не треба індексувати у пошуку
};

const s = {
    page:    { minHeight:"100vh", background:"#008080", fontFamily:"Tahoma,sans-serif", padding:"32px 16px" } as React.CSSProperties,
    window:  { background:"#ece9d8", border:"2px solid #0054e3", borderRadius:4, maxWidth:700, margin:"0 auto", boxShadow:"4px 4px 16px rgba(0,0,0,.4)" } as React.CSSProperties,
    titleBar:{ background:"linear-gradient(to bottom,#1f86e8,#0831d9)", padding:"4px 8px", display:"flex", alignItems:"center", gap:8, borderRadius:"2px 2px 0 0" } as React.CSSProperties,
    body:    { padding:"24px 28px", lineHeight:1.8, color:"#222", fontSize:13 } as React.CSSProperties,
    h1:      { fontSize:18, fontWeight:"bold", marginBottom:6, color:"#0054e3" } as React.CSSProperties,
    h2:      { fontSize:14, fontWeight:"bold", marginTop:20, marginBottom:6, color:"#333", borderBottom:"1px solid #ccc", paddingBottom:4 } as React.CSSProperties,
    link:    { color:"#0054e3" } as React.CSSProperties,
    updated: { fontSize:11, color:"#888", marginBottom:16 } as React.CSSProperties,
};

export default function PrivacyPage() {
    return (
        <div style={s.page}>
            <div style={s.window}>
                <div style={s.titleBar}>
                    <span style={{ fontSize:14 }}>🔒</span>
                    <span style={{ color:"#fff", fontSize:12, fontWeight:"bold" }}>Політика конфіденційності — {SITE_NAME}</span>
                    <Link href="/" style={{ marginLeft:"auto", background:"linear-gradient(to bottom,#ff5a5a,#c00)", borderRadius:2, padding:"1px 6px", color:"#fff", fontSize:11, textDecoration:"none" }}>✕</Link>
                </div>

                <div style={s.body}>
                    <h1 style={s.h1}>🔒 Політика конфіденційності</h1>
                    <p style={s.updated}>Останнє оновлення: березень 2025 р.</p>

                    <p>
                        Ця Політика конфіденційності описує, як <strong>{SITE_NAME}</strong> (<a href={SITE} style={s.link}>{SITE}</a>)
                        збирає, використовує та захищає інформацію під час використання нашого сайту.
                    </p>

                    <h2 style={s.h2}>1. Інформація, яку ми збираємо</h2>
                    <p>
                        Ми не збираємо особисту інформацію (ім'я, email, телефон) без вашої явної згоди.
                    </p>
                    <p><strong>Автоматично збирається:</strong></p>
                    <ul style={{ paddingLeft:20 }}>
                        <li>Дані аналітики (Google Analytics 4): сторінки, які ви відвідуєте, час перебування, країна, тип пристрою</li>
                        <li>Технічна інформація: браузер, операційна система, роздільна здатність екрану</li>
                    </ul>
                    <p><strong>Зберігається локально у вашому браузері (localStorage):</strong></p>
                    <ul style={{ paddingLeft:20 }}>
                        <li>Ігровий прогрес, досягнення, рекорди</li>
                        <li>Налаштування (тема, звук, шпалери)</li>
                        <li>Це дані зберігаються тільки на вашому пристрої і не передаються нам</li>
                    </ul>

                    <h2 style={s.h2}>2. Cookies</h2>
                    <p>Ми використовуємо такі типи cookies:</p>
                    <ul style={{ paddingLeft:20 }}>
                        <li><strong>Аналітичні cookies (Google Analytics)</strong> — для розуміння як користувачі взаємодіють із сайтом</li>
                        <li><strong>Рекламні cookies (Google AdSense)</strong> — для показу релевантної реклами</li>
                    </ul>
                    <p>
                        Ви можете відключити cookies у налаштуваннях свого браузера.
                        Також можна відмовитись від персоналізованої реклами Google за посиланням:{" "}
                        <a href="https://myaccount.google.com/data-and-privacy" style={s.link} target="_blank" rel="noopener noreferrer">
                            myaccount.google.com
                        </a>
                    </p>

                    <h2 style={s.h2}>3. Google AdSense</h2>
                    <p>
                        Ми використовуємо Google AdSense для показу реклами. Google може використовувати cookies
                        для показу оголошень на основі ваших попередніх відвідувань цього та інших сайтів.
                        Детальніше:{" "}
                        <a href="https://policies.google.com/privacy" style={s.link} target="_blank" rel="noopener noreferrer">
                            Політика конфіденційності Google
                        </a>
                    </p>

                    <h2 style={s.h2}>4. Google Analytics</h2>
                    <p>
                        Ми використовуємо Google Analytics 4 для аналізу трафіку. Зібрані дані анонімізовані
                        та не дозволяють ідентифікувати особу. IP-адреси анонімізуються.
                        Детальніше:{" "}
                        <a href="https://policies.google.com/privacy" style={s.link} target="_blank" rel="noopener noreferrer">
                            Умови використання Google Analytics
                        </a>
                    </p>

                    <h2 style={s.h2}>5. Треті сторони</h2>
                    <p>
                        Ми не продаємо, не передаємо і не розкриваємо вашу особисту інформацію третім сторонам,
                        крім випадків, передбачених законом або описаних у цій політиці.
                    </p>

                    <h2 style={s.h2}>6. Діти</h2>
                    <p>
                        Наш сайт не призначений для дітей до 13 років. Ми свідомо не збираємо
                        особисту інформацію від дітей.
                    </p>

                    <h2 style={s.h2}>7. Зміни політики</h2>
                    <p>
                        Ми можемо оновлювати цю Політику конфіденційності. Актуальна версія завжди
                        доступна на цій сторінці з датою останнього оновлення.
                    </p>

                    <h2 style={s.h2}>8. Контакти</h2>
                    <p>
                        Якщо у вас є запитання щодо цієї Політики конфіденційності, напишіть нам:{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`} style={s.link}>{CONTACT_EMAIL}</a>
                    </p>

                    <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid #ccc", fontSize:11, color:"#888", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                        <span>© 2025 {SITE_NAME}</span>
                        <div style={{ display:"flex", gap:16 }}>
                            <Link href="/" style={s.link}>← Назад до ігор</Link>
                            <Link href="/about" style={s.link}>Про нас</Link>
                            <Link href="/contact" style={s.link}>Контакти</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
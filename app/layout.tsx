import type { Metadata } from "next";
import Script from "next/script";
import "../styles/globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games";
const GA   = process.env.NEXT_PUBLIC_GA_ID;
const ADS  = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "RetroXP Games — Безкоштовні ретро ігри онлайн",
    template: "%s | RetroXP Games",
  },
  description:
      "Грай у класичні ігри Windows XP прямо в браузері: Сапер, Змійка, Солітер, Тетріс та інші ретро ігри безкоштовно онлайн.",
  keywords: [
    "ретро ігри онлайн", "сапер онлайн", "змійка онлайн",
    "солітер онлайн", "тетріс онлайн", "windows xp ігри",
    "класичні ігри браузер", "безкоштовні ігри онлайн",
    "minesweeper online", "snake game online", "solitaire online free",
  ],
  alternates: {
    canonical: SITE,
  },
  openGraph: {
    type: "website", locale: "uk_UA", url: SITE,
    siteName: "RetroXP Games",
    title: "RetroXP Games — Безкоштовні ретро ігри онлайн",
    description: "Класичні ігри Windows XP у браузері. Сапер, Змійка, Солітер, Тетріс — безкоштовно!",
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "RetroXP Games" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RetroXP Games — Ретро ігри онлайн",
    description: "Класичні ігри Windows XP у браузері. Безкоштовно!",
    images: ["/og/home.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // ⚠️ Замінити YOUR_GOOGLE_VERIFICATION_TOKEN на реальний з Google Search Console
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "YOUR_TOKEN_HERE" },
};

// JSON-LD structured data — Website + Organization
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      "url": SITE,
      "name": "RetroXP Games",
      "description": "Безкоштовні ретро ігри онлайн у стилі Windows XP",
      "inLanguage": "uk",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${SITE}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      "name": "RetroXP Games",
      "url": SITE,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE}/og/home.png`,
        "width": 1200,
        "height": 630,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="uk">
      <head>
        {/* JSON-LD structured data */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* AdSense */}
        {ADS && (
            <Script
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS}`}
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />
        )}
      </head>
      <body>
      {/* Google Analytics 4 */}
      {GA && (
          <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
                strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', '${GA}', {
                page_path: window.location.pathname,
                send_page_view: true,
              });
              // Custom events helpers — use window.trackGame() in game components
              window.trackGame = function(action, gameName, score) {
                gtag('event', action, {
                  event_category: 'game',
                  event_label: gameName,
                  value: score || 0,
                });
              };
            `}</Script>
          </>
      )}
      {children}
      </body>
      </html>
  );
}
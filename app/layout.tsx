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
    "Грай у класичні ігри Windows XP прямо в браузері: Сапер, Змійка та інші ретро ігри безкоштовно онлайн.",
  keywords: [
    "ретро ігри онлайн","сапер онлайн","змійка онлайн",
    "windows xp ігри","класичні ігри браузер","безкоштовні ігри",
    "minesweeper online","snake game",
  ],
  openGraph: {
    type: "website", locale: "uk_UA", url: SITE,
    siteName: "RetroXP Games",
    title: "RetroXP Games — Безкоштовні ретро ігри онлайн",
    description: "Класичні ігри Windows XP у браузері. Безкоштовно!",
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RetroXP Games",
    description: "Класичні ігри Windows XP у браузері. Безкоштовно!",
    images: ["/og/home.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: { google: "YOUR_GOOGLE_VERIFICATION_TOKEN" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
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
        {GA && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());
              gtag('config','${GA}',{page_path:window.location.pathname});
            `}</Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}

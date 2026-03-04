"use client";
import { useEffect, useState } from "react";

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  style?: React.CSSProperties;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function AdBanner({ slot, format = "auto", style }: Props) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    // Не показуємо на localhost
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}

    // Перевіряємо чи AdSense заповнив блок через 2 секунди
    const timer = setTimeout(() => {
      const ins = document.querySelector(`ins[data-ad-slot="${slot}"]`);
      const status = ins?.getAttribute("data-ad-status");
      if (status === "filled") setFilled(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // На localhost або якщо не заповнено — не рендеримо нічого
  if (!CLIENT_ID) return null;
  if (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return null;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
        minHeight: filled ? undefined : 0,
        overflow: "hidden",
        ...style,
      }}
      data-ad-client={CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
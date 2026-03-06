"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  style?: React.CSSProperties;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function AdBanner({ slot, format = "auto", style }: Props) {
  const [show, setShow] = useState(false);
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Не показуємо якщо немає AdSense ID
    if (!CLIENT_ID) return;
    // Не показуємо на localhost
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

    // Показуємо контейнер щоб AdSense міг його заповнити
    setShow(true);

    // Push тільки один раз
    if (!pushed.current) {
      pushed.current = true;
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {}
    }

    // Перевіряємо через 2.5с чи блок дійсно заповнений
    // Якщо ні — ховаємо щоб не займав місце
    const timer = setTimeout(() => {
      const ins = insRef.current;
      if (!ins) return;
      const status = ins.getAttribute("data-ad-status");
      if (status !== "filled") {
        setShow(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Не рендеримо взагалі якщо немає ID або ще не show
  if (!CLIENT_ID || !show) return null;

  return (
      <ins
          ref={insRef}
          className="adsbygoogle"
          style={{
            display: "block",
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
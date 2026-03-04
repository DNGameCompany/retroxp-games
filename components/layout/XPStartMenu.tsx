"use client";
import type { Game } from "@/lib/games-registry";
import type { Theme } from "@/lib/themes";
import { getProfile } from "@/lib/storage";
import { useEffect, useState } from "react";

interface Props {
  games: Game[];
  theme: Theme;
  onOpen(slug: string): void;
  onSpecial(id: string): void;
  onThemes(): void;
  onClose(): void;
}

const menuItem = (
    emoji: string,
    label: string,
    onClick: () => void,
    hoverBg = "#0054e3",
    textColor = "#000",
) => (
    <div key={label} onClick={onClick} style={{
      padding: "6px 10px", fontSize: 12, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8, color: textColor,
    }}
         onMouseEnter={(e) => {
           (e.currentTarget as HTMLDivElement).style.background = hoverBg;
           (e.currentTarget as HTMLDivElement).style.color = "#fff";
         }}
         onMouseLeave={(e) => {
           (e.currentTarget as HTMLDivElement).style.background = "";
           (e.currentTarget as HTMLDivElement).style.color = textColor;
         }}
    >
      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{emoji}</span>
      {label}
    </div>
);

export default function XPStartMenu({ games, theme, onOpen, onSpecial, onThemes, onClose }: Props) {
  const [profile, setProfile] = useState({ name: "Player", avatar: "😊" });

  useEffect(() => {
    const p = getProfile();
    setProfile({ name: p.name, avatar: p.avatar });
  }, []);

  // Derive colors from theme
  const isDarkWindow = /^#[0-1]/.test(theme.windowBg);
  const panelBg   = theme.windowBg;
  const sideBg    = isDarkWindow ? "rgba(0,0,0,.2)" : "#d4d0c8";
  const borderCol = isDarkWindow ? "rgba(255,255,255,.1)" : "#aca899";
  const textColor = isDarkWindow ? "rgba(255,255,255,.85)" : "#000";
  const hoverBg   = theme.titlebar;

  return (
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", bottom: 30, left: 0, width: 280,
        background: panelBg,
        border: `1px solid rgba(0,0,0,.4)`,
        borderBottom: "none", borderRadius: "8px 8px 0 0",
        boxShadow: "3px -3px 12px rgba(0,0,0,.4)",
        zIndex: 9999, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(to right, ${theme.titlebar.replace("linear-gradient(to bottom,", "").replace(")", "").split(",").reverse().join(",")})`,
          padding: "8px 10px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%", background: "#fff",
            border: "2px solid rgba(255,255,255,.5)", fontSize: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {profile.avatar}
          </div>
          <span style={{
            color: "#fff", fontWeight: "bold", fontSize: 13,
            textShadow: "1px 1px 2px rgba(0,0,0,.4)",
          }}>
          {profile.name}
        </span>
        </div>

        {/* Body */}
        <div style={{ display: "flex" }}>
          {/* Left — games */}
          <div style={{ flex: 1, background: panelBg, padding: "4px 0" }}>
            {games.filter(g => g.available).map((g) =>
                menuItem(g.emoji, g.title, () => { onOpen(g.slug); onClose(); }, hoverBg, textColor)
            )}
            <hr style={{ border: "none", borderTop: `1px solid ${borderCol}`, margin: "4px 0" }} />
            {menuItem("🎮", "All Games",        () => { onOpen("home");           onClose(); }, hoverBg, textColor)}
            {menuItem("📅", "Daily Challenge",  () => { onSpecial("daily");       onClose(); }, hoverBg, textColor)}
          </div>

          {/* Right — system */}
          <div style={{
            width: 110, background: sideBg,
            borderLeft: `1px solid ${borderCol}`, padding: "4px 0",
          }}>
            {menuItem("👤", "Profile",      () => { onSpecial("profile");      onClose(); }, hoverBg, textColor)}
            {menuItem("🏆", "Leaderboard",  () => { onSpecial("leaderboard");  onClose(); }, hoverBg, textColor)}
            {menuItem("🏅", "Achievements", () => { onSpecial("achievements"); onClose(); }, hoverBg, textColor)}
            <hr style={{ border: "none", borderTop: `1px solid ${borderCol}`, margin: "4px 0" }} />
            {menuItem("🎨", "Themes",       () => { onThemes(); onClose(); }, hoverBg, textColor)}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: sideBg, borderTop: `1px solid ${borderCol}`,
          display: "flex", justifyContent: "flex-end", padding: "4px 8px",
        }}>
          <button onClick={onClose} style={{
            padding: "3px 12px", fontSize: 11, background: sideBg,
            border: `1px outset ${isDarkWindow ? "rgba(255,255,255,.2)" : "#fff"}`,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            borderRadius: 2, fontFamily: "Tahoma,sans-serif", color: textColor,
          }}>
            🔴 Shut Down
          </button>
        </div>
      </div>
  );
}
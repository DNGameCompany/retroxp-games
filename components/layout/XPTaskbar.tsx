"use client";
import type { WinState } from "./XPDesktopClient";
import type { Theme } from "@/lib/themes";

interface Props {
    wins: WinState[];
    activeId: string | null;
    time: string;
    theme: Theme;
    soundsOn: boolean;
    onToggleSound(): void;
    onTaskClick(id: string): void;
    onStartClick(e: React.MouseEvent): void;
}

export default function XPTaskbar({
                                      wins, activeId, time, theme, soundsOn, onToggleSound, onTaskClick, onStartClick,
                                  }: Props) {
    // Derive text contrast — taskbarText is already on the Theme
    const txt = theme.taskbarText;
    const borderAlpha = txt === "#000000" ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.2)";
    const btnActiveBg = txt === "#000000"
        ? "linear-gradient(to bottom,rgba(0,0,0,.12),rgba(255,255,255,.08))"
        : "linear-gradient(to bottom,rgba(0,0,0,.15),rgba(255,255,255,.1))";
    const btnInactiveBg = txt === "#000000"
        ? "linear-gradient(to bottom,rgba(255,255,255,.3),rgba(0,0,0,.08))"
        : "linear-gradient(to bottom,rgba(255,255,255,.15),rgba(0,0,0,.1))";

    return (
        <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, height: 30,
            background: theme.taskbar,
            display: "flex", alignItems: "center", gap: 2, padding: "0 2px",
            zIndex: 9999, borderTop: `1px solid ${borderAlpha}`,
        }}>
            {/* Start button */}
            <button onClick={onStartClick} style={{
                height: 26, padding: "0 10px 0 6px",
                background: theme.startBtn,
                border: "none", borderRadius: "0 12px 12px 0",
                color: "#fff", fontSize: 13,
                fontFamily: "Tahoma,sans-serif", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                textShadow: "1px 1px 1px rgba(0,0,0,.5)", fontWeight: "bold",
            }}>
                🪟 Start
            </button>

            {/* Task buttons */}
            <div style={{ display: "flex", gap: 2, flex: 1, margin: "0 4px", overflow: "hidden" }}>
                {wins.map((w) => {
                    const isActive = activeId === w.id && !w.minimized;
                    return (
                        <button key={w.id} onClick={() => onTaskClick(w.id)} style={{
                            height: 22, padding: "0 8px",
                            border: `1px solid ${borderAlpha}`,
                            borderRadius: 3,
                            color: txt, fontSize: 11,
                            fontFamily: "Tahoma,sans-serif", cursor: "pointer",
                            whiteSpace: "nowrap", maxWidth: 160,
                            overflow: "hidden", textOverflow: "ellipsis",
                            background: isActive ? btnActiveBg : btnInactiveBg,
                            boxShadow: isActive ? "inset 0 1px rgba(0,0,0,.2)" : "none",
                        }}>
                            {w.emoji} {w.title}
                        </button>
                    );
                })}
            </div>

            {/* Sound toggle */}
            <button onClick={onToggleSound} title={soundsOn ? "Mute sounds" : "Enable sounds"} style={{
                height: 22, width: 26, border: `1px solid ${borderAlpha}`,
                borderRadius: 3, background: btnInactiveBg,
                color: txt, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                {soundsOn ? "🔊" : "🔇"}
            </button>

            {/* Clock */}
            <div style={{
                color: txt, fontSize: 11, padding: "0 8px",
                borderLeft: `1px solid ${borderAlpha}`,
                whiteSpace: "nowrap", textShadow: "1px 1px 1px rgba(0,0,0,.4)",
                flexShrink: 0,
            }}>
                {time}
            </div>
        </div>
    );
}
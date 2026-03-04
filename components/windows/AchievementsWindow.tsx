"use client";
import { useState, useEffect } from "react";
import { getUnlocked } from "@/lib/storage";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function AchievementsWindow() {
    const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

    useEffect(() => {
        setUnlocked(new Set(getUnlocked().map(a => a.id)));
    }, []);

    const done  = ACHIEVEMENTS.filter(a => unlocked.has(a.id));
    const total = ACHIEVEMENTS.filter(a => !a.secret).length;
    const pct   = Math.round((done.length / ACHIEVEMENTS.length) * 100);

    return (
        <div style={{ flex: 1, overflow: "auto", background: "#ece9d8", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Progress bar */}
            <div style={{ background: "#fff", border: "1px solid #aca899", borderRadius: 4, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                    <span style={{ fontWeight: "bold" }}>🏅 Achievements</span>
                    <span style={{ color: "#0054e3", fontWeight: "bold" }}>{done.length} / {ACHIEVEMENTS.length}</span>
                </div>
                <div style={{ height: 14, background: "#d4d0c8", border: "1px inset #aca899", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(to right,#0054e3,#4488ff)", borderRadius: 2, transition: "width .5s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{pct}% complete · {total} visible + {ACHIEVEMENTS.length - total} secret</div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                {ACHIEVEMENTS.map(a => {
                    const isUnlocked = unlocked.has(a.id);
                    const isSecret   = a.secret && !isUnlocked;
                    return (
                        <div key={a.id} style={{
                            background: isUnlocked ? "#fff" : "#e8e5dc",
                            border: `1px solid ${isUnlocked ? "#0054e3" : "#aca899"}`,
                            borderRadius: 4, padding: "8px 10px",
                            display: "flex", gap: 10, alignItems: "center",
                            opacity: isUnlocked ? 1 : 0.6,
                            boxShadow: isUnlocked ? "0 1px 4px rgba(0,84,227,.15)" : "none",
                        }}>
                            <div style={{ fontSize: 28, filter: isUnlocked ? "none" : "grayscale(1)", flexShrink: 0 }}>
                                {isSecret ? "❓" : a.emoji}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: "bold", color: isUnlocked ? "#000" : "#888" }}>
                                    {isSecret ? "???" : a.title}
                                    {a.secret && isUnlocked && <span style={{ fontSize: 9, color: "#ff6600", marginLeft: 4 }}>SECRET</span>}
                                </div>
                                <div style={{ fontSize: 10, color: "#666", lineHeight: 1.3, marginTop: 2 }}>
                                    {isSecret ? "Keep playing to unlock" : a.desc}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
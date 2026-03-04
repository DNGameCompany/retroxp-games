// ── components/windows/DailyWindow.tsx ───────────────────────
"use client";
import { useEffect, useState } from "react";
import { getDailyChallenge, type DailyChallenge } from "@/lib/storage";
import { GAMES } from "@/lib/games-registry";

interface Props { onPlay: (slug: string) => void; }

export default function DailyWindow({ onPlay }: Props) {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
    const [timeLeft, setTimeLeft]   = useState("");

    useEffect(() => {
        setChallenge(getDailyChallenge());
        const iv = setInterval(() => {
            const now  = new Date();
            const end  = new Date(); end.setHours(24, 0, 0, 0);
            const diff = end.getTime() - now.getTime();
            const h    = Math.floor(diff / 3600000);
            const m    = Math.floor((diff % 3600000) / 60000);
            const s    = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(iv);
    }, []);

    if (!challenge) return null;
    const game = GAMES.find(g => g.slug === challenge.game);

    return (
        <div style={{ flex: 1, overflow: "auto", background: "#ece9d8", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg,#0054e3,#3a93ff)",
                borderRadius: 4, padding: "14px 16px", color: "#fff",
                display: "flex", alignItems: "center", gap: 14,
            }}>
                <div style={{ fontSize: 44 }}>📅</div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: "bold" }}>Daily Challenge</div>
                    <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>
                        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4, background: "rgba(0,0,0,.2)", padding: "2px 8px", borderRadius: 10, display: "inline-block" }}>
                        ⏱ Resets in {timeLeft}
                    </div>
                </div>
            </div>

            {/* Challenge card */}
            <div style={{ background: "#fff", border: "1px solid #aca899", borderRadius: 4, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 40 }}>{game?.emoji}</div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: "bold" }}>Today: {game?.title}</div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{game?.description}</div>
                    </div>
                </div>

                <div style={{ background: "#f0eeea", border: "1px solid #d4d0c8", borderRadius: 3, padding: "8px 12px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#666" }}>🎯 Target Score</div>
                    <div style={{ fontSize: 22, fontWeight: "bold", color: "#0054e3" }}>{challenge.target.toLocaleString()}</div>
                </div>

                {challenge.completed ? (
                    <div style={{ background: "linear-gradient(135deg,#22a822,#1a8a1a)", borderRadius: 3, padding: "10px 14px", color: "#fff", display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 24 }}>✅</span>
                        <div>
                            <div style={{ fontWeight: "bold" }}>Challenge Completed!</div>
                            <div style={{ fontSize: 11, opacity: .9 }}>Your score: {challenge.score.toLocaleString()}</div>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => onPlay(challenge.game)} style={{
                        width: "100%", padding: "10px 0", fontSize: 14, fontWeight: "bold",
                        fontFamily: "Tahoma", background: "linear-gradient(to bottom,#0054e3,#0040b0)",
                        color: "#fff", border: "none", borderRadius: 3, cursor: "pointer",
                    }}>
                        ▶ Play Now
                    </button>
                )}
            </div>

            {/* Tip */}
            <div style={{ fontSize: 11, color: "#888", textAlign: "center" }}>
                💡 Complete daily challenges to build your streak and unlock achievements!
            </div>
        </div>
    );
}



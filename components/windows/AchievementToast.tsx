"use client";
import { useEffect, useState } from "react";
import { getAchievement } from "@/lib/achievements";

interface Toast { id: string; key: number }

let _push: ((id: string) => void) | null = null;
export function pushAchievement(id: string) { _push?.(id); }

export default function AchievementToast() {
    const [queue, setQueue] = useState<Toast[]>([]);

    useEffect(() => {
        _push = (id: string) => setQueue(q => [...q, { id, key: Date.now() }]);
        return () => { _push = null; };
    }, []);

    useEffect(() => {
        if (queue.length === 0) return;
        const t = setTimeout(() => setQueue(q => q.slice(1)), 4000);
        return () => clearTimeout(t);
    }, [queue]);

    if (queue.length === 0) return null;
    const a = getAchievement(queue[0].id);
    if (!a) return null;

    return (
        <div style={{
            position: "fixed", bottom: 40, right: 16, zIndex: 99999,
            background: "linear-gradient(135deg,#1a1a2e,#0d0d1e)",
            border: "1px solid #4488ff", borderRadius: 6,
            padding: "10px 16px", display: "flex", gap: 12, alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,84,227,.4)",
            animation: "slideIn .3s ease",
            fontFamily: "Tahoma, sans-serif",
            minWidth: 260,
        }}>
            <style>{`@keyframes slideIn { from { transform: translateX(120%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
            <div style={{ fontSize: 32 }}>{a.emoji}</div>
            <div>
                <div style={{ color: "#ffcc00", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>ACHIEVEMENT UNLOCKED</div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: "bold", marginTop: 2 }}>{a.title}</div>
                <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{a.desc}</div>
            </div>
        </div>
    );
}
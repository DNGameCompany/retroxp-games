"use client";
import { useRef, useState, useEffect } from "react";

// Original Space Cadet Pinball — C++ decompilation compiled to WebAssembly
// Source: https://github.com/alula/SpaceCadetPinball
const PINBALL_URL = "https://alula.github.io/SpaceCadetPinball/";

// Achievement IDs for Pinball:
// "pinball_started"    — loaded and started the game
// "pinball_5min"       — played for 5 continuous minutes

interface Props {
    onAchievement?: (id: string) => void;
}

export default function Pinball({ onAchievement }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loaded, setLoaded] = useState(false);
    const achievedRef = useRef<Set<string>>(new Set());
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const triggerAchievement = (id: string) => {
        if (!onAchievement) return;
        if (achievedRef.current.has(id)) return;
        achievedRef.current.add(id);
        onAchievement(id);
    };

    const handleLoad = () => {
        setLoaded(true);
        triggerAchievement("pinball_started");
        startTimeRef.current = Date.now();

        // Poll for 5-minute achievement
        timerRef.current = setInterval(() => {
            if (startTimeRef.current && Date.now() - startTimeRef.current >= 5 * 60 * 1000) {
                triggerAchievement("pinball_5min");
                clearInterval(timerRef.current!);
            }
        }, 10_000);
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            flex: 1, overflow: "hidden", background: "#000", position: "relative",
        }}>
            {/* Loading overlay */}
            {!loaded && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    background: "#000", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 12,
                    color: "#fff", fontFamily: "Tahoma, sans-serif",
                }}>
                    <div style={{ fontSize: 40 }}>🚀</div>
                    <div style={{ fontSize: 14, fontWeight: "bold" }}>Loading Space Cadet Pinball...</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Original C++ → WebAssembly port</div>
                    <div style={{ width: 180, height: 6, background: "#222", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", background: "linear-gradient(to right,#4af,#08f)",
                            animation: "load 2s ease-in-out infinite alternate",
                            width: "60%", borderRadius: 3,
                        }} />
                    </div>
                    <style>{`@keyframes load { from { width: 20% } to { width: 90% } }`}</style>
                </div>
            )}

            {/* Controls hint bar */}
            <div style={{
                background: "#111", borderBottom: "1px solid #333",
                padding: "3px 10px", display: "flex", gap: 16,
                fontSize: 10, color: "#888", fontFamily: "Tahoma, sans-serif", flexShrink: 0,
            }}>
                <span>🎮 <b style={{ color: "#aaa" }}>Z</b> Left flipper</span>
                <span><b style={{ color: "#aaa" }}>/</b> Right flipper</span>
                <span><b style={{ color: "#aaa" }}>Space</b> Plunger</span>
                <span><b style={{ color: "#aaa" }}>R</b> New game</span>
                <span><b style={{ color: "#aaa" }}>T</b> Sound on/off</span>
            </div>

            {/* The actual game — original WASM build */}
            <iframe
                ref={iframeRef}
                src={PINBALL_URL}
                style={{
                    flex: 1, border: "none", width: "100%",
                    display: "block", background: "#000",
                }}
                onLoad={handleLoad}
                allow="autoplay; pointer-lock"
                title="3D Pinball Space Cadet"
            />
        </div>
    );
}
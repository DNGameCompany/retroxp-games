"use client";
import { useState, useEffect } from "react";
import { getScores, type ScoreEntry } from "@/lib/storage";
import { GAMES } from "@/lib/games-registry";

const MEDALS = ["🥇","🥈","🥉"];

export default function LeaderboardWindow() {
    const [activeGame, setActiveGame] = useState("minesweeper");
    const [scores, setScores]         = useState<ScoreEntry[]>([]);

    const availGames = GAMES.filter(g => g.available && g.slug !== "pinball");

    useEffect(() => {
        setScores(getScores(activeGame));
    }, [activeGame]);

    return (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "#ece9d8" }}>
            {/* Game tabs */}
            <div style={{ display: "flex", gap: 2, padding: "6px 6px 0", background: "#d4d0c8", borderBottom: "1px solid #aca899", overflowX: "auto" }}>
                {availGames.map(g => (
                    <button key={g.slug} onClick={() => setActiveGame(g.slug)} style={{
                        padding: "4px 12px", fontSize: 11, fontFamily: "Tahoma", cursor: "pointer",
                        background: activeGame === g.slug ? "#ece9d8" : "#c8c4bc",
                        border: "1px solid #aca899",
                        borderBottom: activeGame === g.slug ? "1px solid #ece9d8" : "1px solid #aca899",
                        borderRadius: "3px 3px 0 0",
                        fontWeight: activeGame === g.slug ? "bold" : "normal",
                    }}>{g.emoji} {g.title}</button>
                ))}
            </div>

            {/* Scores */}
            <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
                {scores.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                        <div style={{ fontSize: 13 }}>No scores yet!</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>Play {availGames.find(g => g.slug === activeGame)?.title} to get on the board.</div>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Tahoma", fontSize: 12 }}>
                        <thead>
                        <tr style={{ background: "#0054e3", color: "#fff" }}>
                            <th style={{ padding: "6px 10px", textAlign: "left", width: 36 }}>#</th>
                            <th style={{ padding: "6px 10px", textAlign: "left" }}>Name</th>
                            <th style={{ padding: "6px 10px", textAlign: "right" }}>Score</th>
                            <th style={{ padding: "6px 10px", textAlign: "right" }}>Date</th>
                            {scores.some(s => s.diff) && <th style={{ padding: "6px 10px", textAlign: "center" }}>Diff</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {scores.map((s, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f4f2ec" }}>
                                <td style={{ padding: "5px 10px" }}>{MEDALS[i] ?? `${i + 1}.`}</td>
                                <td style={{ padding: "5px 10px", fontWeight: i === 0 ? "bold" : "normal" }}>{s.name}</td>
                                <td style={{ padding: "5px 10px", textAlign: "right", fontWeight: "bold", color: "#0054e3" }}>{s.score.toLocaleString()}</td>
                                <td style={{ padding: "5px 10px", textAlign: "right", color: "#888" }}>{s.date}</td>
                                {scores.some(e => e.diff) && <td style={{ padding: "5px 10px", textAlign: "center" }}>{s.diff ?? ""}</td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
"use client";
import { useState, useEffect } from "react";
import { getProfile, saveProfile, type Profile } from "@/lib/storage";
import { unlockAchievement } from "@/lib/storage";
import { playSound } from "@/lib/sounds";

const AVATARS = ["😊","😎","🤓","👾","🎮","🏆","👻","🤖","🐱","🦊","🐸","🦄","🐉","🧠","💀","🚀"];

export default function ProfileWindow() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [name, setName]       = useState("");
    const [avatar, setAvatar]   = useState("😊");

    useEffect(() => {
        const p = getProfile();
        setProfile(p); setName(p.name); setAvatar(p.avatar);
    }, []);

    const save = () => {
        if (!profile) return;
        const updated = { ...profile, name: name.trim() || "Player", avatar };
        saveProfile(updated);
        setProfile(updated);
        setEditing(false);
        playSound("click");
        // Achievement: set profile
        if (unlockAchievement("g_profile")) playSound("achievement");
    };

    if (!profile) return null;

    const hours   = Math.floor(profile.totalTime / 3600);
    const minutes = Math.floor((profile.totalTime % 3600) / 60);
    const joined  = new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const stat = (label: string, value: string) => (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #d0ccc0" }}>
            <span style={{ color: "#666", fontSize: 12 }}>{label}</span>
            <span style={{ fontWeight: "bold", fontSize: 12 }}>{value}</span>
        </div>
    );

    return (
        <div style={{ flex: 1, overflow: "auto", background: "#ece9d8", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Avatar + Name */}
            <div style={{ background: "#fff", border: "1px solid #aca899", borderRadius: 4, padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 56, lineHeight: 1, cursor: editing ? "default" : "pointer" }}>{profile.avatar}</div>
                <div style={{ flex: 1 }}>
                    {editing ? (
                        <>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                maxLength={20}
                                style={{ width: "100%", marginBottom: 6, padding: "3px 6px", border: "1px solid #7a92d1", fontFamily: "Tahoma", fontSize: 14, outline: "none" }}
                                autoFocus
                                onKeyDown={e => e.key === "Enter" && save()}
                            />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                                {AVATARS.map(a => (
                                    <span key={a}
                                          onClick={() => setAvatar(a)}
                                          style={{ fontSize: 22, cursor: "pointer", padding: 2, borderRadius: 4,
                                              border: avatar === a ? "2px solid #0054e3" : "2px solid transparent",
                                              background: avatar === a ? "#dde9ff" : "transparent" }}
                                    >{a}</span>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={save} style={{ padding: "3px 14px", fontFamily: "Tahoma", fontSize: 12, background: "#d4d0c8", border: "2px outset #fff", cursor: "pointer" }}>Save</button>
                                <button onClick={() => setEditing(false)} style={{ padding: "3px 14px", fontFamily: "Tahoma", fontSize: 12, background: "#d4d0c8", border: "2px outset #fff", cursor: "pointer" }}>Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>{profile.name}</div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>Member since {joined}</div>
                            <button onClick={() => setEditing(true)} style={{ padding: "3px 14px", fontFamily: "Tahoma", fontSize: 12, background: "#d4d0c8", border: "2px outset #fff", cursor: "pointer" }}>
                                ✏️ Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Streak */}
            {profile.streak > 0 && (
                <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff9500)", borderRadius: 4, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🔥</span>
                    <div>
                        <div style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{profile.streak} Day Streak!</div>
                        <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11 }}>Keep coming back every day</div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ background: "#fff", border: "1px solid #aca899", borderRadius: 4, padding: "10px 14px" }}>
                <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 8, color: "#0054e3" }}>📊 Statistics</div>
                {stat("Games Played",  String(profile.gamesPlayed))}
                {stat("Total Score",   profile.totalScore.toLocaleString())}
                {stat("Time Played",   hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)}
                {stat("Current Streak",`${profile.streak} day${profile.streak !== 1 ? "s" : ""}`)}
            </div>
        </div>
    );
}
"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const W = 480, H = 320, PAD_W = 10, PAD_H = 60, BALL_R = 7, WIN_SCORE = 7;
const AI_SPEED = 3.5;

interface Props {
  onAchievement?: (id: string) => void;
  onGameOver?: (score: number) => void;
}

export default function Pong({ onAchievement, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const achievedRef = useRef<Set<string>>(new Set());
  const lowestScoreRef = useRef(WIN_SCORE);
  const st = useRef({ ly: H / 2 - PAD_H / 2, ry: H / 2 - PAD_H / 2, bx: W / 2, by: H / 2, vx: 4, vy: 3, ls: 0, rs: 0, over: false, mode: "ai" as "ai" | "2p" });
  const afRef = useRef<number>(0);
  const keysRef = useRef({ w: false, s: false, up: false, down: false });
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [scores, setScores] = useState({ l: 0, r: 0 });
  const [mode, setMode] = useState<"ai" | "2p">("ai");
  const [winner, setWinner] = useState("");

  const trigger = useCallback((id: string) => {
    if (!onAchievement || achievedRef.current.has(id)) return;
    achievedRef.current.add(id); onAchievement(id);
  }, [onAchievement]);

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!, s = st.current;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    ctx.setLineDash([8, 8]); ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#fff";
    ctx.fillRect(10, s.ly, PAD_W, PAD_H); ctx.fillRect(W - 20, s.ry, PAD_W, PAD_H);
    ctx.beginPath(); ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
    ctx.shadowColor = "#88f"; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
    ctx.font = "bold 36px Courier New"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.fillText(String(s.ls), W / 2 - 60, 48); ctx.fillText(String(s.rs), W / 2 + 60, 48); ctx.textAlign = "left";
    ctx.font = "11px Courier New"; ctx.fillStyle = "#555";
    ctx.fillText(s.mode === "2p" ? "W/S" : "W/S or Mouse", 14, H - 8);
    ctx.fillText(s.mode === "2p" ? "↑/↓" : "CPU", W - 50, H - 8);
  }, []);

  const loop = useCallback(() => {
    const s = st.current; if (s.over) return;
    if (keysRef.current.w) s.ly = Math.max(0, s.ly - 6);
    if (keysRef.current.s) s.ly = Math.min(H - PAD_H, s.ly + 6);
    if (s.mode === "2p") {
      if (keysRef.current.up) s.ry = Math.max(0, s.ry - 6);
      if (keysRef.current.down) s.ry = Math.min(H - PAD_H, s.ry + 6);
    } else {
      const center = s.ry + PAD_H / 2;
      if (center < s.by - 4) s.ry = Math.min(H - PAD_H, s.ry + AI_SPEED);
      else if (center > s.by + 4) s.ry = Math.max(0, s.ry - AI_SPEED);
    }
    s.bx += s.vx; s.by += s.vy;
    if (s.by - BALL_R < 0) { s.by = BALL_R; s.vy = Math.abs(s.vy); }
    if (s.by + BALL_R > H) { s.by = H - BALL_R; s.vy = -Math.abs(s.vy); }
    if (s.bx - BALL_R <= 20 && s.bx - BALL_R >= 8 && s.by >= s.ly && s.by <= s.ly + PAD_H) {
      s.vx = Math.abs(s.vx) * 1.03; s.vy = ((s.by - (s.ly + PAD_H / 2)) / (PAD_H / 2)) * 5; s.bx = 20 + BALL_R + 1;
    }
    if (s.bx + BALL_R >= W - 20 && s.bx + BALL_R <= W - 8 && s.by >= s.ry && s.by <= s.ry + PAD_H) {
      s.vx = -Math.abs(s.vx) * 1.03; s.vy = ((s.by - (s.ry + PAD_H / 2)) / (PAD_H / 2)) * 5; s.bx = W - 20 - BALL_R - 1;
    }
    const spd = Math.hypot(s.vx, s.vy);
    if (spd > 12) { s.vx = s.vx / spd * 12; s.vy = s.vy / spd * 12; }

    if (s.bx < 0) {
      s.rs++; setScores({ l: s.ls, r: s.rs });
      if (s.rs > s.ls) lowestScoreRef.current = Math.min(lowestScoreRef.current, s.ls);
      if (s.rs >= WIN_SCORE) {
        s.over = true; setWinner(s.mode === "2p" ? "Player 2 Wins!" : "CPU Wins!"); setStatus("over");
        onGameOver?.(s.ls); // P1 score even on loss
        return;
      }
      s.bx = W / 2; s.by = H / 2; s.vx = 4; s.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    if (s.bx > W) {
      s.ls++; setScores({ l: s.ls, r: s.rs });
      if (s.ls >= WIN_SCORE) {
        s.over = true; setWinner("Player 1 Wins!"); setStatus("over");
        trigger("pong_first_win");
        if (s.mode === "ai") trigger("pong_beat_cpu");
        if (s.mode === "2p") trigger("pong_2p_win");
        if (s.rs === 0) trigger("pong_perfect");
        if (lowestScoreRef.current <= 1 && s.rs >= 5) trigger("pong_comeback");
        onGameOver?.(s.ls);
        return;
      }
      s.bx = W / 2; s.by = H / 2; s.vx = -4; s.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    draw(); afRef.current = requestAnimationFrame(loop);
  }, [draw, trigger, onGameOver]);

  const startGame = useCallback((m: "ai" | "2p" = mode) => {
    cancelAnimationFrame(afRef.current); lowestScoreRef.current = WIN_SCORE;
    st.current = { ly: H / 2 - PAD_H / 2, ry: H / 2 - PAD_H / 2, bx: W / 2, by: H / 2, vx: 4, vy: 3, ls: 0, rs: 0, over: false, mode: m };
    setScores({ l: 0, r: 0 }); setWinner(""); setStatus("playing");
    afRef.current = requestAnimationFrame(loop);
  }, [loop, mode]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W") keysRef.current.w = true;
      if (e.key === "s" || e.key === "S") keysRef.current.s = true;
      if (e.key === "ArrowUp") { keysRef.current.up = true; e.preventDefault(); }
      if (e.key === "ArrowDown") { keysRef.current.down = true; e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W") keysRef.current.w = false;
      if (e.key === "s" || e.key === "S") keysRef.current.s = false;
      if (e.key === "ArrowUp") keysRef.current.up = false;
      if (e.key === "ArrowDown") keysRef.current.down = false;
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); cancelAnimationFrame(afRef.current); };
  }, []);

  const handleMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    st.current.ly = Math.max(0, Math.min(H - PAD_H, (e.clientY - rect.top) * (H / rect.height) - PAD_H / 2));
  };

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", flex: 1, gap: 8, padding: 8 }}>
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", border: "2px solid #333", maxWidth: "100%" }} onMouseMove={handleMouse} />
          {status !== "playing" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.9)", color: "#fff", fontFamily: "Courier New, monospace", gap: 12 }}>
                <h2 style={{ fontSize: 28, letterSpacing: 6 }}>PONG</h2>
                {winner && <p style={{ color: "#ff0", fontSize: 16 }}>{winner}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  {(["ai", "2p"] as const).map(m => (
                      <button key={m} onClick={() => { setMode(m); startGame(m); }} style={{ background: m === "ai" ? "#fff" : "#444", color: m === "ai" ? "#000" : "#fff", border: "none", padding: "8px 20px", fontSize: 13, cursor: "pointer", fontFamily: "Courier New, monospace" }}>
                        {m === "ai" ? "▶ vs CPU" : "👥 2 Players"}
                      </button>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "#555" }}>P1: W/S or mouse · P2: ↑/↓</p>
              </div>
          )}
        </div>
      </div>
  );
}
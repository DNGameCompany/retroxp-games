"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const W = 480, H = 360, PAD_W = 80, PAD_H = 10, BALL_R = 7;
const BRICK_ROWS = 6, BRICK_COLS = 10, BRICK_W = 44, BRICK_H = 18, BRICK_PAD = 2;
const BRICK_COLORS = ["#ff4444", "#ff8844", "#ffcc44", "#88cc44", "#44aaff", "#aa44ff"];

type Brick = { x: number; y: number; hp: number; color: string } | null;

interface Props {
  onAchievement?: (id: string) => void;
  onGameOver?: (score: number) => void;
}

function makeBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++)
    for (let c = 0; c < BRICK_COLS; c++)
      bricks.push({ x: c * (BRICK_W + BRICK_PAD) + 8, y: r * (BRICK_H + BRICK_PAD) + 40, hp: BRICK_ROWS - r, color: BRICK_COLORS[r] });
  return bricks;
}

export default function Breakout({ onAchievement, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const achievedRef = useRef<Set<string>>(new Set());
  const livesAtLevelStartRef = useRef(3);
  const st = useRef({ px: W / 2 - PAD_W / 2, bx: W / 2, by: H - 60, vx: 3.5, vy: -3.5, bricks: makeBricks(), score: 0, lives: 3, level: 1, over: false, won: false, started: false });
  const afRef = useRef<number>(0);
  const keysRef = useRef({ left: false, right: false });
  const [status, setStatus] = useState<"idle" | "playing" | "over" | "won">("idle");
  const [info, setInfo] = useState({ score: 0, lives: 3, level: 1 });

  const trigger = useCallback((id: string) => {
    if (!onAchievement || achievedRef.current.has(id)) return;
    achievedRef.current.add(id); onAchievement(id);
  }, [onAchievement]);

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!, s = st.current;
    ctx.fillStyle = "#0a0a1a"; ctx.fillRect(0, 0, W, H);
    s.bricks.forEach(b => {
      if (!b) return;
      ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(b.x, b.y, BRICK_W, 3);
      if (b.hp > 1) { ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(b.x, b.y + BRICK_H - 3, BRICK_W, 3); }
    });
    const grad = ctx.createLinearGradient(s.px, 0, s.px + PAD_W, 0);
    grad.addColorStop(0, "#88aaff"); grad.addColorStop(1, "#4466ff");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(s.px, H - 30, PAD_W, PAD_H, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.shadowColor = "#88aaff"; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#aaa"; ctx.font = "12px Courier New";
    ctx.fillText(`Score: ${s.score}`, 8, 20);
    ctx.fillText(`Lives: ${"❤️".repeat(s.lives)}`, W / 2 - 30, 20);
    ctx.fillText(`Level: ${s.level}`, W - 70, 20);
  }, []);

  const loop = useCallback(() => {
    const s = st.current; if (s.over || s.won) return;
    if (keysRef.current.left) s.px = Math.max(0, s.px - 6);
    if (keysRef.current.right) s.px = Math.min(W - PAD_W, s.px + 6);
    s.bx += s.vx; s.by += s.vy;
    if (s.bx - BALL_R < 0) { s.bx = BALL_R; s.vx = Math.abs(s.vx); }
    if (s.bx + BALL_R > W) { s.bx = W - BALL_R; s.vx = -Math.abs(s.vx); }
    if (s.by - BALL_R < 0) { s.by = BALL_R; s.vy = Math.abs(s.vy); }
    if (s.by + BALL_R >= H - 30 && s.by + BALL_R <= H - 20 && s.bx >= s.px && s.bx <= s.px + PAD_W) {
      s.vy = -Math.abs(s.vy); const hit = (s.bx - (s.px + PAD_W / 2)) / (PAD_W / 2); s.vx = hit * 5; s.by = H - 30 - BALL_R - 1;
    }
    if (s.by > H + 20) {
      s.lives--; setInfo(i => ({ ...i, lives: s.lives }));
      if (s.lives <= 0) { s.over = true; setStatus("over"); onGameOver?.(s.score); return; }
      s.bx = s.px + PAD_W / 2; s.by = H - 60; s.vx = 3.5 * (Math.random() > 0.5 ? 1 : -1); s.vy = -3.5;
    }
    s.bricks.forEach((b, i) => {
      if (!b) return;
      if (s.bx + BALL_R > b.x && s.bx - BALL_R < b.x + BRICK_W && s.by + BALL_R > b.y && s.by - BALL_R < b.y + BRICK_H) {
        b.hp--; s.score += 10 * s.level;
        trigger("breakout_first_brick");
        if (s.score >= 500)  trigger("breakout_score_500");
        if (s.score >= 2000) trigger("breakout_score_2000");
        if (b.hp <= 0) s.bricks[i] = null;
        const fromTop = s.by - s.vy < b.y || s.by - s.vy > b.y + BRICK_H;
        if (fromTop) s.vy *= -1; else s.vx *= -1;
        setInfo(inf => ({ ...inf, score: s.score }));
      }
    });
    if (s.bricks.every(b => b === null)) {
      trigger("breakout_clear_level");
      if (s.level === 1 && s.lives === livesAtLevelStartRef.current) trigger("breakout_no_miss");
      s.level++; livesAtLevelStartRef.current = s.lives;
      if (s.level >= 3) trigger("breakout_level_3");
      s.bricks = makeBricks();
      const spd = Math.min(7, 3.5 + s.level * 0.4);
      s.vx = spd * (s.vx > 0 ? 1 : -1); s.vy = -spd; s.bx = W / 2; s.by = H - 60;
      setInfo(inf => ({ ...inf, level: s.level }));
    }
    draw(); afRef.current = requestAnimationFrame(loop);
  }, [draw, trigger, onGameOver]);

  const startGame = useCallback(() => {
    cancelAnimationFrame(afRef.current); livesAtLevelStartRef.current = 3;
    st.current = { px: W / 2 - PAD_W / 2, bx: W / 2, by: H - 60, vx: 3.5, vy: -3.5, bricks: makeBricks(), score: 0, lives: 3, level: 1, over: false, won: false, started: true };
    setInfo({ score: 0, lives: 3, level: 1 }); setStatus("playing");
    afRef.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
      if ((e.key === " " || e.key === "Enter") && status !== "playing") startGame();
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); cancelAnimationFrame(afRef.current); };
  }, [startGame, status]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    st.current.px = Math.max(0, Math.min(W - PAD_W, e.clientX - rect.left - PAD_W / 2));
  };

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050510", flex: 1, gap: 8, padding: 8, overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", border: "2px solid #333", cursor: "none", maxWidth: "100%" }} onMouseMove={handleMouseMove} onClick={() => { if (status !== "playing") startGame(); }} />
          {status !== "playing" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.85)", color: "#fff", fontFamily: "Courier New, monospace", gap: 10 }}>
                <h2 style={{ fontSize: 24, color: "#88aaff", textShadow: "0 0 15px #88aaff" }}>🧱 BREAKOUT</h2>
                {status === "over" && <><p style={{ color: "#f44", fontSize: 14 }}>GAME OVER</p><p style={{ color: "#aaa" }}>Score: <b style={{ color: "#fff" }}>{info.score}</b></p></>}
                <p style={{ fontSize: 11, color: "#666" }}>Move mouse or ← → keys</p>
                <button onClick={startGame} style={{ background: "#88aaff", color: "#000", border: "none", padding: "8px 24px", fontSize: 14, fontWeight: "bold", cursor: "pointer", borderRadius: 2 }}>
                  ▶ {status === "over" ? "PLAY AGAIN" : "PLAY"}
                </button>
              </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {([["◀◀", -1], ["▶▶", 1]] as [string, number][]).map(([lbl, dir]) => (
              <button key={lbl}
                      onPointerDown={() => { const iv = setInterval(() => { st.current.px = Math.max(0, Math.min(W - PAD_W, st.current.px + dir * 8)); }, 16); (window as any).__biv = iv; }}
                      onPointerUp={() => clearInterval((window as any).__biv)}
                      style={{ padding: "8px 20px", background: "#222", border: "1px solid #444", color: "#88aaff", fontSize: 18, cursor: "pointer", borderRadius: 4 }}>{lbl}</button>
          ))}
        </div>
      </div>
  );
}
"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const S = 18;
type Pt = { x: number; y: number };

interface Props {
  onAchievement?: (id: string) => void;
  onGameOver?: (score: number) => void;
}

export default function Snake({ onAchievement, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const achievedRef = useRef<Set<string>>(new Set());
  const st = useRef({
    snake: [] as Pt[], dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    food: { x: 5, y: 5 }, score: 0, hiScore: 0, cols: 0, rows: 0, alive: false,
  });
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);

  const trigger = useCallback((id: string) => {
    if (!onAchievement || achievedRef.current.has(id)) return;
    achievedRef.current.add(id); onAchievement(id);
  }, [onAchievement]);

  const getWH = () => {
    const el = rootRef.current; if (!el) return { w: 360, h: 288 };
    return { w: Math.floor((el.clientWidth - 4) / S) * S, h: Math.floor(Math.max(160, el.clientHeight - 110) / S) * S };
  };

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!, { snake, food } = st.current, W = cv.width, H = cv.height;
    ctx.fillStyle = "#0d0d1a"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0,255,65,.04)"; ctx.lineWidth = .5;
    for (let x = 0; x < W; x += S) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += S) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = "#ff3333"; ctx.shadowColor = "#f00"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(food.x * S + S / 2, food.y * S + S / 2, S / 2 - 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    snake.forEach((seg, i) => {
      const t = 1 - i / snake.length;
      ctx.fillStyle = `rgb(${~~(50 + t * 50)},${~~(180 + t * 75)},${~~(t * 65)})`;
      ctx.shadowColor = "#00ff41"; ctx.shadowBlur = i === 0 ? 8 : 0;
      const p = i === 0 ? 1 : 2; ctx.fillRect(seg.x * S + p, seg.y * S + p, S - p * 2, S - p * 2);
    }); ctx.shadowBlur = 0;
  }, []);

  const placeFood = (snake: Pt[], cols: number, rows: number): Pt => {
    let p: Pt;
    do { p = { x: ~~(Math.random() * cols), y: ~~(Math.random() * rows) }; }
    while (snake.some(s => s.x === p.x && s.y === p.y));
    return p;
  };

  const start = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const { w, h } = getWH(); cv.width = w; cv.height = h;
    const cols = ~~(w / S), rows = ~~(h / S), cx = ~~(cols / 2), cy = ~~(rows / 2);
    const snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
    const s = st.current;
    s.snake = snake; s.dir = { x: 1, y: 0 }; s.nextDir = { x: 1, y: 0 };
    s.score = 0; s.alive = true; s.cols = cols; s.rows = rows;
    s.food = placeFood(snake, cols, rows);
    setScore(0); setStatus("playing");
    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = setInterval(() => {
      const s = st.current; if (!s.alive) return;
      s.dir = { ...s.nextDir };
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (head.x < 0 || head.x >= s.cols || head.y < 0 || head.y >= s.rows
          || s.snake.some(p => p.x === head.x && p.y === head.y)) {
        s.alive = false;
        if (s.score > s.hiScore) s.hiScore = s.score;
        setHi(s.hiScore); setStatus("dead");
        clearInterval(ivRef.current!);
        onGameOver?.(s.score);
        return;
      }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 10; setScore(s.score);
        s.food = placeFood(s.snake, s.cols, s.rows);
        if (s.score === 10)  trigger("snake_first_food");
        if (s.score >= 100)  trigger("snake_score_100");
        if (s.score >= 500)  trigger("snake_score_500");
        if (s.score >= 1000) trigger("snake_score_1000");
        if (s.snake.length === s.cols * s.rows) trigger("snake_win");
      } else { s.snake.pop(); }
      draw();
    }, 140);
  }, [draw, trigger, onGameOver]);

  const setDir = useCallback((dx: number, dy: number) => {
    if (!st.current.alive) { start(); return; }
    if (st.current.snake.length > 1 && dx === -st.current.dir.x && dy === -st.current.dir.y) return;
    st.current.nextDir = { x: dx, y: dy };
  }, [start]);

  useEffect(() => {
    const map: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    };
    const h = (e: KeyboardEvent) => { const v = map[e.key] || map[e.key.toLowerCase()]; if (v) { setDir(v[0], v[1]); e.preventDefault(); } };
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("keydown", h); if (ivRef.current) clearInterval(ivRef.current); };
  }, [setDir]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const { w, h } = getWH(); cv.width = w; cv.height = h;
  }, []);

  const btnStyle: React.CSSProperties = { width: 36, height: 36, background: "rgba(0,255,65,.15)", border: "1px solid #00ff41", color: "#00ff41", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 };

  return (
      <div ref={rootRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 8, background: "#1a1a2e", flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", color: "#00ff41", fontFamily: "Courier New,monospace", fontSize: 13, padding: "0 4px" }}>
          <span>SCORE: <b>{score}</b></span><span>BEST: <b>{hi}</b></span>
        </div>
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef} style={{ display: "block", border: "2px solid #00ff41", boxShadow: "0 0 20px rgba(0,255,65,.3)" }} />
          {status !== "playing" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.82)", color: "#00ff41", fontFamily: "Courier New,monospace", gap: 8 }}>
                <h2 style={{ fontSize: 20, textShadow: "0 0 10px #00ff41" }}>{status === "idle" ? "🐍 SNAKE" : "💀 GAME OVER"}</h2>
                {status === "dead" && <><p style={{ fontSize: 13, color: "#ff3" }}>Score: {score}</p><p style={{ fontSize: 13, color: "#0f0" }}>Best: {hi}</p></>}
                {status === "idle" && <p style={{ fontSize: 12, color: "#aaa" }}>Arrow keys or WASD</p>}
                <button onClick={start} style={{ background: "#00ff41", color: "#000", border: "none", padding: "8px 24px", fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "Courier New,monospace" }}>
                  ▶ {status === "idle" ? "PLAY" : "PLAY AGAIN"}
                </button>
              </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div><button style={btnStyle} onClick={() => setDir(0, -1)}>▲</button></div>
          <div style={{ display: "flex", gap: 3 }}>
            <button style={btnStyle} onClick={() => setDir(-1, 0)}>◀</button>
            <button style={{ ...btnStyle, opacity: .2 }}>·</button>
            <button style={btnStyle} onClick={() => setDir(1, 0)}>▶</button>
          </div>
          <div><button style={btnStyle} onClick={() => setDir(0, 1)}>▼</button></div>
        </div>
      </div>
  );
}
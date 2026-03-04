"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 10, ROWS = 20, SZ = 24;
const COLORS = ["", "#00f0f0", "#0000f0", "#f0a000", "#f0f000", "#00f000", "#a000f0", "#f00000"];
const PIECES = [
  [[1, 1, 1, 1]], [[2, 0, 0], [2, 2, 2]], [[0, 0, 3], [3, 3, 3]],
  [[4, 4], [4, 4]], [[0, 5, 5], [5, 5, 0]], [[0, 6, 0], [6, 6, 6]], [[7, 7, 0], [0, 7, 7]],
];

interface Props {
  onAchievement?: (id: string) => void;
  onGameOver?: (score: number) => void;
}

type Board = number[][];
type Piece = { shape: number[][]; x: number; y: number };

function emptyBoard(): Board { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)); }
function randPiece(): Piece { const shape = PIECES[~~(Math.random() * PIECES.length)]; return { shape, x: ~~(COLS / 2) - ~~(shape[0].length / 2), y: 0 }; }
function rotate(shape: number[][]): number[][] { return shape[0].map((_, c) => shape.map(r => r[c]).reverse()); }
function collides(board: Board, p: Piece): boolean {
  for (let r = 0; r < p.shape.length; r++)
    for (let c = 0; c < p.shape[r].length; c++)
      if (p.shape[r][c]) { const nx = p.x + c, ny = p.y + r; if (nx < 0 || nx >= COLS || ny >= ROWS) return true; if (ny >= 0 && board[ny][nx]) return true; }
  return false;
}
function merge(board: Board, p: Piece): Board { const b = board.map(r => [...r]); p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) b[p.y + r][p.x + c] = v; })); return b; }
function clearLines(board: Board): [Board, number] {
  const kept = board.filter(r => r.some(v => v === 0));
  const cleared = ROWS - kept.length;
  return [[...Array.from({ length: cleared }, () => Array(COLS).fill(0)), ...kept], cleared];
}

export default function Tetris({ onAchievement, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const achievedRef = useRef<Set<string>>(new Set());
  const state = useRef({ board: emptyBoard(), piece: randPiece(), next: randPiece(), score: 0, lines: 0, level: 1, over: false, paused: false });
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [display, setDisplay] = useState({ score: 0, lines: 0, level: 1 });
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");

  const trigger = useCallback((id: string) => {
    if (!onAchievement || achievedRef.current.has(id)) return;
    achievedRef.current.add(id); onAchievement(id);
  }, [onAchievement]);

  const draw = useCallback(() => {
    const cv = canvasRef.current, nc = nextRef.current; if (!cv || !nc) return;
    const ctx = cv.getContext("2d")!, nctx = nc.getContext("2d")!;
    const { board, piece, next } = state.current;
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, cv.width, cv.height);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (board[r][c]) { ctx.fillStyle = COLORS[board[r][c]]; ctx.fillRect(c * SZ + 1, r * SZ + 1, SZ - 2, SZ - 2); ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.strokeRect(c * SZ + 1, r * SZ + 1, SZ - 2, SZ - 2); }
      else { ctx.strokeStyle = "#1a1a1a"; ctx.strokeRect(c * SZ, r * SZ, SZ, SZ); }
    }
    let ghost = { ...piece };
    while (!collides(board, { ...ghost, y: ghost.y + 1 })) ghost = { ...ghost, y: ghost.y + 1 };
    ghost.shape.forEach((row, r) => row.forEach((v, c) => { if (v && ghost.y + r !== piece.y + r) { ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect((ghost.x + c) * SZ + 1, (ghost.y + r) * SZ + 1, SZ - 2, SZ - 2); } }));
    piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) { ctx.fillStyle = COLORS[v]; ctx.fillRect((piece.x + c) * SZ + 1, (piece.y + r) * SZ + 1, SZ - 2, SZ - 2); ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.strokeRect((piece.x + c) * SZ + 1, (piece.y + r) * SZ + 1, SZ - 2, SZ - 2); } }));
    const NS = 20;
    nctx.fillStyle = "#111"; nctx.fillRect(0, 0, nc.width, nc.height);
    const ox = ~~((nc.width / NS - next.shape[0].length) / 2), oy = ~~((nc.height / NS - next.shape.length) / 2);
    next.shape.forEach((row, r) => row.forEach((v, c) => { if (v) { nctx.fillStyle = COLORS[v]; nctx.fillRect((ox + c) * NS + 1, (oy + r) * NS + 1, NS - 2, NS - 2); } }));
  }, []);

  const tick = useCallback(() => {
    const s = state.current; if (s.over || s.paused) return;
    const moved = { ...s.piece, y: s.piece.y + 1 };
    if (!collides(s.board, moved)) { s.piece = moved; }
    else {
      s.board = merge(s.board, s.piece);
      const [nb, cleared] = clearLines(s.board);
      s.board = nb;
      if (cleared > 0) { trigger("tetris_first_line"); if (cleared === 4) trigger("tetris_tetris"); }
      s.lines += cleared; s.score += [0, 100, 300, 500, 800][cleared] * s.level; s.level = ~~(s.lines / 10) + 1;
      if (s.score >= 1000) trigger("tetris_score_1000");
      if (s.score >= 5000) trigger("tetris_score_5000");
      if (s.level >= 5) trigger("tetris_level_5");
      if (s.level >= 10) trigger("tetris_level_10");
      s.piece = s.next; s.next = randPiece();
      if (collides(s.board, s.piece)) {
        s.over = true; clearInterval(ivRef.current!); setStatus("over");
        onGameOver?.(s.score);
      }
      setDisplay({ score: s.score, lines: s.lines, level: s.level });
    }
    draw();
  }, [draw, trigger, onGameOver]);

  const startGame = useCallback(() => {
    if (ivRef.current) clearInterval(ivRef.current);
    state.current = { board: emptyBoard(), piece: randPiece(), next: randPiece(), score: 0, lines: 0, level: 1, over: false, paused: false };
    setDisplay({ score: 0, lines: 0, level: 1 }); setStatus("playing");
    ivRef.current = setInterval(tick, 500); draw();
  }, [tick, draw]);

  useEffect(() => {
    if (status !== "playing") return;
    if (ivRef.current) clearInterval(ivRef.current);
    const speed = Math.max(100, 500 - (display.level - 1) * 40);
    ivRef.current = setInterval(tick, speed);
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [display.level, status, tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = state.current; if (s.over) return;
      if (e.key === "p" || e.key === "P") { s.paused = !s.paused; return; }
      if (s.paused) return;
      let p = { ...s.piece };
      if (e.key === "ArrowLeft") p = { ...p, x: p.x - 1 };
      else if (e.key === "ArrowRight") p = { ...p, x: p.x + 1 };
      else if (e.key === "ArrowDown") p = { ...p, y: p.y + 1 };
      else if (e.key === "ArrowUp") { const rot = { ...p, shape: rotate(p.shape) }; if (!collides(s.board, rot)) p = rot; }
      else if (e.key === " ") { while (!collides(s.board, { ...p, y: p.y + 1 })) p = { ...p, y: p.y + 1 }; }
      else return;
      if (!collides(s.board, p)) s.piece = p; draw(); e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (ivRef.current) clearInterval(ivRef.current); };
  }, [draw]);

  const btnStyle: React.CSSProperties = { width: 40, height: 40, background: "rgba(255,255,255,.1)", border: "1px solid #555", color: "#fff", fontSize: 18, cursor: "pointer", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
      <div style={{ display: "flex", gap: 8, padding: 8, background: "#0a0a0a", flex: 1, overflow: "hidden", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef} width={COLS * SZ} height={ROWS * SZ} style={{ display: "block", border: "2px solid #444" }} />
          {status !== "playing" && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#fff", fontFamily: "Courier New, monospace" }}>
                <h2 style={{ fontSize: 22, color: "#f0f000", textShadow: "0 0 10px #f0f000" }}>{status === "over" ? "GAME OVER" : "🎮 TETRIS"}</h2>
                {status === "over" && <p style={{ fontSize: 13, color: "#aaa" }}>Score: <b style={{ color: "#fff" }}>{display.score}</b></p>}
                {status === "idle" && <p style={{ fontSize: 11, color: "#888" }}>Arrow keys · ↑ rotate · Space drop</p>}
                <button onClick={startGame} style={{ background: "#f0f000", color: "#000", border: "none", padding: "8px 24px", fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "Courier New, monospace", borderRadius: 2 }}>
                  ▶ {status === "over" ? "PLAY AGAIN" : "PLAY"}
                </button>
              </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "#aaa", fontFamily: "Courier New, monospace", fontSize: 12, minWidth: 90 }}>
          <div style={{ background: "#111", border: "1px solid #333", padding: "6px 8px" }}><div style={{ color: "#555", marginBottom: 2 }}>NEXT</div><canvas ref={nextRef} width={80} height={60} /></div>
          <div style={{ background: "#111", border: "1px solid #333", padding: "6px 8px" }}><div style={{ color: "#555" }}>SCORE</div><div style={{ color: "#fff", fontSize: 14 }}>{display.score}</div></div>
          <div style={{ background: "#111", border: "1px solid #333", padding: "6px 8px" }}><div style={{ color: "#555" }}>LINES</div><div style={{ color: "#fff", fontSize: 14 }}>{display.lines}</div></div>
          <div style={{ background: "#111", border: "1px solid #333", padding: "6px 8px" }}><div style={{ color: "#555" }}>LEVEL</div><div style={{ color: "#f0f000", fontSize: 14 }}>{display.level}</div></div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginTop: 4 }}>
            <button style={btnStyle} onClick={() => { const s = state.current; const r = { ...s.piece, shape: rotate(s.piece.shape) }; if (!collides(s.board, r)) { s.piece = r; draw(); } }}>↻</button>
            <div style={{ display: "flex", gap: 3 }}>
              <button style={btnStyle} onClick={() => { const s = state.current; const p = { ...s.piece, x: s.piece.x - 1 }; if (!collides(s.board, p)) { s.piece = p; draw(); } }}>◀</button>
              <button style={btnStyle} onClick={() => { const s = state.current; let p = s.piece; while (!collides(s.board, { ...p, y: p.y + 1 })) p = { ...p, y: p.y + 1 }; s.piece = p; tick(); }}>⬇</button>
              <button style={btnStyle} onClick={() => { const s = state.current; const p = { ...s.piece, x: s.piece.x + 1 }; if (!collides(s.board, p)) { s.piece = p; draw(); } }}>▶</button>
            </div>
            <button style={{ ...btnStyle, width: 127, fontSize: 12 }} onClick={() => { const s = state.current; const p = { ...s.piece, y: s.piece.y + 1 }; if (!collides(s.board, p)) { s.piece = p; draw(); } }}>▼ DOWN</button>
          </div>
        </div>
      </div>
  );
}
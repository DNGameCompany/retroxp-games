"use client";
import { useState, useEffect, useCallback, useRef } from "react";

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };
type Diff = "easy" | "medium" | "hard";
const DIFFS = { easy: { rows: 9, cols: 9, mines: 10 }, medium: { rows: 16, cols: 16, mines: 40 }, hard: { rows: 16, cols: 30, mines: 99 } };
const LABELS: Record<Diff, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000", "#808080"];

interface Props {
  onAchievement?: (id: string) => void;
  onGameOver?: (score: number, diff: string) => void;
}

function build(rows: number, cols: number, mines: number, sr: number, sc: number): Cell[][] {
  const b: Cell[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })));
  let p = 0;
  while (p < mines) {
    const r = ~~(Math.random() * rows), c = ~~(Math.random() * cols);
    if (!b[r][c].mine && !(Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1)) { b[r][c].mine = true; p++; }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!b[r][c].mine)
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && b[nr][nc].mine) b[r][c].count++;
          }
  return b;
}

function flood(b: Cell[][], r: number, c: number) {
  if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return;
  const cl = b[r][c];
  if (cl.revealed || cl.flagged || cl.mine) return;
  cl.revealed = true;
  if (cl.count === 0) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(b, r + dr, c + dc);
}

export default function Minesweeper({ onAchievement, onGameOver }: Props) {
  const [diff, setDiff] = useState<Diff>("easy");
  const [board, setBoard] = useState<Cell[][] | null>(null);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [secs, setSecs] = useState(0);
  const [flags, setFlags] = useState(10);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const achievedRef = useRef<Set<string>>(new Set());
  const flagsEverPlaced = useRef(0);
  // score = cells revealed (proxy for minesweeper since no points)
  const secsRef = useRef(0);

  const trigger = useCallback((id: string) => {
    if (!onAchievement || achievedRef.current.has(id)) return;
    achievedRef.current.add(id); onAchievement(id);
  }, [onAchievement]);

  const init = useCallback((d: Diff = diff) => {
    if (timer.current) clearInterval(timer.current);
    flagsEverPlaced.current = 0; secsRef.current = 0;
    setBoard(null); setStarted(false); setOver(false); setWon(false); setSecs(0); setFlags(DIFFS[d].mines); setDiff(d);
  }, [diff]);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!started || over) return;
    timer.current = setInterval(() => {
      secsRef.current++;
      setSecs(secsRef.current);
      if (secsRef.current >= 999) { if (timer.current) clearInterval(timer.current); }
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [started, over]);

  const click = (r: number, c: number) => {
    if (over) return;
    let b = board;
    if (!b) { b = build(DIFFS[diff].rows, DIFFS[diff].cols, DIFFS[diff].mines, r, c); setStarted(true); }
    if (b[r][c].revealed || b[r][c].flagged) return;
    const next = b.map(row => row.map(cl => ({ ...cl })));
    if (next[r][c].mine) {
      next.forEach(row => row.forEach(cl => { if (cl.mine) cl.revealed = true; }));
      next[r][c].revealed = true;
      setBoard(next); setOver(true);
      if (timer.current) clearInterval(timer.current);
      // score 0 for loss
      onGameOver?.(0, diff);
      return;
    }
    flood(next, r, c);
    let hidden = 0;
    next.forEach(row => row.forEach(cl => { if (!cl.revealed && !cl.mine) hidden++; }));
    if (hidden === 0) {
      setWon(true); setOver(true);
      if (timer.current) clearInterval(timer.current);
      trigger("ms_first_win");
      trigger(`ms_win_${diff}`);
      if (secsRef.current < 30) trigger("ms_fast_win");
      if (flagsEverPlaced.current === 0) trigger("ms_no_flags");
      // score = 1000 - time (higher is better for leaderboard)
      const score = Math.max(1, 1000 - secsRef.current);
      onGameOver?.(score, diff);
    }
    setBoard(next);
  };

  const flag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (over || !board) return;
    const next = board.map(row => row.map(cl => ({ ...cl })));
    next[r][c].flagged = !next[r][c].flagged;
    if (next[r][c].flagged) flagsEverPlaced.current++;
    setFlags(f => f + (next[r][c].flagged ? -1 : 1));
    setBoard(next);
  };

  const lcd = (n: number) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");
  const face = over ? (won ? "😎" : "😵") : "🙂";
  const { rows, cols } = DIFFS[diff];
  const btnBase: React.CSSProperties = { padding: "2px 10px", fontSize: 11, fontFamily: "Tahoma,sans-serif", background: "#d4d0c8", cursor: "pointer" };

  return (
      <div onContextMenu={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 8, background: "#ece9d8", overflow: "auto", flex: 1, position: "relative" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(Object.keys(DIFFS) as Diff[]).map(d => (
              <button key={d} onClick={() => init(d)} style={{ ...btnBase, border: d === diff ? "2px inset #c8c4bc" : "2px outset #fff", background: d === diff ? "#c8c4bc" : "#d4d0c8" }}>{LABELS[d]}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#d4d0c8", border: "2px inset #ece9d8", padding: "4px 8px", gap: 8, width: "100%", maxWidth: 500 }}>
          <div style={{ background: "#000", color: "#f00", fontFamily: "Courier New,monospace", fontSize: 20, fontWeight: "bold", padding: "2px 6px", border: "2px inset #808080", letterSpacing: 2, minWidth: 50, textAlign: "center" }}>{lcd(flags)}</div>
          <button onClick={() => init()} style={{ width: 36, height: 36, background: "#d4d0c8", border: "2px outset #fff", fontSize: 20, cursor: "pointer" }}>{face}</button>
          <div style={{ background: "#000", color: "#f00", fontFamily: "Courier New,monospace", fontSize: 20, fontWeight: "bold", padding: "2px 6px", border: "2px inset #808080", letterSpacing: 2, minWidth: 50, textAlign: "center" }}>{lcd(secs)}</div>
        </div>
        <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${cols},22px)`, border: "3px inset #808080", background: "#bdbdbd" }}>
          {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
            const cl = board?.[r]?.[c];
            const rev = cl?.revealed ?? false, fl = cl?.flagged ?? false, val = cl?.count ?? 0, mine = cl?.mine ?? false;
            return (
                <div key={`${r}-${c}`}
                     style={{ width: 22, height: 22, background: rev ? (mine ? "#f00" : "#bdbdbd") : "#d4d0c8", border: rev ? "1px solid #808080" : "2px outset #fff", fontSize: 13, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", cursor: rev ? "default" : "pointer", fontFamily: "Arial,sans-serif", userSelect: "none", color: rev && !mine && val > 0 ? COLORS[val] : undefined }}
                     onClick={() => click(r, c)} onContextMenu={e => flag(e, r, c)}>
                  {rev ? (mine ? "💥" : (val > 0 ? val : "")) : (fl ? "🚩" : "")}
                </div>
            );
          }))}
        </div>
        {over && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(236,233,216,.97)", border: "2px outset #fff", padding: "16px 24px", textAlign: "center", boxShadow: "3px 3px 8px rgba(0,0,0,.3)", zIndex: 10 }}>
              <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>{won ? "🎉 You Win!" : "💥 Boom! Game Over"}</p>
              <button onClick={() => init()} style={{ ...btnBase, border: "2px outset #fff", padding: "4px 16px" }}>Play Again</button>
            </div>
        )}
      </div>
  );
}
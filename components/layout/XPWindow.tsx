"use client";
import { useRef, useEffect, ReactNode } from "react";
import type { WinState } from "./XPDesktopClient";
import type { Theme } from "@/lib/themes";

interface Props {
  win: WinState;
  isActive: boolean;
  theme: Theme;
  onFocus(): void;
  onClose(): void;
  onMinimize(): void;
  onMaximize(): void;
  onMove(x: number, y: number): void;
  onResize(w: number, h: number): void;
  children: ReactNode;
}

export default function XPWindow({
                                   win, isActive, theme,
                                   onFocus, onClose, onMinimize, onMaximize, onMove, onResize, children,
                                 }: Props) {
  const tbRef = useRef<HTMLDivElement>(null);
  const rsRef = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const resize = useRef(false);
  const start = useRef({ mx: 0, my: 0, ox: 0, oy: 0, ow: 0, oh: 0 });
  const moveRef = useRef(onMove);
  const resizeRef = useRef(onResize);
  moveRef.current = onMove;
  resizeRef.current = onResize;

  useEffect(() => {
    const tb = tbRef.current!;
    const rs = rsRef.current;

    const tbDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (win.maximized) return;
      drag.current = true;
      start.current = { mx: e.clientX, my: e.clientY, ox: win.x, oy: win.y, ow: 0, oh: 0 };
      onFocus();
    };

    const rsDown = rs ? (e: MouseEvent) => {
      resize.current = true;
      start.current = { mx: e.clientX, my: e.clientY, ox: 0, oy: 0, ow: win.w, oh: win.h };
      e.preventDefault();
    } : null;

    const mmove = (e: MouseEvent) => {
      if (drag.current) {
        const nx = Math.max(0, Math.min(window.innerWidth - 100, start.current.ox + e.clientX - start.current.mx));
        const ny = Math.max(0, Math.min(window.innerHeight - 60, start.current.oy + e.clientY - start.current.my));
        moveRef.current(nx, ny);
      }
      if (resize.current) {
        resizeRef.current(
            Math.max(200, start.current.ow + e.clientX - start.current.mx),
            Math.max(150, start.current.oh + e.clientY - start.current.my),
        );
      }
    };
    const mup = () => { drag.current = false; resize.current = false; };

    tb.addEventListener("mousedown", tbDown);
    if (rs && rsDown) rs.addEventListener("mousedown", rsDown);
    document.addEventListener("mousemove", mmove);
    document.addEventListener("mouseup", mup);
    return () => {
      tb.removeEventListener("mousedown", tbDown);
      if (rs && rsDown) rs.removeEventListener("mousedown", rsDown);
      document.removeEventListener("mousemove", mmove);
      document.removeEventListener("mouseup", mup);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.x, win.y, win.w, win.h, win.maximized]);

  if (win.minimized) return null;

  const tbGrad = isActive ? theme.titlebar : theme.titlebarInactive;

  // Derive secondary colors from windowBg darkness
  const isDark = /^#[0-1]/.test(theme.windowBg) || theme.windowBg.startsWith("rgba(0");
  const menuBorder = isDark ? "1px solid rgba(255,255,255,.1)" : "1px solid #aca899";
  const statusBg   = isDark ? "rgba(0,0,0,.25)" : "#d4d0c8";
  const statusBorder = isDark ? "1px solid rgba(255,255,255,.1)" : "1px solid #aca899";
  const textColor  = isDark ? "rgba(255,255,255,.75)" : "inherit";

  const containerStyle: React.CSSProperties = win.maximized
      ? {
        position: "absolute", left: 0, top: 0, width: "100%",
        height: "calc(100vh - 30px)", borderRadius: 0, zIndex: win.zIndex,
        display: "flex", flexDirection: "column",
        background: theme.windowBg,
        border: "1px solid rgba(0,0,0,.4)",
        boxShadow: "none",
      }
      : {
        position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h,
        zIndex: win.zIndex, display: "flex", flexDirection: "column",
        background: theme.windowBg,
        border: "1px solid rgba(0,0,0,.4)",
        borderRadius: "8px 8px 0 0",
        boxShadow: "3px 3px 12px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.15)",
      };

  return (
      <div style={containerStyle} onMouseDown={onFocus}>
        {/* Title bar */}
        <div
            ref={tbRef}
            style={{
              height: 28, background: tbGrad,
              borderRadius: win.maximized ? "0" : "7px 7px 0 0",
              display: "flex", alignItems: "center",
              padding: "0 4px 0 6px", gap: 4, cursor: "move", flexShrink: 0,
            }}
        >
          <span style={{ fontSize: 14 }}>{win.emoji}</span>
          <span style={{
            flex: 1, color: "#fff", fontSize: 12, fontWeight: "bold",
            textShadow: "1px 1px 2px rgba(0,0,0,.4)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
          {win.title}
        </span>
          <div style={{ display: "flex", gap: 2 }}>
            {([
              ["_", onMinimize, "Minimize"],
              ["□", onMaximize, "Maximize"],
              ["✕", onClose,   "Close"],
            ] as [string, () => void, string][]).map(([lbl, fn, tp]) => (
                <button key={tp} title={tp} onClick={fn} style={{
                  width: 21, height: 21, borderRadius: 3, border: "none", cursor: "pointer",
                  fontSize: tp === "Close" ? 11 : 13, fontWeight: "bold",
                  background: tp === "Close"
                      ? "linear-gradient(to bottom,#ff5656,#cc0000)"
                      : "linear-gradient(to bottom,#f7be5f,#e8a000)",
                  color: tp === "Close" ? "#fff" : "#000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {lbl}
                </button>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <div style={{
          height: 20, background: theme.windowBg,
          borderBottom: menuBorder,
          display: "flex", alignItems: "center", padding: "0 4px", flexShrink: 0,
        }}>
          {["Game", "Help"].map((m) => (
              <span
                  key={m}
                  style={{ padding: "2px 6px", fontSize: 11, cursor: "pointer", borderRadius: 2, color: textColor }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLSpanElement).style.background = theme.titlebar;
                    (e.target as HTMLSpanElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLSpanElement).style.background = "";
                    (e.target as HTMLSpanElement).style.color = "";
                  }}
              >
            {m}
          </span>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflow: "auto", display: "flex", flexDirection: "column",
          borderTop: "2px solid rgba(255,255,255,.12)", minHeight: 0,
        }}>
          {children}
        </div>

        {/* Status bar */}
        <div style={{
          height: 22, background: statusBg, borderTop: statusBorder,
          display: "flex", alignItems: "center", padding: "0 8px",
          fontSize: 11, color: textColor, flexShrink: 0,
        }}>
          Ready
        </div>

        {/* Resize handle */}
        {!win.maximized && (
            <div
                ref={rsRef}
                style={{
                  position: "absolute", right: 0, bottom: 0, width: 16, height: 16,
                  cursor: "se-resize", display: "flex", alignItems: "flex-end",
                  justifyContent: "flex-end", color: "#808080", fontSize: 14,
                }}
            >
              ⌟
            </div>
        )}
      </div>
  );
}
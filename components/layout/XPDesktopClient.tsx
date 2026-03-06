"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Game } from "@/lib/games-registry";
import {
  getTheme, saveTheme, getSoundsEnabled, saveSoundsEnabled,
  getProfile, updateProfileStats, type ThemeId, addScore,
} from "@/lib/storage";
import { getThemeById, THEMES } from "@/lib/themes";
import { playSound, setSoundsEnabled } from "@/lib/sounds";
import { unlockAchievement } from "@/lib/storage";
import { getAchievement } from "@/lib/achievements";
import XPWindow from "./XPWindow";
import XPTaskbar from "./XPTaskbar";
import XPStartMenu from "./XPStartMenu";
import HomeContent from "../games/HomeContent";
import Minesweeper from "../games/Minesweeper";
import Snake from "../games/Snake";
import Tetris from "../games/Tetris";
import Pong from "../games/Pong";
import Pinball from "../games/Pinball";
// ── Card games ──────────────────────────────────────────────────────────────
import Solitaire from "../games/Solitaire";
// ── Windows ─────────────────────────────────────────────────────────────────
import ProfileWindow from "../windows/ProfileWindow";
import LeaderboardWindow from "../windows/LeaderboardWindow";
import AchievementsWindow from "../windows/AchievementsWindow";
import DailyWindow from "../windows/DailyWindow";
import {trackGameOpen} from "@/lib/analytics";

export interface WinState {
  id: string; title: string; emoji: string;
  minimized: boolean; maximized: boolean;
  x: number; y: number; w: number; h: number; zIndex: number;
}

interface Props { games: Game[]; initialGame?: string; }
interface Toast { id: string; key: number; }

let zTop = 200;
const DEFAULT_BG = "linear-gradient(135deg,#1a6e39 0%,#0e4d2a 40%,#094020 100%)";
const STORAGE_KEY = "xp_wallpaper";

// ── Window sizes ─────────────────────────────────────────────────────────────
const WIN_SIZES: Record<string, [number, number]> = {
  minesweeper: [380, 490],
  snake:       [420, 480],
  tetris:      [360, 520],
  breakout:    [540, 440],
  pong:        [540, 400],
  pinball:     [720, 560],
  // card games
  solitaire:   [520, 560],
  spider:      [580, 560],
  pyramid:     [460, 540],
  blackjack:   [420, 460],
};

export default function XPDesktopClient({ games, initialGame }: Props) {
  const [wins, setWins]           = useState<Record<string, WinState>>({});
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime]           = useState("");
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [wallFit, setWallFit]     = useState<"cover"|"contain"|"fill"|"tile">("cover");
  const [showWallMenu, setShowWallMenu] = useState(false);
  const [menuPos, setMenuPos]     = useState({ x: 0, y: 0 });
  const [theme, setTheme]         = useState<ThemeId>("luna");
  const [soundsOn, setSoundsOn]   = useState(true);
  const [toasts, setToasts]       = useState<Toast[]>([]);
  const [showError, setShowError] = useState<string | null>(null);
  const fileRef      = useRef<HTMLInputElement>(null);
  const sessionStart = useRef(Date.now());

  const themeObj = getThemeById(theme);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = getTheme(); setTheme(t);
    const s = getSoundsEnabled(); setSoundsOn(s); setSoundsEnabled(s);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const { url, fit } = JSON.parse(saved); setWallpaper(url); setWallFit(fit); }
    } catch {}
    setTimeout(() => playSound("startup"), 300);
    const p = getProfile();
    if (p.streak >= 3 && unlockAchievement("g_streak3")) pushToast("g_streak3");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Clock ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // ── Achievement toast ─────────────────────────────────────────────────────
  const pushToast = useCallback((id: string) => {
    setToasts(q => [...q, { id, key: Date.now() }]);
    playSound("achievement");
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts(q => q.slice(1)), 4000);
    return () => clearTimeout(t);
  }, [toasts]);

  // ── Shared achievement handler (all games use this) ───────────────────────
  const handleAchievement = useCallback((aid: string) => {
    if (unlockAchievement(aid)) pushToast(aid);
  }, [pushToast]);

  // ── Shared game-over handler factory ─────────────────────────────────────
  const handleGameOver = useCallback((game: string) => (score: number, diff?: string) => {
    const p = getProfile();
    addScore(game, { name: p.name, score, diff });
    updateProfileStats({ score });

    // "g_10games" achievement — count across all games
    const updated = updateProfileStats({ score: 0 }); // re-read after above
    if (updated.gamesPlayed >= 10 && unlockAchievement("g_10games")) pushToast("g_10games");
    if (updated.gamesPlayed >= 50 && unlockAchievement("g_50games")) pushToast("g_50games");
  }, [pushToast]);

  // ── Window management ─────────────────────────────────────────────────────
  const focus = useCallback((id: string) => {
    setActiveId(id);
    setWins(p => ({ ...p, [id]: { ...p[id], zIndex: ++zTop } }));
  }, []);

  const openWin = useCallback((id: string, title: string, emoji: string, w = 480, h = 500) => {
    playSound("windowOpen");
    setWins(p => {
      if (p[id]) return { ...p, [id]: { ...p[id], minimized: false, zIndex: ++zTop } };
      const off = Object.keys(p).length * 24;
      return { ...p, [id]: { id, title, emoji, minimized: false, maximized: false, x: 60+off, y: 40+off, w, h, zIndex: ++zTop } };
    });
    setActiveId(id);
  }, []);

  const closeWin = useCallback((id: string) => {
    playSound("windowClose");
    const elapsed = Math.floor((Date.now() - sessionStart.current) / 1000);
    updateProfileStats({ time: elapsed });
    sessionStart.current = Date.now();
    setWins(p => { const n = { ...p }; delete n[id]; return n; });
  }, []);

  const openGame = useCallback((slug: string) => {
    const g = games.find(x => x.slug === slug);
    trackGameOpen(slug)
    if (!g) return;
    if (!g.available) { alert(`🚧 ${g.title} — coming soon!`); return; }
    const [w, h] = WIN_SIZES[slug] || [480, 500];
    openWin(slug, g.title, g.emoji, w, h);

    // "play all 5 classic" achievement
    const playedGames = new Set(Object.keys(wins));
    playedGames.add(slug);
    if (["minesweeper","snake","tetris","breakout","pong"].every(s => playedGames.has(s))) {
      if (unlockAchievement("g_all5")) pushToast("g_all5");
    }
    // "play all 4 card games" achievement
    if (["solitaire","spider","pyramid","blackjack"].every(s => playedGames.has(s))) {
      if (unlockAchievement("g_allcards")) pushToast("g_allcards");
    }
    // Night owl
    const h24 = new Date().getHours();
    if (h24 >= 0 && h24 < 4 && unlockAchievement("g_night")) pushToast("g_night");
  }, [games, openWin, wins, pushToast]);

  const openSpecial = useCallback((id: string) => {
    const map: Record<string, [string, string, number, number]> = {
      profile:      ["👤 Profile",         "👤", 380, 460],
      leaderboard:  ["🏆 Leaderboard",     "🏆", 560, 460],
      achievements: ["🏅 Achievements",    "🏅", 560, 500],
      daily:        ["📅 Daily Challenge", "📅", 380, 400],
      themes:       ["🎨 Themes",          "🎨", 340, 360],
    };
    const [title, emoji, w, h] = map[id] ?? ["Window","🪟",400,300];
    openWin(id, title, emoji, w, h);
  }, [openWin]);

  useEffect(() => {
    setTimeout(() => {
      openWin("home","RetroXP — All Games","🎮",520,400);
      if (initialGame) setTimeout(() => openGame(initialGame), 250);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Theme / sound / wallpaper ─────────────────────────────────────────────
  const changeTheme = (id: ThemeId) => {
    setTheme(id); saveTheme(id); playSound("click");
    if (unlockAchievement("g_theme")) pushToast("g_theme");
  };
  const toggleSounds = () => {
    const next = !soundsOn; setSoundsOn(next); setSoundsEnabled(next); saveSoundsEnabled(next);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setWallpaper(url); setShowWallMenu(false);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, fit: wallFit })); } catch {}
      if (unlockAchievement("g_wallpaper")) pushToast("g_wallpaper");
    };
    reader.readAsDataURL(file); e.target.value = "";
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id !== "xp-desktop") return;
    e.preventDefault(); setMenuPos({ x: e.clientX, y: e.clientY }); setShowWallMenu(true);
  };

  // ── Render content ────────────────────────────────────────────────────────
  const renderContent = (id: string) => {
    if (id === "home")         return <HomeContent games={games} onOpen={openGame} />;

    // Classic games (unchanged)
    if (id === "minesweeper")  return <Minesweeper  onAchievement={handleAchievement} onGameOver={handleGameOver("minesweeper")} />;
    if (id === "snake")        return <Snake        onAchievement={handleAchievement} onGameOver={handleGameOver("snake")} />;
    if (id === "tetris")       return <Tetris       onAchievement={handleAchievement} onGameOver={handleGameOver("tetris")} />;
    if (id === "pong")         return <Pong         onAchievement={handleAchievement} onGameOver={handleGameOver("pong")} />;
    if (id === "pinball")      return <Pinball />;

    // ── Card games ──────────────────────────────────────────────────────────
    if (id === "solitaire")    return <Solitaire    onAchievement={handleAchievement} onGameOver={handleGameOver("solitaire")} />;

    // Special windows (unchanged)
    if (id === "profile")      return <ProfileWindow />;
    if (id === "leaderboard")  return <LeaderboardWindow />;
    if (id === "achievements") return <AchievementsWindow />;
    if (id === "daily")        return <DailyWindow onPlay={slug => { openGame(slug); closeWin("daily"); }} />;
    if (id === "themes")       return <ThemesPanel current={theme} onChange={changeTheme} />;
    return null;
  };

  // ── Desktop bg ────────────────────────────────────────────────────────────
  const bgStyle: React.CSSProperties = wallpaper
      ? wallFit === "tile"
          ? { backgroundImage:`url(${wallpaper})`,backgroundRepeat:"repeat",backgroundSize:"auto" }
          : { backgroundImage:`url(${wallpaper})`,backgroundRepeat:"no-repeat",backgroundSize:wallFit,backgroundPosition:"center" }
      : theme === "luna"
          ? { background: DEFAULT_BG }
          : { background: themeObj.desktop };

  const icons = [
    { id:"home",         label:"All Games",       emoji:"🎮" },
    { id:"daily",        label:"Daily Challenge", emoji:"📅" },
    { id:"leaderboard",  label:"Leaderboard",     emoji:"🏆" },
    { id:"achievements", label:"Achievements",    emoji:"🏅" },
    { id:"profile",      label:"My Profile",      emoji:"👤" },
    ...games.filter(g => g.available).map(g => ({ id:g.slug, label:g.title, emoji:g.emoji })),
  ];

  return (
      <div id="xp-desktop"
           style={{ position:"relative",width:"100%",height:"calc(100vh - 30px)",overflow:"hidden",...bgStyle }}
           onClick={() => { setStartOpen(false); setShowWallMenu(false); }}
           onContextMenu={handleContextMenu}
      >
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileChange}/>

        {/* Desktop icons */}
        <div style={{position:"absolute",top:10,left:10,display:"flex",flexDirection:"column",gap:8,zIndex:10}}>
          {icons.map(ic => (
              <div key={ic.id}
                   onDoubleClick={() => ic.id==="home"
                       ? openWin("home","RetroXP — All Games","🎮",520,400)
                       : ["daily","leaderboard","achievements","profile","themes"].includes(ic.id)
                           ? openSpecial(ic.id) : openGame(ic.id)}
                   style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 6px",borderRadius:4,cursor:"pointer",width:72}}
                   onMouseEnter={e=>(e.currentTarget.style.background="rgba(49,106,197,.5)")}
                   onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
              >
                <span style={{fontSize:28,filter:"drop-shadow(1px 1px 2px rgba(0,0,0,.5))"}}>{ic.emoji}</span>
                <span style={{fontSize:10,color:"#fff",textAlign:"center",textShadow:"1px 1px 2px #000,0 0 6px #000",lineHeight:1.3,wordBreak:"break-word"}}>{ic.label}</span>
              </div>
          ))}
        </div>

        {/* Clock widget */}
        <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.45)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"6px 12px",color:"#fff",fontFamily:"Tahoma",textAlign:"center",zIndex:10}}>
          <div style={{fontSize:22,fontWeight:"bold",letterSpacing:2}}>{time}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginTop:2}}>
            {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
          </div>
        </div>

        {/* Windows */}
        {Object.values(wins).map(w => (
            <XPWindow key={w.id} win={w} isActive={activeId===w.id} theme={themeObj}
                      onFocus={()=>focus(w.id)} onClose={()=>closeWin(w.id)}
                      onMinimize={()=>setWins(p=>({...p,[w.id]:{...p[w.id],minimized:!p[w.id].minimized}}))}
                      onMaximize={()=>setWins(p=>({...p,[w.id]:{...p[w.id],maximized:!p[w.id].maximized}}))}
                      onMove={(x,y)=>setWins(p=>({...p,[w.id]:{...p[w.id],x,y}}))}
                      onResize={(ww,hh)=>setWins(p=>({...p,[w.id]:{...p[w.id],w:ww,h:hh}}))}
            >{renderContent(w.id)}</XPWindow>
        ))}

        {/* Taskbar */}
        <XPTaskbar wins={Object.values(wins)} activeId={activeId} time={time} theme={themeObj}
                   soundsOn={soundsOn} onToggleSound={toggleSounds}
                   onTaskClick={id=>{
                     const w=wins[id];if(!w)return;
                     if(w.minimized){setWins(p=>({...p,[id]:{...p[id],minimized:false}}));focus(id);}
                     else if(activeId===id) setWins(p=>({...p,[id]:{...p[id],minimized:true}}));
                     else focus(id);
                   }}
                   onStartClick={e=>{e.stopPropagation();setStartOpen(v=>!v);}}
        />

        {/* Start Menu */}
        {startOpen && (
            <XPStartMenu games={games} theme={themeObj}
                         onOpen={slug=>{openGame(slug);setStartOpen(false);}}
                         onSpecial={id=>{openSpecial(id);setStartOpen(false);}}
                         onThemes={()=>{openSpecial("themes");setStartOpen(false);}}
                         onClose={()=>setStartOpen(false)}
            />
        )}

        {/* Right-click menu */}
        {showWallMenu && (
            <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left:menuPos.x,top:menuPos.y,zIndex:99999,background:"#ece9d8",border:"1px solid #808080",boxShadow:"2px 2px 6px rgba(0,0,0,.4)",minWidth:200,fontFamily:"Tahoma",fontSize:12}}>
              <div style={{background:"#0054e3",color:"#fff",padding:"4px 10px",fontWeight:"bold",fontSize:11}}>🖥️ Desktop</div>
              {([
                ["🖼️ Set Wallpaper...", ()=>fileRef.current?.click()],
                ["🎨 Change Theme",    ()=>{openSpecial("themes");setShowWallMenu(false);}],
                ...(wallpaper?[["✕ Remove Wallpaper",()=>{setWallpaper(null);try{localStorage.removeItem(STORAGE_KEY);}catch{}setShowWallMenu(false);}]]:[] as [string,()=>void][]),
              ] as [string,()=>void][]).map(([lbl,fn])=>(
                  <div key={lbl} onClick={fn} style={{padding:"6px 12px",cursor:"pointer"}}
                       onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background="#0054e3";(e.currentTarget as HTMLDivElement).style.color="#fff";}}
                       onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="";(e.currentTarget as HTMLDivElement).style.color="";}}>
                    {lbl}
                  </div>
              ))}
            </div>
        )}

        {/* XP Error popup */}
        {showError && (
            <div style={{position:"fixed",inset:0,zIndex:99998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.3)"}}
                 onClick={()=>setShowError(null)}>
              <div style={{background:"#ece9d8",border:"1px solid #0054e3",borderRadius:"8px 8px 0 0",width:380,fontFamily:"Tahoma",boxShadow:"4px 4px 16px rgba(0,0,0,.5)"}} onClick={e=>e.stopPropagation()}>
                <div style={{background:"linear-gradient(to bottom,#1f86e8,#0831d9)",padding:"4px 8px",borderRadius:"7px 7px 0 0",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:14}}>⚠️</span>
                  <span style={{color:"#fff",fontSize:12,fontWeight:"bold"}}>Windows XP</span>
                </div>
                <div style={{padding:20,display:"flex",gap:14,alignItems:"flex-start"}}>
                  <span style={{fontSize:36}}>🛑</span>
                  <div>
                    <div style={{fontWeight:"bold",marginBottom:8,fontSize:13}}>Error</div>
                    <div style={{fontSize:12,color:"#333",lineHeight:1.5}}>{showError}</div>
                  </div>
                </div>
                <div style={{padding:"0 20px 16px",display:"flex",justifyContent:"flex-end"}}>
                  <button onClick={()=>setShowError(null)} style={{padding:"4px 20px",fontFamily:"Tahoma",fontSize:12,background:"#d4d0c8",border:"2px outset #fff",cursor:"pointer"}}>OK</button>
                </div>
              </div>
            </div>
        )}

        {/* Achievement toasts */}
        {toasts.slice(0,1).map(t => {
          const a = getAchievement(t.id); if (!a) return null;
          return (
              <div key={t.key} style={{position:"fixed",bottom:40,right:16,zIndex:99999,background:"linear-gradient(135deg,#1a1a2e,#0d0d1e)",border:"1px solid #4488ff",borderRadius:6,padding:"10px 16px",display:"flex",gap:12,alignItems:"center",boxShadow:"0 4px 20px rgba(0,84,227,.4)",fontFamily:"Tahoma",minWidth:260,animation:"slideIn .3s ease"}}>
                <style>{`@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
                <div style={{fontSize:32}}>{a.emoji}</div>
                <div>
                  <div style={{color:"#ffcc00",fontSize:10,fontWeight:"bold",letterSpacing:1}}>ACHIEVEMENT UNLOCKED</div>
                  <div style={{color:"#fff",fontSize:13,fontWeight:"bold",marginTop:2}}>{a.title}</div>
                  <div style={{color:"#aaa",fontSize:11,marginTop:2}}>{a.desc}</div>
                </div>
              </div>
          );
        })}
      </div>
  );
}

// ── Themes Panel ──────────────────────────────────────────────────────────────
function ThemesPanel({ current, onChange }: { current: ThemeId; onChange: (id: ThemeId) => void }) {
  return (
      <div style={{flex:1,overflow:"auto",background:"#ece9d8",padding:12,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{fontSize:12,color:"#666",marginBottom:4}}>Select a desktop theme:</div>
        {Object.values(THEMES).map(t=>(
            <div key={t.id} onClick={()=>onChange(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:current===t.id?"#dde9ff":"#fff",border:`1px solid ${current===t.id?"#0054e3":"#aca899"}`,borderRadius:4,cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:4,background:t.desktop,border:"1px solid #aca899",flexShrink:0}}/>
              <div style={{fontSize:13,fontWeight:"bold"}}>{t.emoji} {t.name}</div>
              {current===t.id&&<div style={{marginLeft:"auto",color:"#0054e3",fontWeight:"bold"}}>✓</div>}
            </div>
        ))}
      </div>
  );
}
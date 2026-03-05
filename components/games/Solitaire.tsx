"use client";
import { useState, useCallback, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════
//  TYPES
// ══════════════════════════════════════════════════════════════════════════
type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = 1|2|3|4|5|6|7|8|9|10|11|12|13;
interface Card { suit: Suit; rank: Rank; faceUp: boolean; id: string }
type ZoneId = "stock"|"waste"|`found${number}`|`tab${number}`;

interface Props {
    onAchievement?: (id: string) => void;
    onGameOver?:    (score: number) => void;
}

// ══════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════════════════
const SUITS: Suit[] = ["♠","♥","♦","♣"];
const RED:   Suit[] = ["♥","♦"];
const LABEL  = ["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const CW=66, CH=90, FDUP=20, FRUP=28;

// ══════════════════════════════════════════════════════════════════════════
//  GAME LOGIC
// ══════════════════════════════════════════════════════════════════════════
const isRed  = (s: Suit) => RED.includes(s);
const oppCol = (a: Card, b: Card) => isRed(a.suit) !== isRed(b.suit);

function shuffle<T>(a: T[]): T[] {
    const x = [...a];
    for (let i = x.length-1; i > 0; i--) { const j=~~(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; }
    return x;
}

function makeDeck(): Card[] {
    return shuffle(
        SUITS.flatMap(suit =>
            Array.from({length:13},(_,i)=>({ suit, rank:(i+1) as Rank, faceUp:false, id:`${suit}${i+1}` }))
        )
    );
}

interface GS { tab:Card[][]; stock:Card[]; waste:Card[]; found:Card[][] }

function dealDeck(): GS {
    const deck = makeDeck();
    const tab: Card[][] = Array.from({length:7},()=>[]);
    let idx=0;
    for (let c=0;c<7;c++) for (let r=0;r<=c;r++) tab[c].push({...deck[idx++], faceUp:r===c});
    return { tab, stock:deck.slice(idx).map(c=>({...c,faceUp:false})), waste:[], found:[[],[],[],[]] };
}

function cloneGS(g: GS): GS {
    return { tab:g.tab.map(c=>[...c]), stock:[...g.stock], waste:[...g.waste], found:g.found.map(p=>[...p]) };
}
function flipTop(col: Card[]): void {
    if (col.length && !col[col.length-1].faceUp)
        col[col.length-1] = {...col[col.length-1], faceUp:true};
}
function canStack(card: Card, col: Card[]): boolean {
    if (!col.length) return card.rank === 13;
    const top = col[col.length-1];
    return top.faceUp && oppCol(card, top) && card.rank === top.rank-1;
}
function canFound(card: Card, pile: Card[]): boolean {
    if (!pile.length) return card.rank === 1;
    const top = pile[pile.length-1];
    return top.suit === card.suit && card.rank === top.rank+1;
}
function canAutoComplete(g: GS): boolean {
    if (g.stock.length || g.waste.length) return false;
    return g.tab.every(col => {
        for (let i=1;i<col.length;i++) {
            if (!col[i].faceUp||!col[i-1].faceUp) return false;
            if (!oppCol(col[i],col[i-1])||col[i].rank!==col[i-1].rank-1) return false;
        }
        return true;
    });
}

// ══════════════════════════════════════════════════════════════════════════
//  CARD VISUAL COMPONENTS
// ══════════════════════════════════════════════════════════════════════════
function CardFace({ card, selected, hint, style, onPointerDown, onDoubleClick }: {
    card:Card; selected?:boolean; hint?:boolean; style?:React.CSSProperties;
    onPointerDown?:(e:React.PointerEvent)=>void; onDoubleClick?:()=>void;
}) {
    const red = isRed(card.suit);
    return (
        <div onPointerDown={onPointerDown} onDoubleClick={onDoubleClick} style={{
            position:"absolute", width:CW, height:CH, borderRadius:6,
            background: selected ? "linear-gradient(145deg,#deeeff,#b8d4ff)" : hint ? "linear-gradient(145deg,#fffce0,#fff0a0)" : "#fafafa",
            border: selected ? "2px solid #0054e3" : hint ? "2px solid #d4a000" : "1px solid #ccc",
            boxShadow: selected ? "0 0 0 3px rgba(0,84,227,.2),2px 4px 10px rgba(0,0,0,.2)" : "1px 2px 6px rgba(0,0,0,.15)",
            cursor:"grab", userSelect:"none", touchAction:"none",
            transition:"box-shadow .12s,border-color .12s",
            ...style,
        }}>
            <div style={{position:"absolute",top:3,left:5,lineHeight:1.1}}>
                <div style={{fontSize:12,fontWeight:800,color:red?"#c41":"#111",fontFamily:"Tahoma,sans-serif"}}>{LABEL[card.rank]}</div>
                <div style={{fontSize:11,color:red?"#c41":"#111"}}>{card.suit}</div>
            </div>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:26,color:red?"#c41":"#111"}}>{card.suit}</div>
            <div style={{position:"absolute",bottom:3,right:5,transform:"rotate(180deg)",lineHeight:1.1}}>
                <div style={{fontSize:12,fontWeight:800,color:red?"#c41":"#111",fontFamily:"Tahoma,sans-serif"}}>{LABEL[card.rank]}</div>
                <div style={{fontSize:11,color:red?"#c41":"#111"}}>{card.suit}</div>
            </div>
        </div>
    );
}

function CardBack({ style, onClick }: { style?:React.CSSProperties; onClick?:()=>void }) {
    return (
        <div onClick={onClick} style={{
            position:"absolute", width:CW, height:CH, borderRadius:6, cursor:"pointer", touchAction:"none",
            background:"repeating-linear-gradient(135deg,#1a4a8a 0,#1a4a8a 5px,#1e5ca8 5px,#1e5ca8 10px)",
            border:"2px solid #123a70", boxShadow:"1px 2px 6px rgba(0,0,0,.3)", ...style,
        }}>
            <div style={{position:"absolute",inset:4,borderRadius:3,border:"2px solid rgba(255,255,255,.15)"}}/>
        </div>
    );
}

function Slot({ label, color, highlight, onClick }: { label?:string; color?:string; highlight?:boolean; onClick?:()=>void }) {
    return (
        <div onClick={onClick} style={{
            width:CW, height:CH, borderRadius:6,
            border:`2px dashed ${highlight?"rgba(255,210,0,.85)":"rgba(255,255,255,.25)"}`,
            background: highlight ? "rgba(255,210,0,.07)" : "rgba(0,0,0,.1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color: color ?? "rgba(255,255,255,.28)", fontSize:24,
            transition:"all .15s", cursor: onClick ? "pointer" : "default",
        }}>{label}</div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
//  RULES MODAL
// ══════════════════════════════════════════════════════════════════════════
function RulesModal({ onClose }: { onClose:()=>void }) {
    return (
        <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#ece9d8",border:"2px solid #0054e3",borderRadius:8,width:480,maxHeight:"82vh",overflow:"auto",boxShadow:"4px 8px 28px rgba(0,0,0,.6)",fontFamily:"Tahoma,sans-serif",fontSize:12}}>
                {/* Title bar */}
                <div style={{background:"linear-gradient(to bottom,#1f86e8,#0831d9)",padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:"6px 6px 0 0",position:"sticky",top:0}}>
                    <span style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>🃏 Klondike Solitaire — How to Play</span>
                    <button onClick={onClose} style={{background:"linear-gradient(to bottom,#ff5a5a,#c00)",border:"none",borderRadius:3,width:22,height:22,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
                <div style={{padding:"16px 20px",lineHeight:1.8,color:"#222"}}>
                    {([
                        ["🎯 Goal",
                            "Move all 52 cards to the 4 foundation piles (top-right corner), one pile per suit, built from Ace up to King."],
                        ["📋 Layout",
                            <>
                                <b>Stock</b> (top-left 🂠) — click to draw a card to the Waste pile.<br/>
                                <b>Waste</b> — the top card is always available to play.<br/>
                                <b>Foundations</b> — 4 piles, one per suit, built A → 2 → … → K.<br/>
                                <b>Tableau</b> — 7 columns; only face-up cards can move.
                            </>],
                        ["♟️ Tableau Rules",
                            <>
                                Place a card on one that is <b>one rank higher</b> and <b>opposite colour</b>.<br/>
                                <span style={{color:"#060"}}>✓ Red 6 on Black 7</span>&nbsp;|&nbsp;<span style={{color:"#c00"}}>✗ Red 6 on Red 7</span><br/><br/>
                                <b>Groups:</b> drag an entire face-up sequence at once.<br/>
                                <b>Empty column:</b> only a <b>King</b> (or group led by a King) can fill it.
                            </>],
                        ["🖱️ Controls",
                            <>
                                <b>Drag & drop</b> — drag any face-up card or group to a valid target.<br/>
                                <b>Click</b> — click to select (highlighted blue), click destination to move.<br/>
                                <b>Double-click</b> — auto-send the top card to the correct foundation.<br/>
                                <b>Stock</b> — click to draw; click empty stock to recycle the waste.
                            </>],
                        ["💡 Hints & Tools",
                            <>
                                <b>Hint</b> — highlights a valid move (yellow glow) for 2 seconds.<br/>
                                <b>Auto-finish</b> — appears when the game can complete itself automatically.
                            </>],
                        ["💡 Strategy Tips",
                            <>
                                • Uncover face-down cards as quickly as possible — that's the key to winning.<br/>
                                • Don't rush Aces to the foundation if you still need them for sequences.<br/>
                                • Guard empty columns — only place a King there if it has a useful sequence below it.<br/>
                                • If the stock runs out, recycle the waste as many times as needed (no limit).
                            </>],
                        ["🏆 Scoring",
                            "Score = 10 000 − (seconds × 2) − (moves × 10), minimum 0. Win faster and in fewer moves for a higher score."],
                    ] as [string, React.ReactNode][]).map(([title, content])=>(
                        <div key={title} style={{marginBottom:14}}>
                            <div style={{fontWeight:"bold",color:"#0054e3",marginBottom:4}}>{title}</div>
                            <div style={{paddingLeft:8,color:"#333"}}>{content}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function Solitaire({ onAchievement, onGameOver }: Props) {
    const [gs,       setGs]       = useState<GS>(dealDeck);
    const [moves,    setMoves]    = useState(0);
    const [secs,     setSecs]     = useState(0);
    const [going,    setGoing]    = useState(false);
    const [won,      setWon]      = useState(false);
    const [autoFill, setAutoFill] = useState(false);
    const [showR,    setShowR]    = useState(false);
    const [hintIds,  setHintIds]  = useState<Set<string>>(new Set());
    const [clickSel, setClickSel] = useState<{zone:ZoneId;row:number;cards:Card[]}|null>(null);

    // drag state lives in refs (no re-render needed during drag)
    const dragCards   = useRef<Card[]>([]);
    const dragFrom    = useRef<ZoneId>("waste");
    const dragRow     = useRef(0);
    const dragActive  = useRef(false);
    const dragOffX    = useRef(0);
    const dragOffY    = useRef(0);
    const ghostEl     = useRef<HTMLDivElement|null>(null);
    const boardRef    = useRef<HTMLDivElement>(null);

    // stable refs to avoid stale closures in pointer handlers
    const gsRef    = useRef<GS>(gs);       gsRef.current    = gs;
    const goingRef = useRef(going);        goingRef.current = going;
    const wonRef   = useRef(won);          wonRef.current   = won;

    // achievement tracking
    const winsRef  = useRef(0);
    const achieved = useRef<Set<string>>(new Set());
    const movesRef = useRef(0);
    const secsRef  = useRef(0);

    const trigger = useCallback((id:string)=>{
        if (achieved.current.has(id)) return;
        achieved.current.add(id); onAchievement?.(id);
    },[onAchievement]);

    // ── Ghost element (created once in DOM) ──────────────────────
    useEffect(()=>{
        const el = document.createElement("div");
        el.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;z-index:1000;display:none;";
        document.body.appendChild(el);
        ghostEl.current = el;
        return () => { document.body.removeChild(el); };
    },[]);

    // ── Timer ─────────────────────────────────────────────────────
    useEffect(()=>{
        if (!going||won) return;
        const id = setInterval(()=>setSecs(s=>{secsRef.current=s+1;return s+1;}),1000);
        return ()=>clearInterval(id);
    },[going,won]);

    // ── Auto-complete engine ──────────────────────────────────────
    useEffect(()=>{
        if (!autoFill||won) return;
        const id = setInterval(()=>{
            setGs(prev=>{
                const next = cloneGS(prev);
                let moved = false;
                // try tableau tops then waste top
                const srcs: [Card[],number][] = [
                    ...next.tab.map((col,i):[Card[],number]=>[col,i]),
                    [next.waste, 7],
                ];
                outer: for (const [src,si] of srcs) {
                    if (!src.length) continue;
                    const card = src[src.length-1];
                    if (!card.faceUp) continue;
                    for (let fi=0;fi<4;fi++) {
                        if (canFound(card,next.found[fi])) {
                            src.pop();
                            if (si<7) flipTop(next.tab[si]);
                            next.found[fi].push({...card,faceUp:true});
                            moved=true; break outer;
                        }
                    }
                }
                if (!moved) setAutoFill(false);
                return next;
            });
        },80);
        return ()=>clearInterval(id);
    },[autoFill,won]);

    // ── Win detection ─────────────────────────────────────────────
    useEffect(()=>{
        if (gs.found.every(p=>p.length===13)&&!won) {
            setWon(true); setAutoFill(false);
            winsRef.current++;
            const score = Math.max(0,10000-secsRef.current*2-movesRef.current*10);
            onGameOver?.(score);
            trigger("sl_first");
            if (secsRef.current<180) trigger("sl_fast");
            if (movesRef.current<50) trigger("sl_under50");
            if (winsRef.current>=10) trigger("sl_10wins");
        }
    },[gs,won,onGameOver,trigger]);

    // ── New game ──────────────────────────────────────────────────
    const newGame = useCallback(()=>{
        setGs(dealDeck()); setMoves(0); movesRef.current=0;
        setSecs(0); secsRef.current=0; setGoing(false); setWon(false);
        setAutoFill(false); setClickSel(null); setHintIds(new Set());
    },[]);

    // ── Apply move (shared logic) ─────────────────────────────────
    const applyMove = useCallback((next: GS)=>{
        if (!goingRef.current) setGoing(true);
        movesRef.current++; setMoves(m=>m+1);
        setGs(next); setClickSel(null); setHintIds(new Set());
        if (canAutoComplete(next)) setAutoFill(true);
    },[]);

    // ── Stock click ───────────────────────────────────────────────
    const stockClick = useCallback(()=>{
        const next = cloneGS(gsRef.current);
        if (!next.stock.length) {
            next.stock = [...next.waste].reverse().map(c=>({...c,faceUp:false}));
            next.waste = [];
        } else {
            const c = next.stock.pop()!;
            next.waste.push({...c,faceUp:true});
        }
        if (!goingRef.current) setGoing(true);
        setGs(next); setClickSel(null);
    },[]);

    // ── Core move engine ──────────────────────────────────────────
    const moveCards = useCallback((cards:Card[], fromZone:ZoneId, fromRow:number, toZone:ZoneId): boolean=>{
        if (fromZone===toZone) return false;
        const g = gsRef.current;
        const next = cloneGS(g);

        // remove from source
        if (fromZone==="waste") {
            next.waste.pop();
        } else if (fromZone.startsWith("found")) {
            next.found[+fromZone.slice(5)].pop();
        } else {
            const ci = +fromZone.slice(3);
            next.tab[ci].splice(fromRow); // removes fromRow and everything after
            flipTop(next.tab[ci]);
        }

        // place at destination
        if (toZone.startsWith("found")) {
            if (cards.length!==1) return false;
            const fi = +toZone.slice(5);
            if (!canFound(cards[0], next.found[fi])) return false;
            next.found[fi].push({...cards[0], faceUp:true});
        } else {
            const ci = +toZone.slice(3);
            if (!canStack(cards[0], next.tab[ci])) return false;
            next.tab[ci].push(...cards.map(c=>({...c,faceUp:true})));
        }

        applyMove(next); return true;
    },[applyMove]);

    // ── Auto-send to foundation (double-click) ────────────────────
    const sendToFound = useCallback((card:Card, zone:ZoneId, row:number): boolean=>{
        const g = gsRef.current;
        for (let fi=0;fi<4;fi++) {
            if (!canFound(card, g.found[fi])) continue;
            const next = cloneGS(g);
            if (zone==="waste") { next.waste.pop(); }
            else if (zone.startsWith("found")) { next.found[+zone.slice(5)].pop(); }
            else { const ci=+zone.slice(3); next.tab[ci].splice(row); flipTop(next.tab[ci]); }
            next.found[fi].push({...card,faceUp:true});
            applyMove(next); return true;
        }
        return false;
    },[applyMove]);

    // ── Hint ──────────────────────────────────────────────────────
    const showHint = useCallback(()=>{
        const g = gsRef.current;
        // 1. top card of any col or waste → foundation
        const tops = [
            ...g.tab.map((col,ci)=>col.length?{card:col[col.length-1],zone:`tab${ci}` as ZoneId}:null),
            g.waste.length?{card:g.waste[g.waste.length-1],zone:"waste" as ZoneId}:null,
        ].filter(Boolean) as {card:Card;zone:ZoneId}[];
        for (const {card} of tops) {
            for (let fi=0;fi<4;fi++) {
                if (canFound(card,g.found[fi])) { flash(new Set([card.id])); return; }
            }
        }
        // 2. any face-up sequence or waste top → tableau
        const srcs = [
            ...g.tab.map((col,ci)=>{
                const fu = col.findIndex(c=>c.faceUp);
                return fu>=0 ? {cards:col.slice(fu), zone:`tab${ci}` as ZoneId} : null;
            }),
            g.waste.length?{cards:[g.waste[g.waste.length-1]],zone:"waste" as ZoneId}:null,
        ].filter(Boolean) as {cards:Card[];zone:ZoneId}[];
        for (const src of srcs) {
            for (let ci=0;ci<7;ci++) {
                const tz = `tab${ci}` as ZoneId;
                if (src.zone===tz) continue;
                if (canStack(src.cards[0],g.tab[ci])) {
                    flash(new Set(src.cards.map(c=>c.id))); return;
                }
            }
        }
        flash(new Set(["__none__"]));
    },[]);

    const flash = (ids: Set<string>) => {
        setHintIds(ids);
        setTimeout(()=>setHintIds(new Set()),2000);
    };

    // ── Click-to-move ─────────────────────────────────────────────
    const cardClick = useCallback((card:Card, zone:ZoneId, row:number, group:Card[])=>{
        if (!card.faceUp) return;
        if (clickSel) {
            const ok = moveCards(clickSel.cards, clickSel.zone, clickSel.row, zone);
            if (!ok) setClickSel({zone,row,cards:group}); // reselect
            return;
        }
        setClickSel({zone,row,cards:group});
    },[clickSel,moveCards]);

    const zoneClick = useCallback((zone:ZoneId)=>{
        if (clickSel) moveCards(clickSel.cards, clickSel.zone, clickSel.row, zone);
    },[clickSel,moveCards]);

    // ══════════════════════════════════════════════════════════════
    //  DRAG & DROP — pointer events on the board container
    // ══════════════════════════════════════════════════════════════
    const renderGhost = useCallback(()=>{
        const el = ghostEl.current; if (!el) return;
        el.innerHTML = "";
        dragCards.current.forEach((card,i)=>{
            const d = document.createElement("div");
            const red = isRed(card.suit);
            d.style.cssText = [
                `position:absolute`,`width:${CW}px`,`height:${CH}px`,`top:${i*FRUP}px`,`left:0`,
                `border-radius:6px`,`background:#f8f8f8`,`border:2px solid #0054e3`,
                `box-shadow:4px 10px 24px rgba(0,0,0,.45)`,`opacity:.9`,`transform:rotate(2.5deg)`,
            ].join(";");
            d.innerHTML = `
        <div style="position:absolute;top:3px;left:5px;line-height:1.1;">
          <div style="font-size:12px;font-weight:800;color:${red?"#c41":"#111"};font-family:Tahoma">${LABEL[card.rank]}</div>
          <div style="font-size:11px;color:${red?"#c41":"#111"}">${card.suit}</div>
        </div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:26px;color:${red?"#c41":"#111"}">${card.suit}</div>
      `;
            el.appendChild(d);
        });
    },[]);

    const startDrag = useCallback((e:React.PointerEvent, cards:Card[], zone:ZoneId, row:number)=>{
        if (!cards[0].faceUp) return;
        e.preventDefault();
        dragCards.current  = cards;
        dragFrom.current   = zone;
        dragRow.current    = row;
        dragActive.current = true;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffX.current = e.clientX - rect.left;
        dragOffY.current = e.clientY - rect.top;
        const el = ghostEl.current; if (!el) return;
        renderGhost();
        el.style.display = "block";
        el.style.left    = `${e.clientX-dragOffX.current}px`;
        el.style.top     = `${e.clientY-dragOffY.current}px`;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },[renderGhost]);

    const onPointerMove = useCallback((e:React.PointerEvent)=>{
        if (!dragActive.current) return;
        const el = ghostEl.current; if (!el) return;
        el.style.left = `${e.clientX-dragOffX.current}px`;
        el.style.top  = `${e.clientY-dragOffY.current}px`;
    },[]);

    const onPointerUp = useCallback((e:React.PointerEvent)=>{
        if (!dragActive.current) return;
        dragActive.current = false;
        const el = ghostEl.current;
        if (el) el.style.display = "none";
        // briefly hide ghost so elementFromPoint can see the drop target
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const zoneEl = (under as HTMLElement|null)?.closest("[data-zone]") as HTMLElement|null;
        const toZone = zoneEl?.dataset.zone as ZoneId|undefined;
        if (toZone) moveCards(dragCards.current, dragFrom.current, dragRow.current, toZone);
    },[moveCards]);

    // ══════════════════════════════════════════════════════════════
    //  RENDER HELPERS
    // ══════════════════════════════════════════════════════════════
    const selCard  = (id:string) => clickSel?.cards.some(c=>c.id===id) ?? false;
    const hintCard = (id:string) => hintIds.has(id);
    const fmt = (s:number) => `${String(~~(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
    const toolBtn: React.CSSProperties = {
        padding:"3px 11px",fontSize:11,fontFamily:"Tahoma,sans-serif",
        background:"#d4d0c8",border:"2px outset #fff",cursor:"pointer",borderRadius:2,flexShrink:0,
    };

    // ══════════════════════════════════════════════════════════════
    //  RENDER
    // ══════════════════════════════════════════════════════════════
    return (
        <div
            ref={boardRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
                display:"flex",flexDirection:"column",gap:8,padding:10,
                background:"linear-gradient(160deg,#1a7040,#145530)",
                flex:1,overflow:"auto",userSelect:"none",position:"relative",minWidth:530,
            }}
        >
            {/* ── Toolbar ─────────────────────────────────────────── */}
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,flexWrap:"wrap"}}>
                <button onClick={newGame}            style={toolBtn}>🔄 New</button>
                <button onClick={showHint}           style={toolBtn}>💡 Hint</button>
                <button onClick={()=>setShowR(true)} style={toolBtn}>❓ Rules</button>
                {canAutoComplete(gs)&&!won&&!autoFill&&(
                    <button onClick={()=>setAutoFill(true)} style={{...toolBtn,background:"#c8e6c9",fontWeight:"bold",color:"#2a6a2a"}}>✅ Auto-finish</button>
                )}
                <span style={{fontSize:11,color:"rgba(255,255,255,.88)"}}>Moves: <b>{moves}</b></span>
                <span style={{fontSize:11,color:"rgba(255,255,255,.88)"}}>⏱ <b>{fmt(secs)}</b></span>
                {hintIds.has("__none__")&&(
                    <span style={{fontSize:11,color:"#ffc",background:"rgba(0,0,0,.35)",padding:"2px 7px",borderRadius:3}}>No moves found</span>
                )}
            </div>

            {/* ── Top row: stock / waste / gap / foundations ──────── */}
            <div style={{display:"flex",gap:8,alignItems:"flex-start",flexShrink:0}}>

                {/* Stock */}
                <div data-zone="stock" style={{position:"relative",width:CW,height:CH,flexShrink:0}}>
                    {gs.stock.length > 0
                        ? <CardBack onClick={stockClick} style={{top:0,left:0}}/>
                        : <Slot label="↺" onClick={stockClick}/>
                    }
                    {gs.stock.length>0 && (
                        <div style={{position:"absolute",bottom:-17,width:"100%",textAlign:"center",fontSize:10,color:"rgba(255,255,255,.4)"}}>{gs.stock.length}</div>
                    )}
                </div>

                {/* Waste */}
                <div data-zone="waste" style={{position:"relative",width:CW,height:CH,flexShrink:0}} onPointerUp={()=>zoneClick("waste")}>
                    {gs.waste.length===0
                        ? <Slot highlight={!!clickSel}/>
                        : <CardFace
                            card={gs.waste[gs.waste.length-1]}
                            selected={selCard(gs.waste[gs.waste.length-1].id)}
                            hint={hintCard(gs.waste[gs.waste.length-1].id)}
                            style={{top:0,left:0}}
                            onPointerDown={e=>startDrag(e,[gs.waste[gs.waste.length-1]],"waste",gs.waste.length-1)}
                            onDoubleClick={()=>sendToFound(gs.waste[gs.waste.length-1],"waste",gs.waste.length-1)}
                        />
                    }
                </div>

                <div style={{flex:1}}/>

                {/* Foundations */}
                {([0,1,2,3] as const).map(fi=>{
                    const zone  = `found${fi}` as ZoneId;
                    const pile  = gs.found[fi];
                    const suit  = ["♠","♥","♦","♣"][fi];
                    const rSuit = [false,true,true,false][fi];
                    const canDrop = !!clickSel && clickSel.cards.length===1 && canFound(clickSel.cards[0],pile);
                    return (
                        <div key={fi} data-zone={zone} style={{position:"relative",width:CW,height:CH,flexShrink:0}} onPointerUp={()=>zoneClick(zone)}>
                            {pile.length===0
                                ? <Slot label={suit} color={rSuit?"#e55":"rgba(255,255,255,.32)"} highlight={canDrop}/>
                                : <CardFace
                                    card={pile[pile.length-1]}
                                    selected={selCard(pile[pile.length-1].id)}
                                    hint={canDrop}
                                    style={{top:0,left:0}}
                                    onPointerDown={e=>startDrag(e,[pile[pile.length-1]],zone,pile.length-1)}
                                    onDoubleClick={()=>sendToFound(pile[pile.length-1],zone,pile.length-1)}
                                />
                            }
                            <div style={{position:"absolute",bottom:-17,width:"100%",textAlign:"center",fontSize:10,color:"rgba(255,255,255,.4)"}}>{pile.length}/13</div>
                        </div>
                    );
                })}
            </div>

            {/* ── Tableau ─────────────────────────────────────────── */}
            <div style={{display:"flex",gap:8,alignItems:"flex-start",flex:1,marginTop:4}}>
                {gs.tab.map((col,ci)=>{
                    const zone   = `tab${ci}` as ZoneId;
                    const nDown  = col.filter(c=>!c.faceUp).length;
                    const nUp    = col.filter(c=> c.faceUp).length;
                    const colH   = Math.max(CH, nDown*FDUP + nUp*FRUP + CH);
                    const canDrop= !!clickSel && canStack(clickSel.cards[0], col);

                    return (
                        <div
                            key={ci}
                            data-zone={zone}
                            style={{position:"relative",width:CW,flexShrink:0,height:colH}}
                            onPointerUp={()=>zoneClick(zone)}
                        >
                            {col.length===0
                                ? <Slot highlight={!!clickSel && clickSel.cards[0].rank===13}/>
                                : col.map((card,ri)=>{
                                    // compute pixel top
                                    let top=0;
                                    for (let k=0;k<ri;k++) top += col[k].faceUp ? FRUP : FDUP;

                                    if (!card.faceUp) return <CardBack key={card.id} style={{top,left:0,zIndex:ri+1}}/>;

                                    const group = col.slice(ri); // this card + all below
                                    return (
                                        <CardFace
                                            key={card.id}
                                            card={card}
                                            selected={selCard(card.id)}
                                            hint={hintCard(card.id) || (canDrop && ri===col.length-1 && col.length===0)}
                                            style={{top,left:0,zIndex:ri+1}}
                                            onPointerDown={e=>{
                                                startDrag(e, group, zone, ri);
                                            }}
                                            onDoubleClick={()=>{
                                                // only send the very bottom card of the column to foundation
                                                if (ri===col.length-1) sendToFound(card,zone,ri);
                                            }}
                                        />
                                    );
                                })
                            }
                        </div>
                    );
                })}
            </div>

            {/* ── Win overlay ─────────────────────────────────────── */}
            {won && (
                <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:150}}>
                    <div style={{background:"#ece9d8",border:"2px outset #fff",padding:"28px 42px",textAlign:"center",borderRadius:6,boxShadow:"6px 8px 28px rgba(0,0,0,.6)",fontFamily:"Tahoma,sans-serif"}}>
                        <div style={{fontSize:48,marginBottom:6}}>🎉</div>
                        <p style={{fontSize:22,fontWeight:"bold",marginBottom:6}}>You Win!</p>
                        <p style={{fontSize:13,color:"#555",marginBottom:4}}>Time: <b>{fmt(secs)}</b>&nbsp;·&nbsp;Moves: <b>{moves}</b></p>
                        <p style={{fontSize:16,color:"#0054e3",fontWeight:"bold",marginBottom:24}}>
                            Score: {Math.max(0,10000-secs*2-moves*10).toLocaleString()}
                        </p>
                        <button onClick={newGame} style={{...toolBtn,padding:"7px 28px",fontSize:13}}>▶ New Game</button>
                    </div>
                </div>
            )}

            {/* ── Rules modal ─────────────────────────────────────── */}
            {showR && <RulesModal onClose={()=>setShowR(false)}/>}
        </div>
    );
}
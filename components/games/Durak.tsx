"use client";
import { useState, useCallback, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
//  TYPES & CONSTANTS
// ══════════════════════════════════════════════════════════════
type Suit = "♠"|"♥"|"♦"|"♣";
type Rank = "6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K"|"A";
interface Card { suit: Suit; rank: Rank; id: string }
interface AttackPair { attack: Card; defense: Card | null }

const SUITS: Suit[] = ["♠","♥","♦","♣"];
const RANKS: Rank[] = ["6","7","8","9","10","J","Q","K","A"];
const RANK_VAL: Record<Rank,number> = { "6":0,"7":1,"8":2,"9":3,"10":4,"J":5,"Q":6,"K":7,"A":8 };
const RED_SUITS: Suit[] = ["♥","♦"];
const isRed = (s: Suit) => RED_SUITS.includes(s);

interface Props {
    onAchievement?: (id: string) => void;
    onGameOver?:    (score: number) => void;
}

type Phase = "idle"|"player_attack"|"player_defend"|"ai_attack"|"ai_defend"|"game_over";

interface GS {
    deck:    Card[];
    trump:   Suit;
    player:  Card[];
    ai:      Card[];
    table:   AttackPair[];
    discard: Card[];
    phase:   Phase;
    attacker: "player"|"ai";
    msg:     string;
    winner:  "player"|"ai"|"draw"|null;
    playerWins: number;
    aiWins:     number;
}

// ══════════════════════════════════════════════════════════════
//  DECK HELPERS
// ══════════════════════════════════════════════════════════════
function makeDeck(): Card[] {
    const d: Card[] = [];
    for (const suit of SUITS)
        for (const rank of RANKS)
            d.push({ suit, rank, id: `${rank}${suit}` });
    return shuffle(d);
}

function shuffle<T>(a: T[]): T[] {
    const x = [...a];
    for (let i=x.length-1; i>0; i--) { const j=~~(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; }
    return x;
}

function cardPower(card: Card, trump: Suit): number {
    return card.suit === trump ? RANK_VAL[card.rank] + 100 : RANK_VAL[card.rank];
}

function canBeat(attacker: Card, defender: Card, trump: Suit): boolean {
    if (attacker.suit === defender.suit) return RANK_VAL[defender.rank] > RANK_VAL[attacker.rank];
    if (defender.suit === trump && attacker.suit !== trump) return true;
    return false;
}

function canAttack(card: Card, table: AttackPair[]): boolean {
    if (table.length === 0) return true;
    const ranks = new Set<Rank>();
    table.forEach(p => { ranks.add(p.attack.rank); if (p.defense) ranks.add(p.defense.rank); });
    return ranks.has(card.rank);
}

function dealInitial(deck: Card[]): { player: Card[]; ai: Card[]; deck: Card[] } {
    const d = [...deck];
    const player = d.splice(0, 6);
    const ai     = d.splice(0, 6);
    return { player, ai, deck: d };
}

function refill(hand: Card[], deck: Card[], needed = 6): { hand: Card[]; deck: Card[] } {
    const d = [...deck];
    const h = [...hand];
    while (h.length < needed && d.length > 0) h.push(d.shift()!);
    return { hand: h, deck: d };
}

// Determine who attacks first: lowest trump
function firstAttacker(player: Card[], ai: Card[], trump: Suit): "player"|"ai" {
    const pTrumps = player.filter(c => c.suit === trump).sort((a,b) => RANK_VAL[a.rank]-RANK_VAL[b.rank]);
    const aTrumps = ai.filter(c => c.suit === trump).sort((a,b) => RANK_VAL[a.rank]-RANK_VAL[b.rank]);
    if (!pTrumps.length && !aTrumps.length) return Math.random() > .5 ? "player" : "ai";
    if (!pTrumps.length) return "ai";
    if (!aTrumps.length) return "player";
    return RANK_VAL[pTrumps[0].rank] <= RANK_VAL[aTrumps[0].rank] ? "player" : "ai";
}

function initGame(): GS {
    const deck = makeDeck();
    const trump = deck[deck.length-1].suit; // bottom card = trump
    const { player, ai, deck: remaining } = dealInitial(deck);
    const attacker = firstAttacker(player, ai, trump);
    return {
        deck: remaining, trump, player, ai,
        table: [], discard: [],
        phase: attacker === "player" ? "player_attack" : "ai_attack",
        attacker,
        msg: attacker === "player" ? "Ваш хід — атакуйте!" : "AI атакує...",
        winner: null, playerWins: 0, aiWins: 0,
    };
}

// ══════════════════════════════════════════════════════════════
//  AI LOGIC
// ══════════════════════════════════════════════════════════════
function aiChooseAttack(hand: Card[], table: AttackPair[], trump: Suit): Card | null {
    const legal = hand.filter(c => canAttack(c, table));
    if (!legal.length) return null;
    // prefer non-trump, lowest rank
    const nonTrump = legal.filter(c => c.suit !== trump);
    const pool = nonTrump.length ? nonTrump : legal;
    return pool.sort((a,b) => RANK_VAL[a.rank]-RANK_VAL[b.rank])[0];
}

function aiChooseDefense(attack: Card, hand: Card[], trump: Suit): Card | null {
    const beats = hand.filter(c => canBeat(attack, c, trump));
    if (!beats.length) return null;
    // play weakest card that beats
    return beats.sort((a,b) => cardPower(a,trump)-cardPower(b,trump))[0];
}

// ══════════════════════════════════════════════════════════════
//  CARD VISUAL
// ══════════════════════════════════════════════════════════════
function CardView({ card, selected, faceDown, trump, small, onClick, disabled }: {
    card: Card; selected?: boolean; faceDown?: boolean; trump?: Suit;
    small?: boolean; onClick?: () => void; disabled?: boolean;
}) {
    const red   = isRed(card.suit);
    const isTrump = trump && card.suit === trump;
    const w = small ? 46 : 62;
    const h = small ? 64 : 88;

    if (faceDown) return (
        <div style={{
            width:w, height:h, borderRadius:6, flexShrink:0,
            background:"repeating-linear-gradient(135deg,#1a4a8a 0,#1a4a8a 5px,#1e5ca8 5px,#1e5ca8 10px)",
            border:"2px solid #123a70", boxShadow:"1px 2px 5px rgba(0,0,0,.3)",
        }}/>
    );

    return (
        <div onClick={disabled ? undefined : onClick} style={{
            width:w, height:h, borderRadius:6, flexShrink:0, position:"relative",
            background: selected ? "linear-gradient(145deg,#deeeff,#b8d4ff)"
                : isTrump ? "linear-gradient(145deg,#fffde8,#fff8c0)"
                    : "#fafafa",
            border: selected ? "2px solid #0054e3"
                : isTrump ? "2px solid #d4a000"
                    : "1px solid #ccc",
            boxShadow: selected ? "0 0 0 3px rgba(0,84,227,.2),2px 4px 10px rgba(0,0,0,.2)" : "1px 2px 5px rgba(0,0,0,.15)",
            cursor: onClick && !disabled ? "pointer" : "default",
            userSelect:"none",
            transform: selected ? "translateY(-8px)" : undefined,
            transition:"transform .15s, box-shadow .15s",
            opacity: disabled ? .55 : 1,
        }}>
            <div style={{position:"absolute",top:2,left:4,lineHeight:1.1}}>
                <div style={{fontSize:small?10:12,fontWeight:800,color:red?"#c41":"#111",fontFamily:"Tahoma,sans-serif"}}>{card.rank}</div>
                <div style={{fontSize:small?10:11,color:red?"#c41":"#111"}}>{card.suit}</div>
            </div>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:small?18:24,color:red?"#c41":"#111"}}>{card.suit}</div>
            {isTrump && <div style={{position:"absolute",bottom:1,right:2,fontSize:7,color:"#d4a000",fontWeight:"bold"}}>★</div>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
//  RULES MODAL
// ══════════════════════════════════════════════════════════════
function RulesModal({ onClose, trump }: { onClose:()=>void; trump?: Suit }) {
    return (
        <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#ece9d8",border:"2px solid #8b0000",borderRadius:8,width:480,maxHeight:"82vh",overflow:"auto",boxShadow:"4px 8px 28px rgba(0,0,0,.6)",fontFamily:"Tahoma,sans-serif",fontSize:12}}>
                <div style={{background:"linear-gradient(to bottom,#8b0000,#5a0000)",padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:"6px 6px 0 0",position:"sticky",top:0}}>
                    <span style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>🃏 Дурак — Правила гри</span>
                    <button onClick={onClose} style={{background:"linear-gradient(to bottom,#ff5a5a,#c00)",border:"none",borderRadius:3,width:22,height:22,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:"bold"}}>✕</button>
                </div>
                <div style={{padding:"16px 20px",lineHeight:1.8,color:"#222"}}>
                    {([
                        ["🎯 Мета гри", "Позбутися всіх карт. Хто залишився з картами в кінці — той Дурак!"],
                        ["🃏 Колода", "36 карт (від 6 до Туза). Остання карта колоди визначає козир (trump). Козирна карта залишається відкритою під колодою."],
                        ["⚔️ Атака", <>
                            Гравець-атакуючий кладе карту на стіл. Можна підкидати карти тих самих номіналів що вже є на столі.<br/>
                            <b>Максимум 6 карт</b> в одній атаці (або скільки карт у захищального).
                        </>],
                        ["🛡️ Захист", <>
                            Захищальний б'є кожну атакуючу карту:<br/>
                            • Старшою картою <b>тієї ж масті</b><br/>
                            • <b>Будь-яким козирем</b> (якщо атака не козир)<br/>
                            Якщо не може побити — бере всі карти зі столу.
                        </>],
                        ["🏆 Козир ★", "Козирні карти позначені ★ і виділені жовтим. Козир б'є будь-яку некозирну карту, але програє старшому козирю."],
                        ["📤 Добір карт", "Після кожного раунду гравці добирають карти з колоди до 6 (спочатку атакуючий)."],
                        ["✅ Успішний захист", "Якщо захистився — всі карти йдуть у відбій, захищальний стає атакуючим."],
                        ["❌ Взяв карти", "Якщо взяв — карти переходять до нього, атакуючий ходить знову."],
                        ["🎮 Керування", <>
                            <b>Атака:</b> натисни на карту в руці → вона виділиться → натисни знову або кнопку «Атакувати».<br/>
                            <b>Захист:</b> натисни карту в руці → потім натисни на атакуючу карту на столі.<br/>
                            <b>Взяти/Пас:</b> кнопки внизу.
                        </>],
                    ] as [string, React.ReactNode][]).map(([t,c])=>(
                        <div key={t as string} style={{marginBottom:14}}>
                            <div style={{fontWeight:"bold",color:"#8b0000",marginBottom:4}}>{t}</div>
                            <div style={{paddingLeft:8,color:"#333"}}>{c}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Durak({ onAchievement, onGameOver }: Props) {
    const [gs,       setGs]      = useState<GS>(initGame);
    const [selCard,  setSelCard]  = useState<Card|null>(null);
    const [showR,    setShowR]    = useState(false);
    const [aiThink,  setAiThink]  = useState(false);
    const achieved = useRef<Set<string>>(new Set());

    const trigger = useCallback((id:string) => {
        if (achieved.current.has(id)) return;
        achieved.current.add(id); onAchievement?.(id);
    },[onAchievement]);

    // ── AI turn handler ─────────────────────────────────────────
    const runAiTurn = useCallback((state: GS) => {
        setAiThink(true);
        setTimeout(() => {
            setGs(prev => {
                const g = { ...prev, ai:[...prev.ai], player:[...prev.player], table:[...prev.table], deck:[...prev.deck], discard:[...prev.discard] };

                if (g.phase === "ai_attack") {
                    // AI attacks
                    const undefended = g.table.filter(p => !p.defense).length;
                    const maxAttack  = Math.min(6, g.player.length) - undefended;

                    if (maxAttack <= 0 || g.table.length >= 6) {
                        // end attack — player defends or AI passes
                        if (g.table.every(p => p.defense)) {
                            // all defended — discard and switch
                            g.discard.push(...g.table.flatMap(p => [p.attack, p.defense!]));
                            g.table = [];
                            const ra = refill(g.ai, g.deck);
                            const rp = refill(g.player, ra.deck);
                            g.ai = ra.hand; g.player = rp.hand; g.deck = rp.deck;
                            g.attacker = "ai";
                            g.phase = "ai_attack";
                            g.msg = "AI ходить знову";
                        } else {
                            g.phase = "player_defend";
                            g.msg = "Відбийтесь або візьміть карти";
                        }
                        return checkGameOver(g, trigger, onGameOver);
                    }

                    const card = aiChooseAttack(g.ai, g.table, g.trump);
                    if (!card) {
                        // AI passes — if table clear it means end of round
                        if (g.table.length === 0) {
                            g.phase = "player_attack";
                            g.attacker = "player";
                            g.msg = "Ваш хід — атакуйте!";
                        } else {
                            g.phase = "player_defend";
                            g.msg = "Відбийтесь або візьміть карти";
                        }
                        return checkGameOver(g, trigger, onGameOver);
                    }
                    g.ai = g.ai.filter(c => c.id !== card.id);
                    g.table = [...g.table, { attack: card, defense: null }];
                    // if player has cards to defend, switch phase
                    if (g.table.length >= 6 || g.table.length >= g.player.length) {
                        g.phase = "player_defend";
                        g.msg = "Відбийтесь або візьміть карти";
                    } else {
                        // AI may continue attacking — check again after delay
                        g.phase = "ai_attack";
                        g.msg = "AI підкидає...";
                    }
                    return checkGameOver(g, trigger, onGameOver);
                }

                if (g.phase === "ai_defend") {
                    // Try to defend each undefended card
                    let tookAll = false;
                    const newTable = g.table.map(pair => {
                        if (pair.defense) return pair;
                        const def = aiChooseDefense(pair.attack, g.ai, g.trump);
                        if (!def) return pair; // can't beat
                        g.ai = g.ai.filter(c => c.id !== def.id);
                        return { attack: pair.attack, defense: def };
                    });
                    g.table = newTable;

                    const unbeaten = g.table.filter(p => !p.defense);
                    if (unbeaten.length > 0) {
                        // AI can't beat all — takes cards
                        g.ai = [...g.ai, ...g.table.flatMap(p => [p.attack, ...(p.defense ? [p.defense] : [])])];
                        g.table = [];
                        tookAll = true;
                        const r = refill(g.player, g.deck);
                        g.player = r.hand; g.deck = r.deck;
                        g.attacker = "player";
                        g.phase = "player_attack";
                        g.msg = "AI взяв карти. Ваш хід!";
                    } else {
                        // All defended — player can add more or pass
                        g.phase = "player_attack"; // player gets to throw in more
                        g.msg = "AI відбився! Підкидайте або передайте хід";
                        // mark that we're in "throw-in" mode after defense
                        g.attacker = "ai"; // keep attacker as ai so player throws in
                    }
                    if (!tookAll && g.table.length === 0) {
                        // successful defense complete
                        const ra = refill(g.player, g.deck);
                        const rp = refill(g.ai, ra.deck);
                        g.player = ra.hand; g.ai = rp.hand; g.deck = rp.deck;
                    }
                    return checkGameOver(g, trigger, onGameOver);
                }

                return g;
            });
            setAiThink(false);
        }, 900);
    }, [trigger, onGameOver]);

    // Watch for AI turns
    useEffect(() => {
        if ((gs.phase === "ai_attack" || gs.phase === "ai_defend") && !aiThink) {
            runAiTurn(gs);
        }
    }, [gs.phase, aiThink, runAiTurn, gs]);

    // ── Player attacks ──────────────────────────────────────────
    const playerAttack = useCallback((card: Card) => {
        setGs(prev => {
            if (prev.phase !== "player_attack") return prev;
            if (!canAttack(card, prev.table)) return { ...prev, msg:"Цю карту не можна підкинути!" };
            if (prev.table.length >= 6 || prev.table.length >= prev.ai.length) return { ...prev, msg:"Більше не можна підкидати" };
            const g = { ...prev, player: prev.player.filter(c=>c.id!==card.id), table:[...prev.table, {attack:card,defense:null}] };
            g.msg = "AI відбивається...";
            g.phase = "ai_defend";
            return checkGameOver(g, trigger, onGameOver);
        });
        setSelCard(null);
    },[trigger, onGameOver]);

    // ── Player defends ──────────────────────────────────────────
    const playerDefend = useCallback((defCard: Card, atkIdx: number) => {
        setGs(prev => {
            if (prev.phase !== "player_defend") return prev;
            const target = prev.table[atkIdx];
            if (!target || target.defense) return prev;
            if (!canBeat(target.attack, defCard, prev.trump)) return { ...prev, msg:"Ця карта не б'є!" };
            const newTable = prev.table.map((p,i) => i===atkIdx ? { ...p, defense:defCard } : p);
            const g = { ...prev, player: prev.player.filter(c=>c.id!==defCard.id), table:newTable };
            // Check if all defended
            if (newTable.every(p=>p.defense)) {
                g.msg = "Всі відбиті! Підкидайте або передайте хід";
                g.phase = "player_defend"; // stays so player can see, or pass
            } else {
                g.msg = "Продовжуйте відбиватись або візьміть карти";
            }
            return checkGameOver(g, trigger, onGameOver);
        });
        setSelCard(null);
    },[trigger, onGameOver]);

    // ── Player takes cards ──────────────────────────────────────
    const playerTake = useCallback(() => {
        setGs(prev => {
            if (prev.phase !== "player_defend") return prev;
            const taken = prev.table.flatMap(p => [p.attack, ...(p.defense ? [p.defense] : [])]);
            const g: GS = { ...prev,
                player: [...prev.player, ...taken],
                table: [],
                attacker: "ai" as const,
                phase: "ai_attack" as Phase,
            };
            const r = refill(g.ai, g.deck);
            g.ai = r.hand; g.deck = r.deck;
            g.msg = "Ви взяли карти. AI ходить...";
            trigger("dk_take");
            return checkGameOver(g, trigger, onGameOver);
        });
        setSelCard(null);
    },[trigger, onGameOver]);

    // ── Player passes (ends attack) ─────────────────────────────
    const playerPass = useCallback(() => {
        setGs(prev => {
            if (prev.phase !== "player_attack") return prev;
            if (prev.table.length === 0) return { ...prev, msg:"Спочатку атакуйте!" };
            // End of round — discard all
            const g = { ...prev };
            g.discard = [...g.discard, ...g.table.flatMap(p => [p.attack, ...(p.defense ? [p.defense] : [])])];
            g.table = [];
            const ra = refill(g.player, g.deck);
            const rp = refill(g.ai, ra.deck);
            g.player = ra.hand; g.ai = rp.hand; g.deck = rp.deck;
            g.attacker = "ai";
            g.phase = "ai_attack";
            g.msg = "AI ходить...";
            trigger("dk_pass");
            return checkGameOver(g, trigger, onGameOver);
        });
        setSelCard(null);
    },[trigger, onGameOver]);

    // ── Player finishes defense (all cards beaten) ──────────────
    const playerDoneDefending = useCallback(() => {
        setGs(prev => {
            if (prev.phase !== "player_defend") return prev;
            if (!prev.table.every(p=>p.defense)) return { ...prev, msg:"Ще не всі карти відбиті!" };
            const g = { ...prev };
            g.discard = [...g.discard, ...g.table.flatMap(p => [p.attack, p.defense!])];
            g.table = [];
            const ra = refill(g.ai, g.deck);
            const rp = refill(g.player, ra.deck);
            g.ai = ra.hand; g.player = rp.hand; g.deck = rp.deck;
            g.attacker = "player";
            g.phase = "player_attack";
            g.msg = "Ви відбились! Ваш хід!";
            trigger("dk_defend");
            return checkGameOver(g, trigger, onGameOver);
        });
        setSelCard(null);
    },[trigger, onGameOver]);

    // ── Card click handler ──────────────────────────────────────
    const handleCardClick = (card: Card) => {
        if (gs.phase === "player_attack") {
            if (selCard?.id === card.id) { playerAttack(card); return; }
            setSelCard(card);
        }
        if (gs.phase === "player_defend") {
            if (!selCard) { setSelCard(card); return; }
            if (selCard.id === card.id) { setSelCard(null); return; }
            setSelCard(card);
        }
    };

    const handleTableClick = (idx: number) => {
        if (gs.phase === "player_defend" && selCard) {
            playerDefend(selCard, idx);
        }
    };

    const newGame = () => { setGs(initGame()); setSelCard(null); };

    // ── Render ──────────────────────────────────────────────────
    const { trump, deck, player, ai, table, phase, msg, winner, playerWins, aiWins } = gs;

    const btn = (label:string, onClick:()=>void, color="#d4d0c8", disabled=false): React.CSSProperties => ({});
    const toolBtn = (col="#d4d0c8"): React.CSSProperties => ({
        padding:"4px 12px", fontSize:11, fontFamily:"Tahoma,sans-serif",
        background:col, border:"2px outset #fff", cursor:"pointer", borderRadius:2,
        flexShrink:0, fontWeight:"bold",
    });

    const trumpCard = deck.length > 0 ? { suit: trump, rank: "?" as Rank, id:"trump-indicator" } : null;

    return (
        <div style={{ display:"flex", flexDirection:"column", background:"#1a5c2e", flex:1, overflow:"hidden", fontFamily:"Tahoma,sans-serif", userSelect:"none", position:"relative", minHeight:480 }}>

            {/* ── Header ── */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", background:"rgba(0,0,0,.25)", flexShrink:0, flexWrap:"wrap" }}>
                <button onClick={newGame}           style={toolBtn()}>🔄 Нова гра</button>
                <button onClick={()=>setShowR(true)} style={toolBtn()}>❓ Правила</button>
                <div style={{ marginLeft:4, display:"flex", gap:12 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.9)" }}>Ви: <b style={{color:"#9f9"}}>{playerWins}</b></span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.9)" }}>AI: <b style={{color:"#f99"}}>{aiWins}</b></span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.9)" }}>Колода: <b>{deck.length}</b></span>
                </div>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, color:"#ffd", background:"rgba(0,0,0,.3)", padding:"2px 8px", borderRadius:3 }}>
            Козир: <b style={{fontSize:14}}>{trump}</b> {isRed(trump)?"🔴":"⚫"}
          </span>
                </div>
            </div>

            {/* ── AI hand ── */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"8px 10px 4px", gap:4, flexShrink:0, minHeight:80 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.7)", marginRight:6, flexShrink:0 }}>AI ({ai.length})</div>
                <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"center" }}>
                    {ai.map((c,i) => <CardView key={c.id} card={c} faceDown small />)}
                </div>
                {aiThink && <div style={{ fontSize:11, color:"#ffd", marginLeft:6, animation:"pulse 1s infinite" }}>думає...</div>}
            </div>

            {/* ── Table ── */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"4px 10px", gap:8 }}>

                {/* Status message */}
                <div style={{ fontSize:12, color:"#ffd", background:"rgba(0,0,0,.35)", padding:"3px 12px", borderRadius:4, textAlign:"center", maxWidth:400 }}>
                    {msg}
                </div>

                {/* Table cards */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", minHeight:100, alignItems:"center", padding:"8px 12px", background:"rgba(0,0,0,.15)", borderRadius:8, width:"100%", maxWidth:520 }}>
                    {table.length === 0 ? (
                        <span style={{ color:"rgba(255,255,255,.3)", fontSize:12 }}>Стіл порожній</span>
                    ) : table.map((pair, i) => (
                        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                            {/* Attack card */}
                            <div onClick={() => handleTableClick(i)} style={{ cursor: phase==="player_defend" && selCard && !pair.defense ? "pointer" : "default" }}>
                                <CardView card={pair.attack} trump={trump}
                                          selected={phase==="player_defend" && selCard!=null && !pair.defense}
                                />
                            </div>
                            {/* Defense card */}
                            {pair.defense
                                ? <CardView card={pair.defense} trump={trump} />
                                : <div style={{ width:62, height:20, border:"1px dashed rgba(255,255,255,.2)", borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    <span style={{ fontSize:9, color:"rgba(255,255,255,.3)" }}>відбий</span>
                                </div>
                            }
                        </div>
                    ))}
                </div>

                {/* Deck + trump indicator */}
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {deck.length > 0 && (
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <div style={{ position:"relative", width:46, height:64 }}>
                                <CardView card={{ suit:trump, rank:"6", id:"back" }} faceDown small />
                                {/* trump card peeking under */}
                                <div style={{ position:"absolute", top:4, left:4, transform:"rotate(90deg)", transformOrigin:"0 0", opacity:.9 }}>
                                    <CardView card={{ suit:trump, rank:"A", id:"trump-peek" }} small trump={trump} />
                                </div>
                            </div>
                            <span style={{ fontSize:10, color:"rgba(255,255,255,.5)" }}>{deck.length}</span>
                        </div>
                    )}
                    <div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>Відбій: {gs.discard.length}</div>
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div style={{ display:"flex", justifyContent:"center", gap:8, padding:"4px 10px", flexShrink:0, flexWrap:"wrap" }}>
                {phase === "player_attack" && table.length > 0 && (
                    <button onClick={playerPass} style={{ ...toolBtn("#c8e6c9"), color:"#1b5e20" }}>✅ Передати хід</button>
                )}
                {phase === "player_defend" && table.every(p=>p.defense) && table.length > 0 && (
                    <button onClick={playerDoneDefending} style={{ ...toolBtn("#c8e6c9"), color:"#1b5e20" }}>✅ Відбився</button>
                )}
                {phase === "player_defend" && !table.every(p=>p.defense) && (
                    <button onClick={playerTake} style={{ ...toolBtn("#ffcdd2"), color:"#b71c1c" }}>📥 Взяти карти</button>
                )}
                {selCard && (
                    <div style={{ fontSize:11, color:"#ffd", padding:"4px 8px", background:"rgba(0,0,0,.3)", borderRadius:3 }}>
                        Вибрано: <b>{selCard.rank}{selCard.suit}</b>
                        {phase==="player_attack" && " — натисни ще раз щоб атакувати"}
                        {phase==="player_defend" && " — натисни на карту на столі"}
                    </div>
                )}
            </div>

            {/* ── Player hand ── */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", padding:"4px 10px 8px", gap:4, flexShrink:0, minHeight:110, background:"rgba(0,0,0,.2)" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.7)", marginRight:6, flexShrink:0, alignSelf:"center" }}>Ви ({player.length})</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"center" }}>
                    {player.sort((a,b) => {
                        if (a.suit===trump && b.suit!==trump) return 1;
                        if (b.suit===trump && a.suit!==trump) return -1;
                        if (a.suit!==b.suit) return a.suit.localeCompare(b.suit);
                        return RANK_VAL[a.rank]-RANK_VAL[b.rank];
                    }).map(card => {
                        const isLegal = phase==="player_attack" ? canAttack(card,table) : true;
                        return (
                            <CardView
                                key={card.id}
                                card={card}
                                trump={trump}
                                selected={selCard?.id === card.id}
                                disabled={phase==="player_attack" && !isLegal}
                                onClick={() => handleCardClick(card)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* ── Game over overlay ── */}
            {winner && (
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.78)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
                    <div style={{ background:"#ece9d8", border:"2px outset #fff", padding:"28px 40px", textAlign:"center", borderRadius:6, boxShadow:"6px 8px 24px rgba(0,0,0,.6)" }}>
                        <div style={{ fontSize:48, marginBottom:8 }}>
                            {winner==="player"?"🏆":winner==="ai"?"😵":"🤝"}
                        </div>
                        <p style={{ fontSize:22, fontWeight:"bold", marginBottom:6 }}>
                            {winner==="player"?"Ви виграли!":winner==="ai"?"Ви — Дурак!":"Нічия!"}
                        </p>
                        <p style={{ fontSize:13, color:"#555", marginBottom:20 }}>
                            Рахунок: Ви <b>{playerWins}</b> — <b>{aiWins}</b> AI
                        </p>
                        <button onClick={newGame} style={{ ...toolBtn(), padding:"7px 28px", fontSize:13 }}>▶ Нова гра</button>
                    </div>
                </div>
            )}

            {showR && <RulesModal onClose={()=>setShowR(false)} trump={trump} />}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
//  GAME OVER CHECK
// ══════════════════════════════════════════════════════════════
function checkGameOver(g: GS, trigger:(id:string)=>void, onGameOver?:(s:number)=>void): GS {
    if (g.deck.length > 0) return g;
    if (g.player.length === 0 && g.ai.length === 0) {
        g.winner = "draw"; g.phase = "game_over"; g.msg = "Нічия!";
        g.playerWins++; trigger("dk_draw");
        onGameOver?.(500);
        return g;
    }
    if (g.player.length === 0) {
        g.winner = "player"; g.phase = "game_over"; g.playerWins++;
        g.msg = "Ви виграли!"; trigger("dk_win"); trigger("dk_first_win");
        if (g.playerWins >= 5) trigger("dk_5wins");
        onGameOver?.(1000);
        return g;
    }
    if (g.ai.length === 0) {
        g.winner = "ai"; g.phase = "game_over"; g.aiWins++;
        g.msg = "Ви — Дурак!"; trigger("dk_lose");
        onGameOver?.(0);
        return g;
    }
    return g;
}
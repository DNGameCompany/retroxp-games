export interface Achievement {
    id: string;
    title: string;
    desc: string;
    emoji: string;
    secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    // ── Minesweeper ───────────────────────────────────────────
    { id: "ms_first",    emoji: "💣", title: "Defused!",           desc: "Win your first Minesweeper game" },
    { id: "ms_easy",     emoji: "🟢", title: "Easy Rider",          desc: "Win Minesweeper on Easy" },
    { id: "ms_medium",   emoji: "🟡", title: "Getting Serious",     desc: "Win Minesweeper on Medium" },
    { id: "ms_hard",     emoji: "🔴", title: "Bomb Whisperer",      desc: "Win Minesweeper on Hard" },
    { id: "ms_fast",     emoji: "⚡", title: "Speed Demon",         desc: "Win Easy Minesweeper in under 30 seconds" },

    // ── Snake ─────────────────────────────────────────────────
    { id: "sn_first",    emoji: "🐍", title: "First Bite",          desc: "Score 50+ points in Snake" },
    { id: "sn_100",      emoji: "🌟", title: "Century Snake",       desc: "Score 100+ points in Snake" },
    { id: "sn_500",      emoji: "🏆", title: "Anaconda",            desc: "Score 500+ points in Snake" },
    { id: "sn_1000",     emoji: "👑", title: "Legendary Snake",     desc: "Score 1000+ points in Snake", secret: true },

    // ── Tetris ────────────────────────────────────────────────
    { id: "tt_first",    emoji: "🟦", title: "Block Party",         desc: "Score 500+ in Tetris" },
    { id: "tt_tetris",   emoji: "✨", title: "TETRIS!",             desc: "Clear 4 lines at once" },
    { id: "tt_level5",   emoji: "🚀", title: "Level 5",             desc: "Reach level 5 in Tetris" },
    { id: "tt_level10",  emoji: "💎", title: "Grand Master",        desc: "Reach level 10 in Tetris", secret: true },

    // ── Pong ──────────────────────────────────────────────────
    { id: "pn_win",      emoji: "🏓", title: "Pong Master",         desc: "Beat the CPU in Pong" },
    { id: "pn_shutout",  emoji: "🥇", title: "Shutout",             desc: "Win Pong 7-0", secret: true },

    // ── Solitaire (Klondike) ──────────────────────────────────
    { id: "sl_first",    emoji: "🃏", title: "House of Cards",      desc: "Win your first Solitaire game" },
    { id: "sl_fast",     emoji: "⚡", title: "Speed Dealer",        desc: "Win Solitaire in under 3 minutes" },
    { id: "sl_under50",  emoji: "🎯", title: "Efficient",           desc: "Win Solitaire in under 50 moves" },
    { id: "sl_10wins",   emoji: "👑", title: "Solitaire King",      desc: "Win Solitaire 10 times", secret: true },

    // ── Durak ──────────────────────────────────────────────────
    { id:"dk_first_win", emoji:"🃏", title:"Не Дурак",      desc:"Виграй першу партію в Дурака" },
    { id:"dk_win",       emoji:"🏆", title:"Майстер Дурака", desc:"Виграй партію в Дурака" },
    { id:"dk_5wins",     emoji:"👑", title:"Непереможний",   desc:"Виграй 5 партій поспіль", secret:true },
    { id:"dk_defend",    emoji:"🛡️", title:"Залізний захист",desc:"Відбийся від усіх атак за раунд" },
    { id:"dk_take",      emoji:"📥", title:"Береженого...",  desc:"Взяти карти іноді мудріше" },
    { id:"dk_pass",      emoji:"✅", title:"Тактик",         desc:"Передай хід після успішної атаки" },
    { id:"dk_draw",      emoji:"🤝", title:"Мирна угода",    desc:"Зіграй внічию" },

    // ── General ───────────────────────────────────────────────
    { id: "g_all5",      emoji: "🎮", title: "Gamer",               desc: "Play all 5 classic games at least once" },
    { id: "g_allcards",  emoji: "🃏", title: "Card Shark",          desc: "Play all 4 card games at least once" },
    { id: "g_daily1",    emoji: "📅", title: "Daily Player",        desc: "Complete your first Daily Challenge" },
    { id: "g_daily7",    emoji: "🔥", title: "On Fire",             desc: "Complete Daily Challenge 7 days in a row", secret: true },
    { id: "g_streak3",   emoji: "📆", title: "Coming Back",         desc: "Visit 3 days in a row" },
    { id: "g_profile",   emoji: "👤", title: "Identity",            desc: "Set your name and avatar" },
    { id: "g_wallpaper", emoji: "🖼️", title: "Interior Designer",   desc: "Set a custom wallpaper" },
    { id: "g_theme",     emoji: "🎨", title: "Stylist",             desc: "Change the desktop theme" },
    { id: "g_night",     emoji: "🌙", title: "Night Owl",           desc: "Play between midnight and 4am", secret: true },
    { id: "g_10games",   emoji: "🎲", title: "Dedicated",           desc: "Play 10 games total" },
    { id: "g_50games",   emoji: "🏅", title: "Veteran",             desc: "Play 50 games total", secret: true },
];

export function getAchievement(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}
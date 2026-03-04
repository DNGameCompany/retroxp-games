// ── Types ─────────────────────────────────────────────────────
export interface ScoreEntry {
    name: string;
    score: number;
    date: string;
    diff?: string;
}

export interface Profile {
    name: string;
    avatar: string; // emoji
    createdAt: string;
    gamesPlayed: number;
    totalScore: number;
    totalTime: number; // seconds
    lastVisit: string;
    streak: number; // days in a row
    lastStreakDate: string;
}

export interface AchievementState {
    id: string;
    unlockedAt: string;
}

export interface DailyChallenge {
    date: string;       // YYYY-MM-DD
    game: string;
    seed: number;
    target: number;     // score to beat
    completed: boolean;
    score: number;
}

// ── Keys ──────────────────────────────────────────────────────
const KEYS = {
    profile:      "xp_profile",
    scores:       (game: string) => `xp_scores_${game}`,
    achievements: "xp_achievements",
    daily:        "xp_daily",
    theme:        "xp_theme",
    sounds:       "xp_sounds",
    wallpaper:    "xp_wallpaper",
};

// ── Helpers ───────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Profile ───────────────────────────────────────────────────
export const DEFAULT_PROFILE: Profile = {
    name: "Player", avatar: "😊", createdAt: new Date().toISOString(),
    gamesPlayed: 0, totalScore: 0, totalTime: 0,
    lastVisit: "", streak: 0, lastStreakDate: "",
};

export function getProfile(): Profile {
    return load<Profile>(KEYS.profile, DEFAULT_PROFILE);
}
export function saveProfile(p: Profile) {
    save(KEYS.profile, p);
}
export function updateProfileStats(delta: { score?: number; time?: number }) {
    const p = getProfile();
    if (delta.score) p.totalScore += delta.score;
    if (delta.time)  p.totalTime  += delta.time;
    p.gamesPlayed++;

    // Streak
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (p.lastStreakDate === yesterday) p.streak++;
    else if (p.lastStreakDate !== today) p.streak = 1;
    p.lastStreakDate = today;
    p.lastVisit = new Date().toISOString();

    save(KEYS.profile, p);
    return p;
}

// ── Leaderboard ───────────────────────────────────────────────
export function getScores(game: string): ScoreEntry[] {
    return load<ScoreEntry[]>(KEYS.scores(game), []);
}
export function addScore(game: string, entry: Omit<ScoreEntry, "date">) {
    const scores = getScores(game);
    scores.push({ ...entry, date: new Date().toLocaleDateString("en-US") });
    scores.sort((a, b) => b.score - a.score);
    save(KEYS.scores(game), scores.slice(0, 10)); // top 10
}

// ── Achievements ──────────────────────────────────────────────
export function getUnlocked(): AchievementState[] {
    return load<AchievementState[]>(KEYS.achievements, []);
}
export function unlockAchievement(id: string): boolean {
    const list = getUnlocked();
    if (list.find(a => a.id === id)) return false; // already unlocked
    list.push({ id, unlockedAt: new Date().toISOString() });
    save(KEYS.achievements, list);
    return true;
}
export function isUnlocked(id: string): boolean {
    return getUnlocked().some(a => a.id === id);
}

// ── Daily Challenge ───────────────────────────────────────────
const DAILY_GAMES = ["minesweeper", "snake", "tetris", "breakout"];
export function getDailyChallenge(): DailyChallenge {
    const today = new Date().toISOString().slice(0, 10);
    const saved = load<DailyChallenge | null>(KEYS.daily, null);
    if (saved?.date === today) return saved;

    // New challenge
    const seed = parseInt(today.replace(/-/g, "")) % 9999;
    const game = DAILY_GAMES[seed % DAILY_GAMES.length];
    const targets: Record<string, number> = { minesweeper: 1, snake: 150, tetris: 500, breakout: 300 };
    const challenge: DailyChallenge = { date: today, game, seed, target: targets[game] ?? 100, completed: false, score: 0 };
    save(KEYS.daily, challenge);
    return challenge;
}
export function completeDailyChallenge(score: number) {
    const c = getDailyChallenge();
    c.completed = true; c.score = score;
    save(KEYS.daily, c);
}

// ── Theme ─────────────────────────────────────────────────────
export type ThemeId = "luna" | "dark" | "classic" | "zune" | "royale";
export function getTheme(): ThemeId { return load<ThemeId>(KEYS.theme, "luna"); }
export function saveTheme(t: ThemeId) { save(KEYS.theme, t); }

// ── Sounds ────────────────────────────────────────────────────
export function getSoundsEnabled(): boolean { return load<boolean>(KEYS.sounds, true); }
export function saveSoundsEnabled(v: boolean) { save(KEYS.sounds, v); }
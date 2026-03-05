export interface Game {
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  longDescription: string;
  emoji: string;
  category: "puzzle" | "arcade" | "card" | "strategy";
  keywords: string[];
  available: boolean;
}

export const GAMES: Game[] = [
  // ── Arcade / Puzzle ────────────────────────────────────────────────────────
  {
    slug: "minesweeper",
    title: "Minesweeper",
    titleEn: "Minesweeper",
    description: "Classic Windows XP Minesweeper. Find all the mines!",
    longDescription: "Classic Minesweeper from Windows XP. Reveal cells, place flags and find all mines without triggering them. Three difficulty levels: Easy 9×9 (10 mines), Medium 16×16 (40 mines), Hard 16×30 (99 mines). Left click to reveal, right click to flag.",
    emoji: "💣",
    category: "puzzle",
    keywords: ["minesweeper", "mines", "retro", "windows xp", "minesweeper online free"],
    available: true,
  },
  {
    slug: "snake",
    title: "Snake",
    titleEn: "Snake",
    description: "Legendary neon Snake game in your browser. Eat, grow, survive!",
    longDescription: "The legendary Snake arcade game in neon style. Control the snake with arrow keys or WASD, eat apples and avoid hitting walls or your own tail. Each apple is worth 10 points. The longer you grow, the harder it gets!",
    emoji: "🐍",
    category: "arcade",
    keywords: ["snake", "snake game", "retro games", "snake online"],
    available: true,
  },
  {
    slug: "tetris",
    title: "Tetris",
    titleEn: "Tetris",
    description: "Classic Tetris — stack blocks and clear lines!",
    longDescription: "The iconic Tetris block-stacking game. Rotate and place falling tetrominoes to clear lines and rack up points. Speed increases as you level up. How far can you go?",
    emoji: "🟦",
    category: "arcade",
    keywords: ["tetris", "tetris online", "block game", "classic tetris"],
    available: true,
  },
  {
    slug: "breakout",
    title: "Breakout",
    titleEn: "Breakout",
    description: "Smash all the bricks with your ball and paddle!",
    longDescription: "Classic Breakout arcade game. Control your paddle to keep the ball bouncing and destroy all the bricks. Don't let the ball fall! Clear each level to advance.",
    emoji: "🧱",
    category: "arcade",
    keywords: ["breakout", "brick breaker", "arcade", "retro breakout"],
    available: true,
  },
  {
    slug: "pong",
    title: "Pong",
    titleEn: "Pong",
    description: "The original arcade game. Beat the CPU at Pong!",
    longDescription: "Pong — the game that started it all. Play against the CPU in this faithful recreation of the 1972 classic. First to 7 points wins. Can you achieve a shutout?",
    emoji: "🏓",
    category: "arcade",
    keywords: ["pong", "pong online", "classic arcade", "retro pong"],
    available: true,
  },
  {
    slug: "pinball",
    title: "Pinball",
    titleEn: "Space Pinball",
    description: "Legendary Space Cadet Pinball from Windows XP.",
    longDescription: "Space Cadet Pinball — the legendary game bundled with Windows XP. Coming soon to RetroXP Games!",
    emoji: "🚀",
    category: "arcade",
    keywords: ["pinball", "space cadet", "windows xp pinball"],
    available: true, // keep as per your existing project
  },

  // ── Card games ─────────────────────────────────────────────────────────────
  {
    slug: "solitaire",
    title: "Solitaire",
    titleEn: "Klondike Solitaire",
    description: "Klondike Solitaire — the classic card game from Windows XP.",
    longDescription: "Klondike Solitaire — the world's most popular card game, famous from Windows 95/XP. Goal: sort all 52 cards by suit from Ace to King into 4 foundation piles. Move cards between 7 tableau columns, alternating red and black suits in descending order. Click to select, click again to move. Double-click to auto-send to foundation.",
    emoji: "🃏",
    category: "card",
    keywords: ["solitaire", "klondike solitaire", "card game", "solitaire online free", "windows xp solitaire"],
    available: true,
  },
];

export function getGame(slug: string): Game | undefined {
  return GAMES.find(g => g.slug === slug);
}
export function getAvailableGames(): Game[] {
  return GAMES.filter(g => g.available);
}
export function getGamesByCategory(cat: Game["category"]): Game[] {
  return GAMES.filter(g => g.category === cat && g.available);
}
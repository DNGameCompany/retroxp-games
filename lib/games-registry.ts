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
  {
    slug: "minesweeper",
    title: "Minesweeper",
    titleEn: "Minesweeper",
    description: "Classic Windows XP Minesweeper. Find all the mines!",
    longDescription: "Classic Minesweeper from Windows XP. Three difficulty levels: easy 9×9, medium 16×16, hard 16×30.",
    emoji: "💣",
    category: "puzzle",
    keywords: ["minesweeper", "mines", "retro", "windows xp", "puzzle game"],
    available: true,
  },
  {
    slug: "snake",
    title: "Snake",
    titleEn: "Snake",
    description: "The legendary Snake game. Eat apples, grow longer!",
    longDescription: "The legendary arcade Snake game. Control the snake, eat apples and avoid hitting the walls or your own tail.",
    emoji: "🐍",
    category: "arcade",
    keywords: ["snake", "arcade", "retro games", "classic game"],
    available: true,
  },
  {
    slug: "tetris",
    title: "Tetris",
    titleEn: "Tetris",
    description: "The ultimate block-stacking game. Clear lines, beat levels!",
    longDescription: "Classic Tetris with ghost piece, increasing speed per level, and next piece preview.",
    emoji: "🟦",
    category: "puzzle",
    keywords: ["tetris", "blocks", "puzzle", "retro", "classic"],
    available: true,
  },
  {
    slug: "breakout",
    title: "Breakout",
    titleEn: "Breakout",
    description: "Smash bricks with a ball and paddle. Arkanoid-style action!",
    longDescription: "Classic Breakout / Arkanoid. Use mouse or arrow keys to move the paddle, break all bricks.",
    emoji: "🧱",
    category: "arcade",
    keywords: ["breakout", "arkanoid", "bricks", "paddle", "arcade"],
    available: true,
  },
  {
    slug: "pong",
    title: "Pong",
    titleEn: "Pong",
    description: "The original arcade game. Play vs CPU or a friend!",
    longDescription: "Classic Pong — the very first arcade game. Play solo vs CPU or challenge a friend in 2-player mode.",
    emoji: "🏓",
    category: "arcade",
    keywords: ["pong", "arcade", "retro", "classic", "2 player"],
    available: true,
  },
  {
    slug: "solitaire",
    title: "Solitaire",
    titleEn: "Solitaire",
    description: "Klondike Solitaire — the classic Windows XP card game.",
    longDescription: "Coming soon!",
    emoji: "🃏",
    category: "card",
    keywords: ["solitaire", "cards", "klondike", "windows xp"],
    available: false,
  },
  {
    slug: "pinball",
    title: "Space Pinball",
    titleEn: "Space Cadet Pinball",
    description: "The original 3D Pinball from Windows XP — running via WebAssembly!",
    longDescription: "The original Space Cadet Pinball from Windows XP, decompiled from C++ and compiled to WebAssembly. Runs natively in the browser — 100% authentic.",
    emoji: "🚀",
    category: "arcade",
    keywords: ["pinball", "space cadet", "windows xp", "3d pinball", "webassembly"],
    available: true,   // ← змінити з false на true
  },
  {
    slug: "wolfenstein",
    title: "Wolfenstein 3D",
    titleEn: "Wolfenstein 3D",
    description: "The grandfather of FPS games — running via DOS emulator!",
    longDescription: "id Software's 1992 classic that invented the first-person shooter genre. Play shareware episodes 1–3 free. Escape from Castle Wolfenstein, fight Nazi soldiers, and defeat Boss enemies.",
    emoji: "🐺",
    category: "arcade",
    keywords: ["wolfenstein", "fps", "shooter", "dos", "id software", "retro", "3d", "1992"],
    available: true,
  },
];

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}
export function getAvailableGames(): Game[] {
  return GAMES.filter((g) => g.available);
}
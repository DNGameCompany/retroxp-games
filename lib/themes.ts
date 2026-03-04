import type { ThemeId } from "./storage";

export interface Theme {
    id: ThemeId;
    name: string;
    emoji: string;
    desktop: string;       // background CSS
    taskbar: string;       // gradient
    titlebar: string;      // active gradient
    titlebarInactive: string;
    startBtn: string;
    windowBg: string;
    taskbarText: string;
}

export const THEMES: Record<ThemeId, Theme> = {
    luna: {
        id: "luna", name: "Luna (Default)", emoji: "🌿",
        desktop:          "linear-gradient(135deg,#1a6e39 0%,#0e4d2a 40%,#094020 100%)",
        taskbar:          "linear-gradient(to bottom,#3a93ff,#245edc)",
        titlebar:         "linear-gradient(to bottom,#1f86e8,#0831d9)",
        titlebarInactive: "linear-gradient(to bottom,#7da0c8,#5a6e8a)",
        startBtn:         "linear-gradient(to bottom,#5ab027,#3a7a0f)",
        windowBg:         "#ece9d8",
        taskbarText:      "#ffffff",
    },
    dark: {
        id: "dark", name: "Dark Night", emoji: "🌙",
        desktop:          "linear-gradient(135deg,#0a0a1a 0%,#111130 50%,#0a0a1a 100%)",
        taskbar:          "linear-gradient(to bottom,#1a1a2e,#0f0f1e)",
        titlebar:         "linear-gradient(to bottom,#2a2a4a,#1a1a3a)",
        titlebarInactive: "linear-gradient(to bottom,#222233,#1a1a28)",
        startBtn:         "linear-gradient(to bottom,#3a3a6a,#2a2a4a)",
        windowBg:         "#1e1e2e",
        taskbarText:      "#aaaaff",
    },
    classic: {
        id: "classic", name: "Classic (Win98)", emoji: "🖥️",
        desktop:          "#008080",
        taskbar:          "linear-gradient(to bottom,#d4d0c8,#c0bdb5)",
        titlebar:         "linear-gradient(to bottom,#000080,#1084d0)",
        titlebarInactive: "linear-gradient(to bottom,#808080,#a0a0a0)",
        startBtn:         "linear-gradient(to bottom,#d4d0c8,#b8b5ae)",
        windowBg:         "#d4d0c8",
        taskbarText:      "#000000",
    },
    zune: {
        id: "zune", name: "Zune", emoji: "🎵",
        desktop:          "linear-gradient(135deg,#1a0a0a 0%,#2d0d0d 50%,#1a0a0a 100%)",
        taskbar:          "linear-gradient(to bottom,#2d0d0d,#1a0505)",
        titlebar:         "linear-gradient(to bottom,#8b0000,#5c0000)",
        titlebarInactive: "linear-gradient(to bottom,#3a1010,#2a0a0a)",
        startBtn:         "linear-gradient(to bottom,#cc2200,#991100)",
        windowBg:         "#1e0a0a",
        taskbarText:      "#ff6644",
    },
    royale: {
        id: "royale", name: "Royale", emoji: "👑",
        desktop:          "linear-gradient(135deg,#1a1a3e 0%,#0d0d2b 50%,#1a1a3e 100%)",
        taskbar:          "linear-gradient(to bottom,#4455aa,#223388)",
        titlebar:         "linear-gradient(to bottom,#6677cc,#3344aa)",
        titlebarInactive: "linear-gradient(to bottom,#445588,#334477)",
        startBtn:         "linear-gradient(to bottom,#5566bb,#3344aa)",
        windowBg:         "#eeeef8",
        taskbarText:      "#ffffff",
    },
};

export function getThemeById(id: ThemeId): Theme {
    return THEMES[id] ?? THEMES.luna;
}
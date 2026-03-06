// lib/analytics.ts
export function trackGameOpen(slug: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'game_open', {
            game_name: slug,
            event_category: 'engagement'
        });
    }
}
export function trackGameWin(slug: string, score?: number) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'game_win', {
            game_name: slug,
            score: score,
            event_category: 'engagement'
        });
    }
}
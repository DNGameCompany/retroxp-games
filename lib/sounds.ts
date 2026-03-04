// Generates authentic XP-style sounds via Web Audio API — no external files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
}

function tone(freq: number, dur: number, vol = 0.3, type: OscillatorType = "sine", startDelay = 0) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    const t = c.currentTime + startDelay;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.05);
}

function noise(dur: number, vol = 0.1, startDelay = 0) {
    const c = getCtx();
    const bufSize = c.sampleRate * dur;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "bandpass"; filter.frequency.value = 800; filter.Q.value = 0.5;
    src.buffer = buf; src.connect(filter); filter.connect(gain); gain.connect(c.destination);
    const t = c.currentTime + startDelay;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.start(t); src.stop(t + dur + 0.05);
}

export const Sounds = {
    // XP startup chime (simplified)
    startup() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => tone(f, 0.3, 0.15, "sine", i * 0.18));
    },

    // Window open — short whoosh up
    windowOpen() {
        const c = getCtx();
        const osc = c.createOscillator(); const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
        osc.start(); osc.stop(c.currentTime + 0.2);
    },

    // Window close — down
    windowClose() {
        const c = getCtx();
        const osc = c.createOscillator(); const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
        osc.start(); osc.stop(c.currentTime + 0.2);
    },

    // XP error — two descending tones
    error() {
        tone(440, 0.2, 0.2, "square");
        tone(330, 0.3, 0.2, "square", 0.2);
    },

    // Click — short tick
    click() { tone(1200, 0.04, 0.08, "square"); },

    // Achievement unlock — fanfare
    achievement() {
        [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3], [1047, 0.45]].forEach(
            ([f, d]) => tone(f as number, 0.25, 0.2, "sine", d as number)
        );
    },

    // Game win
    win() {
        [[523,0],[659,0.12],[784,0.24],[1047,0.36],[1318,0.5]].forEach(
            ([f,d]) => tone(f as number, 0.3, 0.18, "sine", d as number)
        );
    },

    // Game over
    lose() {
        tone(440, 0.15, 0.2, "sawtooth");
        tone(370, 0.15, 0.2, "sawtooth", 0.15);
        tone(311, 0.4,  0.2, "sawtooth", 0.30);
    },

    // Bumper / bounce
    bump() { tone(800, 0.06, 0.15, "square"); noise(0.05, 0.05); },

    // Daily complete
    daily() {
        [[784,0],[988,0.1],[1175,0.2],[1568,0.35]].forEach(
            ([f,d]) => tone(f as number, 0.3, 0.2, "sine", d as number)
        );
    },
};

// Global sounds enabled flag
let _enabled = true;
export function setSoundsEnabled(v: boolean) { _enabled = v; }
export function getSoundsActive() { return _enabled; }

// Wrapped calls that respect the enabled flag
export function playSound(name: keyof typeof Sounds) {
    if (!_enabled) return;
    try { Sounds[name](); } catch {}
}
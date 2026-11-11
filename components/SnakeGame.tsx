"use client";
import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

const G = 22;
const C = { bg: "#07060b", grid: "rgba(167,139,250,0.07)", snake: "#a78bfa", head: "#ede9fe", food: "#e879f9" };
type P = { x: number; y: number };
type Ctl = { dir: (x: number, y: number) => void; start: () => void };

export default function SnakeGame() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctl = useRef<Ctl>({ dir: () => {}, start: () => {} });

  useEffect(() => on("open-snake", () => setOpen(true)), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const canvas = cv.current!;
    canvas.width = 480; canvas.height = 480;
    const CELL = 480 / G;
    const ctx = canvas.getContext("2d")!;
    let snake: P[] = [], dir: P = { x: 1, y: 0 }, next: P = { x: 1, y: 0 }, food: P = { x: 0, y: 0 };
    let sc = 0, hi = 0, alive = true, started = false, paused = false, rate = 130, acc = 0, last = 0, shake = 0;
    let parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let audio: AudioContext | null = null;
    const beep = (f: number, d: number) => {
      try {
        audio = audio || new AudioContext();
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = "square"; o.frequency.value = f; g.gain.value = 0.04;
        o.connect(g); g.connect(audio.destination); o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d); o.stop(audio.currentTime + d);
      } catch { /* ignore */ }
    };
    const place = () => {
      let f: P;
      do { f = { x: Math.floor(Math.random() * G), y: Math.floor(Math.random() * G) }; } while (snake.some((s) => s.x === f.x && s.y === f.y));
      food = f;
    };
    const reset = () => {
      snake = [{ x: 10, y: 11 }, { x: 9, y: 11 }, { x: 8, y: 11 }];
      dir = { x: 1, y: 0 }; next = { x: 1, y: 0 };
      sc = 0; alive = true; started = false; paused = false; rate = 130; acc = 0; parts = [];
      place(); setScore(0);
    };
    reset();
    const start = () => { if (!started || !alive) { reset(); started = true; beep(440, 0.08); } };
    const setDir = (x: number, y: number) => { if (!paused && !(x === -dir.x && y === -dir.y)) next = { x, y }; };
    ctl.current = { dir: setDir, start };

    const step = () => {
      dir = next;
      const h = { x: (snake[0].x + dir.x + G) % G, y: (snake[0].y + dir.y + G) % G };
      if (snake.some((s) => s.x === h.x && s.y === h.y)) {
        alive = false; shake = 14; beep(120, 0.4);
        if (sc > hi) { hi = sc; setBest(hi); }
        return;
      }
      snake.unshift(h);
      if (h.x === food.x && h.y === food.y) {
        sc++; setScore(sc); beep(660 + sc * 8, 0.1);
        rate = Math.max(65, 130 - sc * 4);
        for (let i = 0; i < 14; i++) { const a = (Math.PI * 2 * i) / 14; parts.push({ x: (food.x + 0.5) * CELL, y: (food.y + 0.5) * CELL, vx: Math.cos(a) * (1.5 + Math.random() * 1.5), vy: Math.sin(a) * (1.5 + Math.random() * 1.5), life: 1 }); }
        place();
      } else snake.pop();
    };
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
    };
    const msg = (t: string, s: string) => {
      ctx.save(); ctx.fillStyle = "rgba(7,6,11,0.78)"; ctx.fillRect(0, 0, 480, 480);
      ctx.textAlign = "center"; ctx.fillStyle = C.snake; ctx.font = '700 24px monospace'; ctx.fillText(t, 240, 234);
      ctx.fillStyle = "#8d82a8"; ctx.font = "13px monospace"; ctx.fillText(s, 240, 262); ctx.restore();
    };
    const render = () => {
      ctx.save();
      if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake--; }
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, 480, 480);
      ctx.strokeStyle = C.grid;
      for (let i = 0; i <= G; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, 480); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(480, i * CELL); ctx.stroke(); }
      ctx.fillStyle = C.food; ctx.shadowColor = C.food; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc((food.x + 0.5) * CELL, (food.y + 0.5) * CELL, CELL * 0.32 + (0.5 + Math.sin(Date.now() / 160) * 0.5) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      for (let i = snake.length - 1; i >= 0; i--) {
        ctx.fillStyle = i === 0 ? C.head : C.snake;
        ctx.globalAlpha = i === 0 ? 1 : 0.92 - (i / snake.length) * 0.35;
        rr(snake[i].x * CELL + 1.5, snake[i].y * CELL + 1.5, CELL - 3, CELL - 3, i === 0 ? 7 : 5);
      }
      parts.forEach((p) => { ctx.globalAlpha = Math.max(p.life, 0); ctx.fillStyle = C.food; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.restore();
      if (!started) msg("PRESS SPACE OR TAP", "arrows, WASD or swipe to move");
      else if (paused) msg("PAUSED", "esc to resume");
      else if (!alive) msg("GAME OVER", `score ${sc}, space or tap to retry`);
    };
    let raf = 0;
    const loop = (t: number) => {
      if (!last) last = t;
      const d = t - last; last = t;
      if (started && alive && !paused) { acc += d; while (acc >= rate) { step(); acc -= rate; } }
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life -= 0.035; });
      parts = parts.filter((p) => p.life > 0);
      render(); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const key = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "escape"].includes(k)) e.preventDefault();
      if (k === "escape") { if (started && alive) paused = !paused; else setOpen(false); return; }
      if (k === " ") return start();
      if (k === "arrowup" || k === "w") setDir(0, -1);
      else if (k === "arrowdown" || k === "s") setDir(0, 1);
      else if (k === "arrowleft" || k === "a") setDir(-1, 0);
      else if (k === "arrowright" || k === "d") setDir(1, 0);
    };
    let tx = 0, ty = 0;
    const ts = (e: TouchEvent) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return start();
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
    };
    document.addEventListener("keydown", key);
    canvas.addEventListener("touchstart", ts, { passive: true });
    canvas.addEventListener("touchend", te, { passive: true });
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
      canvas.removeEventListener("touchstart", ts);
      canvas.removeEventListener("touchend", te);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  if (!open) return null;
  const pad = (x: number, y: number, l: string) => <button className="pad" onClick={() => ctl.current.dir(x, y)} aria-label={l}>{l}</button>;
  return (
    <div className="snake" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="snake-panel">
        <div className="snake-head">
          <b>SNAKE.EXE</b>
          <span>SCORE <b>{score}</b></span><span>BEST <b>{best}</b></span>
          <button onClick={() => setOpen(false)} aria-label="Close game">x</button>
        </div>
        <canvas ref={cv} className="snake-cv" width={480} height={480} />
        <div className="dpad">{pad(0, -1, "↑")}<div>{pad(-1, 0, "←")}{pad(0, 1, "↓")}{pad(1, 0, "→")}</div></div>
        <p className="dim mono snake-foot">Arrows / WASD / swipe to move. Esc pauses. Space or tap starts.</p>
      </div>
    </div>
  );
}

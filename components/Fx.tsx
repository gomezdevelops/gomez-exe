"use client";
import { useEffect, useRef, useState } from "react";

export { emit } from "@/lib/bus";

const BOOT = ["GOMEZ.EXE v1.0", "mounting /projects ........ ok", "loading stars ............. ok", "loading identity ......... pending", "identity found."];

export function Loader() {
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let skip = false;
    try { skip = sessionStorage.getItem("booted") === "1"; } catch { /* ignore */ }
    if (skip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPhase(3); return; }
    document.body.style.overflow = "hidden";
    const t: number[] = [];
    BOOT.forEach((l, i) => t.push(window.setTimeout(() => setLines((p) => [...p, l]), i * 240)));
    t.push(window.setTimeout(() => setPhase(1), BOOT.length * 240 + 200));
    t.push(window.setTimeout(() => setPhase(2), 7000));
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 1) return;
    const c = cv.current!, x = c.getContext("2d")!;
    c.width = c.height = 320;
    const img = new Image();
    const off = document.createElement("canvas"), ox = off.getContext("2d")!;
    const steps = [6, 10, 16, 28, 48, 96, 320];
    let i = 0, t = 0;
    img.onload = () => {
      const tick = () => {
        const sz = steps[i];
        off.width = off.height = sz;
        ox.drawImage(img, 0, 0, sz, sz);
        x.imageSmoothingEnabled = false;
        x.clearRect(0, 0, 320, 320);
        x.drawImage(off, 0, 0, 320, 320);
        i++;
        t = window.setTimeout(i < steps.length ? tick : () => setPhase(2), i < steps.length ? 170 : 600);
      };
      tick();
    };
    img.onerror = () => setPhase(2);
    img.src = "/pfp.png";
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 2) return;
    const t = window.setTimeout(() => setPhase(3), 650);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 3) return;
    document.body.style.overflow = "";
    try { sessionStorage.setItem("booted", "1"); } catch { /* ignore */ }
  }, [phase]);

  if (phase === 3) return null;
  return (
    <div className={`boot ${phase === 2 ? "out" : ""}`}>
      {phase === 0 && <pre className="boot-log mono">{lines.join("\n")}<b className="typing">▌</b></pre>}
      {phase >= 1 && (
        <div className="boot-pic">
          <canvas ref={cv} />
          <span className="mono">GOMEZ.EXE</span>
        </div>
      )}
    </div>
  );
}

export function Ambient() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.12 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    const mv = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".spot");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    };
    const sc = () => {
      const h = document.documentElement;
      const bar = document.querySelector<HTMLElement>(".progress");
      if (bar) bar.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
    };
    window.addEventListener("mousemove", mv);
    window.addEventListener("scroll", sc, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("mousemove", mv); window.removeEventListener("scroll", sc); };
  }, []);
  return <div className="progress" />;
}

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const m = (e: MouseEvent) => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);
  return <div className="cursor" ref={ref} />;
}

export function Typing({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [t, setT] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[i % words.length];
    const id = setTimeout(() => {
      if (!del) { setT(w.slice(0, t.length + 1)); if (t.length + 1 === w.length) setTimeout(() => setDel(true), 900); }
      else { setT(w.slice(0, t.length - 1)); if (t.length <= 1) { setDel(false); setI(i + 1); } }
    }, del ? 40 : 80);
    return () => clearTimeout(id);
  }, [t, del, i, words]);
  return <span className="typing">{t}<b>▌</b></span>;
}

export function Matrix() {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const toggle = () => setOn((v) => !v);
    window.addEventListener("toggle-matrix", toggle);
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let k = 0;
    const key = (e: KeyboardEvent) => {
      k = e.key === seq[k] ? k + 1 : 0;
      if (k === seq.length) { k = 0; setOn(true); }
      if (e.key === "Escape") setOn(false);
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("toggle-matrix", toggle); window.removeEventListener("keydown", key); };
  }, []);
  useEffect(() => {
    if (!on) return;
    const c = ref.current!, x = c.getContext("2d")!;
    c.width = innerWidth; c.height = innerHeight;
    const cols = Math.floor(c.width / 16), drops = Array(cols).fill(1);
    const id = setInterval(() => {
      x.fillStyle = "rgba(7,6,11,.08)"; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = "#a78bfa"; x.font = "15px monospace";
      drops.forEach((y, i) => {
        x.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 16, y * 16);
        drops[i] = y * 16 > c.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    }, 45);
    return () => clearInterval(id);
  }, [on]);
  return on ? <canvas ref={ref} className="matrix" onClick={() => setOn(false)} /> : null;
}

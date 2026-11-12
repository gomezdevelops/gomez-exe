"use client";
import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

export default function Unmask() {
  const [pos, setPos] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const cur = useRef(0);
  const drag = useRef(false);
  const raf = useRef(0);

  const apply = (v: number) => { cur.current = v; setPos(v); };
  const fromX = (cx: number) => {
    const r = box.current!.getBoundingClientRect();
    apply(Math.max(0, Math.min(100, ((cx - r.left) / r.width) * 100)));
  };
  const anim = (to: number) => {
    cancelAnimationFrame(raf.current);
    const step = () => {
      const n = cur.current + (to - cur.current) * 0.12;
      if (Math.abs(to - n) < 0.5) return apply(to);
      apply(n);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => on("unmask", () => anim(100)), []);

  return (
    <figure className="unmask rv">
      <div ref={box} className="um-box"
        onPointerDown={(e) => { cancelAnimationFrame(raf.current); drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromX(e.clientX); }}
        onPointerMove={(e) => drag.current && fromX(e.clientX)}
        onPointerUp={() => (drag.current = false)} onPointerCancel={() => (drag.current = false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/real.png" alt="Gomez, real photo" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="um-top" src="/pfp.png" alt="" draggable={false} style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
        <span className="um-chip l mono">REAL</span>
        <span className="um-chip r mono">AVATAR</span>
        <div className="um-bar" style={{ left: `${pos}%` }}><span>⇆</span></div>
      </div>
      <input className="sr" type="range" min={0} max={100} value={pos} onChange={(e) => apply(+e.target.value)} aria-label="Reveal slider" />
      <figcaption className="mono dim">{pos > 85 ? "Hi. That is me." : "Drag to meet the person behind the avatar."}</figcaption>
    </figure>
  );
}

"use client";
import { useState } from "react";
import { PROJECTS } from "@/lib/data";

const META: Record<string, { n: string; t: string; g: string }> = {
  "01": { n: "I", t: "The Architect", g: "✦" },
  "02": { n: "II", t: "The Imposter", g: "☾" },
  "03": { n: "III", t: "The Watcher", g: "◉" },
};
const f = (n: number) => n.toFixed(2);
const RAYS = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  return { x1: f(100 + Math.cos(a) * 82), y1: f(100 + Math.sin(a) * 82), x2: f(100 + Math.cos(a) * 94), y2: f(100 + Math.sin(a) * 94) };
});

function Sigil() {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="#a78bfa" strokeWidth="0.8" aria-hidden="true">
      <g className="spin">
        <circle cx="100" cy="100" r="96" strokeDasharray="2 6" opacity=".6" />
        {RAYS.map((r, i) => <line key={i} {...r} opacity=".7" />)}
      </g>
      <g className="spin r">
        <circle cx="100" cy="100" r="74" opacity=".45" />
        <polygon points="100,34 157,133 43,133" opacity=".7" />
        <polygon points="100,166 43,67 157,67" opacity=".7" />
      </g>
      <circle cx="100" cy="100" r="46" opacity=".8" />
    </svg>
  );
}

export default function Tarot() {
  const [flip, setFlip] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setFlip((s) => ({ ...s, [id]: !s[id] }));
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const el = e.currentTarget;
    el.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`);
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const reset = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <>
      <p className="dim rv tarot-hint">Draw a card. Tap or click to turn it over.</p>
      <div className="tarot rv">
        {PROJECTS.map((p) => {
          const m = META[p.id];
          const on = !!flip[p.id];
          return (
            <div className={`tslot ${on ? "on" : ""}`} key={p.id}>
              <div
                className={`tcard ${on ? "flip" : ""}`}
                role="button" tabIndex={0} aria-pressed={on}
                aria-label={`${m.t}, ${p.name}. Flip card`}
                onClick={() => toggle(p.id)}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(p.id); } }}
                onPointerMove={tilt} onPointerLeave={reset}
              >
                <div className="tinner">
                  <div className="tface tfront">
                    <div className="trow mono"><span>{m.n}</span><span>{p.id}/03</span></div>
                    <div className="sigil"><Sigil /><span className="tglyph">{m.g}</span></div>
                    <div className="tname">
                      <h3>{m.t}</h3>
                      <p className="mono dim">{p.name}</p>
                      <p className="mono dim">{p.tag}</p>
                    </div>
                  </div>
                  <div className="tface tback">
                    <p className="mono dim">{p.tag}</p>
                    <h3>{p.name}</h3>
                    <p className="tdesc">{p.desc}</p>
                    <p className="chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</p>
                    <p className="lnks">
                      {p.links.map(([l, u]) => (
                        <a className="lnk" key={l} href={u} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{l}</a>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

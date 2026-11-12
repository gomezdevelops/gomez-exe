"use client";
import { useState } from "react";

const GROUPS = [
  { name: "Languages", c: "#a78bfa", cx: 20, cy: 30, items: ["Python", "JavaScript", "TypeScript", "Java", "C", "C#"] },
  { name: "Frontend", c: "#e879f9", cx: 52, cy: 22, items: ["React", "Next.js", "Vite", "Tailwind CSS"] },
  { name: "Backend", c: "#818cf8", cx: 82, cy: 38, items: ["FastAPI", "Flask", "Node.js", "Express.js", "Discord.js", "Prisma", "SQLAlchemy", "Alembic"] },
  { name: "Data", c: "#f0abfc", cx: 24, cy: 74, items: ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Supabase"] },
  { name: "Tools and Games", c: "#c4b5fd", cx: 66, cy: 76, items: ["Unity", "Git", "GitHub", "Docker", "Postman", "Vercel", "Railway", "VS Code"] },
];
const clamp = (v: number, a: number, b: number) => Math.round(Math.max(a, Math.min(b, v)) * 100) / 100;

const MAP = GROUPS.map((g, gi) => ({
  ...g,
  pts: g.items.map((name, i) => {
    const a = (i / g.items.length) * Math.PI * 2 + gi * 1.3;
    const rx = 12 + ((i * 7) % 3) * 2, ry = 16 + ((i * 5) % 3) * 2;
    return { name, x: clamp(g.cx + Math.cos(a) * rx, 9, 91), y: clamp(g.cy + Math.sin(a) * ry, 10, 90) };
  }),
}));

export default function Constellation() {
  const [act, setAct] = useState(0);
  return (
    <div className="rv">
      <div className="sky" role="group" aria-label="Technology constellations">
        <svg aria-hidden="true">
          {MAP.map((g, gi) => g.pts.slice(1).map((p, i) => (
            <line key={`${gi}-${i}`} x1={`${g.pts[i].x}%`} y1={`${g.pts[i].y}%`} x2={`${p.x}%`} y2={`${p.y}%`}
              stroke={g.c} strokeWidth={gi === act ? 1.6 : 1} opacity={gi === act ? 0.9 : 0.16} />
          )))}
        </svg>
        {MAP.map((g, gi) => g.pts.map((p) => (
          <button key={p.name} className={`star ${gi === act ? "on" : ""}`} style={{ left: `${p.x}%`, top: `${p.y}%`, ["--c" as string]: g.c }}
            onMouseEnter={() => setAct(gi)} onClick={() => setAct(gi)} aria-label={`${p.name}, ${g.name}`}>
            <i className="dot" /><span className="lb mono">{p.name}</span>
          </button>
        )))}
      </div>
      <div className="sky-tabs">
        {MAP.map((g, gi) => (
          <button key={g.name} className={gi === act ? "on" : ""} style={{ ["--c" as string]: g.c }} onClick={() => setAct(gi)}>{g.name}</button>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { emit, on } from "@/lib/bus";
import { EMAIL, GH, LINKEDIN } from "@/lib/data";

interface Item { tag: "go" | "do" | "link"; label: string; hint: string; action: () => void }
const go = (s: string) => document.querySelector(s)?.scrollIntoView({ behavior: "smooth" });
const fuzzy = (q: string, t: string) => {
  const a = q.toLowerCase(), b = t.toLowerCase();
  let i = 0;
  for (let j = 0; j < b.length && i < a.length; j++) if (b[j] === a[i]) i++;
  return i === a.length;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [act, setAct] = useState(0);
  const inp = useRef<HTMLInputElement>(null);

  const items: Item[] = [
    { tag: "go", label: "Top", hint: "jump to hero", action: () => go("#top") },
    { tag: "go", label: "Projects", hint: "selected work", action: () => go("#projects") },
    { tag: "go", label: "Tech Stack", hint: "my toolkit", action: () => go("#stack") },
    { tag: "go", label: "Philosophy", hint: "how I think", action: () => go("#philosophy") },
    { tag: "go", label: "Terminal", hint: "poke around", action: () => go("#terminal") },
    { tag: "go", label: "Commits", hint: "github activity", action: () => go("#commits") },
    { tag: "go", label: "Contact", hint: "say hi", action: () => go("#contact") },
    { tag: "do", label: "Play Snake", hint: "opens the game", action: () => emit("open-snake") },
    { tag: "do", label: "Toggle Matrix Rain", hint: "easter egg", action: () => emit("toggle-matrix") },
    { tag: "do", label: "Copy Email", hint: EMAIL, action: () => { navigator.clipboard?.writeText(EMAIL).catch(() => {}); } },
    { tag: "link", label: "Open GitHub", hint: `github.com/${GH}`, action: () => window.open(`https://github.com/${GH}`, "_blank") },
    { tag: "link", label: "Open LinkedIn", hint: "linkedin.com/in/abingomez", action: () => window.open(LINKEDIN, "_blank") },
    { tag: "link", label: "Email Gomez", hint: "mailto", action: () => window.location.assign(`mailto:${EMAIL}`) },
  ];
  const list = items.filter((i) => fuzzy(q, i.label) || fuzzy(q, i.hint));

  const show = () => { setOpen(true); setQ(""); setAct(0); setTimeout(() => inp.current?.focus(), 60); };
  const hide = () => setOpen(false);

  useEffect(() => {
    const a = on("open-cmdk", show);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open ? hide() : show(); }
    };
    window.addEventListener("keydown", key);
    return () => { a(); window.removeEventListener("keydown", key); };
  }, [open]);

  const run = (i: Item) => { hide(); i.action(); };

  return (
    <div className={`cmdk ${open ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && hide()}>
      <div className="cmdk-panel" role="dialog" aria-label="Command palette">
        <div className="cmdk-in">
          <input ref={inp} value={q} placeholder="Jump to a section or action..." spellCheck={false} autoComplete="off"
            onChange={(e) => { setQ(e.target.value); setAct(0); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") hide();
              else if (e.key === "ArrowDown") { e.preventDefault(); setAct((a) => Math.min(list.length - 1, a + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setAct((a) => Math.max(0, a - 1)); }
              else if (e.key === "Enter" && list[act]) run(list[act]);
            }} />
          <button onClick={hide} aria-label="Close">esc</button>
        </div>
        <div className="cmdk-list">
          {list.length === 0 && <div className="dim cmdk-empty">No matches. Try another word.</div>}
          {list.map((i, n) => (
            <div key={i.label} className={`cmdk-item ${n === act ? "act" : ""}`} onMouseMove={() => setAct(n)} onClick={() => run(i)}>
              <span>{i.label} <small className="dim">{i.hint}</small></span><em>{i.tag}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

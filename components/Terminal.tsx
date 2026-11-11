"use client";
import { useEffect, useRef, useState } from "react";
import { emit } from "./Fx";
import { GH, EMAIL, PROJECTS } from "@/lib/data";

type L = { id: number; text: string; cls?: string };
const go = (s: string) => document.querySelector(s)?.scrollIntoView({ behavior: "smooth" });
const CMDS = ["help","about","skills","projects","github","neofetch","git log","whoami","contact","sudo hire-me","matrix","snake","palette","ls","clear"];

export default function Terminal() {
  const [lines, setLines] = useState<L[]>([]);
  const [val, setVal] = useState("");
  const hist = useRef<string[]>([]);
  const hi = useRef(0);
  const id = useRef(0);
  const body = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);

  const print = (text: string, cls?: string) => setLines((p) => [...p, { id: ++id.current, text, cls }]);
  useEffect(() => { print("GOMEZ.EXE shell ready. Type `help`."); }, []);
  useEffect(() => { body.current?.scrollTo(0, body.current.scrollHeight); }, [lines]);

  const run = async (raw: string) => {
    const c = raw.trim(); print(`guest@gomez:~$ ${c}`, "cmd");
    if (!c) return;
    hist.current.push(c); hi.current = hist.current.length;
    const l = c.toLowerCase();
    if (l === "sudo hire-me") { print("[sudo] password: ********"); print("permission granted. see contact.", "ok"); go("#contact"); return; }
    if (l === "git log") return print(["commit a1f3c9e  feat: job tracker live", "commit 7be20d4  feat: suspect leaderboard", "commit 3c9aa51  init: GOMEZ.EXE portfolio"].join("\n"));
    switch (l.split(" ")[0]) {
      case "help": return print("about  skills  projects  github  neofetch  git log  whoami  contact  sudo hire-me  matrix  snake  palette  ls  clear");
      case "about": return print("Software engineer. Full-stack, AI-powered apps, scalable systems, side quests in games and Discord bots.");
      case "skills": return print("Python · TypeScript · JavaScript · React · Next.js · FastAPI · Flask · Node.js · PostgreSQL · SQLite · MongoDB · Docker · Unity");
      case "projects": print(PROJECTS.map((p) => `${p.id} ${p.name}: ${p.tag}`).join("\n")); return go("#projects");
      case "whoami": return print("gomez: software engineer. builds things that make ideas real.");
      case "neofetch": return print("guest@gomez\nOS: GOMEZ.EXE\nKernel: Next.js · React · TypeScript\nTheme: goth/purple\nCPU: coffee-fueled");
      case "contact": print(`email: ${EMAIL}\ngithub: github.com/${GH}`); return go("#contact");
      case "ls": return print("projects/  stack.json  notes/  contact.sh");
      case "matrix": emit("toggle-matrix"); return print("wake up, neo. (Esc to exit)", "ok");
      case "snake": emit("open-snake"); return print("launching snake.exe ...", "ok");
      case "palette": emit("open-cmdk"); return print("opening command palette ...", "ok");
      case "clear": return setLines([]);
      case "github":
        print("fetching api.github.com ...");
        try {
          const d = await (await fetch(`https://api.github.com/users/${GH}`)).json();
          return print(`user ${d.login}\nrepos ${d.public_repos}\nfollowers ${d.followers}\n${d.html_url}`, "ok");
        } catch { return print("could not reach GitHub API.", "err"); }
      default: return print(`command not found: ${c}: try help`, "err");
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { const v = val; setVal(""); run(v); }
    else if (e.key === "ArrowUp") { e.preventDefault(); hi.current = Math.max(0, hi.current - 1); setVal(hist.current[hi.current] ?? ""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); hi.current = Math.min(hist.current.length, hi.current + 1); setVal(hist.current[hi.current] ?? ""); }
    else if (e.key === "Tab") { e.preventDefault(); const m = CMDS.filter((c) => c.startsWith(val.toLowerCase())); if (m.length === 1) setVal(m[0]); else if (m.length) print(m.join("   "), "dim"); }
  };

  return (
    <div className="term" onClick={() => inp.current?.focus()}>
      <div className="term-bar"><i /><i /><i /><span>guest@gomez: ~: zsh</span></div>
      <div className="term-body" ref={body}>
        {lines.map((l) => <pre key={l.id} className={l.cls}>{l.text}</pre>)}
        <div className="row"><span className="ps">guest@gomez:~$</span>
          <input ref={inp} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" aria-label="terminal input" />
        </div>
      </div>
      <div className="hint mono dim">↑↓ history · Tab complete · try <b>snake</b>, <b>sudo hire-me</b> · Konami code = ???</div>
    </div>
  );
}

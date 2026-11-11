"use client";
import { useState } from "react";
import { Loader, Cursor, Matrix, Typing, Ambient, emit } from "@/components/Fx";
import Terminal from "@/components/Terminal";
import SnakeGame from "@/components/SnakeGame";
import CommandPalette from "@/components/CommandPalette";
import { ROLES, GH, EMAIL, LINKEDIN, PROJECTS, STACK, PHILOSOPHY, NOTES } from "@/lib/data";

const NAV = ["projects", "stack", "philosophy", "terminal", "commits", "contact"];
const half = Math.ceil(STACK.length / 2);

export default function Home() {
  const [menu, setMenu] = useState(false);
  const tilt = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
    e.currentTarget.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
  };
  return (
    <>
      <Loader /><Cursor /><Matrix /><Ambient /><SnakeGame /><CommandPalette />
      <nav className="nav">
        <a href="#top" className="logo">GOMEZ<span>.EXE</span></a>
        <div className={`links ${menu ? "open" : ""}`}>
          {NAV.map((s) => <a key={s} href={`#${s}`} onClick={() => setMenu(false)}>{s}</a>)}
        </div>
        <button className="kbtn" onClick={() => emit("open-cmdk")} aria-label="Open command palette">Ctrl K</button>
        <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}><i /><i /></button>
      </nav>

      <header id="top" className="hero" onMouseMove={tilt}>
        <div className="hero-txt">
          <p className="mono dim">GOMEZ.EXE / SYSTEM INITIALIZED</p>
          <h1><span>I build stuffs</span><span className="g">that can blow your mind</span></h1>
          <p className="lead">Software Engineer building intelligent applications, scalable systems, and experiences that push past conventional development. From full-stack platforms to AI-powered utilities, I turn complex problems into elegant, working solutions.</p>
          <p className="roles mono"><Typing words={ROLES} /></p>
          <div className="cta">
            <a className="btn" href="#projects">Explore my work</a>
            <a className="btn ghost" href="#contact">Get in touch</a>
            <a className="btn ghost" href={`https://github.com/${GH}`} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn ghost" href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
        <div className="pfp">
          <div className="tilt">
            <div className="ring" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pfp.png" alt="Gomez, anime-style blindfolded portrait" />
            <div className="scan" />
            <span className="chip c1 mono">&gt; whoami</span>
            <span className="chip c2 mono">type snake in terminal</span>
          </div>
        </div>
      </header>

      <section className="sec rv">
        <h2>More than just lines of code.</h2>
        <div className="about">
          <p>I&apos;m Abin Gomez, a Software Engineer building products where engineering, creativity and intelligent tech meet. I work across the full lifecycle: backend architecture, intuitive interfaces, and AI features that make apps smarter.</p>
          <p>No fixed stack, no fixed project type. AI platforms, automation tools, interactive apps: I&apos;m driven by turning ambitious ideas into working products. I value clean architecture, continuous learning, and room to experiment.</p>
          <p className="quote">I don&apos;t just want to build software that works. I want to build software worth remembering.</p>
        </div>
      </section>

      <section id="projects" className="sec">
        <h2 className="rv">Selected projects</h2>
        <div className="bento">
          {PROJECTS.map((p) => (
            <article className="proj spot rv" key={p.id}>
              <div className="idx">{p.id}</div>
              <p className="mono dim">{p.tag}</p>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <p className="chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</p>
              <p className="lnks">{p.links.map(([l, u]) => <a className="lnk" key={l} href={u} target="_blank" rel="noreferrer">{l}</a>)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stack" className="sec wide">
        <h2 className="rv">Technologies I work with</h2>
        {[STACK.slice(0, half), STACK.slice(half)].map((row, i) => (
          <div key={i} className={`mq ${i ? "rev" : ""}`}>
            <div>{[...row, ...row].map((s, n) => <span key={n} className="tech">{s}</span>)}</div>
          </div>
        ))}
      </section>

      <section id="philosophy" className="sec">
        <h2 className="rv">Good engineering goes beyond writing code.</h2>
        <div className="phil">{PHILOSOPHY.map(([t, d], i) => <div key={t} className="spot rv" style={{ transitionDelay: `${i * 60}ms` }}><h4>{t}</h4><p>{d}</p></div>)}</div>
      </section>

      <section id="notes" className="sec">
        <h2 className="rv">Things I&apos;ve been exploring</h2>
        <p className="dim rv">Articles coming. Topics on the radar:</p>
        <div className="phil">{NOTES.map(([t, d]) => <div key={t} className="spot rv"><h4>{t}</h4><p>{d}</p></div>)}</div>
      </section>

      <section id="terminal" className="sec">
        <h2 className="rv">This portfolio has a terminal</h2>
        <div className="rv"><Terminal /></div>
      </section>

      <section id="commits" className="sec">
        <h2 className="rv">Commit history</h2>
        <div className="cal rv">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://ghchart.rshah.org/a78bfa/${GH}`} alt="GitHub contribution calendar" />
        </div>
      </section>

      <section id="contact" className="sec">
        <h2 className="rv">Have something interesting in mind?</h2>
        <p className="rv about">Technical discussion, project collaboration, or just a good conversation: reach out.</p>
        <p className="rv"><a className="btn big" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      </section>

      <footer>Designed by curiosity. Built with code. Powered by imagination.<b>GOMEZ.EXE</b></footer>
    </>
  );
}

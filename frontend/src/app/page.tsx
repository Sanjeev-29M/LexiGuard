"use client";

import Link from "next/link";
import React, { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const featureNodes = [
  { id: 1, x: 250, y: 50, label: "Compliance Check", delay: "0s", path: "M 460 225 C 380 225, 360 50, 282 50" },
  { id: 2, x: 150, y: 130, label: "Risk Analysis", delay: "-1.5s", path: "M 460 225 C 380 225, 360 130, 182 130" },
  { id: 3, x: 80, y: 225, label: "Clause Extraction", delay: "-0.5s", path: "M 460 225 L 112 225" },
  { id: 4, x: 150, y: 320, label: "Auto-Redlining", delay: "-2s", path: "M 460 225 C 380 225, 360 320, 182 320" },
  { id: 5, x: 250, y: 400, label: "Version Tracking", delay: "-1s", path: "M 460 225 C 380 225, 360 400, 282 400" },
  { id: 6, x: 750, y: 50, label: "E-Signature", delay: "-0.8s", path: "M 540 225 C 620 225, 640 50, 718 50" },
  { id: 7, x: 850, y: 130, label: "Audit Trail", delay: "-2.5s", path: "M 540 225 C 620 225, 640 130, 818 130" },
  { id: 8, x: 920, y: 225, label: "Obligation Mgt", delay: "-0.2s", path: "M 540 225 L 888 225" },
  { id: 9, x: 850, y: 320, label: "AI Summaries", delay: "-1.2s", path: "M 540 225 C 620 225, 640 320, 818 320" },
  { id: 10, x: 750, y: 400, label: "Secure Vault", delay: "-2.2s", path: "M 540 225 C 620 225, 640 400, 718 400" }
];

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1, active: false });
  const animFrameRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const MAX_PARTICLES = 28;
    const CONNECT_DIST = 110;
    const LIFESPAN = 140;
    const SPAWN_INTERVAL = 8; // frames between spawns
    const SPAWN_RING_MIN = 50; // spawn at least this far from mouse
    const SPAWN_RING_MAX = 110; // up to this far

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      life: number;
      maxLife: number;
    };

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const particles: Particle[] = [];
    let angleSeq = 0; // sequential angle so particles spread uniformly

    const spawn = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (!mouseRef.current.active || mx < 0) return;
      if (particles.length >= MAX_PARTICLES) return;

      // Use golden angle increment for perfectly uniform angular distribution
      const GOLDEN_ANGLE = 2.399963; // radians
      angleSeq += GOLDEN_ANGLE;
      const radius = SPAWN_RING_MIN + Math.random() * (SPAWN_RING_MAX - SPAWN_RING_MIN);

      const sx = mx + Math.cos(angleSeq) * radius;
      const sy = my + Math.sin(angleSeq) * radius;

      // Slow drift away from mouse center
      const speed = 0.12 + Math.random() * 0.18;
      const driftAngle = angleSeq + (Math.random() - 0.5) * 0.6;

      particles.push({
        x: sx,
        y: sy,
        vx: Math.cos(driftAngle) * speed,
        vy: Math.sin(driftAngle) * speed,
        r: Math.random() * 1.4 + 0.8,
        life: LIFESPAN,
        maxLife: LIFESPAN,
      });
    };

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (frame % SPAWN_INTERVAL === 0) spawn();

      // Update + gentle repulsion
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        // Gentle repulsion from neighbours
        for (let j = 0; j < particles.length; j++) {
          if (i === j) continue;
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 40 && dist > 0) {
            const force = (40 - dist) / 40 * 0.012;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Dampen so they don't fly off
        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw connections — only between particles reasonably spaced apart
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST && dist > 25) {
            const lifeAlpha = Math.min(
              particles[i].life / particles[i].maxLife,
              particles[j].life / particles[j].maxLife
            );
            const distAlpha = (1 - dist / CONNECT_DIST) * 0.45;
            const alpha = lifeAlpha * distAlpha;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(170, 200, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw particle dots with smooth fade in/out
      for (const p of particles) {
        const t = p.life / p.maxLife;
        // Ease-in first 20%, ease-out last 25%
        const alpha = Math.max(0, Math.min(1,
          t < 0.2 ? t / 0.2 : t > 0.75 ? (1 - t) / 0.25 : 1.0
        )) * 0.88;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 215, 255, ${alpha})`;
        ctx.shadowColor = "rgba(150, 185, 255, 0.85)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Lines from particles back to cursor + glowing cursor dot
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mouseRef.current.active && mx >= 0) {
        for (const p of particles) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = SPAWN_RING_MAX * 1.4;
          if (dist < maxDist) {
            const lifeRatio = p.life / p.maxLife;
            const alpha = (1 - dist / maxDist) * lifeRatio * 0.55;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(130, 175, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Glowing cursor centre dot
        ctx.beginPath();
        ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 215, 255, 0.95)";
        ctx.shadowColor = "rgba(140, 185, 255, 1)";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(spawnTimerRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Redirect to login with a redirect to dashboard after login
      router.push("/login?redirect=/dashboard");
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1, active: false };
  }, []);

  return (
    <div
      className="min-h-screen bg-[#060b14] text-slate-50 font-sans selection:bg-blue-500/30 overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
        }
        @keyframes orbit-2 {
          0% { transform: rotate(0deg) translateX(-40px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(-40px) rotate(-360deg); }
        }
        @keyframes orbit-3 {
          0% { transform: rotate(0deg) translateY(30px) rotate(0deg); }
          100% { transform: rotate(360deg) translateY(30px) rotate(-360deg); }
        }
        @keyframes line-dash {
          to { stroke-dashoffset: -200; }
        }
        @keyframes fadeUpBlur {
          0% { opacity: 0; transform: translateY(20px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
        @keyframes revealText {
          0% { opacity: 0; transform: translateY(100%); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-travel {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1000; }
        }
        .travel-line {
          stroke-dasharray: 60 1000;
          animation: pulse-travel 3s linear infinite;
        }
        .orbit-1 { animation: orbit-1 25s linear infinite; }
        .orbit-2 { animation: orbit-2 30s linear infinite; }
        .orbit-3 { animation: orbit-3 20s linear infinite; }
        .float-fast { animation: float 3s ease-in-out infinite; }
        .float-slow { animation: float 6s ease-in-out infinite; }
        .animate-dash { animation: line-dash 15s linear infinite; }
        .animate-fade-up-blur {
          opacity: 0;
          animation: fadeUpBlur 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .text-reveal-wrapper {
          overflow: hidden;
          display: inline-block;
        }
        .text-reveal {
          display: inline-block;
          opacity: 0;
          transform: translateY(100%);
          animation: revealText 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Interactive Star Constellation Canvas - pointer-events-none so clicks pass through */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
        style={{ display: 'block' }}
      />

      {/* Extreme background globe / dome glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[140%] h-[1200px] border-[1px] border-white/[0.03] rounded-[100%] bg-gradient-to-b from-[#0f1b34]/40 to-[#060b14] pointer-events-none">
        {/* Inner subtle grid */}
        <div className="absolute inset-0 rounded-[100%] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 w-full pt-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xl font-medium tracking-tight">LexiGuard</span>
          </div>

          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-1 py-1 backdrop-blur-md">
            <Link href="#about" className="px-5 py-2 text-sm text-white font-medium bg-white/10 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
              About Us
            </Link>
          </div>

          <div className="flex items-center">
            <Link href="/login" className="text-sm font-medium bg-transparent border border-white/10 text-white px-5 py-2.5 rounded-full hover:bg-white/5 transition-all flex items-center gap-2">
              Log in / Start
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 pt-36 pb-40 px-6 flex flex-col items-center">

        {/* Main Headline */}
        <h1 className="relative z-20 text-5xl md:text-7xl font-semibold tracking-tight text-center max-w-4xl leading-[1.15] mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-2">
            <span className="text-reveal-wrapper"><span className="text-reveal text-blue-50" style={{ animationDelay: '100ms' }}>Your</span></span>
            <span className="text-reveal-wrapper"><span className="text-reveal text-blue-50" style={{ animationDelay: '200ms' }}>Entire</span></span>
            <span className="text-reveal-wrapper"><span className="text-reveal text-blue-50" style={{ animationDelay: '300ms' }}>Legal</span></span>
            <span className="text-reveal-wrapper"><span className="text-reveal text-blue-50" style={{ animationDelay: '400ms' }}>Team</span></span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4">
            <span className="text-reveal-wrapper"><span className="text-reveal text-white" style={{ animationDelay: '500ms' }}>All</span></span>
            <span className="text-reveal-wrapper"><span className="text-reveal text-white" style={{ animationDelay: '600ms' }}>In</span></span>
            <span className="text-reveal-wrapper"><span className="text-reveal text-white" style={{ animationDelay: '700ms' }}>One</span></span>
            <span className="text-reveal-wrapper"><span className="text-reveal text-white" style={{ animationDelay: '800ms' }}>Solution</span></span>
          </div>
        </h1>

        {/* Input Field Area */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl mx-auto z-50 animate-fade-up-blur" style={{ animationDelay: '1000ms' }}>
          <div className="relative flex-1 w-full group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input
              type="text"
              placeholder="Upload a document"
              className="w-full bg-[#0b1120] border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder-slate-500 cursor-pointer"
              readOnly
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-4 bg-transparent border border-white/20 hover:border-blue-500 hover:bg-white/5 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            Get Started
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </Link>
        </div>

        {/* Floating Icons Background Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          {/* Top Left Document */}
          <div className="absolute top-[20%] left-[25%] p-4 rounded-2xl border border-white/10 bg-[#0f1b34]/30 backdrop-blur-md opacity-60 orbit-1">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>

          {/* Top Right File */}
          <div className="absolute top-[18%] right-[32%] p-3 rounded-xl border border-white/10 bg-[#0f1b34]/30 backdrop-blur-md opacity-60 orbit-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
          </div>

          {/* Far Left File */}
          <div className="absolute top-[45%] left-[10%] p-4 rounded-2xl border border-white/10 bg-[#0f1b34]/30 backdrop-blur-md opacity-50 orbit-3">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>

          {/* Far Right Shield */}
          <div className="absolute top-[35%] right-[20%] p-3 rounded-2xl border border-white/10 bg-[#0f1b34]/30 backdrop-blur-md opacity-70 orbit-1">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>

          {/* Bottom Right Check */}
          <div className="absolute bottom-[20%] right-[12%] p-4 rounded-xl border border-white/10 bg-[#0f1b34]/30 backdrop-blur-md opacity-40 orbit-2">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>

        {/* --- NODE GRAPH SECTION --- */}
        <div className="relative mt-20 w-[1100px] h-[300px] z-20 hidden md:block group mx-auto animate-fade-up-blur scale-[0.7] lg:scale-90 xl:scale-100 origin-top" style={{ animationDelay: '1400ms' }}>

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 opacity-60 group-hover:opacity-100" style={{ filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.15))" }}>
            {/* Import to Launch (Curve down and right) */}
            <path d="M 155 52 C 185 52, 185 128, 215 128" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-dash" />

            {/* Launch to Extract (Curve down and right) */}
            <path d="M 295 128 C 315 128, 315 202, 335 202" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-dash" />

            {/* Extract to Improvements (Straight right) */}
            <path d="M 545 202 L 575 202" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-dash" />

            {/* Improvements to Deliver (Curve up and right) */}
            <path d="M 785 202 C 802 202, 802 128, 820 128" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-dash" />

            {/* Deliver to Sign (Curve up and right) */}
            <path d="M 900 128 C 920 128, 920 52, 940 52" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-dash" />
          </svg>

          {/* --- NODES --- */}
          {/* Node 1: Import Document */}
          <div className="absolute top-[30px] left-[0px] flex items-center gap-3 bg-[#0a101d]/90 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:bg-[#0f172a] hover:border-white/20 hover:scale-105 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#141f36] border border-white/5 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            </div>
            <span className="text-sm font-medium text-slate-400">Import <span className="text-slate-200">Contract</span></span>
          </div>

          {/* Node 2: Launch Pill (White) */}
          <div className="absolute top-[110px] left-[215px] bg-[#f1f5f9] text-slate-800 px-5 py-2 rounded-xl font-bold text-[13px] shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform cursor-pointer">
            Analyze
          </div>

          {/* Node 3: AI Highlights */}
          <div className="absolute top-[180px] left-[335px] flex items-center gap-3 bg-[#0a101d]/90 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:bg-[#0f172a] hover:border-white/20 hover:scale-105 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#141f36] border border-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </div>
            <span className="text-sm font-medium text-slate-400">Extract <span className="text-slate-200">risks & clauses</span></span>
          </div>

          {/* Node 4: Automatic Improvements */}
          <div className="absolute top-[180px] left-[575px] flex items-center gap-3 bg-[#0a101d]/90 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:bg-[#0f172a] hover:border-white/20 hover:scale-105 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#141f36] border border-white/5 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span className="text-sm font-medium text-slate-200">Automatic improvements</span>
          </div>

          {/* Node 5: Deliver Pill (Pink/White) */}
          <div className="absolute top-[110px] left-[820px] bg-[#f3e8ff] text-[#4c1d95] px-5 py-2 rounded-xl font-bold text-[13px] shadow-[0_0_15px_rgba(216,180,254,0.2)] hover:scale-105 transition-transform cursor-pointer">
            Secure
          </div>

          {/* Node 6: Calendar / Safe Agreement */}
          <div className="absolute top-[30px] left-[940px] flex items-center gap-3 bg-[#0a101d]/90 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:bg-[#0f172a] hover:border-emerald-500/20 hover:scale-105 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#141f36] border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <span className="text-sm font-medium text-slate-400">Sign <span className="text-emerald-400">Safe Agreement</span></span>
          </div>

        </div>

        {/* --- FEATURES HUB SECTION --- */}
        <div className="relative mt-40 w-full flex flex-col items-center z-20 mx-auto">
          <div className="text-center mb-24 px-4">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-white tracking-tight">Powerful Capabilities<br /><span className="text-blue-400">Built Into LexiGuard</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">Everything your legal team needs to manage obligations, mitigate risks, and execute contracts efficiently.</p>
          </div>

          <div className="relative w-full max-w-[1000px] h-[450px] hidden md:block group animate-fade-up-blur" style={{ animationDelay: '200ms' }}>
            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Dim Base Links */}
              {featureNodes.map(node => (
                <path key={`base-${node.id}`} d={node.path} stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
              ))}

              {/* Traveling Glowing Pulses */}
              {featureNodes.map(node => (
                <path
                  key={`pulse-${node.id}`}
                  d={node.path}
                  className="travel-line"
                  style={{ animationDelay: node.delay }}
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  fill="none"
                  filter="url(#glowLine)"
                />
              ))}
            </svg>

            {/* Providers Nodes */}
            {featureNodes.map(node => (
              <div
                key={`node-${node.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 group/node cursor-pointer"
                style={{ left: node.x, top: node.y }}
              >
                <div className="w-16 h-16 bg-[#0a101d] border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl flex items-center justify-center group-hover/node:bg-[#0f172a] group-hover/node:border-blue-500/40 group-hover/node:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300 hover:scale-105">
                  <svg className="w-6 h-6 text-slate-400 group-hover/node:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* Lightning bolt icon shape */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-slate-500 group-hover/node:text-blue-200 transition-colors uppercase tracking-wider whitespace-nowrap">{node.label}</span>
              </div>
            ))}

            {/* Central Hub Node */}
            <div className="absolute top-[225px] left-[500px] transform -translate-x-1/2 -translate-y-1/2 w-[84px] h-[84px] bg-[#0f172a] border border-blue-500/50 rounded-[1.25rem] flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] z-50 hover:scale-[1.05] transition-transform duration-300 cursor-pointer">
              <svg className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="fixed bottom-10 right-10 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:flex z-[100] pointer-events-none">
          Scroll to explore
          <svg className="w-4 h-4 text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>

        {/* --- PRODUCT DESCRIPTION SECTION --- */}
        <div id="about" className="relative mt-32 w-full max-w-5xl mx-auto px-6 z-20 mb-32 group animate-fade-up-blur">
          <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>

          <div className="relative bg-[#0a101d]/60 border border-white/10 p-10 md:p-16 rounded-3xl backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Decorative glow inside */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <span className="text-blue-400 font-semibold tracking-wide uppercase text-sm">About LexiGuard</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight leading-tight">Intelligent AI Built For <br />Modern Legal Teams.</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                LexiGuard replaces the chaos of scattered documents and endless email threads with a single, intelligent platform. From instantly analyzing risks in incoming contracts to automatically generating safe agreements, we secure your company's interests while moving at the speed of your business.
              </p>

              <Link href="/login" className="px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform inline-flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Start Free Trial
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* --- MINIMAL FOOTER --- */}
      <footer className="w-full border-t border-white/5 py-10 px-6 z-20 relative bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-lg font-medium tracking-tight text-white">LexiGuard</span>
          </div>
          <div className="text-sm text-slate-500">
            &copy; 2026 LexiGuard Inc. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

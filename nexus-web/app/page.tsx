"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

// --- 3D Hover Card Component ---
function HoverCard({ children, href, delay, color }: { children: React.ReactNode, href: string, delay: number, color: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    // Calculate rotation (max 10 degrees)
    const rotateY = ((x / width) - 0.5) * 20;
    const rotateX = ((y / height) - 0.5) * -20;

    mouseX.set(rotateX);
    mouseY.set(rotateY);
  }

  return (
    <Link href={href} className="block perspective-1000">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        whileHover={{ scale: 1.05 }}
        style={{ rotateX: mouseX, rotateY: mouseY, transformStyle: "preserve-3d" }}
        className="relative h-full bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 overflow-hidden group shadow-xl"
      >
        {/* Hover Gradient Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-multiply"
             style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }} />

        {/* Content (pushed forward in 3D space) */}
        <div style={{ transform: "translateZ(30px)" }} className="relative z-10 h-full flex flex-col">
          {children}
        </div>
      </motion.div>
    </Link>
  );
}

export default function MasterLandingPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900">

      {/* --- High-Contrast Emergency Background --- */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-red-500 rounded-full blur-[150px] pointer-events-none z-0"
      />

      {/* --- Hero Section --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center z-10 max-w-3xl mb-16 relative"
      >
        <div className="mb-4 relative inline-block">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
            NEXUS
          </h1>
          <motion.div
            className="absolute -right-4 -top-4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <p className="text-xl md:text-2xl text-slate-600 font-medium mb-8">
          AI-Powered Hospitality Crisis Intelligence.
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 tracking-wide uppercase">
          Select Role to Begin Simulation
        </div>
      </motion.div>

      {/* --- Role Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10 w-full max-w-6xl px-4 perspective-1000">

        {/* Guest */}
        <HoverCard href="/guest/sos?h=hotel_001&f=4&r=412" delay={0.1} color="rgba(59, 130, 246, 0.15)">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-4xl shadow-inner border border-blue-100">📱</div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest rounded-full border border-blue-200">Initiator</span>
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-900">Guest Portal</h2>
          <p className="text-slate-600 mb-8 leading-relaxed flex-1 font-medium text-sm">3 taps. No login. Instantly report crises dynamically triaged by Gemini AI.</p>
          <div className="text-blue-600 font-black uppercase tracking-widest text-xs group-hover:text-blue-700 transition-colors flex items-center gap-2 mt-auto border-t border-slate-100 pt-4">
            Launch SOS Flow <span className="text-lg group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </HoverCard>

        {/* Staff */}
        <HoverCard href="/staff/dashboard" delay={0.2} color="rgba(139, 92, 246, 0.15)">
          <div className="flex justify-between items-start mb-6">
             <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-4xl shadow-inner border border-purple-100">🏃‍♂️</div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-widest rounded-full border border-purple-200">Responder</span>
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-900">Staff Hub</h2>
          <p className="text-slate-600 mb-8 leading-relaxed flex-1 font-medium text-sm">Mobile-native interface. Receive instant AI-generated protocols and active dispatch alerts.</p>
          <div className="text-purple-600 font-black uppercase tracking-widest text-xs group-hover:text-purple-700 transition-colors flex items-center gap-2 mt-auto border-t border-slate-100 pt-4">
            View Dashboard <span className="text-lg group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </HoverCard>

        {/* Manager */}
        <HoverCard href="/manager/command" delay={0.3} color="rgba(239, 68, 68, 0.15)">
          <div className="flex justify-between items-start mb-6">
             <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-4xl shadow-inner border border-red-100">🖥️</div>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest rounded-full border border-red-200">Orchestrator</span>
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-900">Command Center</h2>
          <p className="text-slate-600 mb-8 leading-relaxed flex-1 font-medium text-sm">The bird's-eye view. Sentinel predictive threat mapping, AI 112-Briefs, and Live Vision analysis.</p>
          <div className="text-red-600 font-black uppercase tracking-widest text-xs group-hover:text-red-700 transition-colors flex items-center gap-2 mt-auto border-t border-slate-100 pt-4">
            Enter Command <span className="text-lg group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </HoverCard>

      </div>

      {/* --- Footer --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-6 text-center z-10"
      >
        <p className="text-xs text-slate-400 font-black tracking-widest mb-1">GOOGLE SOLUTION CHALLENGE 2026</p>
      </motion.div>
    </main>
  );
}

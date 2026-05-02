"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CCTVVision({ type, severity }: { type: string; severity: number }) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const isFire = type.toLowerCase().includes("fire");
  const isMedical = type.toLowerCase().includes("medical");

  const boxColor = severity >= 4 ? "#EF4444" : "#F59E0B";
  const label = isFire ? "THERMAL: 450°C" : isMedical ? "BIOMETRICS: CRITICAL" : "ANOMALY DETECTED";

  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-xl overflow-hidden mt-6 shadow-inner border border-gray-800">
      {/* Fake Camera Feed Background */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen"
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1556740714-a8395b3bf30f?q=80&w=800&auto=format&fit=crop')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             filter: isFire ? "sepia(1) hue-rotate(-50deg) saturate(3)" : "grayscale(0.8) contrast(1.2)"
           }}
      />

      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)" }} />

      {/* Camera UI Overlay */}
      <div className="absolute top-2 left-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-red-500 tracking-widest">REC / CAM_412</span>
      </div>
      <div className="absolute top-2 right-3">
        <span className="text-[10px] font-mono font-bold text-green-400">FPS: 29.97</span>
      </div>

      {analyzing ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
           <div className="text-center">
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
             <p className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Gemini Vision<br/>Analyzing Stream...</p>
           </div>
        </div>
      ) : (
        <>
          {/* AI Bounding Box */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-[20%] left-[30%] w-[40%] h-[50%] border-2 flex flex-col justify-end"
            style={{ borderColor: boxColor }}
          >
             <motion.div
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               className="text-[9px] font-mono font-bold text-black px-1 mt-auto"
               style={{ background: boxColor, whiteSpace: "nowrap", overflow: "hidden" }}
             >
               {label} [98.4%]
             </motion.div>
          </motion.div>

          {/* AI Scanning Line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[1px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-10 opacity-60"
          />
        </>
      )}
    </div>
  );
}

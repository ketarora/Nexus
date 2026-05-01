"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMockData } from "../../../components/MockProvider";

const INCIDENT_TYPES = [
  { id: "medical", icon: "❤️‍🩹", label: "Medical Emergency", desc: "Heartbeat, injury, or health crisis", color: "#FF1744", softColor: "#FFEBEE" },
  { id: "fire", icon: "🔥", label: "Fire / Smoke", desc: "Smoke, fire, or heat detection", color: "#FF6B00", softColor: "#FFF3E6" },
  { id: "security", icon: "🛡️", label: "Security Concern", desc: "Intruder, safety threat, or suspicious activity", color: "#0052FF", softColor: "#E6EFFF" },
  { id: "maintenance", icon: "🔧", label: "Facility Issue", desc: "Leaking, power failure, or hazard", color: "#F5A623", softColor: "#FFF8E6" },
];

const PulseRing = ({ color }: { color: string }) => (
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
    <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: color }}></span>
  </span>
);

const StepBar = ({ current, total }: { current: number, total: number }) => {
  return (
    <div className="flex w-full gap-2 px-6 pt-6 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "#E5E9EF" }}>
          <motion.div
            className="h-full w-full origin-left"
            style={{ background: "#0052FF" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i + 1 <= current ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      ))}
    </div>
  );
};

export default function GuestSOS() {
  const router = useRouter();
  const { addIncident } = useMockData();
  const [step, setStep] = useState(1);
  const [room, setRoom] = useState("");
  const [floor, setFloor] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check URL params for auto-fill
    const params = new URLSearchParams(window.location.search);
    if (params.get("r")) setRoom(params.get("r")!);
    if (params.get("f")) setFloor(params.get("f")!);
  }, []);

  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
        return () => clearTimeout(t);
      } else {
        fireAlert();
      }
    }
  }, [countdown]);

  const fireAlert = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Simulate AI triage and network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sel = INCIDENT_TYPES.find(t => t.id === selectedType);

    const mockIncident = {
      id: `INC-${Math.floor(Math.random() * 10000)}`,
      type: sel?.label || "Emergency",
      location: `Room ${room} - Floor ${floor}`,
      severity: (sel?.id === "medical" || sel?.id === "fire" ? 5 : 4) as 1|2|3|4|5,
      status: "Assessing" as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: description || "No additional description provided.",
    };

    addIncident(mockIncident);
    setSubmitted(true);
    setIsSubmitting(false);

    // Redirect to active tracking page
    setTimeout(() => {
      router.push(`/guest/active/${mockIncident.id}`);
    }, 2000);

  }, [selectedType, room, floor, name, description, isSubmitting, addIncident, router]);

  const sel = INCIDENT_TYPES.find(t => t.id === selectedType);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0052FF", color: "white" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm w-full">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-6">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
              <span className="text-5xl">🤖</span>
            </motion.div>
          </div>
          <h1 className="text-3xl font-black mb-3">Gemini Triaging...</h1>
          <p className="text-lg opacity-90 mb-8">Analyzing severity and dispatching protocols to nearby staff.</p>
          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg bg-blue-600 shadow-lg shadow-blue-600/20">N</div>
        <div>
          <h1 className="font-bold text-sm text-gray-900">NEXUS Emergency</h1>
          <p className="text-xs text-gray-500">Grand Azure Hotel{room ? ` · Room ${room}` : ""}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full px-3 py-1 bg-red-50 border border-red-100">
          <span className="text-xs font-bold text-red-600">SOS</span>
          <PulseRing color="#FF1744" />
        </div>
      </div>

      <StepBar current={step} total={3} />

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-blue-600 mt-4">Step 1 of 3</p>
              <h2 className="text-3xl font-black mb-2 text-gray-900">Your Location</h2>
              <p className="text-sm mb-8 text-gray-500">So staff can find you instantly</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Room Number</label>
                  <input value={room} onChange={e => setRoom(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-2xl font-bold text-center focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none" placeholder="412" type="number" inputMode="numeric" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Floor</label>
                  <input value={floor} onChange={e => setFloor(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-2xl font-bold text-center focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none" placeholder="4" type="number" inputMode="numeric" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!room || !floor} className="w-full mt-8 py-4 rounded-2xl font-bold text-lg text-white transition-all disabled:bg-gray-200 disabled:text-gray-400 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95">
                Next Step →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-blue-600 mt-4">Step 2 of 3</p>
              <h2 className="text-3xl font-black mb-2 text-gray-900">What&apos;s Happening?</h2>
              <p className="text-sm mb-6 text-gray-500">Tap the type of emergency</p>

              <div className="grid grid-cols-2 gap-4">
                {INCIDENT_TYPES.map(type => {
                  const isSel = selectedType === type.id;
                  return (
                    <motion.button key={type.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedType(type.id)}
                      className={`p-5 rounded-2xl text-left transition-all duration-200 border-2 ${isSel ? 'shadow-lg' : 'shadow-sm'}`}
                      style={{
                        background: isSel ? type.softColor : "#FFFFFF",
                        borderColor: isSel ? type.color : "#E5E9EF",
                      }}>
                      <div className="text-4xl mb-3 drop-shadow-sm">{type.icon}</div>
                      <div className="font-bold text-sm leading-tight" style={{ color: isSel ? type.color : "#0A0E1A" }}>{type.label}</div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">← Back</button>
                <button onClick={() => setStep(3)} disabled={!selectedType} className="flex-1 py-4 rounded-2xl font-bold text-lg text-white transition-all disabled:bg-gray-200 disabled:text-gray-400 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95">
                  Continue 🚨
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-blue-600 mt-4">Step 3 of 3</p>
              <h2 className="text-3xl font-black mb-2 text-gray-900">Confirm & Send</h2>
              <p className="text-sm mb-6 text-gray-500">Add details if safe to do so</p>

              <div className="rounded-2xl p-4 mb-6 flex items-center gap-4 bg-gray-50 border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-white shadow-sm">{sel?.icon}</div>
                <div>
                  <p className="font-bold text-gray-900">{sel?.label}</p>
                  <p className="text-sm text-gray-500">Room {room} · Floor {floor}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                   <label className="block text-sm font-semibold mb-2 text-gray-700">Description (Optional)</label>
                   <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none resize-none h-28" placeholder="e.g. Someone collapsed, not breathing..." />
                </div>
              </div>

              {countdown !== null ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center pb-8">
                  <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="64" cy="64" r="54" fill="none" stroke="#FEE2E2" strokeWidth="8" />
                      <motion.circle cx="64" cy="64" r="54" fill="none" stroke="#DC2626" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - countdown / 5) }}
                        transition={{ duration: 0.9, ease: "linear" }} />
                    </svg>
                    <span className="text-5xl font-black text-red-600">{countdown}</span>
                  </div>
                  <p className="font-bold text-gray-900 mb-2">Sending SOS in {countdown}s</p>
                  <button onClick={() => setCountdown(null)} className="px-6 py-3 rounded-full font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all text-sm">
                    Cancel Request
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3 pb-8">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCountdown(5)} disabled={isSubmitting} className="w-full py-5 rounded-2xl font-black text-lg text-white relative overflow-hidden bg-red-600 shadow-xl shadow-red-600/30">
                    <span className="relative z-10">SEND EMERGENCY ALERT</span>
                  </motion.button>
                  <button onClick={() => setStep(2)} className="w-full py-3 rounded-2xl font-semibold text-gray-500 hover:bg-gray-50 transition-all text-sm">
                    ← Edit Details
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

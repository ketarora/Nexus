"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { isDemoMode } from "@/lib/firebase";
import { createDemoIncident } from "@/lib/demo-data";
import type { IncidentType } from "@/lib/types";

const INCIDENT_TYPES = [
  { id: "medical" as IncidentType, label: "Medical Emergency", icon: "🏥", desc: "Heart attack, injury, illness", color: "#FF1744", softColor: "#FFEBEE", borderColor: "#FF8A80" },
  { id: "fire" as IncidentType, label: "Fire / Smoke", icon: "🔥", desc: "Fire, smoke, gas smell", color: "#FF6B00", softColor: "#FFF3E6", borderColor: "#FFAB76" },
  { id: "security" as IncidentType, label: "Security Threat", icon: "🚨", desc: "Theft, assault, suspect", color: "#7C3AED", softColor: "#F5F3FF", borderColor: "#C4B5FD" },
  { id: "flood" as IncidentType, label: "Water / Flood", icon: "💧", desc: "Flooding, pipe burst", color: "#0052FF", softColor: "#E6EFFF", borderColor: "#93B4FF" },
  { id: "power" as IncidentType, label: "Power Outage", icon: "⚡", desc: "Electricity failure", color: "#B45309", softColor: "#FFF8E6", borderColor: "#FCD34D" },
  { id: "other" as IncidentType, label: "Other Emergency", icon: "⚠️", desc: "Any urgent situation", color: "#374151", softColor: "#F3F4F6", borderColor: "#9CA3AF" },
] as const;

function PulseRing({ color }: { color: string }) {
  return (
    <span className="relative flex h-3 w-3 ml-1">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: color }} />
    </span>
  );
}

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 px-5 pt-3 pb-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
          style={{ background: i < current ? "#0052FF" : "#E5E9EF" }} />
      ))}
    </div>
  );
}

function SuccessCheck() {
  return (
    <motion.svg viewBox="0 0 80 80" width="100" height="100"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <motion.circle cx="40" cy="40" r="36" fill="#2EA043"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} />
      <motion.path d="M22 40 L34 52 L58 28" stroke="white" strokeWidth="5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }} />
    </motion.svg>
  );
}

function GuestSOSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<IncidentType | "">("");
  const [room, setRoom] = useState(searchParams.get("r") || "");
  const [floor, setFloor] = useState(searchParams.get("f") || "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hotelId = searchParams.get("h") || "hotel_001";
  const hotelName = hotelId === "hotel_001" ? "Grand Nexus Hotel" : hotelId;

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
      return () => clearTimeout(t);
    }
    // countdown reached 0
    fireAlert();
  }, [countdown]);

  const fireAlert = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isDemoMode) {
        const incident = createDemoIncident(selectedType, room, floor, name, description);
        const stored = JSON.parse(localStorage.getItem("nexus_incidents") || "[]");
        stored.push(incident);
        localStorage.setItem("nexus_incidents", JSON.stringify(stored));
        localStorage.setItem("nexus_active_incident", incident.id);
        setIncidentId(incident.id);
      } else {
        const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const ref = await addDoc(collection(db, "incidents"), {
          type: selectedType,
          location: { hotel: hotelName, hotelId, room, floor, lat: 28.6139, lng: 77.2090 },
          description,
          reportedBy: { name: name || "Anonymous Guest", language: typeof navigator !== "undefined" ? navigator.language : "en" },
          status: "pending",
          assignedStaff: [],
          updates: [],
          createdAt: serverTimestamp(),
        });
        setIncidentId(ref.id);
      }
    } catch (err) {
      console.error("Failed to send alert:", err);
      const incident = createDemoIncident(selectedType, room, floor, name, description);
      const stored = JSON.parse(localStorage.getItem("nexus_incidents") || "[]");
      stored.push(incident);
      localStorage.setItem("nexus_incidents", JSON.stringify(stored));
      localStorage.setItem("nexus_active_incident", incident.id);
      setIncidentId(incident.id);
    }
    setSubmitted(true);
    setIsSubmitting(false);
  }, [selectedType, room, floor, name, description, hotelId, isSubmitting]);

  const sel = INCIDENT_TYPES.find(t => t.id === selectedType);

  if (submitted && incidentId) {
    setTimeout(() => {
      router.push(`/guest/active/${incidentId}`);
    }, 2000);

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#FAFBFC", maxWidth: 480, margin: "0 auto" }}>
        <div className="p-4 flex items-center gap-3" style={{ background: "#0052FF" }}>
          <span className="font-black text-xl text-white">NEXUS</span>
          <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-white">LIVE</span>
            <PulseRing color="white" />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <SuccessCheck />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="text-3xl font-black mt-5 mb-2" style={{ color: "#0A0E1A" }}>Help Is Coming</h1>
            <p className="text-sm mb-6" style={{ color: "#6B7689" }}>Staff have been alerted. Stay calm and stay put.</p>
            <div className="rounded-2xl p-5 mb-4 text-left w-full"
              style={{ background: sel?.softColor || "#F4F6F8", border: `2px solid ${sel?.color || "#E5E9EF"}` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{sel?.icon}</span>
                <div>
                  <p className="font-bold" style={{ color: sel?.color }}>{sel?.label}</p>
                  <p className="text-sm" style={{ color: "#6B7689" }}>Room {room} · Floor {floor}</p>
                </div>
              </div>
            </div>
            <p className="text-xs mt-4" style={{ color: "#9CA5B4" }}>Redirecting to live tracking...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFBFC", maxWidth: 480, margin: "0 auto" }}>
      <div className="p-4 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E9EF" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: "#0052FF" }}>N</div>
        <div>
          <h1 className="font-bold text-sm" style={{ color: "#0A0E1A" }}>NEXUS Emergency</h1>
          <p className="text-xs" style={{ color: "#6B7689" }}>{hotelName}{room ? ` · Room ${room}` : ""}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-full px-3 py-1" style={{ background: "#FFEBEE" }}>
          <span className="text-xs font-bold" style={{ color: "#FF1744" }}>SOS</span>
          <PulseRing color="#FF1744" />
        </div>
      </div>

      <StepBar current={step} total={3} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }} className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0052FF" }}>Step 1 of 3</p>
              <h2 className="text-2xl font-black mb-1" style={{ color: "#0A0E1A" }}>Your Location</h2>
              <p className="text-sm mb-6" style={{ color: "#6B7689" }}>So staff can find you instantly</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3D4759" }}>Room Number *</label>
                  <input value={room} onChange={e => setRoom(e.target.value)} className="nx-input"
                    style={{ fontSize: "2rem", fontWeight: 800, textAlign: "center", height: 72, letterSpacing: "0.05em", width: "100%", border: "2px solid #E5E9EF", borderRadius: "16px" }}
                    placeholder="412" type="number" inputMode="numeric" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3D4759" }}>Floor Number *</label>
                  <input value={floor} onChange={e => setFloor(e.target.value)} className="nx-input"
                    style={{ fontSize: "2rem", fontWeight: 800, textAlign: "center", height: 72, width: "100%", border: "2px solid #E5E9EF", borderRadius: "16px" }}
                    placeholder="4" type="number" inputMode="numeric" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!room || !floor}
                className="w-full mt-6 py-4 rounded-2xl font-bold text-lg text-white transition-all"
                style={{ background: room && floor ? "#0052FF" : "#E5E9EF", color: room && floor ? "white" : "#9CA5B4" }}>
                Next → Choose Emergency Type
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }} className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0052FF" }}>Step 2 of 3</p>
              <h2 className="text-2xl font-black mb-1" style={{ color: "#0A0E1A" }}>What's Happening?</h2>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                {INCIDENT_TYPES.map(type => {
                  const isSel = selectedType === type.id;
                  return (
                    <motion.button key={type.id} whileTap={{ scale: 0.94 }}
                      onClick={() => setSelectedType(type.id)}
                      className="p-4 rounded-2xl text-left transition-all duration-200"
                      style={{
                        background: isSel ? type.softColor : "#FFFFFF",
                        border: isSel ? `2px solid ${type.color}` : "1.5px solid #E5E9EF",
                      }}>
                      <div className="text-4xl mb-2">{type.icon}</div>
                      <div className="font-bold text-sm" style={{ color: isSel ? type.color : "#0A0E1A" }}>{type.label}</div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl font-semibold"
                  style={{ background: "#F4F6F8", color: "#3D4759" }}>← Back</button>
                <button onClick={() => setStep(3)} disabled={!selectedType}
                  className="flex-[2] py-4 rounded-2xl font-bold text-lg text-white"
                  style={{ background: selectedType ? "#FF1744" : "#E5E9EF" }}>
                  REPORT 🚨
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }} className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0052FF" }}>Step 3 of 3</p>
              <h2 className="text-2xl font-black mb-1" style={{ color: "#0A0E1A" }}>Confirm & Send</h2>
              
              <div className="space-y-3 mb-5 mt-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" 
                  style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1.5px solid #E5E9EF" }}/>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1.5px solid #E5E9EF", minHeight: "100px" }}
                  placeholder="Brief description (e.g. father collapsed)" />
              </div>

              {countdown !== null ? (
                <div className="text-center">
                  <div className="text-5xl font-black mb-2" style={{ color: "#FF1744" }}>{countdown}s</div>
                  <p className="font-semibold mb-4">Alerting staff...</p>
                  <button onClick={() => { setCountdown(null); setIsSubmitting(false); }}
                    className="w-full py-4 rounded-2xl font-bold" style={{ background: "#F4F6F8" }}>✕ Cancel Alert</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.button onClick={() => setCountdown(30)} disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl font-black text-xl text-white" style={{ background: "#FF1744" }}>
                    🚨 SEND EMERGENCY ALERT
                  </motion.button>
                  <button onClick={() => setStep(2)} className="w-full py-3 rounded-2xl font-semibold" style={{ background: "#F4F6F8" }}>← Go Back</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// THIS IS THE CRITICAL FIX: WRAPPING IN SUSPENSE
export default function GuestSOS() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500" style={{ background: "#FAFBFC" }}>
        Loading NEXUS...
      </div>
    }>
      <GuestSOSContent />
    </Suspense>
  );
}

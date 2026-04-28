"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isDemoMode } from "@/lib/firebase";
import { getDemoIncidentById, simulateStatusProgression } from "@/lib/demo-data";
import { motion } from "framer-motion";
import type { Incident } from "@/lib/types";
import { INCIDENT_ICONS, SEVERITY_CONFIG, getTimeSince } from "@/lib/types";

export default function ActiveIncidentPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    if (isDemoMode || id.startsWith("guest_")) {
      const loadDemo = () => {
        let found = getDemoIncidentById(id);
        if (!found && id.startsWith("guest_")) {
          const stored = JSON.parse(localStorage.getItem("nexus_incidents") || "[]");
          found = stored.find((i: any) => i.id === id);
        }
        if (found) {
          setIncident(simulateStatusProgression(found));
          setLoading(false);
        } else {
          setLoading(false);
        }
      };
      loadDemo();
      const interval = setInterval(loadDemo, 5000);
      return () => clearInterval(interval);
    } else {
      const unsub = onSnapshot(doc(db, "incidents", id), snap => {
        if (snap.exists()) setIncident({ id: snap.id, ...snap.data() } as Incident);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFBFC" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm" style={{ color: "#6B7689" }}>Loading status...</p>
      </div>
    </div>
  );

  if (!incident) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAFBFC" }}>
      <div className="text-center"><p className="text-4xl mb-3">🔍</p>
        <h2 className="text-xl font-bold" style={{ color: "#0A0E1A" }}>Incident Not Found</h2>
        <p className="text-sm mt-2" style={{ color: "#6B7689" }}>This incident may have expired or been resolved.</p>
      </div>
    </div>
  );

  const sev = incident.severity ? SEVERITY_CONFIG[incident.severity] : null;
  const icon = INCIDENT_ICONS[incident.type] || "⚠️";
  const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    pending: { label: "AI Processing...", color: "#F5A623", desc: "Our AI is analyzing your emergency" },
    active: { label: "Staff Dispatched", color: "#0052FF", desc: "Staff have been alerted with AI protocols" },
    responding: { label: "En Route", color: "#2EA043", desc: "Staff are heading to your location" },
    contained: { label: "Under Control", color: "#2EA043", desc: "Situation is being managed" },
    resolved: { label: "Resolved ✓", color: "#2EA043", desc: "Incident has been resolved" },
  };
  const st = statusMap[incident.status] || statusMap.pending;

  return (
    <div className="min-h-screen" style={{ background: "#FAFBFC", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E9EF" }}>
        <div className="font-black text-base" style={{ color: "#0052FF" }}>NEXUS</div>
        <span className="text-xs" style={{ color: "#9CA5B4" }}>·</span>
        <span className="text-xs" style={{ color: "#6B7689" }}>Live Tracking · {getTimeSince(incident.createdAt)}</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ background: st.color }} />
            <span className="relative rounded-full h-2.5 w-2.5" style={{ background: st.color }} />
          </span>
          <span className="text-xs font-bold ml-1" style={{ color: st.color }}>{st.label}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Main Status Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center"
          style={sev ? { background: sev.softColor, border: `2px solid ${sev.color}` } : { background: "#F4F6F8", border: "1px solid #E5E9EF" }}>
          <p className="text-6xl mb-3">{icon}</p>
          <h2 className="text-xl font-black mb-1" style={{ color: sev?.color || "#0A0E1A" }}>
            {incident.geminiClassification?.classification || incident.type}
          </h2>
          <p className="text-sm" style={{ color: "#6B7689" }}>Room {incident.location.room} · Floor {incident.location.floor}</p>
          {sev && <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: sev.color }}>
            Severity {incident.severity} — {sev.label}
          </div>}
        </motion.div>

        {/* Current Status */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: st.color }} />
            <h3 className="font-bold" style={{ color: st.color }}>{st.label}</h3>
          </div>
          <p className="text-sm" style={{ color: "#6B7689" }}>{st.desc}</p>
          {incident.assignedStaff.length > 0 && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: "#E6F7EB" }}>
              <p className="text-sm font-semibold" style={{ color: "#2EA043" }}>
                👥 {incident.assignedStaff.length} staff member{incident.assignedStaff.length > 1 ? "s" : ""} responding
              </p>
              <p className="text-xs mt-1" style={{ color: "#6B7689" }}>
                {incident.assignedStaff.map(sid => {
                  const names: Record<string, string> = { staff_001: "Rahul (Security)", staff_002: "Priya (Medical)", staff_003: "Amit (Maintenance)", staff_004: "Sneha (Management)" };
                  return names[sid] || sid;
                }).join(" · ")}
              </p>
            </div>
          )}
        </motion.div>

        {/* AI Instructions */}
        {incident.geminiClassification?.guestInstructions && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5" style={{ background: "#E6EFFF", border: "1px solid #93B4FF" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#0052FF" }}>🤖 AI Instructions</p>
            <p className="text-sm leading-relaxed" style={{ color: "#0A0E1A" }}>{incident.geminiClassification.guestInstructions}</p>
          </motion.div>
        )}

        {/* Timeline */}
        {incident.updates.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#9CA5B4" }}>📋 Timeline</p>
            <div className="space-y-3">
              {incident.updates.map((u, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{
                    background: u.type === "status_change" ? "#0052FF" : u.type === "escalation" ? "#FF1744" : u.type === "staff_acknowledged" ? "#2EA043" : "#9CA5B4"
                  }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#0A0E1A" }}>{u.message}</p>
                    <p className="text-xs" style={{ color: "#9CA5B4" }}>{u.author} · {getTimeSince(u.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Emergency Brief */}
        {incident.emergencyBrief && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-5" style={{ background: "#E6F7EB", border: "1px solid #2EA043" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#2EA043" }}>📞 112 Emergency Brief</p>
            <p className="text-sm leading-relaxed font-medium" style={{ color: "#0A0E1A" }}>{incident.emergencyBrief}</p>
          </motion.div>
        )}
      </div>

      {isDemoMode && (
        <div className="p-4 text-center">
          <p className="text-xs font-bold" style={{ color: "#F5A623" }}>🛠️ DEMO MODE — Simulated live updates every 5 seconds</p>
        </div>
      )}
    </div>
  );
}


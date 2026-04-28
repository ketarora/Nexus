"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
    return onSnapshot(doc(db, "incidents", id), snap => {
      if (snap.exists()) setIncident({ id: snap.id, ...snap.data() } as Incident);
      setLoading(false);
    });
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF" }}>
          <h3 className="font-bold mb-1" style={{ color: st.color }}>{st.label}</h3>
          <p className="text-sm" style={{ color: "#6B7689" }}>{st.desc}</p>
          {incident.assignedStaff.length > 0 && (
            <p className="text-sm mt-2 font-semibold" style={{ color: "#0052FF" }}>
              👥 {incident.assignedStaff.length} staff responding
            </p>
          )}
        </motion.div>

        {incident.geminiClassification?.guestInstructions && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5" style={{ background: "#E6EFFF", border: "1px solid #93B4FF" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#0052FF" }}>🤖 AI Instructions</p>
            <p className="text-sm leading-relaxed" style={{ color: "#0A0E1A" }}>{incident.geminiClassification.guestInstructions}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

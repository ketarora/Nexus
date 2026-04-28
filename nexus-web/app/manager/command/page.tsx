"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import type { Incident, SentinelPrediction } from "@/lib/types";
import { SEVERITY_CONFIG, INCIDENT_ICONS, getTimeSince } from "@/lib/types";

// ─── Inline Components ────────────────────────────────────────

function PulseRing({ color, size = 2.5 }: { color: string; size?: number }) {
  return (
    <span className="relative flex" style={{ width: size * 4, height: size * 4 }}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-full w-full" style={{ background: color }} />
    </span>
  );
}

function SeverityBadge({ severity }: { severity: number }) {
  const cfg = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
  if (!cfg) return null;
  return (
    <span className="nx-badge text-white" style={{ background: cfg.color, fontSize: 10 }}>
      {cfg.label}
    </span>
  );
}

function IncidentCard({ incident, isSelected, onClick }: {
  incident: Incident; isSelected: boolean; onClick: () => void;
}) {
  const sev = incident.severity ? SEVERITY_CONFIG[incident.severity] : null;
  const isCritical = (incident.severity ?? 0) >= 4;
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="p-4 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden"
      style={{
        background: isSelected ? "#E6EFFF" : "#FFFFFF",
        border: isSelected ? "2px solid #0052FF" : `1.5px solid ${isCritical ? sev?.color + "40" : "#E5E9EF"}`,
        boxShadow: isCritical ? `0 0 0 2px ${sev?.color}20, 0 4px 12px ${sev?.color}20` : "0 1px 3px rgba(10,14,26,0.04)",
      }}>
      {isCritical && (
        <motion.div className="absolute top-3 right-3" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: sev?.color }} />
        </motion.div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: sev?.softColor || "#F4F6F8" }}>
          {INCIDENT_ICONS[incident.type] || "⚠️"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {sev && <SeverityBadge severity={incident.severity!} />}
            <span className="text-xs font-mono" style={{ color: "#9CA5B4" }}>{getTimeSince(incident.createdAt)}</span>
          </div>
          <p className="font-semibold text-sm truncate" style={{ color: "#0A0E1A" }}>
            {incident.geminiClassification?.classification || incident.type}
          </p>
          <p className="text-xs" style={{ color: "#6B7689" }}>
            Room {incident.location.room} · Floor {incident.location.floor}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {incident.assignedStaff.length > 0 && (
              <span className="text-xs" style={{ color: "#2EA043" }}>
                👥 {incident.assignedStaff.length} responding
              </span>
            )}
            {incident.emergencyBrief && (
              <span className="text-xs" style={{ color: "#F5A623" }}>📞 112 ready</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function IncidentDrawer({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setActiveTab("overview"); }, [incident?.id]);

  const copyBrief = useCallback(async () => {
    if (!incident?.emergencyBrief) return;
    await navigator.clipboard.writeText(incident.emergencyBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [incident?.emergencyBrief]);

  return (
    <AnimatePresence>
      {incident && (
        <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="flex flex-col overflow-hidden"
          style={{ background: "#FFFFFF", borderLeft: "1px solid #E5E9EF", height: "100%" }}>
          {/* Drawer Header */}
          {(() => {
            const sev = incident.severity ? SEVERITY_CONFIG[incident.severity] : null;
            return (
              <div className="p-5 flex-shrink-0" style={{ borderBottom: "1px solid #E5E9EF", background: sev?.softColor || "#FAFBFC" }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{INCIDENT_ICONS[incident.type] || "⚠️"}</span>
                    {sev && <SeverityBadge severity={incident.severity!} />}
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: "#F4F6F8", color: "#6B7689" }}>×</button>
                </div>
                <h2 className="text-lg font-black" style={{ color: sev?.color || "#0A0E1A" }}>
                  {incident.geminiClassification?.classification || incident.type}
                </h2>
                <p className="text-sm" style={{ color: "#6B7689" }}>
                  Room {incident.location.room} · Floor {incident.location.floor} · {getTimeSince(incident.createdAt)}
                </p>
              </div>
            );
          })()}

          {/* Tabs */}
          <div className="flex gap-1 p-3 flex-shrink-0" style={{ borderBottom: "1px solid #E5E9EF", background: "#FAFBFC" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "ai", label: "🤖 AI Brief" },
              { id: "112", label: "📞 112 Brief" },
              { id: "timeline", label: "Timeline" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="nx-tab flex-1 text-xs" style={{ padding: "6px 8px" }}
                data-active={activeTab === tab.id ? "true" : undefined}
                aria-selected={activeTab === tab.id}>
                <span style={{
                  background: activeTab === tab.id ? "#E6EFFF" : "transparent",
                  color: activeTab === tab.id ? "#0052FF" : "#6B7689",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  padding: "4px 8px",
                  borderRadius: 8,
                  display: "block",
                }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === "overview" && (
              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: "#FAFBFC", border: "1px solid #E5E9EF" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA5B4" }}>Location</p>
                  <p className="font-semibold" style={{ color: "#0A0E1A" }}>Room {incident.location.room}</p>
                  <p className="text-sm" style={{ color: "#6B7689" }}>Floor {incident.location.floor} · {incident.location.hotel || incident.location.hotelName}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "#FAFBFC", border: "1px solid #E5E9EF" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA5B4" }}>Staff Responding</p>
                  <p className="text-2xl font-black" style={{ color: "#0052FF" }}>{incident.assignedStaff.length}</p>
                </div>
                {incident.geminiClassification?.riskScore !== undefined && (
                  <div className="rounded-xl p-4" style={{ background: "#FAFBFC", border: "1px solid #E5E9EF" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA5B4" }}>Risk Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full" style={{ background: "#E5E9EF" }}>
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                          animate={{ width: `${incident.geminiClassification.riskScore}%` }}
                          style={{ background: incident.geminiClassification.riskScore > 70 ? "#FF1744" : incident.geminiClassification.riskScore > 40 ? "#F5A623" : "#2EA043" }}
                          transition={{ duration: 0.8, ease: "easeOut" }} />
                      </div>
                      <span className="font-mono font-bold text-sm">{incident.geminiClassification.riskScore}/100</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && incident.geminiClassification && (
              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: "#E6EFFF", border: "1px solid #93B4FF" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#0052FF" }}>AI Classification</p>
                  <p className="font-bold" style={{ color: "#0A0E1A" }}>{incident.geminiClassification.classification}</p>
                  {incident.geminiClassification.immediateRisk && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFEBEE", color: "#FF1744" }}>⚠️ Immediate Risk</span>
                  )}
                </div>
                {Object.entries(incident.geminiClassification.staffProtocols).map(([role, protocol]) => (
                  <div key={role} className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#9CA5B4" }}>{role}</p>
                    <p className="text-sm" style={{ color: "#0A0E1A" }}>{protocol}</p>
                  </div>
                ))}
                {incident.geminiClassification.reasoningChain?.length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: "#FAFBFC", border: "1px solid #E5E9EF" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9CA5B4" }}>AI Reasoning</p>
                    <ul className="space-y-1">
                      {incident.geminiClassification.reasoningChain.map((r, i) => (
                        <li key={i} className="text-xs flex gap-2" style={{ color: "#6B7689" }}>
                          <span style={{ color: "#0052FF" }}>→</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "112" && (
              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: "#E6F7EB", border: "2px solid #2EA043" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#2EA043" }}>
                    🤖 AI-Generated 112 Brief
                  </p>
                  <p className="text-sm leading-relaxed font-medium" style={{ color: "#0A0E1A" }}>
                    {incident.emergencyBrief || incident.geminiClassification?.emergencyBrief || "AI brief not yet generated"}
                  </p>
                </div>
                <button onClick={copyBrief}
                  className="w-full py-4 rounded-xl font-bold text-white transition-all"
                  style={{ background: copied ? "#2EA043" : "#0052FF" }}>
                  {copied ? "✓ Copied to Clipboard!" : "📋 Copy for 112 Call"}
                </button>
                <a href="tel:112" className="block w-full py-4 rounded-xl font-bold text-white text-center"
                  style={{ background: "#FF1744" }}>
                  📞 Call 112 Now
                </a>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex flex-col gap-4">
                    {[
                      { event: "Incident Reported by Guest", actor: incident.reportedBy.name || "Anonymous", time: getTimeSince(incident.createdAt), color: "#FF1744" },
                      ...(incident.geminiClassification ? [{ event: `AI Triage Complete · Severity ${incident.severity}`, actor: "NEXUS AI", time: incident.triageLatencyMs ? `${incident.triageLatencyMs}ms` : "1.4s", color: "#0052FF" }] : []),
                      ...incident.updates.map(u => ({ event: u.message, actor: u.author, time: getTimeSince(u.timestamp), color: "#2EA043" })),
                    ].map((ev, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: ev.color }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#0A0E1A" }}>{ev.event}</p>
                          <p className="text-xs" style={{ color: "#9CA5B4" }}>{ev.actor} · {ev.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Sentinel Panel ──────────────────────────────────────────

const MOCK_PREDICTIONS: SentinelPrediction[] = [
  { id: "p1", hotelId: "hotel_001", zone: "Floor 7 — Room Block C", floor: "7", riskType: "Plumbing Failure", probability: 73, recommendation: "Dispatch maintenance for routine pipe inspection. Aging infrastructure detected.", validFrom: new Date(), validUntil: new Date(Date.now() + 86400000), acknowledged: false, basedOn: "8 incidents in past 90 days" },
  { id: "p2", hotelId: "hotel_001", zone: "Lobby Area", floor: "G", riskType: "Guest Medical Emergency", probability: 42, recommendation: "Ensure AED is charged and accessible. Check medical staff availability.", validFrom: new Date(), validUntil: new Date(Date.now() + 86400000), acknowledged: false, basedOn: "Peak occupancy + seasonal pattern" },
];

function SentinelPanel() {
  const [predictions] = useState<SentinelPrediction[]>(MOCK_PREDICTIONS);
  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="text-base">✨</motion.span>
          <h2 className="font-bold text-sm" style={{ color: "#0A0E1A" }}>NEXUS Sentinel</h2>
        </div>
        <p className="text-xs" style={{ color: "#9CA5B4" }}>Predictive Crisis AI · Vertex AI</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Risk Level", value: "LOW", color: "#2EA043" },
          { label: "Predictions", value: predictions.length.toString(), color: "#0052FF" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF" }}>
            <p className="text-xs font-medium mb-1" style={{ color: stat.color }}>{stat.label}</p>
            <p className="text-lg font-black" style={{ color: "#0A0E1A" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#9CA5B4" }}>Next 24 Hours</p>
        <div className="space-y-3">
          {predictions.map((pred, i) => (
            <motion.div key={pred.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF", boxShadow: "0 1px 4px rgba(10,14,26,0.04)" }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono uppercase" style={{ color: "#9CA5B4" }}>{pred.zone}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 rounded-full" style={{ background: "#E5E9EF" }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${pred.probability}%` }}
                      style={{ background: pred.probability > 60 ? "#FF1744" : pred.probability > 35 ? "#F5A623" : "#2EA043" }}
                      transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                  <span className="text-xs font-mono font-bold"
                    style={{ color: pred.probability > 60 ? "#FF1744" : pred.probability > 35 ? "#F5A623" : "#2EA043" }}>
                    {pred.probability}%
                  </span>
                </div>
              </div>
              <p className="font-semibold text-sm" style={{ color: "#0A0E1A" }}>{pred.riskType}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B7689" }}>{pred.recommendation}</p>
              <button className="text-xs font-semibold mt-2" style={{ color: "#0052FF" }}>Pre-position staff →</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Command Page ────────────────────────────────────────

export default function CommandCenter() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const hotelId = "hotel_001";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) router.push("/manager/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      where("location.hotelId", "==", hotelId),
      where("status", "in", ["pending", "active", "responding"]),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Incident));
      setIncidents(list);
      setLoading(false);
    });
  }, [hotelId]);

  const criticalCount = incidents.filter(i => (i.severity ?? 0) >= 4).length;

  return (
    <div className="h-screen flex flex-col" style={{ background: "#FAFBFC" }}>
      {/* ─ Header ─ */}
      <header className="flex items-center px-6 py-3 gap-6 flex-shrink-0"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E9EF", boxShadow: "0 1px 4px rgba(10,14,26,0.06)", height: 64 }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
            style={{ background: "linear-gradient(135deg, #0052FF, #003BB8)" }}>N</div>
          <div>
            <h1 className="font-black text-base" style={{ color: "#0A0E1A" }}>NEXUS Command</h1>
            <p className="text-xs" style={{ color: "#9CA5B4" }}>Grand Nexus Hotel</p>
          </div>
        </div>

        <div className="flex items-center gap-6 ml-auto">
          {criticalCount > 0 && (
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: "#FFEBEE", border: "1.5px solid #FF1744" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#FF1744" }} />
              <span className="text-sm font-bold" style={{ color: "#FF1744" }}>
                {criticalCount} Critical
              </span>
            </motion.div>
          )}
          <div className="text-center">
            <p className="font-mono font-bold text-base" style={{ color: "#0A0E1A" }}>{time}</p>
            <p className="text-xs" style={{ color: "#9CA5B4" }}>Active Incidents: {incidents.length}</p>
          </div>
        </div>
      </header>

      {/* ─ Body ─ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Sentinel */}
        <aside style={{ width: 280, borderRight: "1px solid #E5E9EF", background: "#FFFFFF", overflow: "hidden" }}>
          <SentinelPanel />
        </aside>

        {/* Center — Incident List */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background: "#FAFBFC" }}>
          <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid #E5E9EF", background: "#FFFFFF" }}>
            <h2 className="font-bold text-sm" style={{ color: "#0A0E1A" }}>
              Active Incidents{" "}
              {incidents.length > 0 && (
                <span className="nx-badge ml-2" style={{ background: "#E6EFFF", color: "#0052FF" }}>{incidents.length}</span>
              )}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="nx-skeleton h-24 rounded-xl" />
                ))
              ) : incidents.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center py-20">
                  <p className="text-5xl mb-4">🛡️</p>
                  <p className="font-bold text-base" style={{ color: "#0A0E1A" }}>All Clear</p>
                  <p className="text-sm mt-1" style={{ color: "#9CA5B4" }}>No active incidents. Hotel is operational.</p>
                </motion.div>
              ) : (
                incidents.map(inc => (
                  <IncidentCard key={inc.id} incident={inc}
                    isSelected={selectedIncident?.id === inc.id}
                    onClick={() => setSelectedIncident(inc)} />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* QR Scanner hint */}
          <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid #E5E9EF", background: "#FFFFFF" }}>
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#E6EFFF" }}>
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "#0052FF" }}>Guest QR Link</p>
                <p className="text-xs" style={{ color: "#6B7689" }}>nexus-crisis.web.app/guest/sos?h=hotel_001</p>
              </div>
            </div>
          </div>
        </main>

        {/* Right — Detail Drawer */}
        <div style={{ width: selectedIncident ? 400 : 0, transition: "width 0.3s ease", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ width: 400, height: "100%" }}>
            <IncidentDrawer incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
          </div>
        </div>
      </div>
    </div>
  );
}

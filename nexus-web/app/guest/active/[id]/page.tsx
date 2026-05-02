"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMockData } from "../../../../components/MockProvider";
import { motion } from "framer-motion";

export default function ActiveIncidentPage() {
  const params = useParams();
  const id = params.id as string;
  const { incidents } = useMockData();
  const [incident, setIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const found = incidents.find(inc => inc.id === id);
    if (found) {
      setIncident(found);
    }
    setLoading(false);
  }, [id, incidents]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 max-w-md mx-auto shadow-2xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-semibold">Loading status...</p>
      </div>
    </div>
  );

  if (!incident) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 max-w-md mx-auto shadow-2xl">
      <div className="text-center">
        <p className="text-5xl mb-4 drop-shadow-md">🔍</p>
        <h2 className="text-xl font-black text-gray-900 mb-2">Incident Not Found</h2>
        <p className="text-gray-500 text-sm">This incident may have been resolved or does not exist.</p>
      </div>
    </div>
  );

  const getIcon = (type: string) => {
    if (type.includes("Medical")) return "❤️‍🩹";
    if (type.includes("Fire")) return "🔥";
    if (type.includes("Security")) return "🛡️";
    return "🚨";
  };

  const icon = getIcon(incident.type);

  const isResolved = incident.status === "Resolved";
  const stColor = isResolved ? "#10B981" : "#3B82F6";
  const stLabel = isResolved ? "Resolved" : "Staff Dispatched";
  const stDesc = isResolved ? "This incident has been handled." : "Staff are heading to your location.";

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col font-sans">
      <div className="p-4 flex items-center gap-3 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="font-black text-lg text-blue-600">NEXUS</div>
        <span className="text-gray-300">·</span>
        <span className="text-xs font-semibold text-gray-500">Live Tracking · {incident.time}</span>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
          <span className="relative flex h-2.5 w-2.5">
            {!isResolved && <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ background: stColor }} />}
            <span className="relative rounded-full h-2.5 w-2.5" style={{ background: stColor }} />
          </span>
          <span className="text-xs font-bold" style={{ color: stColor }}>{stLabel}</span>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 text-center bg-white shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2" style={{ background: incident.severity >= 4 ? "#EF4444" : "#F59E0B" }} />

          <p className="text-7xl mb-4 drop-shadow-md">{icon}</p>
          <h2 className="text-2xl font-black mb-1 text-gray-900 leading-tight">
            {incident.type}
          </h2>
          <p className="text-sm font-semibold text-gray-500 mb-6">{incident.location}</p>

          <div className="inline-flex items-center justify-center w-full py-3 rounded-2xl font-bold text-white shadow-lg"
               style={{ background: incident.severity >= 4 ? "#EF4444" : "#F59E0B" }}>
            Severity {incident.severity}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500" />
          <h3 className="font-bold text-lg mb-1" style={{ color: stColor }}>{stLabel}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{stDesc}</p>
          {!isResolved && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">JD</div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600">SL</div>
              </div>
              <p className="text-sm font-bold text-gray-700">
                Multiple staff responding
              </p>
            </div>
          )}
        </motion.div>

        {!isResolved && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 bg-blue-50 border border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-6xl">🤖</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest mb-2 text-blue-600 flex items-center gap-2">
              <span>✨</span> AI Instructions
            </p>
            <p className="text-sm font-semibold text-blue-900 leading-relaxed">
              Please remain calm and stay exactly where you are. Ensure any immediate hazards are avoided. Help is on the way.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

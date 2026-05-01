"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMockData } from "../../../components/MockProvider";

const PulseRing = ({ color }: { color: string }) => (
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
    <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: color }}></span>
  </span>
);

export default function CommandCenter() {
  const { incidents, triggerSimulation } = useMockData();
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [time, setTime] = useState("");
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const criticalCount = incidents.filter(i => i.severity >= 4 && i.status !== "Resolved").length;
  const activeIncidents = incidents.filter(i => i.status !== "Resolved");

  const generateBrief = () => {
    setGeneratingBrief(true);
    setGeneratedBrief(null);
    setTimeout(() => {
      setGeneratedBrief(`112 EMERGENCY BRIEF:\n\nLOCATION: Grand Azure Hotel, ${selectedIncident?.location}\nINCIDENT: ${selectedIncident?.type} (Severity ${selectedIncident?.severity})\nDESCRIPTION: ${selectedIncident?.description}\nSTATUS: Staff responding.\n\nRECOMMENDED DISPATCH: Police & Medical.`);
      setGeneratingBrief(false);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-nx-bg overflow-hidden font-sans">
      {/* ─ Header ─ */}
      <header className="flex items-center px-6 py-4 gap-6 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-gray-900 shadow-md">N</div>
          <div>
            <h1 className="font-black text-lg text-gray-900 tracking-tight leading-none mb-1">NEXUS Command Center</h1>
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Grand Azure Hotel</p>
          </div>
        </div>

        <div className="flex items-center gap-6 ml-auto">
          <button
            onClick={triggerSimulation}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>⚡</span> Simulate Crisis
          </button>

          {criticalCount > 0 && (
            <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 shadow-sm">
              <PulseRing color="#DC2626" />
              <span className="text-sm font-bold text-red-700">
                {criticalCount} Critical
              </span>
            </motion.div>
          )}
          <div className="text-right border-l border-gray-200 pl-6">
            <p className="font-mono font-bold text-lg text-gray-900 leading-none mb-1">{time}</p>
            <p className="text-xs text-gray-500 font-semibold">Active: {activeIncidents.length}</p>
          </div>
        </div>
      </header>

      {/* ─ Body ─ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Sentinel Predictive AI Map */}
        <aside className="w-[340px] border-r border-gray-200 bg-white flex flex-col z-0">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-xl">🔮</motion.span>
              <h2 className="font-black text-gray-900">Sentinel AI</h2>
            </div>
            <p className="text-xs text-gray-500 font-semibold">Predictive Threat Forecasting</p>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
             <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Risk</span>
                 <span className="text-sm font-black text-orange-600">MODERATE</span>
               </div>
               <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1.5 }} />
               </div>
             </div>

             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Predicted Hotspots (24h)</h3>

             <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-xl border border-gray-200 shadow-sm hover:border-red-300 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">82% Probability</span>
                     <span className="text-xs text-gray-400">Kitchen</span>
                   </div>
                   <h4 className="font-bold text-gray-900 mb-1">Fire Hazard</h4>
                   <p className="text-xs text-gray-500 leading-relaxed">Historical data correlates peak dining hours with increased grease trap temperatures.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-xl border border-gray-200 shadow-sm hover:border-orange-300 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">64% Probability</span>
                     <span className="text-xs text-gray-400">Lobby</span>
                   </div>
                   <h4 className="font-bold text-gray-900 mb-1">Security Incident</h4>
                   <p className="text-xs text-gray-500 leading-relaxed">Local event concluding; expect sudden influx of non-guests near main entrance.</p>
                </motion.div>
             </div>
          </div>
        </aside>

        {/* Center — Incident Feed */}
        <main className="flex-1 flex flex-col bg-gray-50">
          <div className="p-5 border-b border-gray-200 bg-white shadow-sm z-10 flex justify-between items-center">
            <h2 className="font-black text-gray-900 flex items-center gap-3">
              Live Dispatch Feed
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{activeIncidents.length} Active</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence>
                {activeIncidents.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
                    <span className="text-6xl mb-6 block">✨</span>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Active Incidents</h3>
                    <p className="text-gray-500 font-medium">The premises are secure. Use "Simulate Crisis" to test the system.</p>
                  </motion.div>
                ) : (
                  activeIncidents.map((incident, idx) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedIncident(incident)}
                      className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedIncident?.id === incident.id ? 'border-indigo-600 ring-4 ring-indigo-600/10' : 'border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {incident.severity >= 4 && <PulseRing color="#DC2626" />}
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${incident.severity >= 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            Severity {incident.severity}
                          </span>
                          <span className="text-sm font-mono text-gray-400">{incident.id}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">{incident.time}</span>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mb-1">{incident.type}</h3>
                      <p className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        {incident.location}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          Staff Dispatched
                        </span>
                        <span className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">View Details →</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Right — Incident Detail & AI Tools */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-200 bg-white flex flex-col shadow-2xl z-20"
            >
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="font-black text-gray-900 tracking-tight">Incident Details</h2>
                <button onClick={() => setSelectedIncident(null)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm">✕</button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                 <div>
                   <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{selectedIncident.type}</h3>
                   <p className="text-gray-500 font-medium">{selectedIncident.description}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="font-bold text-gray-900">{selectedIncident.status}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="font-bold text-gray-900">{selectedIncident.location}</p>
                    </div>
                 </div>

                 {/* Gemini Brief Generator Mock */}
                 <div className="pt-6 border-t border-gray-100">
                    <h4 className="font-black text-gray-900 flex items-center gap-2 mb-3">
                      <span className="text-blue-600">🤖</span> Gemini 112 Brief
                    </h4>
                    <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed">Instantly generate a structured brief for emergency services using AI.</p>

                    {!generatedBrief && !generatingBrief && (
                      <button onClick={generateBrief} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                        Generate 112 Script
                      </button>
                    )}

                    {generatingBrief && (
                      <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>⏳</motion.div>
                        Generating...
                      </div>
                    )}

                    {generatedBrief && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-50 border border-blue-100 rounded-xl relative">
                        <button className="absolute top-3 right-3 text-xs font-bold text-blue-600 hover:text-blue-800">Copy</button>
                        <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{generatedBrief}</pre>
                      </motion.div>
                    )}
                 </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

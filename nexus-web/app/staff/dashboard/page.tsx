"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMockData } from "../../../components/MockProvider";

export default function StaffDashboard() {
  const { incidents, updateIncidentStatus } = useMockData();
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");

  const activeIncidents = incidents.filter((inc) => inc.status !== "Resolved");
  const resolvedIncidents = incidents.filter((inc) => inc.status === "Resolved");

  const displayIncidents = activeTab === "active" ? activeIncidents : resolvedIncidents;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">N</div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">NEXUS Staff Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Sarah L.</p>
              <p className="text-xs text-indigo-600 font-semibold">Security</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
              SL
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 relative">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${activeTab === "active" ? "text-gray-900" : "text-gray-500"}`}
          >
            Active Threats ({activeIncidents.length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${activeTab === "resolved" ? "text-gray-900" : "text-gray-500"}`}
          >
            Resolved
          </button>
          {/* Animated Tab Indicator */}
          <motion.div
            layout
            initial={false}
            animate={{
              x: activeTab === "active" ? 0 : "100%"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {displayIncidents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">All Clear</h3>
              <p className="text-gray-500 text-sm">No {activeTab} incidents at this time.</p>
            </motion.div>
          ) : (
            displayIncidents.map((incident, idx) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group"
              >
                {/* Severity Indicator Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${incident.severity >= 4 ? 'bg-red-500' : 'bg-orange-400'}`} />

                <div className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${
                        incident.severity >= 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        Severity {incident.severity}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{incident.type}</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{incident.time}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{incident.description}</p>

                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="text-sm font-semibold text-gray-700">{incident.location}</span>
                  </div>

                  {activeTab === "active" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateIncidentStatus(incident.id, "Resolved")}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                      >
                        Acknowledge & Respond
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-50 py-3 rounded-xl text-center text-sm font-bold text-gray-500 border border-gray-100">
                      Resolved
                    </div>
                  )}
                </div>

                {/* Critical Pulse Effect */}
                {incident.severity >= 4 && activeTab === "active" && (
                   <motion.div
                     className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500"
                     animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                   />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Mock Bottom Navigation */}
      <div className="bg-white border-t border-gray-100 flex justify-around p-4 pb-8">
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-indigo-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          <span className="text-[10px] font-bold">Incidents</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span className="text-[10px] font-bold">Directory</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="text-[10px] font-bold">Settings</span>
        </div>
      </div>
    </div>
  );
}

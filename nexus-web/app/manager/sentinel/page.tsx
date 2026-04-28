"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SentinelPrediction } from "@/lib/types";

const MOCK_PREDICTIONS: SentinelPrediction[] = [
  { id: "p1", hotelId: "hotel_001", zone: "Floor 7 — Block C", floor: "7", riskType: "Plumbing Failure Risk", probability: 73, recommendation: "Pre-position maintenance team. Aging pipe infrastructure detected.", validFrom: new Date(), validUntil: new Date(Date.now() + 86400000), acknowledged: false, basedOn: "8 plumbing incidents in past 90 days" },
  { id: "p2", hotelId: "hotel_001", zone: "Lobby & Ground Floor", floor: "G", riskType: "Guest Medical Emergency", probability: 42, recommendation: "Ensure AED charged and accessible at front desk. Verify medical staff.", validFrom: new Date(), validUntil: new Date(Date.now() + 86400000), acknowledged: false, basedOn: "Peak occupancy + seasonal pattern" },
  { id: "p3", hotelId: "hotel_001", zone: "Parking Basement", floor: "B1", riskType: "Security Incident Risk", probability: 28, recommendation: "Schedule extra security rounds 10PM–2AM tonight.", validFrom: new Date(), validUntil: new Date(Date.now() + 86400000), acknowledged: false, basedOn: "Event night + historical data" },
];

export default function SentinelPage() {
  const [predictions] = useState<SentinelPrediction[]>(MOCK_PREDICTIONS);

  return (
    <div className="min-h-screen p-6" style={{ background: "#FAFBFC" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#E6EFFF" }}>✨</div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#0A0E1A" }}>NEXUS Sentinel</h1>
            <p className="text-sm" style={{ color: "#9CA5B4" }}>AI-Powered Predictive Crisis Intelligence · Powered by Vertex AI Forecasting</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Predictions Active", value: predictions.length, color: "#0052FF" },
            { label: "Avg Probability", value: `${Math.round(predictions.reduce((a,p) => a + p.probability, 0) / predictions.length)}%`, color: "#F5A623" },
            { label: "Incidents Prevented (30d)", value: "3", color: "#2EA043" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF", boxShadow: "0 1px 4px rgba(10,14,26,0.04)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#9CA5B4", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Predictions */}
        <h2 className="font-bold mb-4" style={{ color: "#0A0E1A" }}>24-Hour Risk Forecast</h2>
        <div className="space-y-4">
          {predictions.map((pred, i) => (
            <motion.div key={pred.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF", boxShadow: "0 1px 4px rgba(10,14,26,0.04)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#9CA5B4" }}>{pred.zone}</span>
                  <h3 className="font-bold text-lg mt-0.5" style={{ color: "#0A0E1A" }}>{pred.riskType}</h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black" style={{ color: pred.probability > 60 ? "#FF1744" : pred.probability > 35 ? "#F5A623" : "#2EA043" }}>
                    {pred.probability}%
                  </p>
                  <p className="text-xs" style={{ color: "#9CA5B4" }}>probability</p>
                </div>
              </div>
              <div className="h-2 rounded-full mb-3" style={{ background: "#F4F6F8" }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: `${pred.probability}%` }}
                  style={{ background: pred.probability > 60 ? "#FF1744" : pred.probability > 35 ? "#F5A623" : "#2EA043" }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }} />
              </div>
              <p className="text-sm mb-3" style={{ color: "#6B7689" }}>{pred.recommendation}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#9CA5B4" }}>Based on: {pred.basedOn}</span>
                <button className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  style={{ background: "#E6EFFF", color: "#0052FF" }}>
                  Pre-position Staff →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

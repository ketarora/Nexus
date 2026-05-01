"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MasterLandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 max-w-2xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
          NEXUS
        </h1>
        <p className="text-xl text-gray-600 mb-12 font-medium leading-relaxed">
          AI-Powered Hospitality Crisis Intelligence. <br/> Select your role to enter the simulation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10 w-full max-w-5xl">
        {/* Guest Card */}
        <motion.div
          whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(10,14,26,0.12)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg relative overflow-hidden group flex flex-col"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span className="text-6xl">📱</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Guest Portal</h2>
          <p className="text-gray-500 mb-8 line-clamp-3 flex-1">Experience the frictionless SOS reporting flow. 3 taps, no login required, instantly triaged by Gemini AI.</p>
          <Link href="/guest/sos?h=hotel_001&f=4&r=412" className="inline-flex items-center justify-center w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95">
            Enter as Guest
          </Link>
        </motion.div>

        {/* Staff Card */}
        <motion.div
          whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(10,14,26,0.12)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg relative overflow-hidden group flex flex-col"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-6xl">🏃‍♂️</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Staff App</h2>
          <p className="text-gray-500 mb-8 line-clamp-3 flex-1">View the mobile-native responder interface. Receive instant AI protocols and actionable alerts when a crisis hits.</p>
          <Link href="/staff/dashboard" className="inline-flex items-center justify-center w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95">
            Enter as Staff
          </Link>
        </motion.div>

        {/* Manager Card */}
        <motion.div
          whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(10,14,26,0.12)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg relative overflow-hidden group flex flex-col"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span className="text-6xl">🖥️</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Command Center</h2>
          <p className="text-gray-500 mb-8 line-clamp-3 flex-1">The bird's-eye view. Live threat maps, AI predictive "Sentinel" alerts, and 112 emergency briefing generation.</p>
          <Link href="/manager/command" className="inline-flex items-center justify-center w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 active:scale-95">
            Enter as Manager
          </Link>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 text-sm text-gray-400 font-medium tracking-wide text-center"
      >
        GOOGLE SOLUTION CHALLENGE 2026 PROTOTYPE <br/>
        <span className="text-xs opacity-60">Optimized for Web Demonstration</span>
      </motion.div>
    </main>
  );
}

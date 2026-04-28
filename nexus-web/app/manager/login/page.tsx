"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isDemoMode } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function ManagerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isDemoMode) {
        // Demo mode: bypass auth
        localStorage.setItem("nexus_demo_manager", "true");
        router.push("/manager/command");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/manager/command");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem("nexus_demo_manager", "true");
    router.push("/manager/command");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAFBFC" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 relative"
            style={{ background: "linear-gradient(135deg, #0052FF 0%, #003BB8 100%)" }}>
            N
            <motion.div className="absolute inset-0 rounded-2xl"
              animate={{ boxShadow: ["0 0 0 0 rgba(0,82,255,0.4)", "0 0 0 12px rgba(0,82,255,0)", "0 0 0 0 rgba(0,82,255,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity }} />
          </div>
          <h1 className="text-3xl font-black" style={{ color: "#0A0E1A" }}>NEXUS</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7689" }}>Manager Command Center</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#FFFFFF", border: "1px solid #E5E9EF", boxShadow: "0 4px 24px rgba(10,14,26,0.06)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: "#0A0E1A" }}>Sign In</h2>

          {isDemoMode ? (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: "#FFF8E6", border: "1px solid #F5A623" }}>
                <p className="text-sm font-bold" style={{ color: "#B45309" }}>🛠️ Demo Mode Active</p>
                <p className="text-xs mt-1" style={{ color: "#6B7689" }}>No Firebase credentials detected. Click below to enter the demo dashboard with pre-populated data.</p>
              </div>
              <button onClick={handleDemoLogin}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all"
                style={{ background: "#0052FF" }}>
                🚀 Enter Demo Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#3D4759" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="nx-input"
                  placeholder="manager@grandnexus.com" autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#3D4759" }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="nx-input"
                  placeholder="••••••••" autoComplete="current-password" />
              </div>

              {error && (
                <div className="rounded-xl p-3 text-sm" style={{ background: "#FFEBEE", color: "#FF1744" }}>⚠️ {error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all mt-2"
                style={{ background: loading ? "#9CA5B4" : "#0052FF" }}>
                {loading ? "Signing in..." : "Access Command Center →"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: "#E5E9EF" }}>
            <p className="text-xs" style={{ color: "#9CA5B4" }}>
              {isDemoMode ? "Running in prototype demonstration mode" : "Demo: manager@nexus.com / nexus2026"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


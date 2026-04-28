// =====================================================
// NEXUS — Shared TypeScript Types
// =====================================================

export type IncidentType =
  | "medical"
  | "fire"
  | "security"
  | "flood"
  | "power"
  | "structural"
  | "other";

export type IncidentStatus =
  | "pending"
  | "active"
  | "responding"
  | "contained"
  | "resolved"
  | "cancelled"
  | "triage_failed";

export type StaffRole =
  | "security"
  | "medical"
  | "maintenance"
  | "management"
  | "housekeeping"
  | "front_desk";

export interface GeminiClassification {
  severity: 1 | 2 | 3 | 4 | 5;
  classification: string;
  immediateRisk: boolean;
  affectedZones: string[];
  staffProtocols: Record<StaffRole | string, string>;
  guestInstructions: string;
  emergencyBrief: string;
  estimatedResponseMinutes: number;
  riskScore: number;
  reasoningChain: string[];
  multilingualInstructions?: Record<string, string>;
}

export interface IncidentLocation {
  hotelId: string;
  hotelName: string;
  room: string;
  floor: string;
  lat?: number;
  lng?: number;
  zone?: string;
}

export interface IncidentUpdate {
  timestamp: Date;
  author: string;
  authorRole: string;
  message: string;
  type: "status_change" | "staff_acknowledged" | "note" | "escalation";
}

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  severity?: 1 | 2 | 3 | 4 | 5;
  location: IncidentLocation;
  description?: string;
  reportedBy: {
    name?: string;
    phone?: string;
    language?: string;
  };
  geminiClassification?: GeminiClassification;
  emergencyBrief?: string;
  riskScore?: number;
  assignedStaff: string[];
  updates: IncidentUpdate[];
  createdAt: Date | { toMillis: () => number };
  classifiedAt?: Date;
  resolvedAt?: Date;
  triageLatencyMs?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  fcmToken?: string;
  hotelId: string;
  isOnDuty: boolean;
  activeIncidents: string[];
  avatarUrl?: string;
  acknowledgedAt?: Date;
  currentLocation?: { lat: number; lng: number };
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  roomCount: number;
  floors: number;
  staffCount: number;
  hasMedicalStaff: boolean;
  aedLocations: string[];
  exitsByFloor: Record<string, string>;
  emergencyContacts: { name: string; phone: string; role: string }[];
}

export interface SentinelPrediction {
  id: string;
  hotelId: string;
  zone: string;
  floor?: string;
  riskType: string;
  probability: number;
  recommendation: string;
  validFrom: Date;
  validUntil: Date;
  acknowledged: boolean;
  basedOn: string;
}

export interface ReplayReport {
  id: string;
  incidentId: string;
  generatedAt: Date;
  reportUrl: string;
  executiveSummary: string;
  totalResponseTime: number;
  timelineEvents: {
    timestamp: Date;
    event: string;
    actor: string;
  }[];
  complianceItems: { item: string; status: "pass" | "fail" | "na" }[];
  recommendations: string[];
  insuranceGrade: "A" | "B" | "C" | "D";
}

// ─── Severity config helpers ───
export const SEVERITY_CONFIG = {
  5: { label: "CRITICAL", color: "#FF1744", softColor: "#FFEBEE", pulse: true },
  4: { label: "HIGH", color: "#FF6B00", softColor: "#FFF3E6", pulse: true },
  3: { label: "MEDIUM", color: "#F5A623", softColor: "#FFF8E6", pulse: false },
  2: { label: "LOW", color: "#0969DA", softColor: "#DDF4FF", pulse: false },
  1: { label: "INFO", color: "#2EA043", softColor: "#E6F7EB", pulse: false },
} as const;

export const INCIDENT_ICONS: Record<IncidentType | string, string> = {
  medical: "🏥",
  fire: "🔥",
  security: "🚨",
  flood: "💧",
  power: "⚡",
  structural: "🏗️",
  other: "⚠️",
};

export const INCIDENT_LABELS: Record<IncidentType | string, string> = {
  medical: "Medical Emergency",
  fire: "Fire / Smoke",
  security: "Security Threat",
  flood: "Water / Flood",
  power: "Power Outage",
  structural: "Structural Damage",
  other: "Other Emergency",
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  security: "Security",
  medical: "Medical",
  maintenance: "Maintenance",
  management: "Management",
  housekeeping: "Housekeeping",
  front_desk: "Front Desk",
};

export function getTimeSince(date: Date | { toMillis: () => number } | undefined): string {
  if (!date) return "Just now";
  const ms =
    "toMillis" in date ? date.toMillis() : (date as Date).getTime();
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

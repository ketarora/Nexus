// =====================================================
// NEXUS — Gemini Integration Library
// Uses structured output (responseSchema) for guaranteed JSON
// This is the AI moat — Gemini 1.5 Flash for sub-2s triage
// =====================================================
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── Structured output schema (judge-facing feature) ───────
const incidentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    severity: {
      type: SchemaType.INTEGER,
      description: "Emergency severity 1-5 (5=critical life threat)",
    },
    classification: {
      type: SchemaType.STRING,
      description: "Specific emergency type (e.g. 'Suspected Cardiac Arrest')",
    },
    immediateRisk: { type: SchemaType.BOOLEAN },
    affectedZones: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    staffProtocols: {
      type: SchemaType.OBJECT,
      properties: {
        security: { type: SchemaType.STRING },
        medical: { type: SchemaType.STRING },
        maintenance: { type: SchemaType.STRING },
        management: { type: SchemaType.STRING },
        housekeeping: { type: SchemaType.STRING },
      },
      required: ["security", "medical", "maintenance", "management"],
    },
    guestInstructions: {
      type: SchemaType.STRING,
      description: "Calm, clear instructions for the guest — max 25 words",
    },
    emergencyBrief: {
      type: SchemaType.STRING,
      description: "60-word brief for 112 operators: location, nature, patient state, staff on scene",
    },
    estimatedResponseMinutes: { type: SchemaType.INTEGER },
    riskScore: {
      type: SchemaType.INTEGER,
      description: "0-100 aggregate risk score",
    },
    reasoningChain: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "3-5 step AI reasoning for audit trail",
    },
  },
  required: [
    "severity", "classification", "immediateRisk", "staffProtocols",
    "guestInstructions", "emergencyBrief", "riskScore", "reasoningChain",
  ],
};

// ─── Primary triage model (Gemini 1.5 Flash — speed critical) ──
export const triageModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: incidentSchema as any,
    temperature: 0.15, // Low for consistent emergency protocols
    maxOutputTokens: 2048,
  },
  systemInstruction: `You are NEXUS Crisis Intelligence Engine — a hospitality emergency 
triage AI trusted by hotels worldwide. Your classifications directly save lives.

CORE PRINCIPLES:
1. When uncertain about severity, always choose HIGHER (false positives save lives)
2. Staff protocols must be ACTIONABLE: start with a verb, include exact action + location, max 15 words
3. Emergency briefs follow EMS protocol: Location → Nature → Patient State → Resources On-Scene
4. Guest instructions must be CALM and CLEAR, avoid medical jargon, max 25 words
5. Reasoning chain must show your logic transparently (for compliance audit)

SEVERITY SCALE:
1 = Minor inconvenience (power flicker, noise complaint)
2 = Non-urgent issue (minor injury, small leak)
3 = Moderate emergency (slip-and-fall, partial power outage)
4 = High emergency (serious injury, fire detected, security threat)
5 = Critical life threat (cardiac arrest, major fire, active violence)

You operate under the NEXUS Hippocratic Principle: First, send help. Then, document.`,
});

// ─── Report generation model (Gemini 1.5 Pro — depth critical) ─
export const reportModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 4096,
  },
  systemInstruction: `You are NEXUS Incident Analyst generating insurance-grade post-incident reports. 
Be precise, professional, and thorough. Use structured headings. Include measurable metrics.`,
});

// ─── Triage function ────────────────────────────────────────
export async function triageIncident(params: {
  type: string;
  room: string;
  floor: string;
  description: string;
  hotelName: string;
  hotelContext?: {
    roomCount?: number;
    hasMedicalStaff?: boolean;
    aedLocations?: string[];
  };
  recentIncidents?: string[];
}) {
  const prompt = `EMERGENCY INCIDENT REPORT — NEXUS TRIAGE REQUEST
═══════════════════════════════════════════════════
Incident Type: ${params.type}
Location: ${params.hotelName}, Floor ${params.floor}, Room ${params.room}
Description: ${params.description || "No additional details provided by guest"}
Reported At: ${new Date().toISOString()}

Hotel Context:
- Total Rooms: ${params.hotelContext?.roomCount || "Unknown"}
- Medical Staff On-Site: ${params.hotelContext?.hasMedicalStaff ? "Yes" : "No / Unknown"}
- AED Locations: ${params.hotelContext?.aedLocations?.join(", ") || "Standard locations"}

Recent Incidents (last 24h): ${params.recentIncidents?.join(", ") || "None"}

NEXUS TASK: Classify this emergency, generate role-specific staff protocols, 
draft 112 emergency brief, provide guest instructions, and show reasoning chain.`;

  const result = await triageModel.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// ─── Replay report generation ───────────────────────────────
export async function generateReplayReport(incident: Record<string, any>) {
  const prompt = `Generate an insurance-grade post-incident report for the following hospitality emergency:

INCIDENT DATA:
${JSON.stringify(incident, null, 2)}

Generate a structured report with:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. INCIDENT TIMELINE (chronological events)
3. AI TRIAGE ANALYSIS (Gemini classification review)
4. RESPONSE METRICS (response times, staff actions)
5. REGULATORY COMPLIANCE CHECKLIST
6. PREVENTION RECOMMENDATIONS (3-5 actionable items)
7. INSURANCE DOCUMENTATION NOTES

Be specific, professional, and include all timestamps.`;

  const result = await reportModel.generateContent(prompt);
  return result.response.text();
}

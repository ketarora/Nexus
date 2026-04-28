// =====================================================
// NEXUS — Comprehensive Demo Data for Prototype
// No Firebase keys required. Fully self-contained.
// =====================================================

import type { Incident, Staff, SentinelPrediction, IncidentUpdate, GeminiClassification } from "./types";

export const DEMO_HOTEL = {
  id: "hotel_001",
  name: "Grand Nexus Hotel",
  address: "Sector 18, Noida, India",
  lat: 28.6139,
  lng: 77.2090,
};

// ─── Demo Staff Members ──────────────────────────────
export const DEMO_STAFF: Staff[] = [
  { id: "staff_001", name: "Rahul Sharma", role: "security", hotelId: "hotel_001", isOnDuty: true, activeIncidents: ["demo_inc_1"], phone: "+91 98765 43201" },
  { id: "staff_002", name: "Priya Patel", role: "medical", hotelId: "hotel_001", isOnDuty: true, activeIncidents: ["demo_inc_1"], phone: "+91 98765 43202" },
  { id: "staff_003", name: "Amit Kumar", role: "maintenance", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [], phone: "+91 98765 43203" },
  { id: "staff_004", name: "Sneha Gupta", role: "management", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [], phone: "+91 98765 43204" },
  { id: "staff_005", name: "Vikram Rao", role: "housekeeping", hotelId: "hotel_001", isOnDuty: false, activeIncidents: [], phone: "+91 98765 43205" },
  { id: "staff_006", name: "Anita Desai", role: "front_desk", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [], phone: "+91 98765 43206" },
];

// ─── Demo Gemini Classifications ─────────────────────
const DEMO_CLASSIFICATIONS: Record<string, GeminiClassification> = {
  medical_cardiac: {
    severity: 5,
    classification: "Cardiac Arrest — Guest Unresponsive",
    immediateRisk: true,
    affectedZones: ["Floor 4 — Room Block A", "Lobby"],
    staffProtocols: {
      security: "Secure elevator access. Clear emergency corridor. Direct ambulance to service entrance.",
      medical: "Bring AED to Room 412. Initiate CPR protocols. Prepare for advanced life support handoff.",
      front_desk: "Place emergency call to 112. Provide room access key to medical team.",
      management: "Notify hotel GM. Prepare guest family contact. Document incident timeline.",
      maintenance: "Ensure backup generators active. Verify elevator override is functional.",
      housekeeping: "Clear room corridor. Ensure linens and towels available for medical use.",
    },
    guestInstructions: "If you are trained in CPR, begin chest compressions at 100-120/min. If AED is available, follow voice prompts. Unlock your door if safe to do so.",
    emergencyBrief: "GRAND NEXUS HOTEL, NOIDA. Room 412, Floor 4. ADULT MALE, 62, CARDIAC ARREST. Guest unresponsive, not breathing. CPR IN PROGRESS. AED dispatched. ETA medical team: 3 minutes. Need ambulance with ALS.",
    estimatedResponseMinutes: 3,
    riskScore: 94,
    reasoningChain: [
      "Guest reported 'not breathing' — immediate life threat detected",
      "Age 62+ increases cardiac event probability to 78%",
      "Room 412 is 120m from lobby — moderate access delay",
      "Only 2 medical staff on duty — HIGH resource constraint",
      "Recommendation: Parallel dispatch of 112 ambulance",
    ],
  },
  fire_smoke: {
    severity: 4,
    classification: "Smoke Detection — Possible Electrical Fire",
    immediateRisk: true,
    affectedZones: ["Floor 7 — Room 713", "Floor 7 Corridor", "Stairwell B"],
    staffProtocols: {
      security: "Evacuate Floor 7 immediately. Check room 713 for occupants. Block elevator access to Floor 7.",
      medical: "Standby at assembly point. Prepare for smoke inhalation treatment. Check O2 saturation of evacuees.",
      front_desk: "Sound fire alarm. Announce evacuation via PA. Call fire department (101).",
      management: "Declare emergency level ORANGE. Coordinate with fire authorities. Prepare guest manifest.",
      maintenance: "Cut power to Floor 7 circuits. Activate smoke extraction fans. Verify sprinkler activation.",
      housekeeping: "Check all rooms on Floor 7 for guests. Assist elderly/disabled guests to Stairwell A.",
    },
    guestInstructions: "Stay low to the ground. Cover mouth with wet cloth if available. Do NOT use elevators. Use Stairwell B — it is the nearest fire exit. Move to the parking lot assembly point.",
    emergencyBrief: "GRAND NEXUS HOTEL, NOIDA. Floor 7, Room 713. SMOKE REPORTED — possible electrical fire. Guests evacuating via Stairwell B. Maintenance cutting power. Fire brigade notified (101). No injuries reported yet.",
    estimatedResponseMinutes: 5,
    riskScore: 78,
    reasoningChain: [
      "Smoke reported from Room 713 — potential fire origin",
      "Electrical fault pattern: 3 power outages on Floor 7 in past 48h",
      "Floor 7 has 18 occupied rooms — 42 guests at risk",
      "Stairwell B is 30m from Room 713 — adequate egress",
      "Recommendation: Evacuate Floor 7 as precaution",
    ],
  },
  security_intruder: {
    severity: 4,
    classification: "Security Threat — Unauthorized Person on Floor 3",
    immediateRisk: true,
    affectedZones: ["Floor 3 — Room Block C", "Lobby"],
    staffProtocols: {
      security: "Discreetly approach from both stairwells. Do NOT confront directly. Identify and monitor suspect. Lock down floor elevator access.",
      medical: "Standby at security station. Prepare for potential physical trauma response.",
      front_desk: "Verify guest identity for all Floor 3 check-ins. Review CCTV footage. Alert local police (100).",
      management: "Notify hotel security chief. Prepare incident report. Preserve evidence.",
      maintenance: "Ensure CCTV recording is active. Test emergency lock systems.",
      housekeeping: "Pause service on Floor 3. Report any suspicious items to security.",
    },
    guestInstructions: "Lock your door immediately. Do NOT open for anyone without verifying identity through peephole. If you feel unsafe, barricade door with furniture. Call front desk: 0",
    emergencyBrief: "GRAND NEXUS HOTEL, NOIDA. Floor 3. UNAUTHORIZED PERSON reported in guest corridor. Security dispatched. Floor lockdown initiated. Local police (100) notified. Guests advised to remain in rooms with doors locked.",
    estimatedResponseMinutes: 4,
    riskScore: 71,
    reasoningChain: [
      "Guest reported unknown person trying door handles on Floor 3",
      "No staff scheduled on Floor 3 at this time — confirmed outsider",
      "3 thefts reported in past month on Floor 3 — pattern match",
      "Night time (23:47) — reduced visibility, higher risk",
      "Recommendation: Lockdown + police notification",
    ],
  },
  flood_bathroom: {
    severity: 3,
    classification: "Water Leak — Bathroom Pipe Burst",
    immediateRisk: false,
    affectedZones: ["Floor 5 — Room 523", "Floor 5 Corridor (partial)"],
    staffProtocols: {
      security: "No action required. Monitor for electrical hazard if water spreads.",
      medical: "No action required.",
      front_desk: "Relocate guest from Room 523 to Room 525 (vacant). Offer apology amenities.",
      management: "Document water damage. Initiate insurance claim if needed.",
      maintenance: "Shut water valve for Room 523. Assess pipe damage. Begin water extraction.",
      housekeeping: "Move guest belongings to dry area. Place wet floor signs. Begin mop-up.",
    },
    guestInstructions: "Move your belongings away from the wet area. Do NOT use electrical outlets near water. A room change has been arranged. Maintenance will arrive shortly.",
    emergencyBrief: "GRAND NEXUS HOTEL, NOIDA. Room 523, Floor 5. BATHROOM PIPE BURST. Water contained to room. Guest relocated. Maintenance dispatched. No structural risk. ETA repair: 45 minutes.",
    estimatedResponseMinutes: 8,
    riskScore: 42,
    reasoningChain: [
      "Guest reported water flooding from bathroom",
      "Building age: 12 years — pipe corrosion probability moderate",
      "Water contained to single room — low spread risk",
      "Adjacent rooms not affected",
      "Recommendation: Room relocation + maintenance dispatch",
    ],
  },
};

// ─── Demo Incident Updates (Timelines) ───────────────
const DEMO_UPDATES: Record<string, IncidentUpdate[]> = {
  demo_inc_1: [
    { timestamp: new Date(Date.now() - 1000 * 60 * 12), author: "Guest (Room 412)", authorRole: "guest", message: "My father collapsed! He's not breathing! Please help!", type: "note" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 11), author: "NEXUS AI", authorRole: "ai", message: "AI Triage Complete — Severity 5 CRITICAL. Cardiac arrest detected. Auto-dispatching medical team.", type: "status_change" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 10), author: "Priya Patel (Medical)", authorRole: "medical", message: "Medical team acknowledged. Grabbing AED and heading to Room 412.", type: "staff_acknowledged" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 9), author: "Rahul Sharma (Security)", authorRole: "security", message: "Security en route. Clearing corridor and securing elevator access.", type: "staff_acknowledged" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 7), author: "Anita Desai (Front Desk)", authorRole: "front_desk", message: "112 called. Ambulance dispatched. ETA 8 minutes. Providing room key to medical.", type: "escalation" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 5), author: "Priya Patel (Medical)", authorRole: "medical", message: "Arrived at Room 412. Guest performing CPR. AED applied. Shocking advised.", type: "note" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 3), author: "NEXUS AI", authorRole: "ai", message: "Risk score updated: 94 → 82. CPR in progress. Ambulance 5 minutes out.", type: "status_change" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 1), author: "Sneha Gupta (Management)", authorRole: "management", message: "GM notified. Family contact initiated. Documenting timeline for compliance.", type: "note" },
  ],
  demo_inc_2: [
    { timestamp: new Date(Date.now() - 1000 * 60 * 45), author: "Guest (Room 713)", authorRole: "guest", message: "I smell burning! Smoke coming from the AC unit!", type: "note" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 44), author: "NEXUS AI", authorRole: "ai", message: "AI Triage Complete — Severity 4 HIGH. Fire/Smoke detected. Auto-evacuation protocol initiated.", type: "status_change" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 43), author: "Amit Kumar (Maintenance)", authorRole: "maintenance", message: "Cutting power to Floor 7. Activating smoke extraction. Sprinklers activated in Room 713.", type: "staff_acknowledged" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 42), author: "Rahul Sharma (Security)", authorRole: "security", message: "Floor 7 evacuation in progress. All guests accounted for. Moving to assembly point.", type: "staff_acknowledged" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 40), author: "Anita Desai (Front Desk)", authorRole: "front_desk", message: "Fire brigade (101) called. Hotel alarm active. PA announcement made.", type: "escalation" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 35), author: "Amit Kumar (Maintenance)", authorRole: "maintenance", message: "Fire contained to AC unit. Smoke clearing. No structural damage. Safe to return soon.", type: "status_change" },
  ],
  demo_inc_3: [
    { timestamp: new Date(Date.now() - 1000 * 60 * 25), author: "Guest (Room 312)", authorRole: "guest", message: "There's a strange man trying door handles on our floor!", type: "note" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 24), author: "NEXUS AI", authorRole: "ai", message: "AI Triage Complete — Severity 4 HIGH. Security threat detected. Floor lockdown initiated.", type: "status_change" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 23), author: "Rahul Sharma (Security)", authorRole: "security", message: "Security team dispatched to Floor 3. Monitoring via CCTV. Elevator access locked.", type: "staff_acknowledged" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 21), author: "Anita Desai (Front Desk)", authorRole: "front_desk", message: "Local police (100) notified. Guest identity being verified for Floor 3.", type: "escalation" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 18), author: "Rahul Sharma (Security)", authorRole: "security", message: "Suspect identified as non-guest. Escorted to lobby. Police arriving. Floor 3 secure.", type: "status_change" },
  ],
};

// ─── Demo Incidents ──────────────────────────────────
export function getDemoIncidents(): Incident[] {
  const now = Date.now();
  return [
    {
      id: "demo_inc_1",
      type: "medical",
      status: "responding",
      severity: 5,
      location: { hotelId: "hotel_001", hotelName: "Grand Nexus Hotel", room: "412", floor: "4", lat: 28.6139, lng: 77.2090, zone: "Floor 4 — Room Block A" },
      description: "My father collapsed in the bathroom. He is not breathing. I need help immediately!",
      reportedBy: { name: "Arjun Mehta", phone: "+91 98765 12345", language: "en-IN" },
      geminiClassification: DEMO_CLASSIFICATIONS.medical_cardiac,
      emergencyBrief: DEMO_CLASSIFICATIONS.medical_cardiac.emergencyBrief,
      riskScore: 94,
      assignedStaff: ["staff_001", "staff_002"],
      updates: DEMO_UPDATES.demo_inc_1,
      createdAt: new Date(now - 1000 * 60 * 12),
      classifiedAt: new Date(now - 1000 * 60 * 11),
      triageLatencyMs: 1400,
    },
    {
      id: "demo_inc_2",
      type: "fire",
      status: "contained",
      severity: 4,
      location: { hotelId: "hotel_001", hotelName: "Grand Nexus Hotel", room: "713", floor: "7", lat: 28.6140, lng: 77.2091, zone: "Floor 7 — Room Block B" },
      description: "Smoke coming from the AC unit. Burning smell is strong.",
      reportedBy: { name: "Lisa Wong", phone: "+91 98765 67890", language: "en-IN" },
      geminiClassification: DEMO_CLASSIFICATIONS.fire_smoke,
      emergencyBrief: DEMO_CLASSIFICATIONS.fire_smoke.emergencyBrief,
      riskScore: 78,
      assignedStaff: ["staff_001", "staff_003"],
      updates: DEMO_UPDATES.demo_inc_2,
      createdAt: new Date(now - 1000 * 60 * 45),
      classifiedAt: new Date(now - 1000 * 60 * 44),
      triageLatencyMs: 1200,
    },
    {
      id: "demo_inc_3",
      type: "security",
      status: "active",
      severity: 4,
      location: { hotelId: "hotel_001", hotelName: "Grand Nexus Hotel", room: "312", floor: "3", lat: 28.6138, lng: 77.2089, zone: "Floor 3 — Room Block C" },
      description: "Unknown person trying door handles on our floor. Looks suspicious.",
      reportedBy: { name: "Rajesh Iyer", phone: "+91 98765 11111", language: "en-IN" },
      geminiClassification: DEMO_CLASSIFICATIONS.security_intruder,
      emergencyBrief: DEMO_CLASSIFICATIONS.security_intruder.emergencyBrief,
      riskScore: 71,
      assignedStaff: ["staff_001"],
      updates: DEMO_UPDATES.demo_inc_3,
      createdAt: new Date(now - 1000 * 60 * 25),
      classifiedAt: new Date(now - 1000 * 60 * 24),
      triageLatencyMs: 1100,
    },
    {
      id: "demo_inc_4",
      type: "flood",
      status: "active",
      severity: 3,
      location: { hotelId: "hotel_001", hotelName: "Grand Nexus Hotel", room: "523", floor: "5", lat: 28.6141, lng: 77.2092, zone: "Floor 5 — Room Block D" },
      description: "Water is flooding from the bathroom. The pipe seems burst.",
      reportedBy: { name: "Sarah Johnson", phone: "+91 98765 22222", language: "en-IN" },
      geminiClassification: DEMO_CLASSIFICATIONS.flood_bathroom,
      emergencyBrief: DEMO_CLASSIFICATIONS.flood_bathroom.emergencyBrief,
      riskScore: 42,
      assignedStaff: ["staff_003"],
      updates: [
        { timestamp: new Date(now - 1000 * 60 * 15), author: "Guest (Room 523)", authorRole: "guest", message: "Bathroom is flooding! Water everywhere!", type: "note" },
        { timestamp: new Date(now - 1000 * 60 * 14), author: "NEXUS AI", authorRole: "ai", message: "AI Triage Complete — Severity 3 MEDIUM. Water leak detected. Maintenance dispatched.", type: "status_change" },
        { timestamp: new Date(now - 1000 * 60 * 13), author: "Amit Kumar (Maintenance)", authorRole: "maintenance", message: "Water valve shut. Extracting water. Guest relocated to Room 525.", type: "staff_acknowledged" },
      ],
      createdAt: new Date(now - 1000 * 60 * 15),
      classifiedAt: new Date(now - 1000 * 60 * 14),
      triageLatencyMs: 1600,
    },
  ];
}

// ─── Demo Sentinel Predictions ───────────────────────
export const DEMO_PREDICTIONS: SentinelPrediction[] = [
  {
    id: "pred_1",
    hotelId: "hotel_001",
    zone: "Floor 7 — Room Block B",
    floor: "7",
    riskType: "Electrical Fire",
    probability: 73,
    recommendation: "Inspect AC units on Floor 7. 3 power fluctuations detected in 48h. Schedule preventive maintenance.",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 86400000),
    acknowledged: false,
    basedOn: "3 power events + equipment age 8 years + seasonal load",
  },
  {
    id: "pred_2",
    hotelId: "hotel_001",
    zone: "Lobby & Restaurant",
    floor: "G",
    riskType: "Guest Medical Emergency",
    probability: 52,
    recommendation: "Ensure AED is charged and accessible. Medical staff on extended standby during dinner hours (19:00-22:00).",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 86400000),
    acknowledged: false,
    basedOn: "Peak occupancy (94%) + elderly guest ratio 23% + dinner rush",
  },
  {
    id: "pred_3",
    hotelId: "hotel_001",
    zone: "Floor 4 — Room Block A",
    floor: "4",
    riskType: "Plumbing Failure",
    probability: 38,
    recommendation: "Check water pressure in Block A. Monitor for pipe stress signs.",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 86400000),
    acknowledged: true,
    basedOn: "Pipe age 12 years + 2 minor leaks in past 30 days",
  },
];

// ─── Demo Helpers ────────────────────────────────────
export function getDemoIncidentById(id: string): Incident | undefined {
  return getDemoIncidents().find(i => i.id === id);
}

export function getStaffById(id: string): Staff | undefined {
  return DEMO_STAFF.find(s => s.id === id);
}

// For guest flow: create a new demo incident locally
export function createDemoIncident(
  type: string,
  room: string,
  floor: string,
  name: string,
  description: string
): Incident {
  const id = `guest_${Date.now()}`;
  const now = Date.now();
  const template = DEMO_CLASSIFICATIONS[type === "medical" ? "medical_cardiac" : type === "fire" ? "fire_smoke" : type === "security" ? "security_intruder" : "flood_bathroom"];
  
  return {
    id,
    type: type as any,
    status: "pending",
    severity: template?.severity || 3,
    location: { hotelId: "hotel_001", hotelName: "Grand Nexus Hotel", room, floor, lat: 28.6139, lng: 77.2090 },
    description,
    reportedBy: { name: name || "Anonymous Guest", language: "en-IN" },
    geminiClassification: template ? {
      ...template,
      guestInstructions: template.guestInstructions,
      emergencyBrief: template.emergencyBrief,
    } : undefined,
    emergencyBrief: template?.emergencyBrief || "",
    riskScore: template?.riskScore || 50,
    assignedStaff: [],
    updates: [
      { timestamp: new Date(now), author: name || "Anonymous Guest", authorRole: "guest", message: description || "Emergency reported via NEXUS SOS", type: "note" },
    ],
    createdAt: new Date(now),
    triageLatencyMs: 1200,
  };
}

// Simulate status progression for demo
export function simulateStatusProgression(incident: Incident): Incident {
  const elapsed = Date.now() - (incident.createdAt as Date).getTime();
  const minutes = elapsed / 60000;
  
  let status = incident.status;
  if (minutes > 0.5) status = "active";
  if (minutes > 1.5) status = "responding";
  if (minutes > 5 && incident.severity! < 4) status = "contained";
  
  return { ...incident, status };
}


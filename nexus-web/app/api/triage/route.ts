import { NextRequest, NextResponse } from "next/server";
// Notice we REMOVED SchemaType from this import
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// We replaced all SchemaType.XXX with raw lowercase strings
const incidentSchema = {
  type: "object",
  properties: {
    severity: { type: "integer" },
    classification: { type: "string" },
    immediateRisk: { type: "boolean" },
    affectedZones: { type: "array", items: { type: "string" } },
    staffProtocols: {
      type: "object",
      properties: {
        security: { type: "string" },
        medical: { type: "string" },
        maintenance: { type: "string" },
        management: { type: "string" },
        housekeeping: { type: "string" },
      },
    },
    guestInstructions: { type: "string" },
    emergencyBrief: { type: "string" },
    estimatedResponseMinutes: { type: "integer" },
    riskScore: { type: "integer" },
    reasoningChain: { type: "array", items: { type: "string" } },
  },
  required: ["severity", "classification", "staffProtocols", "emergencyBrief", "guestInstructions", "riskScore"],
};

export async function POST(req: NextRequest) {
  try {
    const { type, room, floor, description, hotelName } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: incidentSchema as any,
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
      systemInstruction: `You are NEXUS Crisis Intelligence — a hospitality emergency triage AI. 
Your classifications save lives. Err on the side of higher severity when uncertain. 
Staff protocols must be ACTIONABLE (verb + object + location), max 15 words. 
Emergency briefs follow EMS standard: Location, Nature, Patient State, On-scene resources.
Always provide reassuring but clear guest instructions.`,
    });

    const prompt = `HOSPITALITY EMERGENCY INCIDENT REPORT
═══════════════════════════════════════
Type: ${type}
Location: ${hotelName || "Grand Nexus Hotel"}, Floor ${floor}, Room ${room}
Description: ${description || "No additional details provided"}
Timestamp: ${new Date().toISOString()}
Hotel Context: Professional hospitality environment, trained staff available.

Generate complete emergency triage classification. Be specific and actionable.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({ success: true, classification: parsed });
  } catch (error) {
    console.error("Gemini classification error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Classification failed",
      // Fallback classification
      classification: {
        severity: 3,
        classification: "Emergency — Manual Assessment Required",
        immediateRisk: true,
        staffProtocols: {
          security: "Report to duty manager and affected location immediately",
          medical: "Bring first aid kit to reported location",
          maintenance: "Stand by for instructions from duty manager",
          management: "Assess situation and coordinate response",
          housekeeping: "Clear corridors near affected area",
        },
        guestInstructions: "Help is on the way. Stay in your room and keep the door locked.",
        emergencyBrief: `Emergency at ${new Date().toLocaleTimeString()}. Location requires investigation. Staff dispatched.`,
        riskScore: 50,
        estimatedResponseMinutes: 3,
        reasoningChain: ["Manual fallback classification applied due to AI unavailability"],
      }
    }, { status: 200 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const incidentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    severity: { type: SchemaType.INTEGER },
    classification: { type: SchemaType.STRING },
    immediateRisk: { type: SchemaType.BOOLEAN },
    affectedZones: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    staffProtocols: {
      type: SchemaType.OBJECT,
      properties: {
        security: { type: SchemaType.STRING },
        medical: { type: SchemaType.STRING },
        maintenance: { type: SchemaType.STRING },
        management: { type: SchemaType.STRING },
        housekeeping: { type: SchemaType.STRING },
      },
    },
    guestInstructions: { type: SchemaType.STRING },
    emergencyBrief: { type: SchemaType.STRING },
    estimatedResponseMinutes: { type: SchemaType.INTEGER },
    riskScore: { type: SchemaType.INTEGER },
    reasoningChain: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
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

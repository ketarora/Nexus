// =====================================================
// NEXUS — Cloud Functions Entry Point
// Firebase Functions v2 (Gen 2) — Node 20
// All functions are TypeScript with strict mode
// =====================================================
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { triageIncident, generateReplayReport } from "./lib/gemini";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ═══════════════════════════════════════════════════
// FUNCTION 1: onIncidentCreate
// THE CORE — fires when guest submits SOS
// Calls Gemini 1.5 Flash → dispatches FCM to staff
// ═══════════════════════════════════════════════════
export const onIncidentCreate = onDocumentCreated(
  {
    document: "incidents/{incidentId}",
    region: "us-central1",
    secrets: ["GEMINI_API_KEY"],
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    const incident = event.data?.data();
    if (!incident) return;
    const incidentId = event.params.incidentId;
    const startTime = Date.now();

    logger.info("NEXUS: New incident created", { incidentId, type: incident.type });

    try {
      // ─ 1. Pull hotel context ─────────────────────
      const hotelSnap = await db
        .collection("hotels")
        .doc(incident.location?.hotelId || "hotel_001")
        .get();
      const hotel = hotelSnap.data() || {};

      // ─ 2. Get recent incidents for pattern context ─
      const recentSnap = await db
        .collection("incidents")
        .where("location.hotelId", "==", incident.location?.hotelId || "hotel_001")
        .where("createdAt", ">", new Date(Date.now() - 24 * 60 * 60 * 1000))
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      const recentIncidents = recentSnap.docs.map((d) => d.data().type as string);

      // ─ 3. Call Gemini 1.5 Flash with structured output ─
      const classification = await triageIncident({
        type: incident.type,
        room: incident.location?.room || "Unknown",
        floor: incident.location?.floor || "Unknown",
        description: incident.description || "",
        hotelName: hotel.name || incident.location?.hotel || "Hotel",
        hotelContext: {
          roomCount: hotel.roomCount,
          hasMedicalStaff: hotel.hasMedicalStaff,
          aedLocations: hotel.aedLocations,
        },
        recentIncidents,
      });

      const triageLatencyMs = Date.now() - startTime;
      logger.info("NEXUS: Triage complete", {
        incidentId,
        severity: classification.severity,
        latencyMs: triageLatencyMs,
        classification: classification.classification,
      });

      // ─ 4. Update incident document with Gemini output ─
      await event.data!.ref.update({
        geminiClassification: classification,
        severity: classification.severity,
        emergencyBrief: classification.emergencyBrief,
        riskScore: classification.riskScore,
        status: "active",
        classifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        triageLatencyMs,
      });

      // ─ 5. Query on-duty staff for this hotel ─────
      const staffSnap = await db
        .collection("staff")
        .where("hotelId", "==", incident.location?.hotelId || "hotel_001")
        .where("isOnDuty", "==", true)
        .get();

      // ─ 6. Send FCM to each staff member (role-specific) ─
      const dispatchResults = await Promise.allSettled(
        staffSnap.docs.map(async (staffDoc) => {
          const staff = staffDoc.data();
          if (!staff.fcmToken) return null;

          const role = (staff.role || "").toLowerCase();
          const protocol =
            classification.staffProtocols?.[role] ||
            "Report to duty manager for assignment";

          const isCritical = classification.severity >= 4;

          return messaging.send({
            token: staff.fcmToken,
            notification: {
              title: isCritical
                ? `🚨 CRITICAL — ${classification.classification}`
                : `⚠️ ${classification.classification}`,
              body: `Room ${incident.location?.room} · ${protocol}`,
            },
            data: {
              incidentId,
              severity: String(classification.severity),
              type: incident.type,
              room: String(incident.location?.room || ""),
              floor: String(incident.location?.floor || ""),
              protocol,
              screen: "INCIDENT_DETAIL",
              hotelName: hotel.name || "",
            },
            android: {
              priority: isCritical ? "high" : "normal",
              notification: {
                channelId: "nexus_crisis_alerts",
                defaultVibrateTimings: false,
                vibrateTimingsMillis: isCritical
                  ? [0, 500, 200, 500, 200, 500]
                  : [0, 300, 200, 300],
                visibility: "public",
              },
            },
            apns: {
              headers: {
                "apns-priority": isCritical ? "10" : "5",
                "apns-push-type": "alert",
              },
              payload: {
                aps: {
                  alert: {
                    title: `🚨 NEXUS: ${classification.classification}`,
                    body: protocol,
                  },
                  sound: { critical: isCritical ? 1 : 0, name: "default", volume: 1.0 },
                  "interruption-level": isCritical ? "critical" : "time-sensitive",
                },
              },
            },
          });
        })
      );

      const successCount = dispatchResults.filter((r) => r.status === "fulfilled").length;
      logger.info("NEXUS: FCM dispatch complete", {
        incidentId,
        staffNotified: successCount,
        totalStaff: staffSnap.size,
      });

      // ─ 7. Update assigned staff list ─────────────
      await event.data!.ref.update({
        assignedStaff: staffSnap.docs
          .filter((d) => d.data().fcmToken)
          .map((d) => d.id),
        status: "responding",
      });

    } catch (error) {
      logger.error("NEXUS: Triage failed", { incidentId, error: String(error) });
      await event.data!.ref.update({
        status: "triage_failed",
        triageError: String(error),
      });
    }
  }
);

// ═══════════════════════════════════════════════════
// FUNCTION 2: acknowledgeIncident
// Staff taps "Acknowledge" → updates Firestore
// ═══════════════════════════════════════════════════
export const acknowledgeIncident = onCall(
  { region: "us-central1" },
  async (request) => {
    if (!request.auth) throw new Error("Unauthorized");
    const { incidentId } = request.data;

    await db
      .collection("incidents")
      .doc(incidentId)
      .update({
        updates: admin.firestore.FieldValue.arrayUnion({
          timestamp: new Date(),
          author: request.auth.uid,
          authorRole: "staff",
          message: "Staff acknowledged and is responding",
          type: "staff_acknowledged",
        }),
      });

    return { success: true };
  }
);

// ═══════════════════════════════════════════════════
// FUNCTION 3: generateReplay
// Called when incident is resolved → Gemini 1.5 Pro report
// ═══════════════════════════════════════════════════
export const generateReplay = onCall(
  { region: "us-central1", secrets: ["GEMINI_API_KEY"], memory: "1GiB", timeoutSeconds: 120 },
  async (request) => {
    if (!request.auth) throw new Error("Unauthorized");
    const { incidentId } = request.data;

    const incidentSnap = await db.collection("incidents").doc(incidentId).get();
    if (!incidentSnap.exists) throw new Error("Incident not found");

    const incident = incidentSnap.data()!;

    const report = await generateReplayReport({
      id: incidentId,
      type: incident.type,
      location: incident.location,
      severity: incident.severity,
      classification: incident.geminiClassification?.classification,
      createdAt: incident.createdAt?.toDate?.()?.toISOString() || "Unknown",
      resolvedAt: incident.resolvedAt?.toDate?.()?.toISOString() || "Unknown",
      assignedStaff: incident.assignedStaff?.length || 0,
      triageLatencyMs: incident.triageLatencyMs,
      updates: incident.updates || [],
    });

    // Store report in Firestore
    const reportDoc = await db.collection("replay_reports").add({
      incidentId,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reportText: report,
      hotelId: incident.location?.hotelId,
    });

    return { success: true, reportId: reportDoc.id, reportText: report };
  }
);

// ═══════════════════════════════════════════════════
// FUNCTION 4: sentinelPredict (Scheduled every 6h)
// Generates risk predictions using historical data
// In production: connects to Vertex AI Forecasting
// ═══════════════════════════════════════════════════
export const sentinelPredict = onSchedule(
  { schedule: "every 6 hours", region: "us-central1", memory: "512MiB" },
  async () => {
    const hotelsSnap = await db.collection("hotels").get();

    for (const hotelDoc of hotelsSnap.docs) {
      const hotelId = hotelDoc.id;

      // Get last 90 days of incidents
      const incidentsSnap = await db
        .collection("incidents")
        .where("location.hotelId", "==", hotelId)
        .where("createdAt", ">", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
        .get();

      const incidents = incidentsSnap.docs.map((d) => d.data());

      // Aggregate by type + floor
      const riskMap: Record<string, { count: number; floor: string; type: string }> = {};
      incidents.forEach((inc) => {
        const key = `${inc.type}_${inc.location?.floor}`;
        if (!riskMap[key]) riskMap[key] = { count: 0, floor: inc.location?.floor || "?", type: inc.type };
        riskMap[key].count++;
      });

      // Write predictions
      const batch = db.batch();
      const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

      Object.entries(riskMap)
        .filter(([, v]) => v.count >= 2)
        .forEach(([key, data]) => {
          const probability = Math.min(90, data.count * 8);
          const predRef = db.collection(`predictions/${hotelId}/forecasts`).doc(key);
          batch.set(predRef, {
            hotelId,
            zone: `Floor ${data.floor}`,
            floor: data.floor,
            riskType: data.type,
            probability,
            recommendation: `Preventive action recommended based on ${data.count} historical incidents.`,
            validFrom: new Date(),
            validUntil,
            acknowledged: false,
            basedOn: `${data.count} incidents in past 90 days`,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

      await batch.commit();
      logger.info("NEXUS Sentinel: Predictions updated", { hotelId, count: Object.keys(riskMap).length });
    }
  }
);

// ═══════════════════════════════════════════════════
// FUNCTION 5: resolveIncident (HTTP)
// Manager marks incident as resolved
// ═══════════════════════════════════════════════════
export const resolveIncident = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return; }

    const { incidentId } = req.body;
    if (!incidentId) { res.status(400).json({ error: "incidentId required" }); return; }

    await db.collection("incidents").doc(incidentId).update({
      status: "resolved",
      resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updates: admin.firestore.FieldValue.arrayUnion({
        timestamp: new Date(),
        author: "Manager",
        authorRole: "management",
        message: "Incident marked as resolved",
        type: "status_change",
      }),
    });

    res.json({ success: true, message: "Incident resolved" });
  }
);

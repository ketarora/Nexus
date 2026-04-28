// =====================================================
// NEXUS — Demo Seed Data Script
// Run: node seed.js (after firebase login)
// Seeds hotel_001 and demo staff for the demo video
// =====================================================
const admin = require("firebase-admin");

try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (e) {
  console.log("No serviceAccountKey.json found, trying default credentials...");
  admin.initializeApp({ projectId: "nexus-crisis" });
}

const db = admin.firestore();

async function seed() {
  console.log("🌱 NEXUS: Seeding demo data...");

  // ─ Hotel ─────────────────────────────────────────
  await db.collection("hotels").doc("hotel_001").set({
    name: "Grand Nexus Hotel",
    address: "Connaught Place, New Delhi, 110001",
    lat: 28.6315,
    lng: 77.2167,
    roomCount: 150,
    floors: 8,
    staffCount: 45,
    hasMedicalStaff: false,
    aedLocations: ["Floor 2 Storage Room", "Front Desk", "Gym"],
    exitsByFloor: {
      "1": "Main lobby + 2 emergency exits", "2": "East wing stairwell", "3": "East wing stairwell",
      "4": "East + West stairwells", "5": "East + West stairwells", "6": "East + West stairwells",
      "7": "East + West stairwells", "8": "Roof access via West stairwell",
    },
    emergencyContacts: [
      { name: "Delhi Fire Service", phone: "101", role: "fire" },
      { name: "Police Control Room", phone: "100", role: "security" },
      { name: "AIIMS Emergency", phone: "011-26593012", role: "medical" },
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✅ Hotel seeded");

  // ─ Demo Staff ─────────────────────────────────────
  const staffMembers = [
    { id: "staff_arjun", name: "Arjun Sharma", role: "medical", phone: "+919876543210", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [] },
    { id: "staff_priya", name: "Priya Singh", role: "security", phone: "+919876543211", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [] },
    { id: "staff_ravi", name: "Ravi Kumar", role: "maintenance", phone: "+919876543212", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [] },
    { id: "staff_sneha", name: "Sneha Patel", role: "management", phone: "+919876543213", hotelId: "hotel_001", isOnDuty: true, activeIncidents: [] },
  ];

  for (const staff of staffMembers) {
    await db.collection("staff").doc(staff.id).set({
      ...staff,
      fcmToken: null, // Will be set when staff logs into Flutter app
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  console.log("✅ Staff seeded:", staffMembers.map(s => s.name).join(", "));

  // ─ Demo Manager Account (create in Firebase Auth Console) ─
  console.log("\n📋 NEXT: Go to Firebase Console → Authentication → Add user:");
  console.log("   Email: manager@nexus.com");
  console.log("   Password: nexus2026");
  console.log("\n🔗 Demo QR URL: https://nexus-crisis.web.app/guest/sos?h=hotel_001&f=4&r=412");
  console.log("\n✅ Seed complete! Ready for demo.");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });

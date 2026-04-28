// =====================================================
// NEXUS — Firebase Client SDK (with Demo Mode)
// =====================================================
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Detect demo mode — no Firebase keys = demo mode
export const isDemoMode = !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY";

let app: ReturnType<typeof initializeApp> | undefined;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;

if (!isDemoMode) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Demo mode: create minimal stubs so imports don't break
  app = undefined as any;
  db = {} as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: async () => ({ user: { uid: "demo_manager", email: "demo@nexus.com" } }),
    signOut: async () => {},
  } as any;
}

export { db, auth };

export async function getMessagingInstance() {
  if (!isDemoMode && typeof window !== "undefined" && (await isSupported())) {
    const { getMessaging } = await import("firebase/messaging");
    return getMessaging(app!);
  }
  return null;
}

export default app;


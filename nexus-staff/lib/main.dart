// =====================================================
// NEXUS Staff App — Flutter Entry Point
// Hospitality Crisis Intelligence Platform
// =====================================================
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:go_router/go_router.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/incident_detail_screen.dart';
import 'screens/voice_crisis_screen.dart';
import 'theme/nexus_theme.dart';

// Background FCM handler (top-level required)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('NEXUS: Background FCM received: ${message.data}');
}

final FlutterLocalNotificationsPlugin _localNotifications =
    FlutterLocalNotificationsPlugin();

// ─── Router ────────────────────────────────────────
final _router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(
      path: '/incident',
      builder: (ctx, state) {
        final data = state.extra as Map<String, dynamic>? ?? {};
        return IncidentDetailScreen(data: data);
      },
    ),
    GoRoute(path: '/voice', builder: (_, __) => const VoiceCrisisScreen()),
  ],
);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Status bar styling
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Create high-priority notification channel (Android)
  await _localNotifications
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(const AndroidNotificationChannel(
        'nexus_crisis_alerts',
        'NEXUS Crisis Alerts',
        description: 'Critical emergency notifications from NEXUS',
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
        enableLights: true,
        ledColor: Color(0xFFFF1744),
      ));

  runApp(const NexusApp());
}

class NexusApp extends StatefulWidget {
  const NexusApp({super.key});

  @override
  State<NexusApp> createState() => _NexusAppState();
}

class _NexusAppState extends State<NexusApp> {
  @override
  void initState() {
    super.initState();
    _setupFCM();
  }

  void _setupFCM() {
    // Foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.data['screen'] == 'INCIDENT_DETAIL') {
        HapticFeedback.heavyImpact();
        _router.push('/incident', extra: message.data);
      }
    });

    // Notification tap (background)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (message.data['screen'] == 'INCIDENT_DETAIL') {
        _router.push('/incident', extra: message.data);
      }
    });

    // Check if app was opened from notification
    FirebaseMessaging.instance.getInitialMessage().then((message) {
      if (message != null && message.data['screen'] == 'INCIDENT_DETAIL') {
        Future.delayed(const Duration(milliseconds: 500), () {
          _router.push('/incident', extra: message.data);
        });
      }
    });

    // Save FCM Token to Firestore when user logs in
    FirebaseAuth.instance.authStateChanges().listen((user) async {
      if (user != null) {
        final token = await FirebaseMessaging.instance.getToken();
        if (token != null) {
          await FirebaseFirestore.instance.collection('staff').doc(user.uid).set(
            {'fcmToken': token}, 
            SetOptions(merge: true)
          );
        }
        
        // Listen for token refreshes
        FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
          FirebaseFirestore.instance.collection('staff').doc(user.uid).set(
            {'fcmToken': newToken}, 
            SetOptions(merge: true)
          );
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NEXUS Staff',
      debugShowCheckedModeBanner: false,
      theme: NexusTheme.light(),
      routerConfig: _router,
    );
  }
}

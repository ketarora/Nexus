import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _ringController;

  @override
  void initState() {
    super.initState();
    _ringController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat();
    _navigate();
  }

  void _navigate() async {
    await Future.delayed(const Duration(milliseconds: 2800));
    if (!mounted) return;
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      context.go('/home');
    } else {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _ringController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFBFC),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo with pulse rings
            SizedBox(
              width: 120,
              height: 120,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Outer ring
                  AnimatedBuilder(
                    animation: _ringController,
                    builder: (_, __) => Opacity(
                      opacity: (1 - _ringController.value).clamp(0.0, 1.0),
                      child: Transform.scale(
                        scale: 1.0 + _ringController.value * 1.5,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF0052FF).withOpacity(0.4), width: 2),
                          ),
                        ),
                      ),
                    ),
                  ),
                  // Logo
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF0052FF), Color(0xFF003BB8)],
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF0052FF).withOpacity(0.4), blurRadius: 24, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: const Center(
                      child: Text('N', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, fontFamily: 'Inter')),
                    ),
                  ),
                ],
              ),
            ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),

            const SizedBox(height: 24),

            const Text('NEXUS', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF0A0E1A), letterSpacing: -1, fontFamily: 'Inter'))
                .animate().fadeIn(delay: 400.ms, duration: 400.ms).slideY(begin: 0.2),

            const SizedBox(height: 6),

            const Text('Staff Crisis Response', style: TextStyle(fontSize: 14, color: Color(0xFF9CA5B4), fontFamily: 'Inter'))
                .animate().fadeIn(delay: 600.ms, duration: 400.ms),

            const SizedBox(height: 48),

            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                valueColor: const AlwaysStoppedAnimation(Color(0xFF0052FF)),
                backgroundColor: const Color(0xFFE5E9EF),
              ),
            ).animate().fadeIn(delay: 1000.ms),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController(text: '+91');
  final _otpController = TextEditingController();
  bool _otpSent = false;
  bool _loading = false;
  String? _verificationId;
  String? _error;

  Future<void> _sendOTP() async {
    setState(() { _loading = true; _error = null; });
    try {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: _phoneController.text.trim(),
        verificationCompleted: (PhoneAuthCredential cred) async {
          await FirebaseAuth.instance.signInWithCredential(cred);
          await _onLoginSuccess();
        },
        verificationFailed: (FirebaseAuthException e) {
          setState(() { _error = e.message; _loading = false; });
        },
        codeSent: (String verificationId, int? resendToken) {
          setState(() { _verificationId = verificationId; _otpSent = true; _loading = false; });
        },
        codeAutoRetrievalTimeout: (_) {},
      );
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _verifyOTP() async {
    if (_verificationId == null) return;
    setState(() { _loading = true; _error = null; });
    try {
      final cred = PhoneAuthProvider.credential(verificationId: _verificationId!, smsCode: _otpController.text.trim());
      await FirebaseAuth.instance.signInWithCredential(cred);
      await _onLoginSuccess();
    } on FirebaseAuthException catch (e) {
      setState(() { _error = e.message; _loading = false; });
    }
  }

  Future<void> _onLoginSuccess() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    // Save FCM token to Firestore
    final fcmToken = await FirebaseMessaging.instance.getToken();
    if (fcmToken != null) {
      await FirebaseFirestore.instance.collection('staff').doc(uid).set({
        'fcmToken': fcmToken,
        'lastLogin': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    }
    if (mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFBFC),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),
              // Logo
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF0052FF), Color(0xFF003BB8)],
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [BoxShadow(color: const Color(0xFF0052FF).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
                ),
                child: const Center(child: Text('N', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900))),
              ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
              const SizedBox(height: 20),
              const Text('NEXUS Staff', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF0A0E1A))).animate().fadeIn(),
              const SizedBox(height: 8),
              const Text('Sign in with your phone number', style: TextStyle(fontSize: 14, color: Color(0xFF9CA5B4))).animate().fadeIn(delay: 200.ms),
              const SizedBox(height: 48),

              // Form card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
                  border: Border.all(color: const Color(0xFFE5E9EF)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Phone Number', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF3D4759))),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      enabled: !_otpSent,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF0A0E1A)),
                      decoration: InputDecoration(
                        hintText: '+91 98765 43210',
                        hintStyle: const TextStyle(color: Color(0xFF9CA5B4), fontWeight: FontWeight.w400, fontSize: 16),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E9EF))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0052FF), width: 2)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),

                    if (_otpSent) ...[
                      const SizedBox(height: 16),
                      const Text('OTP Code', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF3D4759))),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 8, color: Color(0xFF0A0E1A)),
                        decoration: InputDecoration(
                          hintText: '------',
                          hintStyle: TextStyle(color: const Color(0xFF9CA5B4), letterSpacing: 8),
                          counterText: '',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E9EF))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0052FF), width: 2)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                    ],

                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(color: const Color(0xFFFFEBEE), borderRadius: BorderRadius.circular(8)),
                        child: Text(_error!, style: const TextStyle(color: Color(0xFFFF1744), fontSize: 13)),
                      ),
                    ],

                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _loading ? null : (_otpSent ? _verifyOTP : _sendOTP),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0052FF),
                          disabledBackgroundColor: const Color(0xFF9CA5B4),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        child: _loading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : Text(_otpSent ? 'Verify OTP ✓' : 'Send OTP →',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),

              const Spacer(),
              const Text('NEXUS · Hospitality Crisis Intelligence', style: TextStyle(fontSize: 11, color: Color(0xFF9CA5B4))),
            ],
          ),
        ),
      ),
    );
  }
}

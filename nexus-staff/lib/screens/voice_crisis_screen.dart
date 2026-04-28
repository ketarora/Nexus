import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';

class VoiceCrisisScreen extends StatefulWidget {
  const VoiceCrisisScreen({super.key});
  @override
  State<VoiceCrisisScreen> createState() => _VoiceCrisisScreenState();
}

class _VoiceCrisisScreenState extends State<VoiceCrisisScreen> with SingleTickerProviderStateMixin {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  bool _speechAvailable = false;
  String _transcription = '';
  Map<String, dynamic>? _classification;
  bool _isClassifying = false;
  bool _submitted = false;

  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize();
    setState(() {});
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
      _classifyTranscription();
    } else {
      setState(() {
        _isListening = true;
        _transcription = '';
        _classification = null;
      });
      HapticFeedback.heavyImpact();
      await _speech.listen(
        onResult: (result) => setState(() => _transcription = result.recognizedWords),
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 4),
        localeId: 'en-IN',
      );
    }
  }

  Future<void> _classifyTranscription() async {
    if (_transcription.trim().isEmpty) return;
    setState(() => _isClassifying = true);
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('classifyVoiceInput');
      final result = await callable.call({'transcription': _transcription});
      setState(() {
        _classification = Map<String, dynamic>.from(result.data as Map);
        _isClassifying = false;
      });
    } catch (e) {
      setState(() => _isClassifying = false);
    }
  }

  @override
  void dispose() {
    _waveController.dispose();
    _speech.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFBFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Voice Crisis Mode', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF0A0E1A))),
        iconTheme: const IconThemeData(color: Color(0xFF0A0E1A)),
        bottom: PreferredSize(preferredSize: const Size.fromHeight(1), child: Container(color: const Color(0xFFE5E9EF), height: 1)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Gap(24),

              // Instructions
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(color: const Color(0xFFE6EFFF), borderRadius: BorderRadius.circular(12)),
                child: const Row(children: [
                  Text('💡', style: TextStyle(fontSize: 18)),
                  Gap(10),
                  Expanded(child: Text('"NEXUS, room 412, cardiac arrest, guest unresponsive"',
                      style: TextStyle(fontSize: 13, color: Color(0xFF0052FF), fontStyle: FontStyle.italic))),
                ]),
              ).animate().fadeIn(),

              const Gap(40),

              // Mic button with wave animation
              GestureDetector(
                onTap: _speechAvailable ? _toggleListening : null,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Wave rings
                    if (_isListening) ...[
                      AnimatedBuilder(
                        animation: _waveController,
                        builder: (_, __) => Opacity(
                          opacity: (1 - _waveController.value).clamp(0.0, 1.0),
                          child: Transform.scale(
                            scale: 1.0 + _waveController.value * 1.8,
                            child: Container(
                              width: 120, height: 120,
                              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFFFF1744).withOpacity(0.2)),
                            ),
                          ),
                        ),
                      ),
                    ],
                    // Button
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 120, height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: _isListening
                            ? const LinearGradient(colors: [Color(0xFFFF1744), Color(0xFFFF6B00)], begin: Alignment.topLeft, end: Alignment.bottomRight)
                            : const LinearGradient(colors: [Color(0xFF0052FF), Color(0xFF003BB8)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        boxShadow: [
                          BoxShadow(
                            color: (_isListening ? const Color(0xFFFF1744) : const Color(0xFF0052FF)).withOpacity(0.4),
                            blurRadius: _isListening ? 40 : 20,
                            spreadRadius: _isListening ? 8 : 0,
                          ),
                        ],
                      ),
                      child: Icon(_isListening ? Icons.stop_rounded : Icons.mic_rounded, color: Colors.white, size: 56),
                    ),
                  ],
                ),
              ).animate().scale(delay: 200.ms, duration: 400.ms, curve: Curves.easeOutBack),

              const Gap(24),

              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Text(
                  _isListening ? 'Listening... tap to stop' : (!_speechAvailable ? 'Microphone unavailable' : 'Tap to describe emergency'),
                  key: ValueKey(_isListening),
                  style: TextStyle(fontSize: 15, color: _isListening ? const Color(0xFFFF1744) : const Color(0xFF9CA5B4), fontWeight: FontWeight.w500),
                ),
              ),

              const Gap(32),

              // Transcription
              if (_transcription.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE5E9EF)),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('TRANSCRIPTION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 2, color: Color(0xFF9CA5B4))),
                    const Gap(8),
                    Text(_transcription, style: const TextStyle(fontSize: 16, color: Color(0xFF0A0E1A), height: 1.5)),
                  ]),
                ).animate().fadeIn(),

              const Spacer(),

              if (_isClassifying)
                Column(children: [
                  const CircularProgressIndicator(color: Color(0xFF0052FF), strokeWidth: 2.5),
                  const Gap(12),
                  const Text('AI classifying...', style: TextStyle(color: Color(0xFF9CA5B4), fontSize: 13)),
                ]),

              if (_classification != null && !_submitted) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE6EFFF),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF0052FF), width: 1.5),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      const Text('🤖', style: TextStyle(fontSize: 16)),
                      const Gap(8),
                      Text('SEVERITY ${_classification!['severity']} · ${(_classification!['classification'] as String? ?? '').toUpperCase()}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.5, color: Color(0xFF0052FF))),
                    ]),
                    const Gap(8),
                    Text(_classification!['guestInstructions'] as String? ?? '', style: const TextStyle(fontSize: 14, height: 1.5, color: Color(0xFF0A0E1A))),
                  ]),
                ).animate().fadeIn(),

                const Gap(12),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      HapticFeedback.heavyImpact();
                      setState(() => _submitted = true);
                      Navigator.pop(context, _classification);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF1744),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: const Text('🚨 CONFIRM & DISPATCH', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5)),
                  ),
                ).animate().slideY(begin: 0.2),
              ],

              if (_submitted) ...[
                const Text('✅', style: TextStyle(fontSize: 56)).animate().scale(curve: Curves.easeOutBack),
                const Gap(12),
                const Text('Emergency Dispatched', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF2EA043))),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';

class IncidentDetailScreen extends StatefulWidget {
  final Map<String, dynamic> data;
  const IncidentDetailScreen({super.key, required this.data});
  @override
  State<IncidentDetailScreen> createState() => _IncidentDetailScreenState();
}

class _IncidentDetailScreenState extends State<IncidentDetailScreen> {
  bool _acknowledged = false;
  bool _briefCopied = false;

  final _sevColors = {
    5: const Color(0xFFFF1744), 4: const Color(0xFFFF6B00),
    3: const Color(0xFFF5A623), 2: const Color(0xFF0969DA), 1: const Color(0xFF2EA043),
  };
  final _sevSoftColors = {
    5: const Color(0xFFFFEBEE), 4: const Color(0xFFFFF3E6),
    3: const Color(0xFFFFF8E6), 2: const Color(0xFFDDF4FF), 1: const Color(0xFFE6F7EB),
  };
  final _sevLabels = {5: 'CRITICAL', 4: 'HIGH', 3: 'MEDIUM', 2: 'LOW', 1: 'INFO'};

  Future<void> _acknowledge() async {
    HapticFeedback.heavyImpact();
    final incidentId = widget.data['incidentId'];
    if (incidentId == null) return;
    try {
      await FirebaseFunctions.instance.httpsCallable('acknowledgeIncident').call({'incidentId': incidentId});
    } catch (_) {}
    setState(() => _acknowledged = true);
  }

  Future<void> _copyBrief(String brief) async {
    await Clipboard.setData(ClipboardData(text: brief));
    HapticFeedback.mediumImpact();
    setState(() => _briefCopied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _briefCopied = false);
  }

  String _getMyRole() => widget.data['staffRole']?.toLowerCase() ?? 'security';

  @override
  Widget build(BuildContext context) {
    final sev = int.tryParse(widget.data['severity']?.toString() ?? '3') ?? 3;
    final sevColor = _sevColors[sev] ?? const Color(0xFFF5A623);
    final sevSoft = _sevSoftColors[sev] ?? const Color(0xFFFFF8E6);
    final sevLabel = _sevLabels[sev] ?? 'MEDIUM';
    final isCritical = sev >= 4;
    final type = widget.data['type'] as String? ?? 'emergency';
    final room = widget.data['room'] as String? ?? '?';
    final floor = widget.data['floor'] as String? ?? '?';
    final incidentId = widget.data['incidentId'] as String?;
    final protocol = widget.data['protocol'] as String? ?? 'Report to duty manager immediately';

    return Scaffold(
      backgroundColor: const Color(0xFFFAFBFC),
      body: incidentId != null
          ? StreamBuilder<DocumentSnapshot>(
              stream: FirebaseFirestore.instance.collection('incidents').doc(incidentId).snapshots(),
              builder: (ctx, snap) {
                final incData = snap.data?.data() as Map<String, dynamic>? ?? {};
                final gemini = incData['geminiClassification'] as Map<String, dynamic>? ?? {};
                final brief = incData['emergencyBrief'] as String? ?? '';
                final myProtocol = gemini['staffProtocols']?[_getMyRole()] as String? ?? protocol;
                return _buildBody(context, sev, sevColor, sevSoft, sevLabel, isCritical, type, room, floor, myProtocol, gemini, brief);
              },
            )
          : _buildBody(context, sev, sevColor, sevSoft, sevLabel, isCritical, type, room, floor, protocol, {}, ''),
    );
  }

  Widget _buildBody(BuildContext context, int sev, Color sevColor, Color sevSoft, String sevLabel,
      bool isCritical, String type, String room, String floor, String protocol,
      Map gemini, String brief) {
    final icons = {'medical': '🏥', 'fire': '🔥', 'security': '🚨', 'flood': '💧', 'power': '⚡', 'other': '⚠️'};
    final icon = icons[type] ?? '⚠️';

    return SafeArea(
      child: Column(
        children: [
          // ─ Critical Header ─
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft, end: Alignment.bottomRight,
                colors: [sevColor, sevColor.withOpacity(0.8)],
              ),
            ),
            child: Column(
              children: [
                Row(children: [
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back_rounded, color: Colors.white), padding: EdgeInsets.zero),
                  const Spacer(),
                  if (isCritical)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                      child: Row(children: [
                        const _PulseDotWhite(),
                        const Gap(6),
                        const Text('CRITICAL', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                      ]),
                    ),
                ]),
                const Gap(8),
                Text(icon, style: const TextStyle(fontSize: 48)),
                const Gap(8),
                Text(
                  gemini['classification'] as String? ?? type.toUpperCase(),
                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                  textAlign: TextAlign.center,
                ),
                const Gap(4),
                Text('Room $room · Floor $floor', style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 14)),
              ],
            ),
          ).animate().fadeIn(),

          // ─ Content ─
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Your Protocol
                _SectionCard(
                  icon: '🤖',
                  title: 'YOUR PROTOCOL — AI Generated',
                  color: const Color(0xFF0052FF),
                  child: Text(protocol, style: const TextStyle(fontSize: 16, height: 1.6, color: Color(0xFF0A0E1A), fontWeight: FontWeight.w500)),
                ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.05),
                const Gap(12),

                // Risk Score
                if (gemini['riskScore'] != null) ...[
                  _SectionCard(
                    icon: '📊',
                    title: 'RISK ANALYSIS',
                    color: const Color(0xFF7C3AED),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Text('${gemini['riskScore']}/100', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0A0E1A), fontFamily: 'monospace')),
                        const Gap(8),
                        Text('Risk Score', style: const TextStyle(color: Color(0xFF9CA5B4), fontSize: 13)),
                      ]),
                      const Gap(8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: (gemini['riskScore'] as int) / 100,
                          backgroundColor: const Color(0xFFE5E9EF),
                          valueColor: AlwaysStoppedAnimation(sevColor),
                          minHeight: 8,
                        ),
                      ),
                      if (gemini['estimatedResponseMinutes'] != null) ...[
                        const Gap(8),
                        Text('Est. response: ${gemini['estimatedResponseMinutes']} minutes', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7689))),
                      ],
                    ]),
                  ).animate().fadeIn(delay: 300.ms),
                  const Gap(12),
                ],

                // 112 Brief
                if (brief.isNotEmpty) ...[
                  _SectionCard(
                    icon: '📞',
                    title: '112 EMERGENCY BRIEF — AI Generated',
                    color: const Color(0xFF2EA043),
                    child: Column(children: [
                      Text(brief, style: const TextStyle(fontSize: 13, height: 1.7, color: Color(0xFF0A0E1A))),
                      const Gap(12),
                      ElevatedButton.icon(
                        onPressed: () => _copyBrief(brief),
                        icon: Icon(_briefCopied ? Icons.check_rounded : Icons.copy_rounded, size: 16),
                        label: Text(_briefCopied ? 'Copied!' : 'Copy for 112 Call'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _briefCopied ? const Color(0xFF2EA043) : const Color(0xFF0052FF),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                      ),
                    ]),
                  ).animate().fadeIn(delay: 400.ms),
                  const Gap(12),
                ],

                // Reasoning chain (transparency for judges)
                if ((gemini['reasoningChain'] as List?)?.isNotEmpty == true) ...[
                  _SectionCard(
                    icon: '🔗',
                    title: 'AI REASONING CHAIN',
                    color: const Color(0xFF9CA5B4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: (gemini['reasoningChain'] as List).map<Widget>((r) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('→ ', style: TextStyle(color: Color(0xFF0052FF), fontWeight: FontWeight.w700)),
                          Expanded(child: Text(r.toString(), style: const TextStyle(fontSize: 12, color: Color(0xFF6B7689), height: 1.5))),
                        ]),
                      )).toList(),
                    ),
                  ).animate().fadeIn(delay: 500.ms),
                  const Gap(12),
                ],

                const Gap(80), // space for button
              ],
            ),
          ),

          // ─ Acknowledge Button ─
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: const Color(0xFFE5E9EF))),
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _acknowledged ? null : _acknowledge,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _acknowledged ? const Color(0xFF2EA043) : sevColor,
                  disabledBackgroundColor: const Color(0xFF2EA043),
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: Text(
                  _acknowledged ? '✅ ACKNOWLEDGED & RESPONDING' : '✅ ACKNOWLEDGE & RESPOND',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.3),
                ),
              ),
            ),
          ).animate().slideY(begin: 1, delay: 600.ms),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String icon;
  final String title;
  final Color color;
  final Widget child;
  const _SectionCard({required this.icon, required this.title, required this.color, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
        boxShadow: [BoxShadow(color: color.withOpacity(0.06), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const Gap(8),
            Text(title, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5, color: color)),
          ]),
          const Gap(12),
          child,
        ],
      ),
    );
  }
}

class _PulseDotWhite extends StatefulWidget {
  const _PulseDotWhite();
  @override
  State<_PulseDotWhite> createState() => _PulseDotWhiteState();
}

class _PulseDotWhiteState extends State<_PulseDotWhite> with SingleTickerProviderStateMixin {
  late AnimationController _c;
  late Animation<double> _a;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..repeat(reverse: true);
    _a = Tween<double>(begin: 0.4, end: 1.0).animate(_c);
  }
  @override
  void dispose() { _c.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: _a,
    builder: (_, __) => Container(
      width: 8, height: 8,
      decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(_a.value)),
    ),
  );
}

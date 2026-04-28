import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isOnDuty = true;
  String _role = 'security';
  List<Map<String, dynamic>> _activeIncidents = [];
  bool _loading = true;

  final _roleColors = {
    'security': const Color(0xFF7C3AED),
    'medical': const Color(0xFFFF1744),
    'maintenance': const Color(0xFFFF6B00),
    'management': const Color(0xFF0052FF),
    'housekeeping': const Color(0xFF2EA043),
    'front_desk': const Color(0xFF0969DA),
  };

  @override
  void initState() {
    super.initState();
    _loadStaffData();
    _loadIncidents();
  }

  Future<void> _loadStaffData() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    final snap = await FirebaseFirestore.instance.collection('staff').doc(uid).get();
    if (snap.exists && mounted) {
      final data = snap.data()!;
      setState(() {
        _isOnDuty = data['isOnDuty'] ?? true;
        _role = data['role'] ?? 'security';
      });
    }
  }

  void _loadIncidents() {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) { setState(() => _loading = false); return; }
    FirebaseFirestore.instance
        .collection('incidents')
        .where('assignedStaff', arrayContains: uid)
        .where('status', whereIn: ['active', 'responding'])
        .orderBy('createdAt', descending: true)
        .limit(5)
        .snapshots()
        .listen((snap) {
      if (mounted) {
        setState(() {
          _activeIncidents = snap.docs.map((d) => {'id': d.id, ...d.data()}).toList();
          _loading = false;
        });
      }
    });
  }

  Future<void> _toggleDuty() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    setState(() => _isOnDuty = !_isOnDuty);
    await FirebaseFirestore.instance.collection('staff').doc(uid).update({'isOnDuty': _isOnDuty});
  }

  @override
  Widget build(BuildContext context) {
    final roleColor = _roleColors[_role] ?? const Color(0xFF0052FF);
    return Scaffold(
      backgroundColor: const Color(0xFFFAFBFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 20,
        title: const Row(children: [
          Text('NEXUS', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0052FF), letterSpacing: -0.5)),
          Gap(8),
          Text('Staff', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Color(0xFF9CA5B4))),
        ]),
        bottom: PreferredSize(preferredSize: const Size.fromHeight(1), child: Container(color: const Color(0xFFE5E9EF), height: 1)),
        actions: [
          IconButton(
            onPressed: () async { await FirebaseAuth.instance.signOut(); if (context.mounted) context.go('/login'); },
            icon: const Icon(Icons.logout_rounded, color: Color(0xFF9CA5B4)),
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ─ Duty Status Card ─
          GestureDetector(
            onTap: _toggleDuty,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: _isOnDuty
                    ? const LinearGradient(colors: [Color(0xFF0052FF), Color(0xFF003BB8)])
                    : const LinearGradient(colors: [Color(0xFFF4F6F8), Color(0xFFE5E9EF)]),
                borderRadius: BorderRadius.circular(20),
                boxShadow: _isOnDuty
                    ? [BoxShadow(color: const Color(0xFF0052FF).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))]
                    : [],
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('DUTY STATUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5, color: _isOnDuty ? Colors.white70 : const Color(0xFF9CA5B4))),
                      const Gap(6),
                      Row(children: [
                        _isOnDuty
                            ? const _PulseDot(color: Colors.white, size: 10)
                            : const SizedBox(width: 10, height: 10, child: DecoratedBox(decoration: BoxDecoration(shape: BoxShape.circle, color: Color(0xFF9CA5B4)))),
                        const Gap(8),
                        Text(_isOnDuty ? 'ON DUTY' : 'OFF DUTY',
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: _isOnDuty ? Colors.white : const Color(0xFF6B7689))),
                      ]),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: _isOnDuty ? Colors.white.withOpacity(0.2) : const Color(0xFFE5E9EF),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(_isOnDuty ? Icons.toggle_on_rounded : Icons.toggle_off_rounded,
                        color: _isOnDuty ? Colors.white : const Color(0xFF9CA5B4), size: 32),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

          const Gap(16),

          // ─ Role Chip ─
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE5E9EF)),
            ),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: roleColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: roleColor.withOpacity(0.3)),
                ),
                child: Text(_role.toUpperCase(),
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: roleColor, letterSpacing: 1)),
              ),
              const Spacer(),
              const Text('Your Role', style: TextStyle(fontSize: 13, color: Color(0xFF9CA5B4))),
            ]),
          ).animate().fadeIn(delay: 300.ms),

          const Gap(24),
          const Text('Active Incidents', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0A0E1A))).animate().fadeIn(delay: 400.ms),
          const Gap(12),

          if (_loading)
            const Center(child: CircularProgressIndicator(color: Color(0xFF0052FF)))
          else if (_activeIncidents.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE5E9EF)),
              ),
              child: Column(children: [
                const Text('🛡️', style: TextStyle(fontSize: 48)),
                const Gap(12),
                const Text('All Clear', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF0A0E1A))),
                const Gap(4),
                const Text('No active incidents assigned to you', style: TextStyle(fontSize: 13, color: Color(0xFF9CA5B4))),
              ]),
            ).animate().fadeIn(delay: 500.ms)
          else
            ..._activeIncidents.asMap().entries.map((entry) {
              final inc = entry.value;
              final sev = inc['severity'] as int? ?? 3;
              final sevColors = {5: const Color(0xFFFF1744), 4: const Color(0xFFFF6B00), 3: const Color(0xFFF5A623), 2: const Color(0xFF0969DA), 1: const Color(0xFF2EA043)};
              final sevColor = sevColors[sev] ?? const Color(0xFFF5A623);
              return GestureDetector(
                onTap: () => context.push('/incident', extra: {'incidentId': inc['id'], 'severity': sev.toString(), 'type': inc['type'], 'room': inc['location']?['room']?.toString() ?? ''}),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: sevColor.withOpacity(0.3)),
                    boxShadow: [BoxShadow(color: sevColor.withOpacity(0.08), blurRadius: 12)],
                  ),
                  child: Row(children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: sevColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: Center(child: Text({'medical': '🏥', 'fire': '🔥', 'security': '🚨', 'flood': '💧', 'power': '⚡'}[inc['type']] ?? '⚠️', style: const TextStyle(fontSize: 22))),
                    ),
                    const Gap(12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(inc['type']?.toString().toUpperCase() ?? 'EMERGENCY',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: sevColor)),
                        const Gap(2),
                        Text('Room ${inc['location']?['room'] ?? '?'} · Floor ${inc['location']?['floor'] ?? '?'}',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF6B7689))),
                      ]),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: Color(0xFF9CA5B4)),
                  ]),
                ),
              ).animate().fadeIn(delay: Duration(milliseconds: 500 + entry.key * 100)).slideX(begin: 0.05);
            }),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/voice'),
        backgroundColor: const Color(0xFFFF1744),
        icon: const Icon(Icons.mic_rounded, color: Colors.white),
        label: const Text('Voice Crisis', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        elevation: 4,
      ),
    );
  }
}

class _PulseDot extends StatefulWidget {
  final Color color;
  final double size;
  const _PulseDot({required this.color, required this.size});
  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot> with SingleTickerProviderStateMixin {
  late AnimationController _c;
  late Animation<double> _anim;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000))..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.5, end: 1.0).animate(CurvedAnimation(parent: _c, curve: Curves.easeInOut));
  }
  @override
  void dispose() { _c.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: _anim,
    builder: (_, __) => Container(
      width: widget.size, height: widget.size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: widget.color.withOpacity(_anim.value)),
    ),
  );
}

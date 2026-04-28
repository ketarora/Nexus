import 'package:flutter/material.dart';

class NexusTheme {
  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Inter',
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF0052FF),
        brightness: Brightness.light,
        primary: const Color(0xFF0052FF),
        secondary: const Color(0xFF2EA043),
        error: const Color(0xFFFF1744),
        background: const Color(0xFFFAFBFC),
        surface: const Color(0xFFFFFFFF),
        onBackground: const Color(0xFF0A0E1A),
        onSurface: const Color(0xFF0A0E1A),
        onPrimary: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFFFAFBFC),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF0A0E1A),
        elevation: 0,
        titleTextStyle: TextStyle(
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Color(0xFF0A0E1A),
          letterSpacing: -0.3,
        ),
        iconTheme: IconThemeData(color: Color(0xFF0A0E1A)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0052FF),
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E9EF)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E9EF)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF0052FF), width: 2),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: Color(0xFF9CA5B4), fontFamily: 'Inter'),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE5E9EF)),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFE6EFFF),
        labelStyle: const TextStyle(color: Color(0xFF0052FF), fontWeight: FontWeight.w600, fontFamily: 'Inter', fontSize: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFFE5E9EF), thickness: 1),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w900, color: Color(0xFF0A0E1A), letterSpacing: -1.5),
        headlineLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w800, color: Color(0xFF0A0E1A), letterSpacing: -1),
        headlineMedium: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, color: Color(0xFF0A0E1A)),
        titleLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, color: Color(0xFF0A0E1A)),
        titleMedium: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, color: Color(0xFF0A0E1A)),
        bodyLarge: TextStyle(fontFamily: 'Inter', color: Color(0xFF3D4759), height: 1.6),
        bodyMedium: TextStyle(fontFamily: 'Inter', color: Color(0xFF6B7689), height: 1.5),
        bodySmall: TextStyle(fontFamily: 'Inter', color: Color(0xFF9CA5B4)),
        labelLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700),
      ),
    );
  }
}

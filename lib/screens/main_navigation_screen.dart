import 'package:flutter/material.dart';
import '../widgets/custom_bottom_navigation.dart';
import 'home_screen.dart';
import 'newsletter_screen.dart';
import 'outils_screen.dart';
import 'concours_screen.dart';
import 'academie_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 2; // Index 2 = Accueil (au centre)
  
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const NewsletterScreen(), // Index 0 - Newsletter
      const OutilsScreen(), // Index 1 - Outils
      const HomeScreen(), // Index 2 - Accueil (page principale)
      const ConcoursScreen(), // Index 3 - Concours
      const AcademieScreen(), // Index 4 - Académie
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: CustomBottomNavigation(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
} 
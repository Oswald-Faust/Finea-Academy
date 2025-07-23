import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:animate_do/animate_do.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/onboarding_model.dart';
import '../widgets/onboarding_widgets.dart';
import '../main.dart';
import 'login_screen.dart';
import 'register_screen.dart';
import 'main_navigation_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  int _currentPage = 0;
  final List<OnboardingPage> _pages = OnboardingData.getPages();
  bool _isAnimating = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _nextPage() async {
    if (_isAnimating) return;
    _isAnimating = true;
    
    if (_currentPage < _pages.length - 1) {
      await _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOutCubic,
      );
    }
    
    Future.delayed(const Duration(milliseconds: 100), () {
      _isAnimating = false;
    });
  }

  Future<void> _skipToEnd() async {
    if (_isAnimating) return;
    _isAnimating = true;
    
    await _pageController.animateToPage(
      _pages.length - 1,
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOutCubic,
    );
    
    Future.delayed(const Duration(milliseconds: 100), () {
      _isAnimating = false;
    });
  }

  Future<void> _completeOnboarding() async {
    // Marquer l'onboarding comme terminé
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_completed', true);
    
    // Animation de sortie
    await _animationController.reverse();
    
    // Naviguer vers l'écran de connexion
    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
          transitionDuration: const Duration(milliseconds: 800),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(1.0, 0.0);
            const end = Offset.zero;
            const curve = Curves.easeInOutCubic;

            var tween = Tween(begin: begin, end: end).chain(
              CurveTween(curve: curve),
            );

            return SlideTransition(
              position: animation.drive(tween),
              child: FadeTransition(
                opacity: animation,
                child: child,
              ),
            );
          },
        ),
      );
    }
  }

  void _navigateToLogin() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );
  }

  void _navigateToRegister() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const RegisterScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Stack(
          children: [
            // Background avec effets visuels
            const OnboardingBackground(),
            
            // PageView principal
            PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              itemCount: _pages.length,
              itemBuilder: (context, index) {
                return OnboardingPageWidget(
                  page: _pages[index],
                  isVisible: index == _currentPage,
                );
              },
            ),
            
            // Indicateurs de page
            Positioned(
              bottom: 180,
              left: 0,
              right: 0,
              child: FadeInUp(
                duration: const Duration(milliseconds: 800),
                child: Center(
                  child: AnimatedSmoothIndicator(
                    activeIndex: _currentPage,
                    count: _pages.length,
                    effect: WormEffect(
                      dotWidth: 12,
                      dotHeight: 12,
                      spacing: 16,
                      dotColor: Colors.white.withOpacity(0.3),
                      activeDotColor: Colors.white,
                      paintStyle: PaintingStyle.fill,
                    ),
                  ),
                ),
              ),
            ),
            
            // Bottom sheet avec boutons
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: SlideInUp(
                duration: const Duration(milliseconds: 800),
                delay: const Duration(milliseconds: 400),
                child: OnboardingBottomSheet(
                  currentPage: _currentPage,
                  totalPages: _pages.length,
                  onNext: _nextPage,
                  onSkip: _skipToEnd,
                  onGetStarted: _completeOnboarding,
                  onLogin: _navigateToLogin,
                  onRegister: _navigateToRegister,
                ),
              ),
            ),
            
            // Bouton de fermeture en haut à droite
            Positioned(
              top: 50,
              right: 20,
              child: FadeInRight(
                duration: const Duration(milliseconds: 800),
                delay: const Duration(milliseconds: 600),
                child: SafeArea(
                  child: IconButton(
                    onPressed: _completeOnboarding,
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(
                        Icons.close,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OnboardingChecker extends StatelessWidget {
  final Widget child;

  const OnboardingChecker({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _checkOnboardingStatus(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Container(
            color: const Color(0xFF000D64),
            child: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          );
        }
        
        final hasCompletedOnboarding = snapshot.data ?? false;
        
        if (hasCompletedOnboarding) {
          return child;
        } else {
          return const OnboardingScreen();
        }
      },
    );
  }

  Future<bool> _checkOnboardingStatus() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('onboarding_completed') ?? false;
  }
} 
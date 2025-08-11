import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../models/onboarding_model.dart';

class OnboardingPageWidget extends StatelessWidget {
  final OnboardingPage page;
  final bool isVisible;

  const OnboardingPageWidget({
    super.key,
    required this.page,
    required this.isVisible,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF000B4A), // Plus foncé
            const Color(0xFF001064), // Plus foncé
            const Color(0xFF1A1A2E).withOpacity(0.9), // Plus foncé
          ],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            children: [
              // Traitement spécial pour la première page (logo centré)
              if (page.pageIndex == 0) ...[
                Expanded(
                  child: Center(
                    child: FadeInUp(
                      duration: const Duration(milliseconds: 1000),
                      delay: Duration(milliseconds: isVisible ? 400 : 0),
                      child: Container(
                        constraints: const BoxConstraints(maxWidth: 200),
                        child: Image.asset(
                          page.imagePath,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Icon(
                                Icons.image_not_supported,
                                color: Colors.white,
                                size: 80,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              ] else ...[
                // Nouveau layout pour tous les autres slides (1-7)
                const SizedBox(height: 40),
                
                // Titre en haut
                FadeInLeft(
                  duration: const Duration(milliseconds: 800),
                  delay: Duration(milliseconds: isVisible ? 600 : 0),
                  child: Text(
                    page.title,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.2,
                    ),
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Description juste en dessous
                FadeInLeft(
                  duration: const Duration(milliseconds: 800),
                  delay: Duration(milliseconds: isVisible ? 800 : 0),
                  child: Text(
                    page.description,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.9),
                      height: 1.5,
                    ),
                  ),
                ),
                
                // Image positionnée à droite au bord
                Expanded(
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 0),
                      child: FadeInRight(
                        duration: const Duration(milliseconds: 1000),
                        delay: Duration(milliseconds: isVisible ? 1000 : 0),
                        child: Container(
                          constraints: const BoxConstraints(maxWidth: 250),
                          child: Image.asset(
                            page.imagePath,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                width: 200,
                                height: 200,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Icon(
                                  Icons.image_not_supported,
                                  color: Colors.white,
                                  size: 80,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class OnboardingBottomSheet extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final VoidCallback? onNext;
  final VoidCallback? onSkip;
  final VoidCallback? onGetStarted;
  final VoidCallback? onLogin;
  final VoidCallback? onRegister;

  const OnboardingBottomSheet({
    super.key,
    required this.currentPage,
    required this.totalPages,
    this.onNext,
    this.onSkip,
    this.onGetStarted,
    this.onLogin,
    this.onRegister,
  });

  @override
  Widget build(BuildContext context) {
    final isLastPage = currentPage == totalPages - 1;
    
    return Container(
      height: isLastPage ? 140 : 120,
      decoration: BoxDecoration(
        // Suppression du fond blanc - transparent
        color: Colors.transparent,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(30),
          topRight: Radius.circular(30),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
        child: isLastPage
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Bouton Connexion
                  FadeInUp(
                    duration: const Duration(milliseconds: 600),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: onLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF000D64),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                          elevation: 8,
                          shadowColor: const Color(0xFF000D64).withOpacity(0.3),
                        ),
                        child: const Text(
                          'Connexion',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Bouton Inscription
                  FadeInUp(
                    duration: const Duration(milliseconds: 600),
                    delay: const Duration(milliseconds: 200),
                    child: SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: onRegister,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white, width: 2),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                        ),
                        child: const Text(
                          'Inscription',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Bouton Skip/Back
                  if (!isLastPage)
                    FadeInLeft(
                      child: TextButton(
                        onPressed: onSkip,
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.white,
                        ),
                        child: const Text(
                          'Passer',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                  
                  // Bouton principal
                  FadeInRight(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      child: ElevatedButton(
                        onPressed: isLastPage ? onGetStarted : onNext,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF000D64),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(140, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                          elevation: 8,
                          shadowColor: const Color(0xFF000D64).withOpacity(0.3),
                        ),
                        child: Text(
                          isLastPage ? 'Commencer' : 'Suivant',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
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

class OnboardingBackground extends StatelessWidget {
  const OnboardingBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF000B4A), // Plus foncé
            const Color(0xFF001064), // Plus foncé
            const Color(0xFF1A1A2E).withOpacity(0.9), // Plus foncé
          ],
        ),
      ),
      child: Stack(
        children: [
          // Cercles décoratifs animés
          Positioned(
            top: -100,
            right: -100,
            child: FadeIn(
              duration: const Duration(seconds: 2),
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.05),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -150,
            left: -100,
            child: FadeIn(
              duration: const Duration(seconds: 3),
              child: Container(
                width: 400,
                height: 400,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.03),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
} 
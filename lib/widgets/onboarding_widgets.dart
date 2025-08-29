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
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0), // Réduit de 24/40 à 20/20
          child: Column(
            mainAxisSize: MainAxisSize.min, // Ajout pour éviter l'expansion excessive
            children: [
              // Traitement spécial pour la première page (logo centré)
              if (page.pageIndex == 0) ...[
                Flexible( // Changé de Expanded à Flexible
                  child: Center(
                    child: FadeInUp(
                      duration: const Duration(milliseconds: 1000),
                      delay: Duration(milliseconds: isVisible ? 400 : 0),
                      child: Container(
                        constraints: BoxConstraints(
                          maxWidth: 180, // Réduit de 200 à 180
                          maxHeight: MediaQuery.of(context).size.height * 0.4, // Ajout d'une contrainte de hauteur
                        ),
                        child: Image.asset(
                          page.imagePath,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              width: 180, // Réduit de 200 à 180
                              height: 120, // Hauteur fixe pour l'erreur
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Icon(
                                Icons.image_not_supported,
                                color: Colors.white,
                                size: 60, // Réduit de 80 à 60
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
                const SizedBox(height: 20), // Réduit de 40 à 20
                
                // Titre en haut
                FadeInLeft(
                  duration: const Duration(milliseconds: 800),
                  delay: Duration(milliseconds: isVisible ? 600 : 0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      page.title,
                      style: const TextStyle(
                        fontSize: 28, // Augmenté de 24 à 28
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        height: 1.2, // Augmenté de 1.1 à 1.2
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 16), // Augmenté de 12 à 16
                
                // Description juste en dessous
                FadeInLeft(
                  duration: const Duration(milliseconds: 800),
                  delay: Duration(milliseconds: isVisible ? 800 : 0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      page.description,
                      style: TextStyle(
                        fontSize: 15, // Augmenté de 13 à 15
                        color: Colors.white.withOpacity(0.9),
                        height: 1.4, // Augmenté de 1.3 à 1.4
                      ),
                    ),
                  ),
                ),
                
                // Image positionnée à droite au bord avec layout flexible
                Flexible( // Changé de Expanded à Flexible
                  child: Stack(
                    children: [
                      Positioned(
                        right: -20, // Style uniforme pour toutes les pages
                        top: 0,
                        bottom: 0,
                        child: FadeInRight(
                          duration: const Duration(milliseconds: 1000),
                          delay: Duration(milliseconds: isVisible ? 1000 : 0),
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: 400, // Style uniforme pour toutes les pages
                              maxHeight: MediaQuery.of(context).size.height * 0.5, // Ajout d'une contrainte de hauteur
                            ),
                            child: Image.asset(
                              page.imagePath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  width: page.pageIndex == 2 ? 400 : 450,
                                  height: 300, // Hauteur fixe pour l'erreur
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Icon(
                                    Icons.image_not_supported,
                                    color: Colors.white,
                                    size: 60, // Réduit de 80 à 60
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ),
                    ],
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
      height: isLastPage ? 160 : 120, // Augmenté de 140 à 160 pour éviter l'overflow
      decoration: BoxDecoration(
        // Suppression du fond blanc - transparent
        color: Colors.transparent,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(30),
          topRight: Radius.circular(30),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0), // Réduit de 20 à 16
        child: isLastPage
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min, // Ajout pour éviter l'expansion
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
                          minimumSize: const Size(double.infinity, 48), // Réduit de 50 à 48
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
                  
                  const SizedBox(height: 10), // Réduit de 12 à 10
                  
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
                          minimumSize: const Size(double.infinity, 48), // Réduit de 50 à 48
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
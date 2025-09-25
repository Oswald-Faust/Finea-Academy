import 'package:flutter/material.dart';

class TallyFormCard extends StatelessWidget {
  final VoidCallback? onTap;

  const TallyFormCard({
    super.key,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 140,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            // Image de fond - Profil Investisseur
            Positioned.fill(
              child: Image.asset(
                'assets/images/profil.jpeg',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback en cas d'erreur de chargement de l'image
                  return Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          const Color(0xFF6366F1).withOpacity(0.8),
                          const Color(0xFF8B5CF6).withOpacity(0.6),
                          const Color(0xFFA855F7).withOpacity(0.4),
                        ],
                      ),
                    ),
                    child: CustomPaint(
                      painter: FormPatternPainter(),
                    ),
                  );
                },
              ),
            ),
            
            // Overlay sombre pour la lisibilité
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.black.withOpacity(0.5),
                    Colors.black.withOpacity(0.2),
                  ],
                ),
              ),
            ),
            
            // Contenu
            Positioned(
              top: 16,
              left: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Profil Investisseur',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                      shadows: [
                        Shadow(
                          offset: Offset(1, 1),
                          blurRadius: 3,
                          color: Colors.black54,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Découvrez votre profil et optimisez vos placements',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontFamily: 'Poppins',
                      shadows: [
                        Shadow(
                          offset: Offset(1, 1),
                          blurRadius: 2,
                          color: Colors.black54,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'IA',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B5CF6).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Profil',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFA855F7).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Conseils',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Icône formulaire en bas à droite
            Positioned(
              bottom: 16,
              right: 16,
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
                ),
                child: const Icon(
                  Icons.quiz,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
            
            // Overlay pour l'effet de clic
            Positioned.fill(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onTap,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FormPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Dessiner des formes géométriques pour représenter un formulaire
    
    // Lignes horizontales pour représenter les champs de formulaire
    paint.color = Colors.white.withOpacity(0.15);
    for (int i = 0; i < 4; i++) {
      final y = size.height * 0.3 + (i * 15);
      canvas.drawLine(
        Offset(size.width * 0.6, y),
        Offset(size.width * 0.9, y),
        paint,
      );
    }
    
    // Cercles pour représenter des options à cocher
    paint.style = PaintingStyle.stroke;
    paint.color = Colors.white.withOpacity(0.2);
    for (int i = 0; i < 3; i++) {
      final y = size.height * 0.45 + (i * 20);
      canvas.drawCircle(
        Offset(size.width * 0.65, y),
        4,
        paint,
      );
    }
    
    // Rectangle pour représenter un bouton
    paint.style = PaintingStyle.fill;
    paint.color = Colors.white.withOpacity(0.1);
    final buttonRect = Rect.fromLTWH(
      size.width * 0.65,
      size.height * 0.75,
      size.width * 0.2,
      size.height * 0.15,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(buttonRect, const Radius.circular(4)),
      paint,
    );
    
    // Détails décoratifs - lignes courbes
    paint.style = PaintingStyle.stroke;
    paint.color = Colors.white.withOpacity(0.1);
    paint.strokeWidth = 1;
    
    final path = Path();
    path.moveTo(0, size.height * 0.2);
    path.quadraticBezierTo(
      size.width * 0.3, 
      size.height * 0.1, 
      size.width * 0.5, 
      size.height * 0.3
    );
    canvas.drawPath(path, paint);
    
    final path2 = Path();
    path2.moveTo(0, size.height * 0.8);
    path2.quadraticBezierTo(
      size.width * 0.2, 
      size.height * 0.6, 
      size.width * 0.4, 
      size.height * 0.9
    );
    canvas.drawPath(path2, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

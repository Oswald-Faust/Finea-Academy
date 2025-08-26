import 'package:flutter/material.dart';

class LotCalculatorCard extends StatelessWidget {
  final VoidCallback? onTap;

  const LotCalculatorCard({
    super.key,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 120,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            // Fond avec image de mains tenant un smartphone
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.orange.withOpacity(0.3),
                    Colors.yellow.withOpacity(0.2),
                    Colors.blue.withOpacity(0.1),
                  ],
                ),
              ),
              child: CustomPaint(
                painter: SmartphonePainter(),
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
                    Colors.black.withOpacity(0.4),
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
                    'Calculateur d\'Intérêt',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '(croissance du capital, intérêts composés)',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.orange.withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Simuler',
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
                          color: Colors.blue.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue.withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Graphique',
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
            
            // Icône calculatrice en bas à droite
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
                  Icons.calculate,
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

class SmartphonePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Dessiner un smartphone stylisé
    final phoneRect = Rect.fromLTWH(size.width * 0.6, size.height * 0.2, size.width * 0.3, size.height * 0.6);
    
    // Contour du smartphone
    paint.color = Colors.white.withOpacity(0.2);
    paint.style = PaintingStyle.stroke;
    canvas.drawRRect(RRect.fromRectAndRadius(phoneRect, const Radius.circular(8)), paint);
    
    // Écran du smartphone
    final screenRect = Rect.fromLTWH(
      phoneRect.left + 2,
      phoneRect.top + 2,
      phoneRect.width - 4,
      phoneRect.height - 4,
    );
    paint.color = Colors.blue.withOpacity(0.3);
    canvas.drawRRect(RRect.fromRectAndRadius(screenRect, const Radius.circular(6)), paint);
    
    // Boutons de la calculatrice
    paint.color = Colors.white.withOpacity(0.3);
    for (int i = 0; i < 3; i++) {
      for (int j = 0; j < 3; j++) {
        final buttonRect = Rect.fromLTWH(
          screenRect.left + 4 + (i * 8),
          screenRect.top + 20 + (j * 8),
          6,
          6,
        );
        canvas.drawRRect(RRect.fromRectAndRadius(buttonRect, const Radius.circular(2)), paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
} 
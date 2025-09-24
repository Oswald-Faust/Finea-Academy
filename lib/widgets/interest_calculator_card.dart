import 'package:flutter/material.dart';

class InterestCalculatorCard extends StatelessWidget {
  final VoidCallback? onTap;

  const InterestCalculatorCard({
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
            // Image de fond - Calculatrice d'intérêts
            Positioned.fill(
              child: Image.asset(
                'assets/images/c.jpeg',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback en cas d'erreur de chargement de l'image
                  return Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.purple.withOpacity(0.3),
                          Colors.blue.withOpacity(0.2),
                          Colors.green.withOpacity(0.1),
                        ],
                      ),
                    ),
                    child: CustomPaint(
                      painter: InterestChartPainter(),
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
                    Colors.black.withOpacity(0.6),
                    Colors.black.withOpacity(0.3),
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
                    'Calculateur d\'Intérêts',
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
                    'Croissance de capital et investissements',
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
                          color: Colors.purple.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.purple.withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Simple',
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
                          'Composé',
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
                  Icons.trending_up,
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

class InterestChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    // Ligne de croissance exponentielle (intérêts composés)
    paint.color = Colors.green.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.8);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.7, size.width * 0.4, size.height * 0.6);
    path.quadraticBezierTo(size.width * 0.6, size.height * 0.4, size.width * 0.8, size.height * 0.2);
    path.quadraticBezierTo(size.width, size.height * 0.1, size.width, size.height * 0.05);
    canvas.drawPath(path, paint);
    
    // Ligne de croissance linéaire (intérêts simples)
    paint.color = Colors.blue.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.8);
    path.lineTo(size.width * 0.3, size.height * 0.7);
    path.lineTo(size.width * 0.6, size.height * 0.6);
    path.lineTo(size.width * 0.9, size.height * 0.5);
    path.lineTo(size.width, size.height * 0.45);
    canvas.drawPath(path, paint);
    
    // Points sur les lignes
    paint.style = PaintingStyle.fill;
    
    // Points pour la ligne composée
    paint.color = Colors.green.withOpacity(0.6);
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.7), 3, paint);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.5), 3, paint);
    canvas.drawCircle(Offset(size.width * 0.8, size.height * 0.2), 3, paint);
    
    // Points pour la ligne simple
    paint.color = Colors.blue.withOpacity(0.6);
    canvas.drawCircle(Offset(size.width * 0.3, size.height * 0.7), 3, paint);
    canvas.drawCircle(Offset(size.width * 0.6, size.height * 0.6), 3, paint);
    canvas.drawCircle(Offset(size.width * 0.9, size.height * 0.5), 3, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

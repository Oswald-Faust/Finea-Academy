import 'package:flutter/material.dart';

class CurrencyConverterCard extends StatelessWidget {
  final VoidCallback? onTap;

  const CurrencyConverterCard({
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
            // Fond avec graphique multicolore
            Container(
              width: double.infinity,
              height: double.infinity,
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
                painter: CurrencyChartPainter(),
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
                    'Convertisseur de devise',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
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
                          'EUR',
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
                          'USD',
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
                          color: Colors.green.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'GBP',
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
            
            // Icône de conversion en bas à droite
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
                  Icons.currency_exchange,
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

class CurrencyChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    // Ligne 1 (bleue)
    paint.color = Colors.blue.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.7);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.5, size.width * 0.4, size.height * 0.6);
    path.quadraticBezierTo(size.width * 0.6, size.height * 0.7, size.width * 0.8, size.height * 0.4);
    path.quadraticBezierTo(size.width, size.height * 0.3, size.width, size.height * 0.2);
    canvas.drawPath(path, paint);
    
    // Ligne 2 (verte)
    paint.color = Colors.green.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.8);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.6, size.width * 0.4, size.height * 0.7);
    path.quadraticBezierTo(size.width * 0.6, size.height * 0.8, size.width * 0.8, size.height * 0.5);
    path.quadraticBezierTo(size.width, size.height * 0.4, size.width, size.height * 0.3);
    canvas.drawPath(path, paint);
    
    // Ligne 3 (jaune)
    paint.color = Colors.yellow.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.6);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.4, size.width * 0.4, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.6, size.height * 0.6, size.width * 0.8, size.height * 0.3);
    path.quadraticBezierTo(size.width, size.height * 0.2, size.width, size.height * 0.1);
    canvas.drawPath(path, paint);
    
    // Ligne 4 (orange)
    paint.color = Colors.orange.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.3, size.width * 0.4, size.height * 0.4);
    path.quadraticBezierTo(size.width * 0.6, size.height * 0.5, size.width * 0.8, size.height * 0.2);
    path.quadraticBezierTo(size.width, size.height * 0.1, size.width, size.height * 0.05);
    canvas.drawPath(path, paint);
    
    // Ligne 5 (rouge)
    paint.color = Colors.red.withOpacity(0.4);
    path.reset();
    path.moveTo(0, size.height * 0.4);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.2, size.width * 0.4, size.height * 0.3);
    path.quadraticBezierTo(size.width * 0.6, size.height * 0.4, size.width * 0.8, size.height * 0.1);
    path.quadraticBezierTo(size.width, size.height * 0.05, size.width, 0);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
} 
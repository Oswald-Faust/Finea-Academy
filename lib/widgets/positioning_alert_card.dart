import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import '../services/alerts_permissions_service.dart';
import 'access_denied_dialog.dart';

class PositioningAlertCard extends StatelessWidget {
  final VoidCallback? onTap;

  const PositioningAlertCard({
    super.key,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AlertsPermissionsService?>(
      builder: (context, permissionsService, child) {
        // Toujours afficher la carte
        return _buildAlertCard(context, permissionsService);
      },
    );
  }

  Widget _buildAlertCard(BuildContext context, AlertsPermissionsService? permissionsService) {
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
            // Image de fond - Alertes de positionnement
            Positioned.fill(
              child: Image.asset(
                'assets/images/alertes-de-posi.jpeg',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback en cas d'erreur de chargement de l'image
                  return Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.green.withOpacity(0.3),
                          Colors.red.withOpacity(0.2),
                          Colors.blue.withOpacity(0.1),
                        ],
                      ),
                    ),
                    child: CustomPaint(
                      painter: FinancialChartPainter(),
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
                    'Alertes de Positionnement',
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
                    'Notifications en temps réel',
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
                          color: Colors.red.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Alertes',
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
                          color: Colors.orange.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.orange.withOpacity(0.5), width: 1),
                        ),
                        child: const Text(
                          'Trading',
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
            
            // Icône en bas à droite
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
                  Icons.notifications_active,
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
                  onTap: () => _handleTap(context, permissionsService),
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

  void _handleTap(BuildContext context, AlertsPermissionsService? permissionsService) {
    // Si le service n'est pas disponible, utiliser le callback par défaut
    if (permissionsService == null) {
      if (kDebugMode) {
        print('⚠️ AlertsPermissionsService est null, autorisation accordée par défaut');
      }
      onTap?.call();
      return;
    }

    // Logs de débogage
    if (kDebugMode) {
      if (permissionsService.hasLoaded) {
        print('🔍 Permissions chargées:');
        print('   - canViewPositioningAlerts: ${permissionsService.canViewPositioningAlerts}');
        print('   - Permissions complètes: ${permissionsService.permissions}');
      } else {
        print('⚠️ Permissions pas encore chargées, rechargement...');
      }
    }
    
    if (!permissionsService.hasLoaded) {
      permissionsService.refreshPermissions();
    }

    // Vérifier les permissions
    if (!permissionsService.canViewPositioningAlerts) {
      if (kDebugMode) {
        print('❌ Accès refusé - canViewPositioningAlerts = false');
      }
      // Afficher le popup d'accès refusé
      AccessDeniedDialog.show(
        context,
        "Vous n'avez pas l'autorisation d'accéder aux alertes de positionnement",
        title: "Accès aux Alertes",
      );
      return;
    }

    if (kDebugMode) {
      print('✅ Accès autorisé - Navigation vers les alertes');
    }
    // Si autorisé, utiliser le callback normal
    onTap?.call();
  }
}

class FinancialChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Dessiner des lignes de graphiques
    final path = Path();
    
    // Ligne 1 (verte)
    paint.color = Colors.green.withOpacity(0.3);
    path.reset();
    path.moveTo(0, size.height * 0.8);
    path.quadraticBezierTo(size.width * 0.25, size.height * 0.6, size.width * 0.5, size.height * 0.7);
    path.quadraticBezierTo(size.width * 0.75, size.height * 0.8, size.width, size.height * 0.5);
    canvas.drawPath(path, paint);
    
    // Ligne 2 (rouge)
    paint.color = Colors.red.withOpacity(0.3);
    path.reset();
    path.moveTo(0, size.height * 0.6);
    path.quadraticBezierTo(size.width * 0.25, size.height * 0.4, size.width * 0.5, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.75, size.height * 0.6, size.width, size.height * 0.3);
    canvas.drawPath(path, paint);
    
    // Ligne 3 (bleue)
    paint.color = Colors.blue.withOpacity(0.3);
    path.reset();
    path.moveTo(0, size.height * 0.4);
    path.quadraticBezierTo(size.width * 0.25, size.height * 0.2, size.width * 0.5, size.height * 0.3);
    path.quadraticBezierTo(size.width * 0.75, size.height * 0.4, size.width, size.height * 0.1);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
} 
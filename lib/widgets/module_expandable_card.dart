import 'package:flutter/material.dart';

class ModuleExpandableCard extends StatefulWidget {
  final int moduleNumber;
  final String moduleTitle;
  final String moduleContent;
  final Color actionIconColor;

  const ModuleExpandableCard({
    super.key,
    required this.moduleNumber,
    required this.moduleTitle,
    required this.moduleContent,
    required this.actionIconColor,
  });

  @override
  State<ModuleExpandableCard> createState() => _ModuleExpandableCardState();
}

class _ModuleExpandableCardState extends State<ModuleExpandableCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _heightAnimation;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _heightAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          // En-tête du module
          GestureDetector(
            onTap: _toggleExpanded,
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Numéro du module
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: widget.actionIconColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text(
                        '${widget.moduleNumber}',
                        style: TextStyle(
                          color: widget.actionIconColor,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: 16),
                  
                  // Titre du module
                  Expanded(
                    child: Text(
                      widget.moduleTitle,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontFamily: 'Poppins',
                        height: 1.4,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: 12),
                  
                  // Bouton d'expansion
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: widget.actionIconColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: AnimatedRotation(
                      turns: _isExpanded ? 0.5 : 0.0,
                      duration: const Duration(milliseconds: 300),
                      child: Icon(
                        Icons.keyboard_arrow_down,
                        color: widget.actionIconColor,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Contenu déroulant
          AnimatedBuilder(
            animation: _heightAnimation,
            builder: (context, child) {
              return SizeTransition(
                sizeFactor: _heightAnimation,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(
                        color: Colors.white24,
                        thickness: 1,
                        height: 20,
                      ),
                      
                      // Contenu détaillé du module - Liste des leçons
                      Container(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: _buildLessonsList(),
                        ),
                      ),
                      
                      const SizedBox(height: 12),
                      
                      // Indicateur de progression (optionnel)
                      Row(
                        children: [
                          Icon(
                            Icons.play_circle_outline,
                            color: widget.actionIconColor,
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Module disponible',
                            style: TextStyle(
                              color: widget.actionIconColor,
                              fontSize: 12,
                              fontFamily: 'Poppins',
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  List<Widget> _buildLessonsList() {
    // Diviser le contenu en leçons individuelles
    final lessons = widget.moduleContent.split('\n').where((line) => line.trim().isNotEmpty).toList();
    
    return lessons.map((lesson) {
      final cleanLesson = lesson.replaceFirst('• ', '').trim();
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            // Icône de vidéo
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: widget.actionIconColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.play_arrow,
                color: widget.actionIconColor,
                size: 16,
              ),
            ),
            
            const SizedBox(width: 12),
            
            // Titre de la leçon
            Expanded(
              child: Text(
                cleanLesson,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 13,
                  fontFamily: 'Poppins',
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      );
    }).toList();
  }
}

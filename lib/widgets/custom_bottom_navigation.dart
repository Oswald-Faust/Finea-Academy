import 'package:flutter/material.dart';
import 'svg_icons.dart';

class CustomBottomNavigation extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  State<CustomBottomNavigation> createState() => _CustomBottomNavigationState();
}

class _CustomBottomNavigationState extends State<CustomBottomNavigation> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 100,
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0),
              _buildNavItem(1),
              _buildNavItem(2, isCenter: true),
              _buildNavItem(3),
              _buildNavItem(4),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, {bool isCenter = false}) {
    final isSelected = widget.currentIndex == index;
    
    return GestureDetector(
      onTap: () => widget.onTap(index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
        decoration: null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildCustomIcon(index, isSelected, isCenter),
            SizedBox(height: index == 4 ? 1 : 10), // Espacement réduit pour Accueil (dernière icône)
            _buildLabel(index, isSelected),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomIcon(int index, bool isSelected, bool isCenter) {
    final double iconSize = isSelected && isCenter ? 54 : 44;
    
    // Mapping des icônes SVG selon l'index
    switch (index) {
      case 0: // Newsletter
        return SvgIcons.newsletter(size: iconSize, isSelected: isSelected);
      case 1: // Concours (nouvelle position)
        return SvgIcons.contest(size: iconSize, isSelected: isSelected);
      case 2: // Académie (nouvelle position, centre)
        return SvgIcons.academy(size: iconSize, isSelected: isSelected);
      case 3: // Outils
        return SvgIcons.tools(size: iconSize, isSelected: isSelected);
      case 4: // Accueil (plus grand)
        return SvgIcons.home(size: isSelected ? 54 : 54, isSelected: isSelected);
      default:
        return SvgIcons.home(size: iconSize, isSelected: isSelected); // Par défaut
    }
  }

  Widget _buildLabel(int index, bool isSelected) {
    String label;
    switch (index) {
      case 0:
        label = 'Newsletter';
        break;
      case 1:
        label = 'Outils';
        break;
      case 2:
        label = 'Accueil';
        break;
      case 3:
        label = 'Concours';
        break;
      case 4:
        label = 'Académie';
        break;
      default:
        label = 'Accueil';
    }

    return Text(
      label,
      style: TextStyle(
        color: isSelected ? Colors.white : Colors.grey[400],
        fontSize: 10,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
      ),
    );
  }
} 
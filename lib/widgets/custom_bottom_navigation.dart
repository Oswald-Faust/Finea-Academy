import 'package:flutter/material.dart';

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
          height: 65,
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.mail_outline, 'newsletter'),
              _buildNavItem(1, Icons.eco_outlined, 'outils'),
              _buildNavItem(2, Icons.home, 'accueil', isCenter: true),
              _buildNavItem(3, Icons.card_giftcard_outlined, 'concours'),
              _buildNavItem(4, Icons.school_outlined, 'académie'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, {bool isCenter = false}) {
    final isSelected = widget.currentIndex == index;
    
    return GestureDetector(
      onTap: () => widget.onTap(index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
        decoration: isSelected && isCenter ? BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white, width: 1),
        ) : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isSelected && isCenter) 
              Container(
                width: 14,
                height: 2,
                margin: const EdgeInsets.only(bottom: 1),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
            if (index == 1) 
              _buildOutilsIcon(isSelected)
            else
              Icon(
                icon,
                color: isSelected ? Colors.white : Colors.grey[400],
                size: isSelected && isCenter ? 24 : 20,
              ),
            const SizedBox(height: 1),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[400],
                fontSize: 8,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOutilsIcon(bool isSelected) {
    return SizedBox(
      width: 20,
      height: 20,
      child: Stack(
        children: [
          Icon(
            Icons.settings,
            color: isSelected ? Colors.white : Colors.grey[400],
            size: 20,
          ),
          Positioned(
            top: 4,
            left: 4,
            child: Icon(
              Icons.eco,
              color: isSelected ? Colors.white : Colors.grey[400],
              size: 6,
            ),
          ),
          Positioned(
            top: 6,
            right: 4,
            child: Icon(
              Icons.edit,
              color: isSelected ? Colors.white : Colors.grey[400],
              size: 4,
            ),
          ),
          Positioned(
            bottom: 4,
            left: 6,
            child: Icon(
              Icons.brush,
              color: isSelected ? Colors.white : Colors.grey[400],
              size: 4,
            ),
          ),
        ],
      ),
    );
  }
} 
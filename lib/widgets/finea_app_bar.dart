import 'package:flutter/material.dart';

class FineaAppBar extends StatelessWidget implements PreferredSizeWidget {
  final List<Widget>? actions;
  final Widget? leading;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final double logoHeight;
  final PreferredSizeWidget? bottom;

  const FineaAppBar({
    super.key,
    this.actions,
    this.leading,
    this.showBackButton = false,
    this.onBackPressed,
    this.logoHeight = 82,
    this.bottom,
  });

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom?.preferredSize.height ?? 0.0),
      );

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
            )
          : leading,
      title: Image.asset(
        'assets/images/finea-logo.png',
        height: logoHeight,
        fit: BoxFit.contain,
      ),
      actions: actions,
      bottom: bottom,
    );
  }
}

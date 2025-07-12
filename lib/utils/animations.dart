import 'package:flutter/material.dart';

class CustomAnimations {
  // Animation de scale avec bounce
  static Widget scaleIn({
    required Widget child,
    Duration delay = Duration.zero,
    Duration duration = const Duration(milliseconds: 600),
  }) {
    return TweenAnimationBuilder<double>(
      duration: duration,
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: child,
        );
      },
      child: child,
    );
  }

  // Animation de slide avec elastic
  static Widget slideInFromBottom({
    required Widget child,
    Duration delay = Duration.zero,
    Duration duration = const Duration(milliseconds: 800),
  }) {
    return TweenAnimationBuilder<Offset>(
      duration: duration,
      tween: Tween(begin: const Offset(0, 1), end: Offset.zero),
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return SlideTransition(
          position: AlwaysStoppedAnimation(value),
          child: child,
        );
      },
      child: child,
    );
  }

  // Animation de rotation douce
  static Widget rotateIn({
    required Widget child,
    Duration delay = Duration.zero,
    Duration duration = const Duration(milliseconds: 1000),
  }) {
    return TweenAnimationBuilder<double>(
      duration: duration,
      tween: Tween(begin: -0.5, end: 0.0),
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.rotate(
          angle: value,
          child: child,
        );
      },
      child: child,
    );
  }

  // Animation de shimmer pour les loading states
  static Widget shimmer({
    required Widget child,
    Duration duration = const Duration(milliseconds: 1500),
  }) {
    return TweenAnimationBuilder<double>(
      duration: duration,
      tween: Tween(begin: -1.0, end: 2.0),
      builder: (context, value, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.transparent,
                Colors.white.withOpacity(0.3),
                Colors.transparent,
              ],
              stops: [0.0, value, 1.0],
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: child,
    );
  }
}

class RevolutLikeButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isPrimary;

  const RevolutLikeButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isPrimary = true,
  });

  @override
  State<RevolutLikeButton> createState() => _RevolutLikeButtonState();
}

class _RevolutLikeButtonState extends State<RevolutLikeButton>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    
    _opacityAnimation = Tween<double>(
      begin: 1.0,
      end: 0.8,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    _controller.forward();
  }

  void _onTapUp(TapUpDetails details) {
    _controller.reverse();
  }

  void _onTapCancel() {
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      onTap: widget.onPressed,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: Container(
                height: 56,
                decoration: BoxDecoration(
                  gradient: widget.isPrimary
                      ? const LinearGradient(
                          colors: [Color(0xFF000D64), Color(0xFF1A237E)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : null,
                  color: widget.isPrimary ? null : Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(28),
                  border: widget.isPrimary
                      ? null
                      : Border.all(color: Colors.white.withOpacity(0.3)),
                  boxShadow: widget.isPrimary
                      ? [
                          BoxShadow(
                            color: const Color(0xFF000D64).withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ]
                      : null,
                ),
                child: Center(
                  child: widget.isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          widget.text,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class ParallaxBackground extends StatelessWidget {
  final Widget child;
  final double offset;

  const ParallaxBackground({
    super.key,
    required this.child,
    this.offset = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Couches de background avec effet parallax
        Positioned(
          top: -100 + (offset * 0.1),
          right: -100 + (offset * 0.05),
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.02),
            ),
          ),
        ),
        Positioned(
          bottom: -150 + (offset * 0.08),
          left: -100 + (offset * 0.03),
          child: Container(
            width: 400,
            height: 400,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.01),
            ),
          ),
        ),
        Positioned(
          top: 200 + (offset * 0.06),
          left: 100 + (offset * 0.04),
          child: Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF3F51B5).withOpacity(0.05),
            ),
          ),
        ),
        child,
      ],
    );
  }
}

class AnimatedCounter extends StatefulWidget {
  final int value;
  final Duration duration;
  final TextStyle? style;

  const AnimatedCounter({
    super.key,
    required this.value,
    this.duration = const Duration(milliseconds: 1000),
    this.style,
  });

  @override
  State<AnimatedCounter> createState() => _AnimatedCounterState();
}

class _AnimatedCounterState extends State<AnimatedCounter>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  int _previousValue = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: widget.duration, vsync: this);
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedCounter oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      _previousValue = oldWidget.value;
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final currentValue = (_previousValue + 
            (_animation.value * (widget.value - _previousValue))).round();
        
        return Text(
          currentValue.toString(),
          style: widget.style,
        );
      },
    );
  }
} 
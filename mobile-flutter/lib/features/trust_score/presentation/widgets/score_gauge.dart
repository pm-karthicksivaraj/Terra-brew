import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/trust_score_model.dart';

class ScoreGauge extends StatelessWidget {
  final int score;
  final String grade;
  final double size;

  const ScoreGauge({
    super.key,
    required this.score,
    required this.grade,
    this.size = 200,
  });

  Color get _scoreColor {
    if (score >= 85) return AppColors.success;
    if (score >= 70) return AppColors.gold;
    if (score >= 55) return AppColors.warning;
    if (score >= 40) return const Color(0xFFE06030);
    return AppColors.danger;
  }

  Color get _scoreColorLight {
    if (score >= 85) return AppColors.success.withValues(alpha: 0.15);
    if (score >= 70) return AppColors.gold.withValues(alpha: 0.15);
    if (score >= 55) return AppColors.warning.withValues(alpha: 0.15);
    if (score >= 40) return const Color(0xFFE06030).withValues(alpha: 0.15);
    return AppColors.danger.withValues(alpha: 0.15);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GaugePainter(
          score: score,
          scoreColor: _scoreColor,
          scoreColorLight: _scoreColorLight,
          backgroundColor: AppColors.surface,
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                score.toString(),
                style: TextStyle(
                  fontSize: size * 0.22,
                  fontWeight: FontWeight.w800,
                  color: _scoreColor,
                  height: 1.0,
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                decoration: BoxDecoration(
                  color: _scoreColorLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  grade,
                  style: TextStyle(
                    fontSize: size * 0.09,
                    fontWeight: FontWeight.w700,
                    color: _scoreColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final int score;
  final Color scoreColor;
  final Color scoreColorLight;
  final Color backgroundColor;

  _GaugePainter({
    required this.score,
    required this.scoreColor,
    required this.scoreColorLight,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const startAngle = 0.75 * math.pi; // ~135 degrees
    const sweepAngle = 1.5 * math.pi; // ~270 degrees
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 12;

    // Background arc
    final bgPaint = Paint()
      ..color = AppColors.borderLight
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      bgPaint,
    );

    // Score arc
    final scoreSweep = sweepAngle * (score / 100);
    final scorePaint = Paint()
      ..shader = LinearGradient(
        colors: [
          scoreColor.withValues(alpha: 0.6),
          scoreColor,
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      scoreSweep,
      false,
      scorePaint,
    );

    // Score indicator dot
    final dotAngle = startAngle + scoreSweep;
    final dotX = center.dx + radius * math.cos(dotAngle);
    final dotY = center.dy + radius * math.sin(dotAngle);

    // Glow
    final glowPaint = Paint()
      ..color = scoreColor.withValues(alpha: 0.3)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(dotX, dotY), 10, glowPaint);

    // Dot
    final dotPaint = Paint()
      ..color = scoreColor
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(dotX, dotY), 6, dotPaint);

    // Inner white dot
    final innerDotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(dotX, dotY), 3, innerDotPaint);

    // Scale markers
    for (int i = 0; i <= 10; i++) {
      final markerAngle = startAngle + (sweepAngle * i / 10);
      final markerValue = i * 10;

      final innerRadius = radius - 22;
      final outerRadius = radius - 18;

      final x1 = center.dx + innerRadius * math.cos(markerAngle);
      final y1 = center.dy + innerRadius * math.sin(markerAngle);
      final x2 = center.dx + outerRadius * math.cos(markerAngle);
      final y2 = center.dy + outerRadius * math.sin(markerAngle);

      final markerPaint = Paint()
        ..color = markerValue <= score
            ? scoreColor.withValues(alpha: 0.5)
            : AppColors.borderLight
        ..strokeWidth = 1.5
        ..strokeCap = StrokeCap.round;

      canvas.drawLine(Offset(x1, y1), Offset(x2, y2), markerPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _GaugePainter oldDelegate) {
    return oldDelegate.score != score || oldDelegate.scoreColor != scoreColor;
  }
}

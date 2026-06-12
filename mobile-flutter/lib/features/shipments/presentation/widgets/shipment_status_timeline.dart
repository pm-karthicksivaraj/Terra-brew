import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/shipment_model.dart';

class ShipmentStatusTimeline extends StatelessWidget {
  final ShipmentStatus currentStatus;

  const ShipmentStatusTimeline({
    super.key,
    required this.currentStatus,
  });

  static const List<_TimelineStep> _steps = [
    _TimelineStep(status: ShipmentStatus.planned, label: 'Planned', icon: Icons.event_outlined),
    _TimelineStep(status: ShipmentStatus.booked, label: 'Booked', icon: Icons.bookmark_outlined),
    _TimelineStep(status: ShipmentStatus.inTransit, label: 'In Transit', icon: Icons.local_shipping),
    _TimelineStep(status: ShipmentStatus.arrived, label: 'Arrived', icon: Icons.location_on),
    _TimelineStep(status: ShipmentStatus.delivered, label: 'Delivered', icon: Icons.check_circle),
  ];

  int get _currentStepIndex {
    switch (currentStatus) {
      case ShipmentStatus.planned:
        return 0;
      case ShipmentStatus.booked:
        return 1;
      case ShipmentStatus.inTransit:
        return 2;
      case ShipmentStatus.arrived:
        return 3;
      case ShipmentStatus.delivered:
        return 4;
      case ShipmentStatus.cancelled:
        return -1;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (currentStatus == ShipmentStatus.cancelled) {
      return _buildCancelledState();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(_steps.length, (index) {
        final step = _steps[index];
        final isCompleted = index < _currentStepIndex;
        final isCurrent = index == _currentStepIndex;
        final isLast = index == _steps.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Timeline indicator column
              SizedBox(
                width: 40,
                child: Column(
                  children: [
                    // Circle
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: isCurrent ? 28 : 24,
                      height: isCurrent ? 28 : 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted
                            ? AppColors.success
                            : isCurrent
                                ? AppColors.primary
                                : AppColors.borderLight,
                        border: isCurrent
                            ? Border.all(
                                color: AppColors.primary.withValues(alpha: 0.3),
                                width: 3,
                              )
                            : null,
                        boxShadow: isCurrent
                            ? [
                                BoxShadow(
                                  color:
                                      AppColors.primary.withValues(alpha: 0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Center(
                        child: isCompleted
                            ? const Icon(Icons.check,
                                size: 14, color: Colors.white)
                            : Icon(
                                step.icon,
                                size: isCurrent ? 14 : 12,
                                color: isCurrent
                                    ? Colors.white
                                    : AppColors.textTertiary,
                              ),
                      ),
                    ),
                    // Line
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? AppColors.success
                                : AppColors.borderLight,
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(left: 12, bottom: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step.label,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              isCurrent ? FontWeight.w700 : FontWeight.w500,
                          color: isCompleted
                              ? AppColors.success
                              : isCurrent
                                  ? AppColors.primary
                                  : AppColors.textTertiary,
                        ),
                      ),
                      if (isCurrent) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Current status',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.primary.withValues(alpha: 0.7),
                          ),
                        ),
                      ],
                      if (isCompleted) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Completed',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.success.withValues(alpha: 0.7),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildCancelledState() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.danger.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.danger,
            ),
            child: const Icon(Icons.close, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Cancelled',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.danger,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'This shipment has been cancelled',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.danger.withValues(alpha: 0.7),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TimelineStep {
  final ShipmentStatus status;
  final String label;
  final IconData icon;

  const _TimelineStep({
    required this.status,
    required this.label,
    required this.icon,
  });
}

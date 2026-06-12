import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/shipment_model.dart';
import '../../data/repositories/shipment_repository.dart';
import '../widgets/shipment_status_timeline.dart';

class ShipmentDetailScreen extends ConsumerWidget {
  final String shipmentId;

  const ShipmentDetailScreen({
    super.key,
    required this.shipmentId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shipmentAsync = ref.watch(shipmentDetailProvider(shipmentId));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: shipmentAsync.when(
        data: (shipment) => CustomScrollView(
          slivers: [
            _buildSliverAppBar(context, shipment),
            SliverToBoxAdapter(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status timeline
                      _buildSectionCard(
                        title: 'Shipment Progress',
                        icon: Icons.timeline,
                        child: ShipmentStatusTimeline(
                          currentStatus: shipment.status,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Route info
                      _buildRouteCard(shipment),
                      const SizedBox(height: 16),
                      // Container & vessel info
                      _buildDetailsCard(shipment),
                      const SizedBox(height: 16),
                      // Tracking updates
                      if (shipment.trackingUpdates != null &&
                          shipment.trackingUpdates!.isNotEmpty) ...[
                        _buildTrackingUpdatesCard(shipment),
                        const SizedBox(height: 16),
                      ],
                      // IoT sensor readings
                      if (shipment.sensorReadings != null &&
                          shipment.sensorReadings!.isNotEmpty) ...[
                        _buildSensorReadingsCard(shipment),
                        const SizedBox(height: 16),
                      ],
                      // Documents
                      if (shipment.documents != null &&
                          shipment.documents!.isNotEmpty) ...[
                        _buildDocumentsCard(shipment),
                        const SizedBox(height: 16),
                      ],
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        loading: () => Scaffold(
          appBar: AppBar(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
          body: const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          ),
        ),
        error: (err, _) => Scaffold(
          appBar: AppBar(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline,
                      size: 48, color: AppColors.danger),
                  const SizedBox(height: 12),
                  const Text('Failed to load shipment',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  Text(err.toString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context, ShipmentModel shipment) {
    final statusColor = AppColors.statusColor(shipment.status.name);

    return SliverAppBar(
      expandedHeight: 160,
      pinned: true,
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      title: Text(
        shipment.shipmentId,
        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColors.primary,
                AppColors.primaryDark,
              ],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 56, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      shipment.statusLabel,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    shipment.route,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }

  Widget _buildRouteCard(ShipmentModel shipment) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.map_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Route Details',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Origin → Destination visual
          Row(
            children: [
              _RoutePoint(
                label: 'Origin',
                value: shipment.originCountry,
                color: AppColors.primary,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    children: [
                      Container(
                        height: 2,
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(1),
                        ),
                      ),
                      const SizedBox(height: 4),
                      if (shipment.isInProgress)
                        const Icon(Icons.local_shipping,
                            size: 16, color: AppColors.info),
                    ],
                  ),
                ),
              ),
              _RoutePoint(
                label: 'Destination',
                value: shipment.destinationCountry,
                color: AppColors.success,
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (shipment.portOfLoading != null)
            _detailRow('Port of Loading', shipment.portOfLoading!),
          if (shipment.portOfDischarge != null)
            _detailRow('Port of Discharge', shipment.portOfDischarge!),
          if (shipment.departureDate != null)
            _detailRow(
              'Departure',
              DateFormat('dd MMM yyyy').format(shipment.departureDate!),
            ),
          if (shipment.estimatedArrival != null)
            _detailRow(
              'Est. Arrival',
              DateFormat('dd MMM yyyy').format(shipment.estimatedArrival!),
            ),
          if (shipment.actualArrival != null)
            _detailRow(
              'Actual Arrival',
              DateFormat('dd MMM yyyy').format(shipment.actualArrival!),
            ),
        ],
      ),
    );
  }

  Widget _buildDetailsCard(ShipmentModel shipment) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.info_outline, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Shipment Details',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (shipment.containerNumber != null)
            _detailRow('Container', shipment.containerNumber!),
          if (shipment.vesselName != null)
            _detailRow('Vessel', shipment.vesselName!),
          if (shipment.shippingLine != null)
            _detailRow('Shipping Line', shipment.shippingLine!),
          if (shipment.billOfLading != null)
            _detailRow('Bill of Lading', shipment.billOfLading!),
          if (shipment.weightKg != null)
            _detailRow(
                'Weight', '${shipment.weightKg!.toStringAsFixed(0)} kg'),
        ],
      ),
    );
  }

  Widget _buildTrackingUpdatesCard(ShipmentModel shipment) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.track_changes, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Tracking Updates',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...shipment.trackingUpdates!.map(
            (update) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(top: 5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          update.status,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (update.location != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            update.location!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                        if (update.description != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            update.description!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Text(
                    DateFormat('dd MMM, HH:mm').format(update.timestamp),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSensorReadingsCard(ShipmentModel shipment) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.sensors, size: 18, color: AppColors.info),
              SizedBox(width: 8),
              Text(
                'IoT Sensor Readings',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...shipment.sensorReadings!.take(5).map(
            (reading) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (reading.temperature != null)
                      _sensorValue(
                        icon: Icons.thermostat_outlined,
                        label: 'Temp',
                        value: '${reading.temperature!.toStringAsFixed(1)}°C',
                        color: reading.temperature! > 30
                            ? AppColors.danger
                            : AppColors.success,
                      ),
                    if (reading.humidity != null)
                      _sensorValue(
                        icon: Icons.water_drop_outlined,
                        label: 'Humidity',
                        value: '${reading.humidity!.toStringAsFixed(1)}%',
                        color: AppColors.info,
                      ),
                    if (reading.co2Level != null)
                      _sensorValue(
                        icon: Icons.cloud_outlined,
                        label: 'CO₂',
                        value: '${reading.co2Level!.toStringAsFixed(0)} ppm',
                        color: AppColors.warning,
                      ),
                    Text(
                      DateFormat('HH:mm').format(reading.timestamp),
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentsCard(ShipmentModel shipment) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.attach_file, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Export Documents',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...shipment.documents!.map(
            (doc) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () {},
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.description_outlined,
                          size: 20, color: AppColors.primary),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          doc,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const Icon(Icons.download,
                          size: 18, color: AppColors.textTertiary),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sensorValue({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textTertiary),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _RoutePoint extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _RoutePoint({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 2),
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

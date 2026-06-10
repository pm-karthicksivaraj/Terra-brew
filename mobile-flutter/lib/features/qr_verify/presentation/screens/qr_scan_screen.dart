import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/layouts/app_scaffold.dart';
import '../../../../shared/widgets/app_button.dart';

/// QR scanner screen with camera view, overlay, flash toggle, gallery import
class QrScanScreen extends StatefulWidget {
  const QrScanScreen({super.key});

  @override
  State<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends State<QrScanScreen>
    with SingleTickerProviderStateMixin {
  final MobileScannerController _scannerController = MobileScannerController(
    autoStart: true,
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );

  bool _flashOn = false;
  bool _hasScanned = false;
  String? _scannedCode;
  late AnimationController _animationController;
  late Animation<double> _scanLineAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _scanLineAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _scannerController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_hasScanned) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode != null && barcode.rawValue != null) {
      setState(() {
        _hasScanned = true;
        _scannedCode = barcode.rawValue;
      });
      _scannerController.stop();

      // Haptic feedback
      // HapticFeedback.mediumImpact();
    }
  }

  void _resetScan() {
    setState(() {
      _hasScanned = false;
      _scannedCode = null;
    });
    _scannerController.start();
  }

  Future<void> _pickFromGallery() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      // In a real implementation, we would use ML Kit or similar
      // to scan the QR code from the image
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Gallery QR scanning would process the selected image'),
        ),
      );
    }
  }

  void _navigateToResult() {
    if (_scannedCode != null) {
      context.push('/qr-result', extra: {'code': _scannedCode});
    }
  }

  void _navigateToEntity() {
    if (_scannedCode == null) return;
    // Parse QR code to determine entity type
    final code = _scannedCode!;
    if (code.contains('farmer')) {
      context.push('/farmers/${_extractId(code)}');
    } else if (code.contains('farmland')) {
      context.push('/farmlands/${_extractId(code)}');
    } else if (code.contains('batch')) {
      context.push('/shipments/${_extractId(code)}');
    } else {
      _navigateToResult();
    }
  }

  String _extractId(String code) {
    // Try to extract ID from URL-like format
    final parts = code.split('/');
    return parts.isNotEmpty ? parts.last : code;
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'QR Scanner',
      showBackButton: true,
      body: Column(
        children: [
          // Scanner area
          Expanded(
            flex: 3,
            child: Stack(
              children: [
                // Camera preview
                MobileScanner(
                  controller: _scannerController,
                  onDetect: _onDetect,
                ),

                // Scan overlay frame
                _ScanOverlay(
                  scanLineAnimation: _scanLineAnimation,
                  hasScanned: _hasScanned,
                ),

                // Top controls
                Positioned(
                  top: 16,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _hasScanned ? 'Code Detected!' : 'Scan a QR Code',
                        style: TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: AppFontSize.md,
                          fontWeight: FontWeight.w700,
                          color: _hasScanned ? AppColors.success : AppColors.textOnPrimary,
                          shadows: const [
                            Shadow(color: Colors.black54, blurRadius: 4),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Bottom controls
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _ControlButton(
                        icon: _flashOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                        label: 'Flash',
                        onTap: () {
                          _scannerController.toggleTorch();
                          setState(() => _flashOn = !_flashOn);
                        },
                      ),
                      _ControlButton(
                        icon: Icons.photo_library_outlined,
                        label: 'Gallery',
                        onTap: _pickFromGallery,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Result area
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.xl),
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(AppRadius.xl),
                ),
              ),
              child: _hasScanned
                  ? _buildScanResult()
                  : _buildScanInstructions(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanInstructions() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.qr_code_scanner_rounded,
          size: 48,
          color: AppColors.muted,
        ),
        const SizedBox(height: AppSpacing.lg),
        const Text(
          'Point your camera at a QR code',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: AppFontSize.md,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        const Text(
          'Scan farmer IDs, farmland codes, or batch QRs to verify authenticity and trace origin',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: AppFontSize.sm,
            color: AppColors.muted,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildScanResult() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.success.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.check_circle_rounded, color: AppColors.success, size: 28),
              SizedBox(width: AppSpacing.sm),
              Text(
                'QR Code Detected',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.md,
                  fontWeight: FontWeight.w700,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Text(
            _scannedCode ?? '',
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.textPrimary,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        Row(
          children: [
            Expanded(
              child: AppButton(
                label: 'View Details',
                variant: AppButtonVariant.primary,
                icon: Icons.open_in_new_rounded,
                onPressed: _navigateToEntity,
                fullWidth: true,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: AppButton(
                label: 'Verify',
                variant: AppButtonVariant.secondary,
                icon: Icons.verified_user_rounded,
                onPressed: _navigateToResult,
                fullWidth: true,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        TextButton(
          onPressed: _resetScan,
          child: const Text(
            'Scan Again',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

/// Scan overlay with coffee brown frame corners and animated scan line
class _ScanOverlay extends StatelessWidget {
  final Animation<double> scanLineAnimation;
  final bool hasScanned;

  const _ScanOverlay({
    required this.scanLineAnimation,
    required this.hasScanned,
  });

  @override
  Widget build(BuildContext context) {
    return ColorFiltered(
      colorFilter: ColorFilter.mode(
        Colors.black.withOpacity(0.5),
        BlendMode.srcOut,
      ),
      child: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              color: Colors.black,
              backgroundBlendMode: BlendMode.dstOut,
            ),
          ),
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Control button for flash/gallery
class _ControlButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ControlButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 10,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

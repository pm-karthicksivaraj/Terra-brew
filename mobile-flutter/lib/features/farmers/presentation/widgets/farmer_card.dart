import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/farmer_model.dart';

class FarmerCard extends StatelessWidget {
  final FarmerModel farmer;
  final VoidCallback onTap;

  const FarmerCard({
    super.key,
    required this.farmer,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      elevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              _buildAvatar(),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            farmer.fullName,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (farmer.isCertified) _buildCertifiedBadge(),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            farmer.farmerCode,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.phone_outlined,
                          size: 12,
                          color: AppColors.textHint,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          farmer.contactNumber.isNotEmpty ? farmer.contactNumber : 'N/A',
                          style: const TextStyle(
                            fontFamily: 'SpaceMono',
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _buildCountryFlag(),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            farmer.locationDisplay,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: 11,
                              color: AppColors.textHint,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppColors.textHint,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: farmer.isCertified ? AppColors.successLight : AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: farmer.isCertified ? AppColors.success : AppColors.border,
          width: 1.5,
        ),
      ),
      child: Center(
        child: Text(
          farmer.initials,
          style: TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: farmer.isCertified ? AppColors.success : AppColors.primary,
          ),
        ),
      ),
    );
  }

  Widget _buildCertifiedBadge() {
    return Container(
      margin: const EdgeInsets.only(left: 6),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.successLight,
        borderRadius: BorderRadius.circular(4),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified, size: 10, color: AppColors.success),
          SizedBox(width: 2),
          Text(
            'Certified',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: AppColors.success,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountryFlag() {
    if (farmer.country.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        _getCountryEmoji(farmer.country),
        style: const TextStyle(fontSize: 11),
      ),
    );
  }

  String _getCountryEmoji(String country) {
    const countryEmojis = {
      'Ethiopia': '🇪🇹',
      'Colombia': '🇨🇴',
      'Brazil': '🇧🇷',
      'Vietnam': '🇻🇳',
      'Indonesia': '🇮🇩',
      'Honduras': '🇭🇳',
      'India': '🇮🇳',
      'Uganda': '🇺🇬',
      'Peru': '🇵🇪',
      'Mexico': '🇲🇽',
      'Guatemala': '🇬🇹',
      'Nicaragua': '🇳🇮',
      'Costa Rica': '🇨🇷',
      'Kenya': '🇰🇪',
      'Tanzania': '🇹🇿',
      'Rwanda': '🇷🇼',
      'Papua New Guinea': '🇵🇬',
      'Ecuador': '🇪🇨',
      'El Salvador': '🇸🇻',
      'Cameroon': '🇨🇲',
    };
    return countryEmojis[country] ?? '🌍';
  }
}

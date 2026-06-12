import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Avatar size enum
enum AvatarSize {
  small,
  medium,
  large,
}

/// User avatar with initials fallback, image from URL, coffee brown background
class UserAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final AvatarSize size;
  final Color? backgroundColor;
  final Color? textColor;
  final VoidCallback? onTap;
  final bool showOnlineIndicator;
  final bool isOnline;

  const UserAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.size = AvatarSize.medium,
    this.backgroundColor,
    this.textColor,
    this.onTap,
    this.showOnlineIndicator = false,
    this.isOnline = false,
  });

  double _dimension() {
    switch (size) {
      case AvatarSize.small:
        return 32;
      case AvatarSize.medium:
        return 44;
      case AvatarSize.large:
        return 64;
    }
  }

  double _fontSize() {
    switch (size) {
      case AvatarSize.small:
        return 12;
      case AvatarSize.medium:
        return 16;
      case AvatarSize.large:
        return 22;
    }
  }

  double _onlineIndicatorSize() {
    switch (size) {
      case AvatarSize.small:
        return 8;
      case AvatarSize.medium:
        return 10;
      case AvatarSize.large:
        return 14;
    }
  }

  String _getInitials() {
    if (name == null || name!.trim().isEmpty) return '??';
    final parts = name!.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final dimension = _dimension();

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: dimension,
            height: dimension,
            decoration: BoxDecoration(
              color: backgroundColor ?? AppColors.primary,
              shape: BoxShape.circle,
              image: imageUrl != null && imageUrl!.isNotEmpty
                  ? DecorationImage(
                      image: CachedNetworkImageProvider(imageUrl!),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: imageUrl == null || imageUrl!.isEmpty
                ? Center(
                    child: Text(
                      _getInitials(),
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: _fontSize(),
                        fontWeight: FontWeight.w700,
                        color: textColor ?? AppColors.textOnPrimary,
                      ),
                    ),
                  )
                : null,
          ),
          if (showOnlineIndicator)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: _onlineIndicatorSize(),
                height: _onlineIndicatorSize(),
                decoration: BoxDecoration(
                  color: isOnline ? AppColors.success : AppColors.muted,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.background,
                    width: 2,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/**
 * ProfileAvatar - Shared avatar component for user profiles
 */

import * as React from 'react';
import type { PublicProfile } from '@mbxarts/types';
import { cn } from '../utils/cn';

export interface ProfileAvatarProps {
  profile: PublicProfile | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTierRing?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export function ProfileAvatar({
  profile,
  size = 'md',
  className,
  showTierRing = false,
}: ProfileAvatarProps) {
  const initials = React.useMemo(() => {
    if (!profile) return '?';
    if (profile.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    if (profile.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return profile.wallet_address.slice(2, 4).toUpperCase();
  }, [profile]);

  const tierColor = profile?.tier_color || '#6b7280';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-700 text-white font-semibold overflow-hidden',
        sizeClasses[size],
        showTierRing && 'ring-2',
        className
      )}
      style={showTierRing ? { ringColor: tierColor } : undefined}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.display_name || profile.username || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

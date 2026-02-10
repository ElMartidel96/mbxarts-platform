'use client';

/**
 * ProfileCard - Unified 4-level profile identity system (Wallets)
 *
 * Usage:
 * <ProfileCard />                           // Uses connected wallet
 * <ProfileCard wallet="0x..." />            // Shows specific user
 * <ProfileCard initialLevel={1} />          // Start at thumbnail
 * <ProfileCard size="sm" />                 // Customize thumbnail
 *
 * Levels:
 * 1 - Thumbnail (48px Apple Watch style)
 * 2 - Expanded Panel (large avatar + network badge)
 * 3 - Mini Card (stats + social preview) - standalone sharing
 * 4 - Full Modal (everything + Manage Wallets)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { ProfileCardProvider, type ProfileLevel } from './ProfileCardProvider';
import { ProfileThumbnail } from './ProfileThumbnail';
import { ProfileExpanded } from './ProfileExpanded';
import { ProfileMiniCard } from './ProfileMiniCard';
import { ProfileFullCard } from './ProfileFullCard';

interface ProfileCardProps {
  size?: 'sm' | 'md' | 'lg';
  wallet?: string;
  initialLevel?: ProfileLevel;
  isStandalone?: boolean;
  onLevelChange?: (level: ProfileLevel) => void;
  onStandaloneClose?: () => void;
  className?: string;
}

export function ProfileCard({
  size = 'sm',
  wallet,
  initialLevel = 1,
  isStandalone = false,
  onLevelChange,
  onStandaloneClose,
  className = '',
}: ProfileCardProps) {
  return (
    <ProfileCardProvider
      wallet={wallet}
      initialLevel={initialLevel}
      isStandalone={isStandalone}
      onLevelChange={onLevelChange}
      onStandaloneClose={onStandaloneClose}
    >
      <div className={`relative ${className}`}>
        {/* Level 1: Thumbnail (always visible as anchor) */}
        <ProfileThumbnail size={size} />

        {/* Level 2: Expanded Panel (portal) */}
        <ProfileExpanded />

        {/* Level 3: Mini Card (portal) - standalone sharing */}
        <ProfileMiniCard />

        {/* Level 4: Full Modal (portal) */}
        <ProfileFullCard />
      </div>
    </ProfileCardProvider>
  );
}

export default ProfileCard;

'use client';

/**
 * ProfileCard - Entry component for the profile card system (Wallets)
 *
 * Phase 1: Renders L1 (Thumbnail) + L2 (Expanded) only.
 * L3 (MiniCard) and L4 (FullCard) are stubbed for Phase 2.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { ProfileCardProvider, type ProfileLevel } from './ProfileCardProvider';
import { ProfileThumbnail } from './ProfileThumbnail';
import { ProfileExpanded } from './ProfileExpanded';

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
        <ProfileThumbnail size={size} />
        <ProfileExpanded />
        {/* Phase 2: <ProfileMiniCard /> */}
        {/* Phase 2: <ProfileFullCard /> */}
      </div>
    </ProfileCardProvider>
  );
}

export default ProfileCard;

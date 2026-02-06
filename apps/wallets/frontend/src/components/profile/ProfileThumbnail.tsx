'use client';

/**
 * ProfileThumbnail - Level 1 of ProfileCard system
 *
 * Small thumbnail avatar (48px default):
 * - Hover -> Opens Level 2 (Expanded Avatar) - temporary
 * - Click -> Opens Level 2 AND locks it - stays open until click outside
 * - When card is open (L2+), shows Farcaster icon in glass circle
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React from 'react';
import { useProfileCard } from './ProfileCardProvider';
import { ApexAvatar } from './ApexAvatar';

interface ProfileThumbnailProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeCount?: number;
  enableFloat?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-12 h-12', emoji: 'text-2xl' },
  md: { container: 'w-16 h-16', emoji: 'text-3xl' },
  lg: { container: 'w-20 h-20', emoji: 'text-4xl' },
};

export function ProfileThumbnail({
  size = 'sm',
  showBadge = false,
  badgeCount = 0,
  enableFloat = false,
  className = '',
}: ProfileThumbnailProps) {
  const { profile, currentLevel, openLevel, lockLevel, thumbnailRef } = useProfileCard();

  const handleMouseEnter = () => {
    if ((currentLevel ?? 0) <= 1) {
      openLevel(2);
    }
  };

  const handleClick = () => {
    openLevel(2);
    lockLevel();
  };

  const isCardOpen = (currentLevel ?? 0) > 1;

  return (
    <div
      ref={thumbnailRef as React.RefObject<HTMLDivElement>}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className="relative cursor-pointer"
    >
      {isCardOpen ? (
        <div
          className={`${sizeMap[size].container} rounded-full backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/40 dark:border-slate-500/40 shadow-lg shadow-slate-500/10 dark:shadow-black/20 flex items-center justify-center transition-all duration-300 ${className}`}
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.15)',
          }}
          title="Exploring profile..."
        >
          <img
            src="/farcaster-icon-1024.png"
            alt="Exploring"
            className={`${sizeMap[size].emoji} object-contain opacity-80`}
            style={{ width: '60%', height: '60%' }}
          />
        </div>
      ) : (
        <ApexAvatar
          size={size}
          showBadge={showBadge}
          badgeCount={badgeCount}
          enableFloat={enableFloat}
          imageSrc={profile?.avatar_url || undefined}
          className={className}
        />
      )}
    </div>
  );
}

export default ProfileThumbnail;

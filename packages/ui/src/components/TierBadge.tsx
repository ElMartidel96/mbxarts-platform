/**
 * TierBadge - Display user tier with appropriate styling
 */

import * as React from 'react';
import type { ProfileTier } from '@mbxarts/types';
import { cn } from '../utils/cn';

export interface TierBadgeProps {
  tier: ProfileTier;
  tierColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const tierLabels: Record<ProfileTier, string> = {
  newcomer: 'Newcomer',
  contributor: 'Contributor',
  builder: 'Builder',
  expert: 'Expert',
  master: 'Master',
  legend: 'Legend',
};

const defaultTierColors: Record<ProfileTier, string> = {
  newcomer: '#6b7280',
  contributor: '#10b981',
  builder: '#3b82f6',
  expert: '#8b5cf6',
  master: '#f59e0b',
  legend: '#ef4444',
};

export function TierBadge({
  tier,
  tierColor,
  size = 'md',
  className,
}: TierBadgeProps) {
  const color = tierColor || defaultTierColors[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {tierLabels[tier]}
    </span>
  );
}

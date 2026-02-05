/**
 * PlatformLink - Cross-platform navigation component
 */

import * as React from 'react';
import { cn } from '../utils/cn';

export interface PlatformLinkProps {
  href: string;
  platform?: 'dao' | 'wallets' | 'auto';
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

const PLATFORM_URLS = {
  dao: process.env.NEXT_PUBLIC_DAO_URL || 'https://mbxarts.com',
  wallets: process.env.NEXT_PUBLIC_WALLETS_URL || 'https://gifts.mbxarts.com',
};

function getCurrentPlatform(): 'dao' | 'wallets' {
  if (typeof window === 'undefined') return 'dao';
  const hostname = window.location.hostname;
  if (hostname.includes('gifts.') || hostname.includes('wallets.')) {
    return 'wallets';
  }
  return 'dao';
}

export function PlatformLink({
  href,
  platform = 'auto',
  children,
  className,
  external = false,
}: PlatformLinkProps) {
  const resolvedPlatform = platform === 'auto' ? getCurrentPlatform() : platform;
  const baseUrl = PLATFORM_URLS[resolvedPlatform];

  // If href is already a full URL, use it directly
  const fullHref = href.startsWith('http') ? href : `${baseUrl}${href}`;

  // Determine if this is a cross-platform link
  const currentPlatform = getCurrentPlatform();
  const isCrossPlatform = platform !== 'auto' && platform !== currentPlatform;

  return (
    <a
      href={fullHref}
      className={cn(
        'text-blue-400 hover:text-blue-300 transition-colors',
        className
      )}
      target={external || isCrossPlatform ? '_blank' : undefined}
      rel={external || isCrossPlatform ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}

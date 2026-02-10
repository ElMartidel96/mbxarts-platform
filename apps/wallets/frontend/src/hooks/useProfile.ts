/**
 * Profile Hooks for Wallets Platform
 *
 * Fetches profile data from DAO's cross-platform API.
 * Uses plain useState/useEffect (no React Query dependency).
 * Returns same shape as DAO's useProfile/usePublicProfile hooks.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProfileData {
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_handle: string | null;
  discord_handle: string | null;
  telegram_handle?: string | null;
  website_url?: string | null;
  total_tasks_completed: number;
  total_cgc_earned: number;
  total_referrals?: number;
  reputation_score: number;
  tier: string;
  tier_color: string;
}

interface ProfileHookResult {
  profile: ProfileData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchCrossPlatformProfile(wallet: string): Promise<ProfileData | null> {
  const res = await fetch(`/api/cross-platform/profile?wallet=${wallet}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status}`);
  }
  const json = await res.json();
  if (!json.success || !json.data) return null;
  return json.data;
}

/**
 * Hook to fetch own profile via cross-platform API
 */
export function useProfile(wallet?: string): ProfileHookResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchIdRef = useRef(0);

  const doFetch = useCallback(async () => {
    if (!wallet) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const data = await fetchCrossPlatformProfile(wallet);
      if (id === fetchIdRef.current) {
        setProfile(data);
        setIsLoading(false);
      }
    } catch (err) {
      if (id === fetchIdRef.current) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    }
  }, [wallet]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  return { profile, isLoading, isError, error, refetch: doFetch };
}

/**
 * Hook to fetch a public profile (for viewing others)
 * Same implementation as useProfile for cross-platform API
 */
export function usePublicProfile(wallet?: string): ProfileHookResult {
  return useProfile(wallet);
}

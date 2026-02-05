/**
 * @mbxarts/hooks - Shared React hooks for MBXarts Platform
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PublicProfile, NFTWallet } from '@mbxarts/types';
import { MBXartsClient, createClient } from '@mbxarts/api-client';

// =============================================================================
// CLIENT INSTANCE
// =============================================================================

let clientInstance: MBXartsClient | null = null;

function getClient(): MBXartsClient {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

// =============================================================================
// PROFILE HOOKS
// =============================================================================

export interface UseProfileResult {
  profile: PublicProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user profile data
 * Works across both DAO and Wallets platforms
 */
export function useProfile(walletAddress: string | undefined): UseProfileResult {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const data = await client.getProfile(walletAddress);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}

/**
 * Hook to get or create a profile (auto-creates if not exists)
 */
export function useProfileWithCreate(walletAddress: string | undefined): UseProfileResult {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrCreateProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const data = await client.getOrCreateProfile(walletAddress);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get/create profile'));
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchOrCreateProfile();
  }, [fetchOrCreateProfile]);

  return { profile, loading, error, refetch: fetchOrCreateProfile };
}

// =============================================================================
// WALLET HOOKS
// =============================================================================

export interface UseNFTWalletsResult {
  wallets: NFTWallet[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch NFT wallets for an owner
 */
export function useNFTWallets(owner: string | undefined): UseNFTWalletsResult {
  const [wallets, setWallets] = useState<NFTWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWallets = useCallback(async () => {
    if (!owner) {
      setWallets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const data = await client.getNFTWallets(owner);
      setWallets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch wallets'));
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return { wallets, loading, error, refetch: fetchWallets };
}

export interface UseActiveWalletResult {
  wallet: NFTWallet | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch the active/selected wallet for an owner
 */
export function useActiveWallet(owner: string | undefined): UseActiveWalletResult {
  const [wallet, setWallet] = useState<NFTWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchActiveWallet = useCallback(async () => {
    if (!owner) {
      setWallet(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const data = await client.getActiveWallet(owner);
      setWallet(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch active wallet'));
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    fetchActiveWallet();
  }, [fetchActiveWallet]);

  return { wallet, loading, error, refetch: fetchActiveWallet };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to format wallet addresses for display
 */
export function useFormattedAddress(address: string | undefined): string {
  return useMemo(() => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);
}

/**
 * Hook to check if current platform is DAO or Wallets
 */
export function usePlatform(): 'dao' | 'wallets' | 'unknown' {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'unknown';
    const hostname = window.location.hostname;
    if (hostname.includes('gifts.') || hostname.includes('wallets.')) {
      return 'wallets';
    }
    if (hostname.includes('mbxarts.com') || hostname.includes('dao')) {
      return 'dao';
    }
    // Local development detection
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port;
      // Assuming DAO runs on 3000 and Wallets on 3001 in dev
      return port === '3001' ? 'wallets' : 'dao';
    }
    return 'unknown';
  }, []);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  PublicProfile,
  NFTWallet,
} from '@mbxarts/types';

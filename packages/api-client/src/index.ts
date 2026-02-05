/**
 * @mbxarts/api-client - Cross-platform API client for MBXarts Platform
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type {
  UserProfile,
  PublicProfile,
  NFTWallet,
  ApiResponse,
  CrossPlatformProfileResponse,
} from '@mbxarts/types';
import { SERVICES, buildApiUrl } from '@mbxarts/config';

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

export interface ClientConfig {
  daoUrl?: string;
  walletsUrl?: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000;

// =============================================================================
// API CLIENT CLASS
// =============================================================================

export class MBXartsClient {
  private daoUrl: string;
  private walletsUrl: string;
  private timeout: number;

  constructor(config: ClientConfig = {}) {
    this.daoUrl = config.daoUrl || SERVICES.DAO.url;
    this.walletsUrl = config.walletsUrl || SERVICES.WALLETS.url;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  // ===========================================================================
  // PROFILE METHODS (via DAO)
  // ===========================================================================

  /**
   * Get public profile for a wallet address
   */
  async getProfile(walletAddress: string): Promise<PublicProfile | null> {
    const url = `${this.daoUrl}/api/cross-platform/profile?wallet=${walletAddress}`;

    try {
      const response = await this.fetch(url);
      const data: CrossPlatformProfileResponse = await response.json();

      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Create or get profile for a wallet address
   */
  async createProfile(walletAddress: string): Promise<PublicProfile | null> {
    const url = `${this.daoUrl}/api/cross-platform/profile`;

    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress }),
      });

      const data: CrossPlatformProfileResponse = await response.json();

      if (data.success && data.data) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to create profile');
    } catch (error) {
      console.error('[MBXartsClient] Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Get or create profile (convenience method)
   */
  async getOrCreateProfile(walletAddress: string): Promise<PublicProfile | null> {
    const existing = await this.getProfile(walletAddress);
    if (existing) return existing;

    try {
      return await this.createProfile(walletAddress);
    } catch {
      return null;
    }
  }

  // ===========================================================================
  // WALLET METHODS (via Wallets service)
  // ===========================================================================

  /**
   * Get all NFT wallets for an owner
   */
  async getNFTWallets(owner: string): Promise<NFTWallet[]> {
    const url = `${this.walletsUrl}/api/user/nft-wallets?owner=${owner}`;

    try {
      const response = await this.fetch(url, {}, 60000); // Longer timeout for wallet queries
      const data = await response.json();
      return data.wallets || [];
    } catch (error) {
      console.error('[MBXartsClient] Error fetching NFT wallets:', error);
      return [];
    }
  }

  /**
   * Get active/selected wallet for a user
   */
  async getActiveWallet(owner: string): Promise<NFTWallet | null> {
    const url = `${this.walletsUrl}/api/user/active-wallet?owner=${owner}`;

    try {
      const response = await this.fetch(url);
      const data = await response.json();
      return data.wallet || null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching active wallet:', error);
      return null;
    }
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  private async fetch(
    url: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout || this.timeout
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new MBXarts API client
 */
export function createClient(config?: Partial<ClientConfig>): MBXartsClient {
  return new MBXartsClient({
    daoUrl: process.env.NEXT_PUBLIC_DAO_API_URL || config?.daoUrl,
    walletsUrl: process.env.NEXT_PUBLIC_WALLETS_API_URL || config?.walletsUrl,
    timeout: config?.timeout,
  });
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default MBXartsClient;

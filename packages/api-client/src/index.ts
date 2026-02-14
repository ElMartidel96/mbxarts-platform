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
  ReferralCode,
  ReferralNetwork,
  ReferralStats,
  LeaderboardResponse,
  ReferralStatusResponse,
  ReferralReward,
  RewardType,
  RewardStatus,
  ActivationStatus,
  BonusStatus,
  TrackClickData,
  ConversionData,
  SpecialInviteCreate,
  SpecialInvite,
  PermanentInviteCreate,
  PermanentInvite,
  PermanentInviteClaim,
} from '@mbxarts/types';
import { SERVICES, buildApiUrl } from '@mbxarts/config';

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

export interface ClientConfig {
  daoUrl?: string;
  walletsUrl?: string;
  timeout?: number;
  apiKey?: string;
}

const DEFAULT_TIMEOUT = 10000;

// =============================================================================
// API CLIENT CLASS
// =============================================================================

export class MBXartsClient {
  private daoUrl: string;
  private walletsUrl: string;
  private timeout: number;
  private apiKey?: string;

  constructor(config: ClientConfig = {}) {
    this.daoUrl = config.daoUrl || SERVICES.DAO.url;
    this.walletsUrl = config.walletsUrl || SERVICES.WALLETS.url;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.apiKey = config.apiKey;
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
  // REFERRAL METHODS (via DAO)
  // ===========================================================================

  /**
   * Get or create referral code for a wallet
   */
  async getReferralCode(walletAddress: string): Promise<ReferralCode | null> {
    const url = `${this.daoUrl}/api/referrals/code?wallet=${walletAddress}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<ReferralCode> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching referral code:', error);
      return null;
    }
  }

  /**
   * Get referral code by code string
   */
  async getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    const url = `${this.daoUrl}/api/referrals/code?code=${encodeURIComponent(code)}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<ReferralCode> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching referral code by code:', error);
      return null;
    }
  }

  /**
   * Set custom referral code
   */
  async setCustomReferralCode(wallet: string, customCode: string): Promise<ReferralCode | null> {
    const url = `${this.daoUrl}/api/referrals/code`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, customCode }),
      });
      const data: ApiResponse<ReferralCode> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error setting custom referral code:', error);
      return null;
    }
  }

  /**
   * Get referral network (3 levels deep)
   */
  async getReferralNetwork(
    wallet: string,
    options?: { level?: 1 | 2 | 3; status?: string; limit?: number; offset?: number }
  ): Promise<ReferralNetwork | null> {
    const params = new URLSearchParams({ wallet });
    if (options?.level) params.set('level', options.level.toString());
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const url = `${this.daoUrl}/api/referrals/network?${params}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<ReferralNetwork> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching referral network:', error);
      return null;
    }
  }

  /**
   * Get comprehensive referral statistics
   */
  async getReferralStats(
    wallet: string,
    options?: { analytics?: boolean; days?: number }
  ): Promise<ReferralStats | null> {
    const params = new URLSearchParams({ wallet });
    if (options?.analytics) params.set('analytics', 'true');
    if (options?.days) params.set('days', options.days.toString());

    const url = `${this.daoUrl}/api/referrals/stats?${params}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<ReferralStats> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching referral stats:', error);
      return null;
    }
  }

  /**
   * Get global referral leaderboard
   */
  async getLeaderboard(
    options?: { sortBy?: 'earnings' | 'referrals'; limit?: number; offset?: number; wallet?: string }
  ): Promise<LeaderboardResponse | null> {
    const params = new URLSearchParams();
    if (options?.sortBy) params.set('sortBy', options.sortBy);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.wallet) params.set('wallet', options.wallet);

    const url = `${this.daoUrl}/api/referrals/leaderboard?${params}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<LeaderboardResponse> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching leaderboard:', error);
      return null;
    }
  }

  /**
   * Check referral status for a wallet
   */
  async getReferralStatus(wallet: string): Promise<ReferralStatusResponse | null> {
    const url = `${this.daoUrl}/api/referrals/status?wallet=${wallet}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<ReferralStatusResponse> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching referral status:', error);
      return null;
    }
  }

  /**
   * Validate a referral code
   */
  async validateReferralCode(code: string): Promise<{ valid: boolean; active: boolean } | null> {
    const url = `${this.daoUrl}/api/referrals/track?code=${encodeURIComponent(code)}`;
    try {
      const response = await this.fetch(url);
      const data = await response.json();
      return data.success ? { valid: true, active: data.active ?? true } : { valid: false, active: false };
    } catch (error) {
      console.error('[MBXartsClient] Error validating referral code:', error);
      return null;
    }
  }

  /**
   * Track a referral click
   */
  async trackReferralClick(data: TrackClickData): Promise<boolean> {
    const url = `${this.daoUrl}/api/referrals/track`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('[MBXartsClient] Error tracking referral click:', error);
      return false;
    }
  }

  /**
   * Register referral conversion (signup)
   */
  async registerConversion(data: ConversionData): Promise<ApiResponse<unknown> | null> {
    const url = `${this.daoUrl}/api/referrals/track`;
    try {
      const response = await this.fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('[MBXartsClient] Error registering conversion:', error);
      return null;
    }
  }

  /**
   * Check activation status for a wallet
   */
  async getActivationStatus(wallet: string): Promise<ActivationStatus | null> {
    const url = `${this.daoUrl}/api/referrals/activate?wallet=${wallet}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<ActivationStatus> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching activation status:', error);
      return null;
    }
  }

  /**
   * Activate referral (checks CGC balance on-chain)
   */
  async activateReferral(wallet: string): Promise<ActivationStatus | null> {
    const url = `${this.daoUrl}/api/referrals/activate`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      });
      const data: ApiResponse<ActivationStatus> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error activating referral:', error);
      return null;
    }
  }

  /**
   * Get reward history
   */
  async getRewards(
    wallet: string,
    options?: { status?: RewardStatus; type?: RewardType; limit?: number; offset?: number }
  ): Promise<ApiResponse<ReferralReward[]> | null> {
    const params = new URLSearchParams({ wallet });
    if (options?.status) params.set('status', options.status);
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const url = `${this.daoUrl}/api/referrals/rewards?${params}`;
    try {
      const response = await this.fetch(url);
      return await response.json();
    } catch (error) {
      console.error('[MBXartsClient] Error fetching rewards:', error);
      return null;
    }
  }

  /**
   * Check bonus eligibility and status
   */
  async getBonusStatus(
    wallet: string,
    type?: 'status' | 'treasury' | 'commissions'
  ): Promise<BonusStatus | null> {
    const params = new URLSearchParams({ wallet });
    if (type) params.set('type', type);

    const url = `${this.daoUrl}/api/referrals/bonus?${params}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<BonusStatus> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching bonus status:', error);
      return null;
    }
  }

  // ===========================================================================
  // SPECIAL INVITE METHODS (via DAO)
  // ===========================================================================

  /**
   * Create a special (single-use) invite
   */
  async createSpecialInvite(data: SpecialInviteCreate): Promise<SpecialInvite | null> {
    const url = `${this.daoUrl}/api/referrals/special-invite`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<SpecialInvite> = await response.json();
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error creating special invite:', error);
      return null;
    }
  }

  /**
   * Get special invite details
   */
  async getSpecialInvite(code: string): Promise<SpecialInvite | null> {
    const url = `${this.daoUrl}/api/referrals/special-invite?code=${encodeURIComponent(code)}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<SpecialInvite> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching special invite:', error);
      return null;
    }
  }

  /**
   * Claim a special invite
   */
  async claimSpecialInvite(code: string, claimedBy: string): Promise<boolean> {
    const url = `${this.daoUrl}/api/referrals/special-invite/claim`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, claimedBy }),
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('[MBXartsClient] Error claiming special invite:', error);
      return false;
    }
  }

  /**
   * Get user's special invites
   */
  async getUserSpecialInvites(wallet: string): Promise<SpecialInvite[]> {
    const url = `${this.daoUrl}/api/referrals/special-invite/user?wallet=${wallet}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<SpecialInvite[]> = await response.json();
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('[MBXartsClient] Error fetching user special invites:', error);
      return [];
    }
  }

  /**
   * Verify special invite password
   */
  async verifySpecialInvitePassword(code: string, password: string): Promise<boolean> {
    const url = `${this.daoUrl}/api/referrals/special-invite/verify-password`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password }),
      });
      return response.status === 200;
    } catch (error) {
      console.error('[MBXartsClient] Error verifying special invite password:', error);
      return false;
    }
  }

  // ===========================================================================
  // PERMANENT INVITE METHODS (via DAO)
  // ===========================================================================

  /**
   * Create a permanent (multi-use) invite
   */
  async createPermanentInvite(data: PermanentInviteCreate): Promise<PermanentInvite | null> {
    const url = `${this.daoUrl}/api/referrals/permanent-invite`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<PermanentInvite> = await response.json();
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error creating permanent invite:', error);
      return null;
    }
  }

  /**
   * Get permanent invite details
   */
  async getPermanentInvite(code: string, wallet?: string): Promise<PermanentInvite | null> {
    const params = new URLSearchParams({ code });
    if (wallet) params.set('wallet', wallet);

    const url = `${this.daoUrl}/api/referrals/permanent-invite?${params}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<PermanentInvite> = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error('[MBXartsClient] Error fetching permanent invite:', error);
      return null;
    }
  }

  /**
   * Claim a permanent invite
   */
  async claimPermanentInvite(data: PermanentInviteClaim): Promise<ApiResponse<unknown> | null> {
    const url = `${this.daoUrl}/api/referrals/permanent-invite/claim`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('[MBXartsClient] Error claiming permanent invite:', error);
      return null;
    }
  }

  /**
   * Get user's permanent invites
   */
  async getUserPermanentInvites(wallet: string): Promise<PermanentInvite[]> {
    const url = `${this.daoUrl}/api/referrals/permanent-invite/user?wallet=${wallet}`;
    try {
      const response = await this.fetch(url);
      const data: ApiResponse<PermanentInvite[]> = await response.json();
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('[MBXartsClient] Error fetching user permanent invites:', error);
      return [];
    }
  }

  /**
   * Pause or resume a permanent invite
   */
  async togglePermanentInvite(
    inviteCode: string,
    wallet: string,
    action: 'pause' | 'resume'
  ): Promise<boolean> {
    const url = `${this.daoUrl}/api/referrals/permanent-invite/user`;
    try {
      const response = await this.fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, wallet, action }),
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('[MBXartsClient] Error toggling permanent invite:', error);
      return false;
    }
  }

  /**
   * Get permanent invite claim history
   */
  async getPermanentInviteHistory(
    code: string,
    options?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<unknown> | null> {
    const params = new URLSearchParams({ code });
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const url = `${this.daoUrl}/api/referrals/permanent-invite/history?${params}`;
    try {
      const response = await this.fetch(url);
      return await response.json();
    } catch (error) {
      console.error('[MBXartsClient] Error fetching permanent invite history:', error);
      return null;
    }
  }

  /**
   * Verify permanent invite password
   */
  async verifyPermanentInvitePassword(code: string, password: string): Promise<boolean> {
    const url = `${this.daoUrl}/api/referrals/permanent-invite/verify-password`;
    try {
      const response = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password }),
      });
      return response.status === 200;
    } catch (error) {
      console.error('[MBXartsClient] Error verifying permanent invite password:', error);
      return false;
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
      // Merge API key header if configured (service-to-service auth)
      const authHeaders: Record<string, string> = {};
      if (this.apiKey) {
        authHeaders['x-api-key'] = this.apiKey;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...authHeaders,
          ...(options.headers as Record<string, string> || {}),
        },
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
    apiKey: process.env.MBXARTS_API_KEY || config?.apiKey,
  });
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default MBXartsClient;

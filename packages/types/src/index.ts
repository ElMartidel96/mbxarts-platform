/**
 * @mbxarts/types - Shared TypeScript types for MBXarts Platform
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

// =============================================================================
// USER PROFILE TYPES (Managed by DAO, used by both platforms)
// =============================================================================

export type ProfileTier =
  | 'newcomer'
  | 'contributor'
  | 'builder'
  | 'expert'
  | 'master'
  | 'legend';

export interface UserProfile {
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: ProfileTier;
  tier_color: string;
  total_cgc_earned: number;
  total_tasks_completed: number;
  reputation_score: number;
  twitter_handle: string | null;
  discord_handle: string | null;
  telegram_handle: string | null;
  show_balance: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: ProfileTier;
  tier_color: string;
  total_cgc_earned: number;
  total_tasks_completed: number;
  reputation_score: number;
  twitter_handle: string | null;
  discord_handle: string | null;
}

// =============================================================================
// NFT WALLET TYPES (Managed by Wallets platform)
// =============================================================================

export interface NFTWallet {
  tokenId: number;
  tbaAddress: string;
  owner: string;
  metadata: NFTMetadata;
  balance: WalletBalance;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface WalletBalance {
  native: string;
  nativeFormatted: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// CROSS-PLATFORM TYPES
// =============================================================================

export interface CrossPlatformProfileRequest {
  wallet: string;
}

export interface CrossPlatformProfileResponse extends ApiResponse<PublicProfile> {
  is_new?: boolean;
}

// =============================================================================
// TASK TYPES (DAO-specific but may be displayed in Wallets)
// =============================================================================

export type TaskStatus =
  | 'available'
  | 'claimed'
  | 'in_progress'
  | 'submitted'
  | 'validated'
  | 'completed'
  | 'expired';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward_cgc: number;
  status: TaskStatus;
  assignee?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CHAIN CONFIGURATION
// =============================================================================

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_CHAINS = {
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
} as const;

export type SupportedChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

// =============================================================================
// REFERRAL SYSTEM TYPES (Managed by DAO, used by all platforms)
// =============================================================================

export type ReferralTier = 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface ReferralCode {
  code: string;
  canonicalCode: string;
  customCode: string | null;
  walletAddress: string;
  isActive: boolean;
  totalReferrals: number;
  totalEarnings: number;
  clickCount: number;
  createdAt: string;
}

export interface ReferralEntry {
  wallet: string;
  level: 1 | 2 | 3;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  cgcEarned: number;
}

export interface ReferralNetwork {
  referrals: ReferralEntry[];
  stats: {
    level1: { total: number; active: number };
    level2: { total: number; active: number };
    level3: { total: number; active: number };
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  network: {
    level1: { count: number; earnings: number };
    level2: { count: number; earnings: number };
    level3: { count: number; earnings: number };
  };
  commissionRates: {
    level1: number;
    level2: number;
    level3: number;
  };
  milestones: {
    current: number;
    next: number;
    nextReward: number;
    progress: number;
  };
  engagement: {
    clickCount: number;
    conversionRate: number;
  };
  leaderboardRank: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  displayName: string | null;
  tier: ReferralTier;
  totalReferrals: number;
  totalEarnings: number;
  badge: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userPosition: LeaderboardEntry | null;
  platformStats: {
    totalUsers: number;
    totalReferrals: number;
    totalDistributed: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export type RewardType =
  | 'direct_bonus'
  | 'level2_bonus'
  | 'level3_bonus'
  | 'milestone_5'
  | 'milestone_10'
  | 'milestone_25'
  | 'milestone_50'
  | 'milestone_100'
  | 'activation_bonus'
  | 'special_bonus'
  | 'signup_bonus'
  | 'signup_commission_l1'
  | 'signup_commission_l2'
  | 'signup_commission_l3';

export type RewardStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface ReferralReward {
  id: string;
  type: RewardType;
  amount: number;
  status: RewardStatus;
  fromWallet: string;
  txHash: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface TrackClickData {
  code: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referer?: string;
  landingPage?: string;
}

export interface ConversionData {
  wallet: string;
  code?: string;
  source?: string;
  campaign?: string;
}

export interface ActivationStatus {
  isActivated: boolean;
  cgcBalance: string;
  referralStatus: string;
  activatedRelationships: number;
}

export interface ReferralStatusResponse {
  isReferred: boolean;
  referral: { referrerWallet: string; code: string } | null;
  hasOwnCode: boolean;
  recentRewards: ReferralReward[];
}

export interface BonusStatus {
  eligible: boolean;
  claimed: boolean;
  amount: number;
  type: string;
}

export interface SpecialInviteCreate {
  referrerWallet: string;
  referrerCode?: string;
  password?: string;
  customMessage?: string;
  image?: string;
  masterclassType?: 'v2' | 'legacy' | 'none';
}

export interface SpecialInvite {
  code: string;
  referrerWallet: string;
  status: 'active' | 'claimed' | 'expired';
  customMessage: string | null;
  image: string | null;
  masterclassType: string;
  expiresAt: string;
  createdAt: string;
}

export interface PermanentInviteCreate {
  referrerWallet: string;
  referrerCode?: string;
  password?: string;
  customMessage: string;
  customMessageEs?: string;
  customTitle?: string;
  image?: string;
  maxClaims?: number;
  neverExpires?: boolean;
  masterclassType?: 'v2' | 'legacy' | 'none';
}

export interface PermanentInvite {
  code: string;
  referrerWallet: string;
  status: 'active' | 'paused' | 'expired';
  customMessage: string | null;
  customTitle: string | null;
  image: string | null;
  masterclassType: string;
  totalClaims: number;
  maxClaims: number | null;
  recentClaims: Array<{ wallet: string; claimedAt: string }>;
  createdAt: string;
}

export interface PermanentInviteClaim {
  code: string;
  claimedBy: string;
  source?: string;
  campaign?: string;
}

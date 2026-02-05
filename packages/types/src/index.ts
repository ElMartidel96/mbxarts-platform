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

/**
 * CRYPTOGIFT ESCROW CONTRACT ABI V3 - PERPETUAL MODE + EXTENDED TIMEFRAMES
 * Network: Base Mainnet (8453)
 * Version: 3.0.0
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

// Import V3 ABI and re-export as canonical names
export {
  ESCROW_ABI_V3 as ESCROW_ABI,
  ESCROW_CONTRACT_ADDRESS_V3 as ESCROW_CONTRACT_ADDRESS,
  PERPETUAL_EXPIRY_VALUE
} from './escrowABIV3';

// Re-export types from V2 (still compatible - same struct shape)
export type {
  EscrowGift,
  GiftRegisteredFromMintEvent,
  GiftCreatedEvent,
  GiftClaimedEvent,
  GiftReturnedEvent
} from './escrowABIV2';

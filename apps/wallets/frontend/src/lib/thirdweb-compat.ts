/**
 * ThirdWeb Compatibility Layer
 *
 * Wraps Wallets' ThirdWeb imports to match DAO's useAccount/useNetwork signatures.
 * Enables profile components to work identically across both platforms.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

'use client';

import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
export { useCGCBalance } from '@/hooks/useCGCBalance';

/**
 * Get active wallet account (matches DAO signature)
 */
export function useAccount() {
  const account = useActiveAccount();

  return {
    address: account?.address,
    isConnected: !!account,
    isDisconnected: !account,
  };
}

/**
 * Get current chain and network status (matches DAO signature)
 */
export function useNetwork() {
  const chain = useActiveWalletChain();

  return {
    chain: chain || null,
    chainId: chain?.id,
  };
}

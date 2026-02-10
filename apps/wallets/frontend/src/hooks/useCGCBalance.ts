'use client';

/**
 * CGC Token Balance Hook
 *
 * Reads CGC token balance on Base Mainnet (8453) for the connected wallet.
 * Mirrors DAO's useCGCBalance from lib/thirdweb/hooks.ts.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { base } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { balanceOf } from 'thirdweb/extensions/erc20';
import { getClient } from '../app/client';

export const CGC_TOKEN_ADDRESS = '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175';

export function useCGCBalance() {
  const account = useActiveAccount();
  const client = getClient();

  const contract = client
    ? getContract({
        client: client,
        chain: base,
        address: CGC_TOKEN_ADDRESS,
      })
    : null;

  const { data: balance, isLoading } = useReadContract(balanceOf, {
    // @ts-expect-error - contract is null during SSR, but query is disabled
    contract: contract,
    address: account?.address || '0x0000000000000000000000000000000000000000',
    queryOptions: {
      enabled: !!client && !!account?.address && !!contract,
    },
  });

  return {
    data: balance,
    isLoading: !client ? false : isLoading,
    formatted: balance ? (Number(balance) / 1e18).toFixed(2) : '0.00',
  };
}

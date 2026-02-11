'use client';

/**
 * CrossDomainSync - Shares wallet session between mbxarts.com subdomains
 *
 * Sets a cookie on .mbxarts.com when wallet connects so both
 * www.mbxarts.com (DAO) and gifts.mbxarts.com (Wallets) stay in sync.
 * On mount, attempts auto-connect if cookie exists but no local session.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useEffect, useRef } from 'react';
import { useActiveAccount, useActiveWallet, useConnect } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { getClient } from '../app/client';

const COOKIE_NAME = 'mbx_wallet';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function getCookieDomain(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  // In production: .mbxarts.com (shared across subdomains)
  if (hostname.endsWith('mbxarts.com')) return '.mbxarts.com';
  // Local dev: don't set domain (cookie stays on localhost)
  return '';
}

function setWalletCookie(address: string, walletId: string) {
  const domain = getCookieDomain();
  const domainAttr = domain ? `domain=${domain};` : '';
  const secure = window.location.protocol === 'https:' ? 'secure;' : '';
  document.cookie = `${COOKIE_NAME}=${address}|${walletId};${domainAttr}path=/;max-age=${COOKIE_MAX_AGE};${secure}samesite=lax`;
}

function clearWalletCookie() {
  const domain = getCookieDomain();
  const domainAttr = domain ? `domain=${domain};` : '';
  document.cookie = `${COOKIE_NAME}=;${domainAttr}path=/;max-age=0`;
}

function getWalletCookie(): { address: string; walletId: string } | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match || !match[1]) return null;
  const [address, walletId] = match[1].split('|');
  if (!address || !walletId) return null;
  return { address, walletId };
}

export function CrossDomainSync() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect } = useConnect();
  const attemptedRef = useRef(false);

  // Write cookie when wallet connects
  useEffect(() => {
    if (account?.address && wallet?.id) {
      setWalletCookie(account.address, wallet.id);
    }
  }, [account?.address, wallet?.id]);

  // Clear cookie on disconnect (account goes from defined to undefined)
  const prevAccountRef = useRef(account?.address);
  useEffect(() => {
    if (prevAccountRef.current && !account?.address) {
      clearWalletCookie();
    }
    prevAccountRef.current = account?.address;
  }, [account?.address]);

  // Auto-connect from cookie on mount
  useEffect(() => {
    if (attemptedRef.current || account) return;
    attemptedRef.current = true;

    const saved = getWalletCookie();
    if (!saved) return;

    const client = getClient();
    if (!client) return;

    connect(async () => {
      const w = createWallet(saved.walletId as Parameters<typeof createWallet>[0]);
      await w.connect({ client });
      return w;
    }).catch(() => {
      // Silent fail - user may need to manually approve on this domain
    });
  }, [account, connect]);

  return null;
}

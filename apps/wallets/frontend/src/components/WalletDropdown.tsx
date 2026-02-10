'use client';

/**
 * WalletDropdown - Unified wallet display for Navbar
 *
 * Combines ProfileCard avatar + address + CGC balance in a compact bar,
 * with a dropdown containing wallet management, TBA switching, and profile actions.
 * Mirrors DAO's WalletDropdown while preserving all Wallets-specific functionality
 * (TBA wallets, RightSlideWallet, full logout).
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useDisconnect, useActiveWallet as useThirdwebWallet } from 'thirdweb/react';
import { useActiveWallet } from '../hooks/useActiveWallet';
import { useCGCBalance } from '../hooks/useCGCBalance';
import { ProfileCard } from './profile';
import { RightSlideWallet } from './TBAWallet/RightSlideWallet';
import { ImageDebugger } from './ImageDebugger';
import { clearAuth } from '../lib/siweClient';
import { Link } from '../i18n/routing';
import {
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Settings,
  Wallet,
} from 'lucide-react';

interface WalletDropdownProps {
  fullWidth?: boolean;
  className?: string;
}

export function WalletDropdown({ fullWidth = false, className = '' }: WalletDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTBAWallet, setShowTBAWallet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    account,
    tbaWallet,
    getWalletDisplayName,
    getWalletType,
    hasActiveTBAWallet,
  } = useActiveWallet();
  const { formatted: cgcBalance } = useCGCBalance();
  const thirdwebWallet = useThirdwebWallet();
  const { disconnect } = useDisconnect();
  const t = useTranslations('navigation');

  if (!account) return null;

  const walletType = getWalletType();
  const displayAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
  const explorer = 'https://basescan.org';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      clearAuth();
      if (thirdwebWallet) {
        disconnect(thirdwebWallet);
      }
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('thirdweb') ||
            key.includes('walletconnect') ||
            key.includes('siwe') ||
            key.includes('auth')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        sessionStorage.clear();
      }
      setShowDropdown(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
        {/* Main Wallet Bar */}
        <div
          className={`flex items-center space-x-2 bg-bg-card rounded-lg border border-border-primary px-3 py-2
                   hover:border-accent-gold dark:hover:border-accent-silver transition-all duration-300 ${fullWidth ? 'w-full' : ''}`}
        >
          {/* ProfileCard Avatar */}
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            <ProfileCard size="sm" />
          </div>

          {/* Wallet Info */}
          <div className="flex items-center space-x-2 flex-1">
            <div className="flex-1 text-left">
              {/* Clickable address */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="font-medium text-text-primary text-xs hover:text-accent-gold dark:hover:text-accent-silver transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  displayAddress
                )}
              </button>
              {/* CGC Balance */}
              <div className="text-xs text-text-secondary">
                {cgcBalance} CGC
              </div>
            </div>

            {/* Dropdown toggle */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 hover:bg-bg-secondary rounded transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 text-text-muted transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Content */}
            <div className={`${fullWidth ? 'relative' : 'absolute top-full right-0 min-w-[280px]'} mt-2 bg-bg-card rounded-lg shadow-xl border border-border-primary z-20`}>
              <div className="p-4">
                {/* Header: ProfileCard + Address + Chain */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ProfileCard size="md" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{displayAddress}</div>
                      <div className="text-xs text-text-secondary flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Base
                      </div>
                    </div>
                  </div>
                </div>

                {/* CGC Balance Card */}
                <div className="bg-bg-secondary rounded-lg p-3 mb-4">
                  <div className="text-xs text-text-muted mb-1">CGC Balance</div>
                  <div className="text-2xl font-bold text-text-primary">
                    {cgcBalance} <span className="text-sm font-normal text-text-secondary">CGC</span>
                  </div>
                </div>

                {/* Wallet Switching Section */}
                {/* Current EOA Wallet */}
                <button
                  onClick={() => setShowDropdown(false)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors ${
                    walletType === 'EOA' ? 'bg-blue-50 dark:bg-accent-gold/20 border border-blue-200 dark:border-accent-gold/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center">
                    <Image
                      src="/cg-wallet-logo.png"
                      alt="CG Wallet"
                      width={28}
                      height={28}
                      className="object-contain w-7 h-7"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-text-primary text-sm">{displayAddress}</div>
                    <div className="text-xs text-text-secondary">Regular Wallet</div>
                  </div>
                  {walletType === 'EOA' && (
                    <div className="w-2 h-2 bg-blue-500 dark:bg-accent-gold rounded-full"></div>
                  )}
                </button>

                {/* TBA Wallet (if available) */}
                {hasActiveTBAWallet() && tbaWallet && (
                  <button
                    onClick={() => setShowDropdown(false)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors mt-1 ${
                      walletType === 'TBA' ? 'bg-orange-50 dark:bg-accent-silver/20 border border-orange-200 dark:border-accent-silver/30' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border-primary">
                      <ImageDebugger
                        nftContract={tbaWallet.nftContract}
                        tokenId={tbaWallet.tokenId}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-text-primary text-sm">{tbaWallet.name}</div>
                      <div className="text-xs text-text-secondary">CryptoGift Wallet</div>
                    </div>
                    {walletType === 'TBA' && (
                      <div className="w-2 h-2 bg-orange-500 dark:bg-accent-silver rounded-full"></div>
                    )}
                  </button>
                )}

                <div className="border-t border-border-primary my-3"></div>

                {/* Actions */}
                <div className="space-y-1">
                  {/* Copy Address */}
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors text-left"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-muted" />
                    )}
                    <span className="text-sm text-text-secondary">{copied ? 'Copied!' : 'Copy Address'}</span>
                  </button>

                  {/* View on Explorer */}
                  <a
                    href={`${explorer}/address/${account.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors text-left"
                    onClick={() => setShowDropdown(false)}
                  >
                    <ExternalLink className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">View on BaseScan</span>
                  </a>

                  {/* Open CG Wallet (if TBA available) */}
                  {hasActiveTBAWallet() && tbaWallet && (
                    <button
                      onClick={() => {
                        setShowTBAWallet(true);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors text-left"
                    >
                      <Wallet className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">Open CG Wallet</span>
                    </button>
                  )}

                  {/* Manage Wallets */}
                  <Link
                    href="/my-wallets"
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors text-left"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Manage Wallets</span>
                  </Link>

                  <div className="border-t border-border-primary my-2"></div>

                  {/* Disconnect */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                             transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {isLoggingOut ? 'Disconnecting...' : 'Disconnect'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* TBA Wallet Slide Panel (preserved from WalletSwitcher) */}
      {showTBAWallet && tbaWallet && (
        <RightSlideWallet
          isOpen={showTBAWallet}
          onClose={() => setShowTBAWallet(false)}
          nftContract={tbaWallet.nftContract}
          tokenId={tbaWallet.tokenId}
        />
      )}
    </>
  );
}

export default WalletDropdown;

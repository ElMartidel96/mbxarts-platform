'use client';

/**
 * WalletDropdown - Unified wallet display for Navbar
 *
 * Mirrors DAO's WalletDropdown: ProfileCard avatar + address + CGC balance bar,
 * with dropdown containing Profile, Copy Address, View on Explorer,
 * Manage Wallets, and Disconnect.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState } from 'react';
import { useDisconnect, useActiveWallet as useThirdwebWallet } from 'thirdweb/react';
import { useActiveWallet } from '../hooks/useActiveWallet';
import { useCGCBalance } from '../hooks/useCGCBalance';
import { ProfileCard } from './profile';
import { clearAuth } from '../lib/siweClient';
import { Link } from '../i18n/routing';
import {
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Wallet,
  User,
} from 'lucide-react';

interface WalletDropdownProps {
  fullWidth?: boolean;
  className?: string;
}

export function WalletDropdown({ fullWidth = false, className = '' }: WalletDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { account } = useActiveWallet();
  const { formatted: cgcBalance } = useCGCBalance();
  const thirdwebWallet = useThirdwebWallet();
  const { disconnect } = useDisconnect();

  if (!account) return null;

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
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {/* Main Wallet Bar - className (scale-90) applied here, not on root */}
      <div
        className={`${className} flex items-center space-x-2 bg-bg-card rounded-lg border border-border-primary px-3 py-2
                 hover:border-accent-gold dark:hover:border-accent-silver transition-all duration-300 ${fullWidth ? 'w-full' : ''}`}
      >
        {/* ProfileCard Avatar */}
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
          <ProfileCard size="sm" />
        </div>

        {/* Wallet Info */}
        <div className="flex items-center space-x-2 flex-1">
          <div className="flex-1 text-left">
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
            className="fixed inset-0 z-[9999]"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className={`${fullWidth ? 'relative' : 'absolute top-full right-0 min-w-[280px]'} mt-2 bg-bg-card rounded-lg shadow-xl border border-border-primary z-[10001]`}>
            <div className="p-4">
              {/* Header: ProfileCard + Address + Chain */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ProfileCard size="md" />
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

              {/* Actions */}
              <div className="space-y-2">
                {/* Profile */}
                <Link
                  href="/profile"
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-sm text-text-secondary font-medium">Profile</span>
                </Link>

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

                {/* Manage Wallets */}
                <Link
                  href="/my-wallets"
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                  onClick={() => setShowDropdown(false)}
                >
                  <Wallet className="w-4 h-4 text-blue-500" />
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
  );
}

export default WalletDropdown;

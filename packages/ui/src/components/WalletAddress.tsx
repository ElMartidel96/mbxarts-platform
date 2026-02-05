/**
 * WalletAddress - Display formatted wallet address with copy functionality
 */

import * as React from 'react';
import { cn } from '../utils/cn';

export interface WalletAddressProps {
  address: string;
  truncate?: boolean;
  copyable?: boolean;
  className?: string;
  onCopy?: () => void;
}

function formatAddress(address: string, truncate: boolean): string {
  if (!truncate || address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletAddress({
  address,
  truncate = true,
  copyable = true,
  className,
  onCopy,
}: WalletAddressProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    if (!copyable) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, [address, copyable, onCopy]);

  return (
    <span
      className={cn(
        'font-mono text-sm',
        copyable && 'cursor-pointer hover:text-blue-400 transition-colors',
        className
      )}
      onClick={handleCopy}
      title={copyable ? (copied ? 'Copied!' : 'Click to copy') : address}
    >
      {formatAddress(address, truncate)}
      {copied && (
        <span className="ml-1 text-green-500 text-xs">✓</span>
      )}
    </span>
  );
}

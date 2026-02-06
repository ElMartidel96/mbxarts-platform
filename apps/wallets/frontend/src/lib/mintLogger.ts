/**
 * MINT LOGGER - Production-ready logging for mint operations
 *
 * Extracted from debug/mint-logs.ts to ensure availability in production builds.
 * Uses secureDebugLogger for sanitized, environment-aware logging.
 *
 * Made by mbxarts.com The Moon in a Box property
 */

import { debugLogger } from './secureDebugLogger';

// In-memory log storage for debugging (limited to prevent memory issues)
let mintLogs: Array<{
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'SUCCESS' | 'WARN';
  step: string;
  data: any;
}> = [];

const MAX_LOGS = 100;

/**
 * Add a mint operation log entry
 * @param level - Log level (INFO, ERROR, SUCCESS, WARN)
 * @param step - Operation step identifier
 * @param data - Additional context data
 */
export function addMintLog(
  level: 'INFO' | 'ERROR' | 'SUCCESS' | 'WARN',
  step: string,
  data: any
): void {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    step,
    data
  };

  mintLogs.push(log);

  // Keep only last MAX_LOGS entries to prevent memory issues
  if (mintLogs.length > MAX_LOGS) {
    mintLogs = mintLogs.slice(-MAX_LOGS);
  }

  // Also log through secure debug logger
  debugLogger.operation(`🔍 MINT LOG [${level}] ${step}`, { logData: data });
}

/**
 * Get all mint logs (most recent first)
 */
export function getMintLogs(): typeof mintLogs {
  return mintLogs.slice().reverse();
}

/**
 * Clear all mint logs
 */
export function clearMintLogs(): void {
  mintLogs = [];
}

/**
 * Get mint logs count
 */
export function getMintLogsCount(): number {
  return mintLogs.length;
}

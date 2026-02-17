/**
 * DEBUG AUTHENTICATION HELPER
 * Protects debug endpoints from unauthorized access in production
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { safeCompare } from './adminAuth';

interface DebugAuthResult {
  authorized: boolean;
  message?: string;
}

/**
 * Authenticate debug endpoint access
 * In development: always allow
 * In production: require admin token (kill switch via ENABLE_DEBUG_ENDPOINTS)
 */
export function authenticateDebugEndpoint(req: NextApiRequest): DebugAuthResult {
  // Always allow in development environment
  if (process.env.NODE_ENV === 'development') {
    return { authorized: true };
  }

  // In production, check if debug endpoints are enabled
  const debugEnabled = process.env.ENABLE_DEBUG_ENDPOINTS === 'true';

  if (!debugEnabled) {
    return {
      authorized: false,
      message: 'Debug endpoints are disabled in production'
    };
  }

  // Require admin token for all requests (no Origin bypass)
  const adminToken = process.env.ADMIN_API_TOKEN;
  const providedToken = req.headers['x-admin-token'] ||
                       req.headers['authorization']?.replace('Bearer ', '') ||
                       req.body?.adminToken ||
                       req.query?.token;

  if (!adminToken) {
    return {
      authorized: false,
      message: 'Server configuration error'
    };
  }

  if (typeof providedToken !== 'string' || !safeCompare(providedToken, adminToken)) {
    return {
      authorized: false,
      message: 'Unauthorized'
    };
  }

  return { authorized: true };
}

/**
 * Middleware wrapper for debug endpoints
 */
export function withDebugAuth(handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authResult = authenticateDebugEndpoint(req);

    if (!authResult.authorized) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    return handler(req, res);
  };
}

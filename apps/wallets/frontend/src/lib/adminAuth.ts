/**
 * CENTRALIZED ADMIN AUTHENTICATION MIDDLEWARE
 * Protects admin/debug/analytics endpoints from unauthorized access
 *
 * Usage:
 * ```typescript
 * import { withAdminAuth } from '../../lib/adminAuth';
 *
 * async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   // Only reached if admin token is valid
 * }
 *
 * export default withAdminAuth(handler);
 * ```
 */

import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { timingSafeEqual } from 'crypto';

/**
 * Timing-safe string comparison to prevent timing attacks on token validation.
 * Returns false if either string is empty/undefined.
 */
export function safeCompare(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Compare against self to burn constant time, then return false
    timingSafeEqual(bufA, bufA);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

/**
 * Extract admin token from multiple sources in priority order:
 * 1. x-admin-token header
 * 2. Authorization: Bearer <token>
 * 3. body.adminToken
 */
function extractAdminToken(req: NextApiRequest): string | undefined {
  const headerToken = req.headers['x-admin-token'];
  if (typeof headerToken === 'string' && headerToken.length > 0) {
    return headerToken;
  }

  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7);
    if (bearer.length > 0) return bearer;
  }

  if (req.body?.adminToken && typeof req.body.adminToken === 'string') {
    return req.body.adminToken;
  }

  return undefined;
}

/**
 * HOF wrapper that validates admin token before calling the handler.
 * Returns 401 with no detail on failure, 500 if ADMIN_API_TOKEN is not configured.
 */
export function withAdminAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (!expectedToken) {
      console.error('[adminAuth] ADMIN_API_TOKEN not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const providedToken = extractAdminToken(req);

    if (!providedToken || !safeCompare(providedToken, expectedToken)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
  };
}

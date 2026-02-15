/**
 * LEAD STATS API
 * Returns lead statistics with optional filters
 * Protected by ADMIN_API_TOKEN
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { leadService } from '../../../lib/leads/leadService';
import { leadStatsQuerySchema } from '../../../lib/leads/schemas';

function authenticateAdmin(req: NextApiRequest): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;

  const provided =
    (req.headers['x-admin-token'] as string) ||
    req.headers['authorization']?.replace('Bearer ', '');

  return provided === adminToken;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const filter = leadStatsQuerySchema.parse({
      from: req.query.from || undefined,
      to: req.query.to || undefined,
      quality: req.query.quality || undefined,
      path: req.query.path || undefined,
    });

    const stats = await leadService.getStats(filter);
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

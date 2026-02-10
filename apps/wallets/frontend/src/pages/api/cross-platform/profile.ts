/**
 * Cross-Platform Profile Proxy
 *
 * Server-side proxy that forwards profile requests to the DAO API,
 * eliminating CORS issues caused by Vercel domain redirects (307).
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const DAO_URL = process.env.NEXT_PUBLIC_DAO_URL || 'https://mbxarts.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({ success: false, error: 'Wallet address is required' });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    try {
      const response = await fetch(
        `${DAO_URL}/api/cross-platform/profile?wallet=${wallet}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Cross-platform profile proxy error:', error);
      return res.status(502).json({ success: false, error: 'Failed to reach DAO API' });
    }
  }

  if (req.method === 'POST') {
    const { wallet } = req.body;

    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({ success: false, error: 'Wallet address is required' });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    try {
      const response = await fetch(
        `${DAO_URL}/api/cross-platform/profile`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Cross-platform profile proxy error:', error);
      return res.status(502).json({ success: false, error: 'Failed to reach DAO API' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

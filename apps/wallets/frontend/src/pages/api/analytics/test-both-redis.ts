/**
 * DIAGNOSTIC ENDPOINT - Test BOTH Redis instances
 * Verifies which Redis has the actual data for gift #313
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { withAdminAuth } from '../../../lib/adminAuth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tokenId = '313' } = req.query;

  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tokenId,
      instances: {}
    };

    // Test Instance 1: production Redis
    console.log('Testing production Redis...');
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Production Redis env vars not configured');
      }
      const redis1 = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      });

      const mapping1 = await redis1.hgetall(`gift_mapping:${tokenId}`);
      const detail1 = mapping1?.giftId
        ? await redis1.hgetall(`gift:detail:${mapping1.giftId}`)
        : null;

      results.instances.production = {
        name: 'Production Redis',
        status: 'connected',
        data: {
          mapping: mapping1 || 'NOT_FOUND',
          giftDetail: detail1 || 'NOT_FOUND'
        }
      };
    } catch (error: any) {
      results.instances.production = {
        name: 'Production Redis',
        status: 'error',
        error: error.message
      };
    }

    // Test Instance 2: secondary Redis (if configured)
    console.log('Testing secondary Redis...');
    try {
      if (!process.env.UPSTASH_REDIS_SECONDARY_URL || !process.env.UPSTASH_REDIS_SECONDARY_TOKEN) {
        throw new Error('Secondary Redis env vars not configured');
      }
      const redis2 = new Redis({
        url: process.env.UPSTASH_REDIS_SECONDARY_URL,
        token: process.env.UPSTASH_REDIS_SECONDARY_TOKEN
      });

      const mapping2 = await redis2.hgetall(`gift_mapping:${tokenId}`);
      const detail2 = mapping2?.giftId
        ? await redis2.hgetall(`gift:detail:${mapping2.giftId}`)
        : null;

      results.instances.secondary = {
        name: 'Secondary Redis',
        status: 'connected',
        data: {
          mapping: mapping2 || 'NOT_FOUND',
          giftDetail: detail2 || 'NOT_FOUND'
        }
      };
    } catch (error: any) {
      results.instances.secondary = {
        name: 'Secondary Redis',
        status: 'error',
        error: error.message
      };
    }

    // Summary
    const prodHasData = results.instances.production?.data?.mapping !== 'NOT_FOUND';
    const secondaryHasData = results.instances.secondary?.data?.mapping !== 'NOT_FOUND';

    results.summary = {
      production_has_data: prodHasData,
      secondary_has_data: secondaryHasData,
      recommendation: prodHasData
        ? 'Use production Redis (has data)'
        : secondaryHasData
        ? 'Use secondary Redis (has data)'
        : 'CRITICAL: No data found in either instance!'
    };

    return res.status(200).json(results);

  } catch (error: any) {
    console.error('Test both Redis failed:', error);
    return res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
}

export default withAdminAuth(handler);

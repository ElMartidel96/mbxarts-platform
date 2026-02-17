/**
 * LIVE COMPARISON - Check XLEN in BOTH Redis instances
 * Shows which instance is receiving writes in real-time
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { withAdminAuth } from '../../../lib/adminAuth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      instances: {}
    };

    // Test Instance 1: production Redis (from env vars)
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Production Redis env vars not configured');
      }
      const redis1 = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      });

      const xlen1 = await redis1.xlen('ga:v1:events');
      const recent1 = await redis1.xrevrange('ga:v1:events', '+', '-', 3);

      results.instances.production = {
        name: 'Production Redis',
        status: 'connected',
        metrics: {
          xlen_ga_v1_events: xlen1,
          recent_events_count: Array.isArray(recent1) ? recent1.length : 0,
          last_3_events: Array.isArray(recent1)
            ? recent1.map(([id, fields]: [string, any]) => ({
                id,
                type: fields.type,
                timestamp: fields.timestamp || fields.blockTimestamp,
                giftId: fields.giftId,
                tokenId: fields.tokenId
              }))
            : []
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
    try {
      if (!process.env.UPSTASH_REDIS_SECONDARY_URL || !process.env.UPSTASH_REDIS_SECONDARY_TOKEN) {
        throw new Error('Secondary Redis env vars not configured');
      }
      const redis2 = new Redis({
        url: process.env.UPSTASH_REDIS_SECONDARY_URL,
        token: process.env.UPSTASH_REDIS_SECONDARY_TOKEN
      });

      const xlen2 = await redis2.xlen('ga:v1:events');
      const recent2 = await redis2.xrevrange('ga:v1:events', '+', '-', 3);

      results.instances.secondary = {
        name: 'Secondary Redis',
        status: 'connected',
        metrics: {
          xlen_ga_v1_events: xlen2,
          recent_events_count: Array.isArray(recent2) ? recent2.length : 0,
          last_3_events: Array.isArray(recent2)
            ? recent2.map(([id, fields]: [string, any]) => ({
                id,
                type: fields.type,
                timestamp: fields.timestamp || fields.blockTimestamp,
                giftId: fields.giftId,
                tokenId: fields.tokenId
              }))
            : []
        }
      };
    } catch (error: any) {
      results.instances.secondary = {
        name: 'Secondary Redis',
        status: 'error',
        error: error.message
      };
    }

    // Analysis
    const prod_xlen = results.instances.production?.metrics?.xlen_ga_v1_events || 0;
    const secondary_xlen = results.instances.secondary?.metrics?.xlen_ga_v1_events || 0;

    results.analysis = {
      production_events: prod_xlen,
      secondary_events: secondary_xlen,
      conclusion: prod_xlen > 0
        ? secondary_xlen > 0
          ? 'BOTH instances have events - DUAL WRITE or MIGRATION in progress'
          : 'Production is PRIMARY (has events, secondary empty)'
        : secondary_xlen > 0
        ? 'Secondary is PRIMARY (has events, production empty)'
        : 'NO EVENTS in either instance - tracking NOT writing',
      recommendation: prod_xlen > secondary_xlen
        ? 'Use production Redis (more events)'
        : secondary_xlen > prod_xlen
        ? 'Use secondary Redis (more events)'
        : 'CRITICAL: No data in either instance'
    };

    return res.status(200).json(results);

  } catch (error: any) {
    console.error('Live comparison failed:', error);
    return res.status(500).json({
      error: 'Comparison failed',
      message: error.message
    });
  }
}

export default withAdminAuth(handler);

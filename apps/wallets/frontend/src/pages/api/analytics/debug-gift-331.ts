/**
 * DEBUG ENDPOINT - Gift #331 Redis Data Investigation
 *
 * This endpoint investigates what's in Redis for gift #331
 * to identify why claimer, email, and appointment data aren't showing
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Redis connection
    const { getRedisConnection } = await import('@/lib/redisConfig');
    const redis = getRedisConnection();

    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    const debugData: any = {
      timestamp: new Date().toISOString(),
      investigation: {}
    };

    // Check gift:detail:357 (the giftId from the response)
    console.log('🔍 Checking gift:detail:357...');
    const giftDetails357 = await redis.hgetall('gift:detail:357');
    debugData.investigation['gift:detail:357'] = {
      exists: !!giftDetails357 && Object.keys(giftDetails357).length > 0,
      keys: giftDetails357 ? Object.keys(giftDetails357) : [],
      data: giftDetails357
    };

    // Check gift:detail:331 (using tokenId as giftId)
    console.log('🔍 Checking gift:detail:331...');
    const giftDetails331 = await redis.hgetall('gift:detail:331');
    debugData.investigation['gift:detail:331'] = {
      exists: !!giftDetails331 && Object.keys(giftDetails331).length > 0,
      keys: giftDetails331 ? Object.keys(giftDetails331) : [],
      data: giftDetails331
    };

    // Search all gift:detail:* keys for tokenId=331
    console.log('🔍 Searching all gift:detail:* for tokenId=331...');
    const allGiftKeys = await redis.keys('gift:detail:*');
    debugData.investigation.allGiftDetailKeys = {
      count: allGiftKeys.length,
      keys: allGiftKeys
    };

    // Find which key has tokenId=331
    let foundKey = null;
    let foundData = null;
    for (const key of allGiftKeys) {
      const details = await redis.hgetall(key);
      if (details && details.tokenId === '331') {
        foundKey = key;
        foundData = details;
        break;
      }
    }

    debugData.investigation.searchResult = {
      foundKey,
      foundData,
      hasClaimerField: foundData ? 'claimer' in foundData : false,
      hasEmailField: foundData ? ('email_plain' in foundData || 'email_encrypted' in foundData) : false,
      hasAppointmentField: foundData ? 'appointment_date' in foundData : false
    };

    // Check reverse mapping
    const reverseMapping = await redis.get('reverse_mapping:357');
    debugData.investigation.reverseMapping = {
      'reverse_mapping:357': reverseMapping
    };

    // Check gift_mapping
    const giftMapping = await redis.get('gift_mapping:331');
    debugData.investigation.giftMapping = {
      'gift_mapping:331': typeof giftMapping === 'string' ? JSON.parse(giftMapping) : giftMapping
    };

    // Check appointment data
    const appointmentData = await redis.get('appointment:gift:357');
    debugData.investigation.appointment = {
      'appointment:gift:357': typeof appointmentData === 'string' ? JSON.parse(appointmentData) : appointmentData
    };

    // Check education data
    const educationData = await redis.get('education:gift:357');
    debugData.investigation.education = {
      'education:gift:357': typeof educationData === 'string' ? JSON.parse(educationData) : educationData
    };

    // Analysis summary
    debugData.analysis = {
      giftIdFromAPI: '357',
      tokenIdFromAPI: '331',
      foundGiftDetailKey: foundKey,
      problemsIdentified: []
    };

    if (!foundData?.claimer) {
      debugData.analysis.problemsIdentified.push('NO_CLAIMER_FIELD: The claimer field is missing from gift:detail');
    }
    if (!foundData?.email_plain && !foundData?.email_encrypted) {
      debugData.analysis.problemsIdentified.push('NO_EMAIL_FIELD: Neither email_plain nor email_encrypted exists');
    }
    if (!foundData?.appointment_date) {
      debugData.analysis.problemsIdentified.push('NO_APPOINTMENT_FIELD: No appointment data saved');
    }

    // Recommendations
    debugData.recommendations = [];
    if (!foundData?.claimer) {
      debugData.recommendations.push('The claim-nft endpoint may not have been called for this gift, or the claimer data failed to save');
    }
    if (!foundData?.email_plain && !foundData?.email_encrypted) {
      debugData.recommendations.push('The education/approve endpoint may not have received an email, or PII encryption is not configured');
    }
    if (!foundData?.appointment_date) {
      debugData.recommendations.push('The calendar/save-appointment endpoint has not been called for this gift');
    }

    return res.status(200).json(debugData);

  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({
      error: 'Debug failed',
      message: error.message
    });
  }
}
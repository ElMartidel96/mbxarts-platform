/**
 * DEBUG SCRIPT - DIRECT REDIS VERIFICATION FOR GIFT #354
 * Verifies if appointment data actually exists in Redis
 * Checks BOTH gift:detail:378 (giftId) AND gift:detail:354 (tokenId)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { withAdminAuth } from '../../../lib/adminAuth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({ error: 'Redis env vars not configured' });
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });

    // Gift #354: tokenId=354, giftId=378
    const tokenId = '354';
    const giftId = '378';

    // CHECK 1: gift:detail:378 (giftId - where save-appointment writes)
    const giftDetailByGiftId = await redis.hgetall(`gift:detail:${giftId}`);

    // Check for appointment fields
    const appointmentFields = [
      'appointment_scheduled',
      'appointment_date',
      'appointment_time',
      'appointment_duration',
      'appointment_timezone',
      'appointment_meeting_url',
      'appointment_invitee_name',
      'appointment_invitee_email_plain',
      'appointment_invitee_email_encrypted',
      'appointment_created_at'
    ];

    const foundAppointmentFields: Record<string, any> = {};
    if (giftDetailByGiftId) {
      for (const field of appointmentFields) {
        if (field in giftDetailByGiftId) {
          foundAppointmentFields[field] = (giftDetailByGiftId as any)[field];
        }
      }
    }

    // Check for email fields
    const emailFields = [
      'email_plain',
      'email_encrypted',
      'email_hmac',
      'email_warning'
    ];

    const foundEmailFields: Record<string, any> = {};
    if (giftDetailByGiftId) {
      for (const field of emailFields) {
        if (field in giftDetailByGiftId) {
          foundEmailFields[field] = (giftDetailByGiftId as any)[field];
        }
      }
    }

    // CHECK 2: gift:detail:354 (tokenId - fallback key)
    const giftDetailByTokenId = await redis.hgetall(`gift:detail:${tokenId}`);

    const foundAppointmentFieldsToken: Record<string, any> = {};
    if (giftDetailByTokenId) {
      for (const field of appointmentFields) {
        if (field in giftDetailByTokenId) {
          foundAppointmentFieldsToken[field] = (giftDetailByTokenId as any)[field];
        }
      }
    }

    const foundEmailFieldsToken: Record<string, any> = {};
    if (giftDetailByTokenId) {
      for (const field of emailFields) {
        if (field in giftDetailByTokenId) {
          foundEmailFieldsToken[field] = (giftDetailByTokenId as any)[field];
        }
      }
    }

    // CHECK 3: appointment:gift:378 (separate appointment record)
    const appointmentRecord = await redis.get(`appointment:gift:${giftId}`);

    // CHECK 4: List ALL gift:detail:* keys to see what exists
    const allKeys = await redis.keys('gift:detail:*');

    // Return comprehensive report
    return res.status(200).json({
      success: true,
      tokenId,
      giftId,
      checks: {
        byGiftId: {
          key: `gift:detail:${giftId}`,
          exists: !!giftDetailByGiftId && Object.keys(giftDetailByGiftId).length > 0,
          fieldCount: giftDetailByGiftId ? Object.keys(giftDetailByGiftId).length : 0,
          allFields: giftDetailByGiftId ? Object.keys(giftDetailByGiftId) : [],
          appointmentFields: foundAppointmentFields,
          emailFields: foundEmailFields,
          fullData: giftDetailByGiftId
        },
        byTokenId: {
          key: `gift:detail:${tokenId}`,
          exists: !!giftDetailByTokenId && Object.keys(giftDetailByTokenId).length > 0,
          fieldCount: giftDetailByTokenId ? Object.keys(giftDetailByTokenId).length : 0,
          allFields: giftDetailByTokenId ? Object.keys(giftDetailByTokenId) : [],
          appointmentFields: foundAppointmentFieldsToken,
          emailFields: foundEmailFieldsToken,
          fullData: giftDetailByTokenId
        },
        appointmentRecord: {
          key: `appointment:gift:${giftId}`,
          exists: !!appointmentRecord,
          data: appointmentRecord
        },
        allKeys: {
          total: allKeys.length,
          containing354: allKeys.filter(k => k.includes('354')),
          containing378: allKeys.filter(k => k.includes('378'))
        }
      }
    });

  } catch (error: any) {
    console.error('DEBUG ERROR:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export default withAdminAuth(handler);

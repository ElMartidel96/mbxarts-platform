/**
 * DEBUG SCRIPT - DIRECT REDIS VERIFICATION FOR GIFT #354
 * Verifies if appointment data actually exists in Redis
 * Checks BOTH gift:detail:378 (giftId) AND gift:detail:354 (tokenId)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Direct Redis connection with hardcoded credentials
    const redis = new Redis({
      url: 'https://exotic-alien-13383.upstash.io',
      token: 'ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM'
    });

    console.error('🔍 DEBUG GIFT #354 - DIRECT REDIS CHECK');
    console.error('================================================');

    // Gift #354: tokenId=354, giftId=378
    const tokenId = '354';
    const giftId = '378';

    // CHECK 1: gift:detail:378 (giftId - where save-appointment writes)
    console.error('\n📊 CHECK 1: gift:detail:378 (giftId - PRIMARY KEY)');
    const giftDetailByGiftId = await redis.hgetall(`gift:detail:${giftId}`);

    console.error('Keys found:', giftDetailByGiftId ? Object.keys(giftDetailByGiftId) : []);
    console.error('Field count:', giftDetailByGiftId ? Object.keys(giftDetailByGiftId).length : 0);

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

    console.error('Appointment fields found:', Object.keys(foundAppointmentFields).length);
    console.error('Appointment data:', foundAppointmentFields);

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

    console.error('Email fields found:', Object.keys(foundEmailFields).length);
    console.error('Email data:', foundEmailFields);

    // CHECK 2: gift:detail:354 (tokenId - fallback key)
    console.error('\n📊 CHECK 2: gift:detail:354 (tokenId - FALLBACK KEY)');
    const giftDetailByTokenId = await redis.hgetall(`gift:detail:${tokenId}`);

    console.error('Keys found:', giftDetailByTokenId ? Object.keys(giftDetailByTokenId) : []);
    console.error('Field count:', giftDetailByTokenId ? Object.keys(giftDetailByTokenId).length : 0);

    const foundAppointmentFieldsToken: Record<string, any> = {};
    if (giftDetailByTokenId) {
      for (const field of appointmentFields) {
        if (field in giftDetailByTokenId) {
          foundAppointmentFieldsToken[field] = (giftDetailByTokenId as any)[field];
        }
      }
    }

    console.error('Appointment fields found:', Object.keys(foundAppointmentFieldsToken).length);
    console.error('Appointment data:', foundAppointmentFieldsToken);

    const foundEmailFieldsToken: Record<string, any> = {};
    if (giftDetailByTokenId) {
      for (const field of emailFields) {
        if (field in giftDetailByTokenId) {
          foundEmailFieldsToken[field] = (giftDetailByTokenId as any)[field];
        }
      }
    }

    console.error('Email fields found:', Object.keys(foundEmailFieldsToken).length);
    console.error('Email data:', foundEmailFieldsToken);

    // CHECK 3: appointment:gift:378 (separate appointment record)
    console.error('\n📊 CHECK 3: appointment:gift:378 (SEPARATE APPOINTMENT RECORD)');
    const appointmentRecord = await redis.get(`appointment:gift:${giftId}`);
    console.error('Appointment record exists:', !!appointmentRecord);
    console.error('Appointment record data:', appointmentRecord);

    // CHECK 4: List ALL gift:detail:* keys to see what exists
    console.error('\n📊 CHECK 4: ALL gift:detail:* KEYS');
    const allKeys = await redis.keys('gift:detail:*');
    console.error('Total gift:detail keys:', allKeys.length);
    console.error('Keys containing 354:', allKeys.filter(k => k.includes('354')));
    console.error('Keys containing 378:', allKeys.filter(k => k.includes('378')));

    // SUMMARY
    console.error('\n📊 SUMMARY FOR GIFT #354 (tokenId=354, giftId=378)');
    console.error('================================================');
    console.error('gift:detail:378 (PRIMARY):', {
      exists: !!giftDetailByGiftId && Object.keys(giftDetailByGiftId).length > 0,
      hasAppointment: Object.keys(foundAppointmentFields).length > 0,
      hasEmail: Object.keys(foundEmailFields).length > 0
    });
    console.error('gift:detail:354 (FALLBACK):', {
      exists: !!giftDetailByTokenId && Object.keys(giftDetailByTokenId).length > 0,
      hasAppointment: Object.keys(foundAppointmentFieldsToken).length > 0,
      hasEmail: Object.keys(foundEmailFieldsToken).length > 0
    });
    console.error('appointment:gift:378 (SEPARATE):', {
      exists: !!appointmentRecord
    });

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
    console.error('❌ DEBUG ERROR:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

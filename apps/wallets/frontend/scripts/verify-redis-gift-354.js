/**
 * STANDALONE REDIS VERIFICATION SCRIPT
 * Verifies if appointment data exists in Redis for Gift #354
 * Run with: node scripts/verify-redis-gift-354.js
 */

const https = require('https');

// Upstash Redis REST API credentials
const REDIS_URL = 'https://exotic-alien-13383.upstash.io';
const REDIS_TOKEN = 'ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM';

// Gift #354 identifiers
const TOKEN_ID = '354';
const GIFT_ID = '378';

/**
 * Execute Redis command via REST API
 */
async function redisCommand(command, ...args) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify([command, ...args]);
    const url = new URL(REDIS_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Main verification function
 */
async function verifyGift354() {
  console.log('🔍 REDIS VERIFICATION FOR GIFT #354');
  console.log('=====================================');
  console.log(`Token ID: ${TOKEN_ID}`);
  console.log(`Gift ID: ${GIFT_ID}`);
  console.log('');

  try {
    // CHECK 1: gift:detail:378 (giftId - PRIMARY KEY where save-appointment writes)
    console.log('📊 CHECK 1: gift:detail:378 (PRIMARY - where save-appointment writes)');
    console.log('-------------------------------------------------------------------');

    const giftDetailByGiftId = await redisCommand('HGETALL', `gift:detail:${GIFT_ID}`);

    // Convert array response [key1, val1, key2, val2] to object
    const giftDataByGiftId = {};
    if (giftDetailByGiftId && Array.isArray(giftDetailByGiftId)) {
      for (let i = 0; i < giftDetailByGiftId.length; i += 2) {
        giftDataByGiftId[giftDetailByGiftId[i]] = giftDetailByGiftId[i + 1];
      }
    }

    console.log('Keys found:', Object.keys(giftDataByGiftId));
    console.log('Total fields:', Object.keys(giftDataByGiftId).length);

    // Check appointment fields
    const appointmentFields = [
      'appointment_scheduled',
      'appointment_date',
      'appointment_time',
      'appointment_duration',
      'appointment_timezone',
      'appointment_meeting_url',
      'appointment_invitee_name',
      'appointment_created_at'
    ];

    const foundAppointmentFields = {};
    for (const field of appointmentFields) {
      if (field in giftDataByGiftId) {
        foundAppointmentFields[field] = giftDataByGiftId[field];
      }
    }

    console.log('Appointment fields found:', Object.keys(foundAppointmentFields).length);
    if (Object.keys(foundAppointmentFields).length > 0) {
      console.log('✅ APPOINTMENT DATA:', JSON.stringify(foundAppointmentFields, null, 2));
    } else {
      console.log('❌ NO APPOINTMENT DATA FOUND');
    }

    // Check email fields
    const emailFields = ['email_plain', 'email_encrypted', 'email_hmac'];
    const foundEmailFields = {};
    for (const field of emailFields) {
      if (field in giftDataByGiftId) {
        foundEmailFields[field] = giftDataByGiftId[field];
      }
    }

    console.log('Email fields found:', Object.keys(foundEmailFields).length);
    if (Object.keys(foundEmailFields).length > 0) {
      console.log('✅ EMAIL DATA:', JSON.stringify(foundEmailFields, null, 2));
    } else {
      console.log('❌ NO EMAIL DATA FOUND');
    }

    console.log('');

    // CHECK 2: gift:detail:354 (tokenId - FALLBACK KEY)
    console.log('📊 CHECK 2: gift:detail:354 (FALLBACK - tokenId key)');
    console.log('---------------------------------------------------');

    const giftDetailByTokenId = await redisCommand('HGETALL', `gift:detail:${TOKEN_ID}`);

    const giftDataByTokenId = {};
    if (giftDetailByTokenId && Array.isArray(giftDetailByTokenId)) {
      for (let i = 0; i < giftDetailByTokenId.length; i += 2) {
        giftDataByTokenId[giftDetailByTokenId[i]] = giftDetailByTokenId[i + 1];
      }
    }

    console.log('Keys found:', Object.keys(giftDataByTokenId));
    console.log('Total fields:', Object.keys(giftDataByTokenId).length);

    const foundAppointmentFieldsToken = {};
    for (const field of appointmentFields) {
      if (field in giftDataByTokenId) {
        foundAppointmentFieldsToken[field] = giftDataByTokenId[field];
      }
    }

    console.log('Appointment fields found:', Object.keys(foundAppointmentFieldsToken).length);
    if (Object.keys(foundAppointmentFieldsToken).length > 0) {
      console.log('✅ APPOINTMENT DATA:', JSON.stringify(foundAppointmentFieldsToken, null, 2));
    } else {
      console.log('❌ NO APPOINTMENT DATA FOUND');
    }

    const foundEmailFieldsToken = {};
    for (const field of emailFields) {
      if (field in giftDataByTokenId) {
        foundEmailFieldsToken[field] = giftDataByTokenId[field];
      }
    }

    console.log('Email fields found:', Object.keys(foundEmailFieldsToken).length);
    if (Object.keys(foundEmailFieldsToken).length > 0) {
      console.log('✅ EMAIL DATA:', JSON.stringify(foundEmailFieldsToken, null, 2));
    } else {
      console.log('❌ NO EMAIL DATA FOUND');
    }

    console.log('');

    // CHECK 3: appointment:gift:378 (SEPARATE APPOINTMENT RECORD)
    console.log('📊 CHECK 3: appointment:gift:378 (SEPARATE RECORD)');
    console.log('------------------------------------------------');

    const appointmentRecord = await redisCommand('GET', `appointment:gift:${GIFT_ID}`);
    console.log('Appointment record exists:', !!appointmentRecord);
    if (appointmentRecord) {
      try {
        const parsed = JSON.parse(appointmentRecord);
        console.log('✅ APPOINTMENT RECORD:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Appointment record (raw):', appointmentRecord);
      }
    } else {
      console.log('❌ NO SEPARATE APPOINTMENT RECORD FOUND');
    }

    console.log('');

    // FINAL SUMMARY
    console.log('📊 FINAL VERDICT');
    console.log('================');
    console.log('gift:detail:378 (PRIMARY):', {
      exists: Object.keys(giftDataByGiftId).length > 0,
      hasAppointment: Object.keys(foundAppointmentFields).length > 0,
      hasEmail: Object.keys(foundEmailFields).length > 0
    });
    console.log('gift:detail:354 (FALLBACK):', {
      exists: Object.keys(giftDataByTokenId).length > 0,
      hasAppointment: Object.keys(foundAppointmentFieldsToken).length > 0,
      hasEmail: Object.keys(foundEmailFieldsToken).length > 0
    });
    console.log('appointment:gift:378 (SEPARATE):', {
      exists: !!appointmentRecord
    });

    // DIAGNOSIS
    console.log('');
    console.log('🔍 DIAGNOSIS:');
    if (Object.keys(foundAppointmentFields).length === 0 &&
        Object.keys(foundAppointmentFieldsToken).length === 0 &&
        !appointmentRecord) {
      console.log('❌ PROBLEM CONFIRMED: No appointment data found in ANY Redis key');
      console.log('   This means save-appointment API did NOT actually write to Redis');
      console.log('   despite logging "success"');
    } else if (Object.keys(foundAppointmentFieldsToken).length > 0 &&
               Object.keys(foundAppointmentFields).length === 0) {
      console.log('⚠️  DATA MISMATCH: Appointment saved to tokenId key (354) instead of giftId key (378)');
      console.log('   Analytics reads from giftId key, so data appears missing');
    } else if (Object.keys(foundAppointmentFields).length > 0) {
      console.log('✅ DATA EXISTS: Appointment found in giftId key (378)');
      console.log('   Analytics should be reading this data correctly');
      console.log('   Check gift-profile API logic for reading issues');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run verification
verifyGift354().then(() => {
  console.log('');
  console.log('Verification complete.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

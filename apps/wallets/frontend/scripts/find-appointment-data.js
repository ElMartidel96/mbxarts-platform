/**
 * SEARCH ALL REDIS KEYS FOR APPOINTMENT DATA
 * Find which gift:detail key (if any) contains appointment_scheduled field
 */

const https = require('https');

const REDIS_URL = 'https://exotic-alien-13383.upstash.io';
const REDIS_TOKEN = 'ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM';

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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).result);
        } catch (e) {
          reject(new Error(`Failed to parse: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function searchAllGifts() {
  console.log('🔍 SEARCHING ALL gift:detail:* KEYS FOR APPOINTMENT DATA');
  console.log('=====================================================\n');

  try {
    // Get all gift:detail keys
    const allKeys = await redisCommand('KEYS', 'gift:detail:*');
    console.log(`Found ${allKeys.length} gift:detail keys\n`);

    const giftsWithAppointments = [];
    const giftsWithEmail = [];

    // Check each key
    for (const key of allKeys) {
      const data = await redisCommand('HGETALL', key);

      // Convert to object
      const giftData = {};
      if (data && Array.isArray(data)) {
        for (let i = 0; i < data.length; i += 2) {
          giftData[data[i]] = data[i + 1];
        }
      }

      // Check for appointment fields
      if (giftData.appointment_scheduled || giftData.appointment_date) {
        giftsWithAppointments.push({
          key,
          giftId: giftData.giftId,
          tokenId: giftData.tokenId,
          appointment_scheduled: giftData.appointment_scheduled,
          appointment_date: giftData.appointment_date,
          appointment_time: giftData.appointment_time,
          creator: giftData.creator,
          claimer: giftData.claimer,
          status: giftData.status
        });
      }

      // Check for email fields
      if (giftData.email_plain || giftData.email_encrypted) {
        giftsWithEmail.push({
          key,
          giftId: giftData.giftId,
          tokenId: giftData.tokenId,
          hasEmailPlain: !!giftData.email_plain,
          hasEmailEncrypted: !!giftData.email_encrypted
        });
      }
    }

    console.log(`📊 RESULTS:`);
    console.log(`-----------`);
    console.log(`Gifts with appointment data: ${giftsWithAppointments.length}`);
    console.log(`Gifts with email data: ${giftsWithEmail.length}\n`);

    if (giftsWithAppointments.length > 0) {
      console.log('✅ GIFTS WITH APPOINTMENT DATA:');
      console.log('================================');
      giftsWithAppointments.forEach(gift => {
        console.log(`\nKey: ${gift.key}`);
        console.log(`  Gift ID: ${gift.giftId}`);
        console.log(`  Token ID: ${gift.tokenId}`);
        console.log(`  Appointment Date: ${gift.appointment_date}`);
        console.log(`  Appointment Time: ${gift.appointment_time}`);
        console.log(`  Status: ${gift.status}`);
        console.log(`  Claimer: ${gift.claimer || 'not claimed'}`);
      });
    } else {
      console.log('❌ NO GIFTS FOUND WITH APPOINTMENT DATA');
      console.log('   This confirms save-appointment API is NOT writing to ANY key');
    }

    if (giftsWithEmail.length > 0) {
      console.log('\n\n✅ GIFTS WITH EMAIL DATA:');
      console.log('=========================');
      giftsWithEmail.forEach(gift => {
        console.log(`\nKey: ${gift.key}`);
        console.log(`  Gift ID: ${gift.giftId}`);
        console.log(`  Token ID: ${gift.tokenId}`);
        console.log(`  Has Email: ${gift.hasEmailPlain ? 'plain' : gift.hasEmailEncrypted ? 'encrypted' : 'none'}`);
      });
    } else {
      console.log('\n❌ NO GIFTS FOUND WITH EMAIL DATA');
    }

    // Also check appointment:gift:* keys
    console.log('\n\n📊 CHECKING SEPARATE APPOINTMENT RECORDS:');
    console.log('=========================================');
    const appointmentKeys = await redisCommand('KEYS', 'appointment:gift:*');
    console.log(`Found ${appointmentKeys.length} appointment:gift:* keys`);

    if (appointmentKeys.length > 0) {
      for (const key of appointmentKeys) {
        const data = await redisCommand('GET', key);
        try {
          const parsed = JSON.parse(data);
          console.log(`\n${key}:`);
          console.log(`  Gift ID: ${parsed.giftId}`);
          console.log(`  Event Date: ${parsed.eventDate}`);
          console.log(`  Event Time: ${parsed.eventTime}`);
        } catch (e) {
          console.log(`\n${key}: ${data}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

searchAllGifts().then(() => {
  console.log('\n\nSearch complete.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

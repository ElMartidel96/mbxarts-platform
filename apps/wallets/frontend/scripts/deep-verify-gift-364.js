/**
 * DEEP VERIFICATION FOR GIFT #364
 * Checks ALL possible Redis keys where data might have been saved
 * Uses Upstash REST API (no dependencies needed)
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
          const parsed = JSON.parse(data);
          resolve(parsed.result);
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

function displayData(obj, title) {
  console.log(`\n${title}`);
  console.log('='.repeat(80));

  if (Array.isArray(obj) && obj.length > 0) {
    const convertedObj = {};
    for (let i = 0; i < obj.length; i += 2) {
      convertedObj[obj[i]] = obj[i + 1];
    }

    console.log('\n📧 EMAIL FIELDS:');
    console.log('  - email_plain:', convertedObj.email_plain || '❌ NOT FOUND');
    console.log('  - email_encrypted:', convertedObj.email_encrypted ? `✅ EXISTS (${convertedObj.email_encrypted.length} chars)` : '❌ NOT FOUND');
    console.log('  - email_hmac:', convertedObj.email_hmac ? `✅ EXISTS` : '❌ NOT FOUND');
    console.log('  - email_captured_at:', convertedObj.email_captured_at || '❌ NOT FOUND');
    console.log('  - email_warning:', convertedObj.email_warning || '(none)');

    console.log('\n📅 APPOINTMENT FIELDS:');
    console.log('  - appointment_scheduled:', convertedObj.appointment_scheduled || '❌ NOT FOUND');
    console.log('  - appointment_date:', convertedObj.appointment_date || '❌ NOT FOUND');
    console.log('  - appointment_time:', convertedObj.appointment_time || '❌ NOT FOUND');
    console.log('  - appointment_meeting_url:', convertedObj.appointment_meeting_url ? `✅ EXISTS` : '❌ NOT FOUND');

    console.log('\n🎓 EDUCATION FIELDS:');
    console.log('  - education_score_correct:', convertedObj.education_score_correct || '❌ NOT FOUND');
    console.log('  - education_score_total:', convertedObj.education_score_total || '❌ NOT FOUND');
    console.log('  - education_completed_at:', convertedObj.education_completed_at || '❌ NOT FOUND');

    console.log('\n🎁 CLAIM FIELDS:');
    console.log('  - claimer:', convertedObj.claimer || '❌ NOT FOUND');
    console.log('  - claimedAt:', convertedObj.claimedAt || '❌ NOT FOUND');
    console.log('  - status:', convertedObj.status || '❌ NOT FOUND');

    console.log('\n📋 ALL FIELDS:');
    Object.keys(convertedObj).forEach(key => {
      const value = convertedObj[key];
      const display = typeof value === 'string' && value.length > 60
        ? value.substring(0, 60) + '...'
        : value;
      console.log(`  - ${key}: ${display}`);
    });

    return convertedObj;
  } else {
    console.log('❌ NO DATA FOUND');
    return null;
  }
}

async function main() {
  console.log('\n🔍 DEEP VERIFICATION FOR GIFT #364\n');
  console.log('='.repeat(80));
  console.log('Gift Info: tokenId=364, giftId=387');
  console.log('Checking ALL possible Redis keys where data might be stored\n');

  const keysToCheck = [
    { key: 'gift:detail:387', description: 'PRIMARY - giftId key (CANONICAL)' },
    { key: 'gift:detail:364', description: 'MIRROR - tokenId key (SEARCH/FALLBACK)' },
    { key: 'gift:detail:0xA362a2', description: 'FALLBACK - creator-based key (if resolution failed)' }
  ];

  const results = {};

  for (const { key, description } of keysToCheck) {
    console.log(`\n📊 Checking: ${key}`);
    console.log(`   Purpose: ${description}`);

    try {
      const data = await redisCommand('HGETALL', key);
      results[key] = displayData(data, `   Results for ${key}`);
    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
      results[key] = null;
    }
  }

  // Check appointment-specific keys
  console.log('\n\n📅 CHECKING APPOINTMENT-SPECIFIC KEYS');
  console.log('='.repeat(80));

  const appointmentKeys = [
    'appointment:gift:387',
    'appointment:gift:364'
  ];

  for (const key of appointmentKeys) {
    console.log(`\n📊 Checking: ${key}`);
    try {
      const data = await redisCommand('GET', key);
      if (data) {
        console.log('   ✅ FOUND:', data);
        try {
          const parsed = JSON.parse(data);
          console.log('   Parsed:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('   (not JSON)');
        }
      } else {
        console.log('   ❌ NOT FOUND');
      }
    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
    }
  }

  // DIAGNOSTIC SUMMARY
  console.log('\n\n🔍 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(80));

  const hasEmailAnywhere = Object.values(results).some(data =>
    data && (data.email_plain || data.email_encrypted)
  );
  const hasAppointmentAnywhere = Object.values(results).some(data =>
    data && data.appointment_date
  );

  if (hasEmailAnywhere) {
    console.log('✅ EMAIL DATA FOUND in at least one key');
    Object.entries(results).forEach(([key, data]) => {
      if (data && (data.email_plain || data.email_encrypted)) {
        console.log(`   📧 Found in: ${key}`);
        if (data.email_plain) {
          console.log(`      Email: ${data.email_plain}`);
        }
      }
    });
  } else {
    console.log('❌ EMAIL DATA NOT FOUND in any key');
    console.log('   🚨 PROBLEM CONFIRMED: Email verification did not persist to Redis');
  }

  if (hasAppointmentAnywhere) {
    console.log('✅ APPOINTMENT DATA FOUND in at least one key');
    Object.entries(results).forEach(([key, data]) => {
      if (data && data.appointment_date) {
        console.log(`   📅 Found in: ${key}`);
        console.log(`      Date: ${data.appointment_date}`);
        console.log(`      Time: ${data.appointment_time || 'N/A'}`);
      }
    });
  } else {
    console.log('❌ APPOINTMENT DATA NOT FOUND in any key');
    console.log('   🚨 PROBLEM CONFIRMED: Appointment save did not persist to Redis');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ DEEP VERIFICATION COMPLETE\n');
}

main().catch(console.error);

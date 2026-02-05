/**
 * VERIFICACIÓN DIRECTA GIFT #362 (giftId=385, tokenId=362)
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

async function main() {
  console.log('\n🔍 VERIFICANDO GIFT #362 (tokenId=362, giftId=385)\n');
  console.log('='.repeat(80));

  // Check gift:detail:385 (giftId key - CANONICAL)
  console.log('\n📊 Checking: gift:detail:385 (giftId key - CANONICAL)');
  const giftIdData = await redisCommand('HGETALL', 'gift:detail:385');
  console.log('Raw response:', JSON.stringify(giftIdData, null, 2));

  if (Array.isArray(giftIdData) && giftIdData.length > 0) {
    console.log('\n✅ FOUND DATA - Converting array to object:');
    const obj = {};
    for (let i = 0; i < giftIdData.length; i += 2) {
      obj[giftIdData[i]] = giftIdData[i + 1];
    }

    console.log('\n📧 EMAIL FIELDS:');
    console.log('  - email_plain:', obj.email_plain || '❌ NOT FOUND');
    console.log('  - email_encrypted:', obj.email_encrypted ? `✅ EXISTS (length: ${obj.email_encrypted.length})` : '❌ NOT FOUND');
    console.log('  - email_hmac:', obj.email_hmac ? `✅ EXISTS (length: ${obj.email_hmac.length})` : '❌ NOT FOUND');
    console.log('  - email_captured_at:', obj.email_captured_at || '❌ NOT FOUND');

    console.log('\n📅 APPOINTMENT FIELDS:');
    console.log('  - appointment_scheduled:', obj.appointment_scheduled || '❌ NOT FOUND');
    console.log('  - appointment_date:', obj.appointment_date || '❌ NOT FOUND');
    console.log('  - appointment_time:', obj.appointment_time || '❌ NOT FOUND');
    console.log('  - appointment_meeting_url:', obj.appointment_meeting_url || '❌ NOT FOUND');

    console.log('\n🎓 EDUCATION FIELDS:');
    console.log('  - education_score_correct:', obj.education_score_correct || '❌ NOT FOUND');
    console.log('  - education_score_total:', obj.education_score_total || '❌ NOT FOUND');
    console.log('  - education_score_percentage:', obj.education_score_percentage || '❌ NOT FOUND');
    console.log('  - education_completed_at:', obj.education_completed_at || '❌ NOT FOUND');

    console.log('\n🎁 CLAIM FIELDS:');
    console.log('  - claimer:', obj.claimer || '❌ NOT FOUND');
    console.log('  - claimedAt:', obj.claimedAt || '❌ NOT FOUND');
    console.log('  - status:', obj.status || '❌ NOT FOUND');

    console.log('\n📋 ALL FIELDS:');
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const display = typeof value === 'string' && value.length > 50
        ? value.substring(0, 50) + '...'
        : value;
      console.log(`  - ${key}: ${display}`);
    });
  } else {
    console.log('❌ NO DATA FOUND in gift:detail:385');
  }

  // Check gift:detail:362 (tokenId mirror key)
  console.log('\n\n📊 Checking: gift:detail:362 (tokenId mirror key)');
  const tokenIdData = await redisCommand('HGETALL', 'gift:detail:362');
  console.log('Raw response:', JSON.stringify(tokenIdData, null, 2));

  if (Array.isArray(tokenIdData) && tokenIdData.length > 0) {
    console.log('\n✅ FOUND DATA - Converting array to object:');
    const obj = {};
    for (let i = 0; i < tokenIdData.length; i += 2) {
      obj[tokenIdData[i]] = tokenIdData[i + 1];
    }

    console.log('\n📧 EMAIL FIELDS:');
    console.log('  - email_plain:', obj.email_plain || '❌ NOT FOUND');
    console.log('  - email_encrypted:', obj.email_encrypted ? `✅ EXISTS (length: ${obj.email_encrypted.length})` : '❌ NOT FOUND');
    console.log('  - email_hmac:', obj.email_hmac ? `✅ EXISTS (length: ${obj.email_hmac.length})` : '❌ NOT FOUND');

    console.log('\n🎁 CLAIM FIELDS:');
    console.log('  - claimer:', obj.claimer || '❌ NOT FOUND');
    console.log('  - claimedAt:', obj.claimedAt || '❌ NOT FOUND');
  } else {
    console.log('❌ NO DATA FOUND in gift:detail:362');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ VERIFICATION COMPLETE\n');
}

main().catch(console.error);

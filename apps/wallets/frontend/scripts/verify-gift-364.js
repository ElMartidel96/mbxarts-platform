/**
 * VERIFICACIÓN DIRECTA GIFT #364 (giftId=387, tokenId=364)
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
  console.log('\n🔍 VERIFICANDO GIFT #364 (tokenId=364, giftId=387)\n');
  console.log('='.repeat(80));
  console.log('⚠️ NOTA: Usuario NO completó el claim, solo email + appointment\n');

  // Check gift:detail:387 (giftId key - CANONICAL)
  console.log('📊 Checking: gift:detail:387 (giftId key - CANONICAL)');
  const giftIdData = await redisCommand('HGETALL', 'gift:detail:387');
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
    console.log('  - email_warning:', obj.email_warning || '(none)');

    console.log('\n📅 APPOINTMENT FIELDS:');
    console.log('  - appointment_scheduled:', obj.appointment_scheduled || '❌ NOT FOUND');
    console.log('  - appointment_date:', obj.appointment_date || '❌ NOT FOUND');
    console.log('  - appointment_time:', obj.appointment_time || '❌ NOT FOUND');
    console.log('  - appointment_meeting_url:', obj.appointment_meeting_url ? `✅ EXISTS` : '❌ NOT FOUND');

    console.log('\n🎓 EDUCATION FIELDS:');
    console.log('  - education_score_correct:', obj.education_score_correct || '❌ NOT FOUND');
    console.log('  - education_score_total:', obj.education_score_total || '❌ NOT FOUND');
    console.log('  - education_score_percentage:', obj.education_score_percentage || '❌ NOT FOUND');
    console.log('  - education_completed_at:', obj.education_completed_at || '❌ NOT FOUND');

    console.log('\n🎁 CLAIM FIELDS (should be EMPTY - NOT CLAIMED):');
    console.log('  - claimer:', obj.claimer || '❌ NOT FOUND (expected)');
    console.log('  - claimedAt:', obj.claimedAt || '❌ NOT FOUND (expected)');
    console.log('  - status:', obj.status || '❌ NOT FOUND');

    console.log('\n📋 ALL FIELDS:');
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const display = typeof value === 'string' && value.length > 50
        ? value.substring(0, 50) + '...'
        : value;
      console.log(`  - ${key}: ${display}`);
    });

    // DIAGNOSTIC
    console.log('\n\n🔍 DIAGNÓSTICO:');
    console.log('='.repeat(80));
    const hasEmail = !!(obj.email_plain || obj.email_encrypted);
    const hasAppointment = !!obj.appointment_date;
    const isClaimed = !!obj.claimer;

    if (hasEmail) {
      console.log('✅ EMAIL DATA PRESENTE');
      if (obj.email_plain) {
        console.log(`   📧 Email (plain): ${obj.email_plain}`);
      }
      if (obj.email_encrypted) {
        console.log(`   🔐 Email (encrypted): SÍ (${obj.email_encrypted.length} chars)`);
      }
    } else {
      console.log('❌ EMAIL DATA AUSENTE - PROBLEMA CONFIRMADO');
    }

    if (hasAppointment) {
      console.log('✅ APPOINTMENT DATA PRESENTE');
      console.log(`   📅 Fecha: ${obj.appointment_date}`);
      console.log(`   ⏰ Hora: ${obj.appointment_time || 'N/A'}`);
    } else {
      console.log('❌ APPOINTMENT DATA AUSENTE - PROBLEMA CONFIRMADO');
    }

    if (isClaimed) {
      console.log('⚠️ GIFT RECLAMADO (no esperado según usuario)');
      console.log(`   👤 Claimer: ${obj.claimer}`);
    } else {
      console.log('✅ GIFT NO RECLAMADO (esperado según usuario)');
    }

  } else {
    console.log('❌ NO DATA FOUND in gift:detail:387');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ VERIFICATION COMPLETE\n');
}

main().catch(console.error);

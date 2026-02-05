#!/usr/bin/env node

/**
 * DIAGNOSTIC SCRIPT: Check Redis data for gifts #366 and #367
 * Identify why email and appointment data is missing
 */

const { createClient } = require('@vercel/kv');

async function diagnoseGifts() {
  const redis = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  console.log('🔍 DIAGNOSING GIFTS #366 and #367\n');
  console.log('=' .repeat(80));

  // Gift #366 (Token #366, Gift ID #389)
  console.log('\n📦 GIFT #366 (Token #366, Gift ID #389):');
  console.log('-'.repeat(80));

  const gift366Data = await redis.hgetall('gift:detail:389');
  console.log('\n✅ Redis Key: gift:detail:389');
  console.log(JSON.stringify(gift366Data, null, 2));

  // Check for email fields
  console.log('\n📧 EMAIL CHECK:');
  console.log(`  - email_encrypted: ${gift366Data?.email_encrypted ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_plain: ${gift366Data?.email_plain ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_hmac: ${gift366Data?.email_hmac ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_captured_at: ${gift366Data?.email_captured_at ? new Date(Number(gift366Data.email_captured_at)).toISOString() : 'MISSING ❌'}`);

  // Check for appointment
  console.log('\n📅 APPOINTMENT CHECK:');
  const appointment366 = await redis.hgetall('appointment:gift:389');
  console.log(`  - appointment key exists: ${appointment366 && Object.keys(appointment366).length > 0 ? 'YES ✅' : 'NO ❌'}`);
  if (appointment366 && Object.keys(appointment366).length > 0) {
    console.log(`  - appointment data:`, JSON.stringify(appointment366, null, 4));
  }

  // Check education data
  console.log('\n🎓 EDUCATION CHECK:');
  console.log(`  - education_score_correct: ${gift366Data?.education_score_correct || 'MISSING ❌'}`);
  console.log(`  - education_score_total: ${gift366Data?.education_score_total || 'MISSING ❌'}`);
  console.log(`  - education_score_percentage: ${gift366Data?.education_score_percentage || 'MISSING ❌'}`);

  console.log('\n' + '='.repeat(80));

  // Gift #367 (Token #367, Gift ID #390)
  console.log('\n📦 GIFT #367 (Token #367, Gift ID #390):');
  console.log('-'.repeat(80));

  const gift367Data = await redis.hgetall('gift:detail:390');
  console.log('\n✅ Redis Key: gift:detail:390');
  console.log(JSON.stringify(gift367Data, null, 2));

  // Check for email fields
  console.log('\n📧 EMAIL CHECK:');
  console.log(`  - email_encrypted: ${gift367Data?.email_encrypted ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_plain: ${gift367Data?.email_plain ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_hmac: ${gift367Data?.email_hmac ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_captured_at: ${gift367Data?.email_captured_at ? new Date(Number(gift367Data.email_captured_at)).toISOString() : 'MISSING ❌'}`);

  // Check for appointment
  console.log('\n📅 APPOINTMENT CHECK:');
  const appointment367 = await redis.hgetall('appointment:gift:390');
  console.log(`  - appointment key exists: ${appointment367 && Object.keys(appointment367).length > 0 ? 'YES ✅' : 'NO ❌'}`);
  if (appointment367 && Object.keys(appointment367).length > 0) {
    console.log(`  - appointment data:`, JSON.stringify(appointment367, null, 4));
  }

  // Check education data
  console.log('\n🎓 EDUCATION CHECK:');
  console.log(`  - education_score_correct: ${gift367Data?.education_score_correct || 'MISSING ❌'}`);
  console.log(`  - education_score_total: ${gift367Data?.education_score_total || 'MISSING ❌'}`);
  console.log(`  - education_score_percentage: ${gift367Data?.education_score_percentage || 'MISSING ❌'}`);

  console.log('\n' + '='.repeat(80));

  // Gift #365 (WORKING - for comparison)
  console.log('\n📦 GIFT #365 (Token #365, Gift ID #388) - WORKING REFERENCE:');
  console.log('-'.repeat(80));

  const gift365Data = await redis.hgetall('gift:detail:388');
  console.log('\n✅ Redis Key: gift:detail:388');

  // Check for email fields
  console.log('\n📧 EMAIL CHECK (REFERENCE - SHOULD BE PRESENT):');
  console.log(`  - email_encrypted: ${gift365Data?.email_encrypted ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_plain: ${gift365Data?.email_plain ? 'PRESENT ✅' : 'MISSING ❌'}`);
  console.log(`  - email_hmac: ${gift365Data?.email_hmac ? `PRESENT (${gift365Data.email_hmac.substring(0, 16)}...) ✅` : 'MISSING ❌'}`);
  console.log(`  - email_captured_at: ${gift365Data?.email_captured_at ? new Date(Number(gift365Data.email_captured_at)).toISOString() : 'MISSING ❌'}`);

  // Check for appointment
  console.log('\n📅 APPOINTMENT CHECK (REFERENCE):');
  const appointment365 = await redis.hgetall('appointment:gift:388');
  console.log(`  - appointment key exists: ${appointment365 && Object.keys(appointment365).length > 0 ? 'YES ✅' : 'NO ❌'}`);

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ DIAGNOSIS COMPLETE');
}

diagnoseGifts().catch(console.error);

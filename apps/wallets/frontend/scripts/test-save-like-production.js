/**
 * TEST: Simulate EXACT save operations like production
 * Reproduces the exact flow: save email → save appointment → verify
 */

const { Redis } = require('@upstash/redis');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://exotic-alien-13383.upstash.io';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM';

async function main() {
  console.log('\n🧪 TESTING PRODUCTION-LIKE SAVE FLOW\n');
  console.log('='.repeat(80));

  // Initialize Redis like production does
  const redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });

  const giftId = '387';
  const tokenId = '364';
  const testKey = `gift:detail:${giftId}`;

  try {
    // STEP 1: Simulate email save (like save-email-manual.ts)
    console.log('\n📧 STEP 1: Simulating email save...');
    const emailUpdates = {
      email_plain: 'test@example.com',
      email_warning: 'TEST',
      email_captured_at: Date.now().toString(),
      tokenId
    };

    console.log('  Writing:', emailUpdates);
    const emailResult = await redis.hset(testKey, emailUpdates);
    console.log('  HSET result:', emailResult);
    console.log('✅ Email save completed');

    // STEP 2: Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 3: Verify email was saved
    console.log('\n🔍 STEP 2: Verifying email data...');
    const afterEmail = await redis.hgetall(testKey);
    console.log('  Data found:', afterEmail);

    const hasEmail = afterEmail && (afterEmail.email_plain || afterEmail.email_encrypted);
    console.log(hasEmail ? '✅ Email data PRESENT' : '❌ Email data MISSING');

    // STEP 4: Simulate appointment save (like save-appointment.ts)
    console.log('\n📅 STEP 3: Simulating appointment save...');
    const appointmentUpdates = {
      appointment_scheduled: 'true',
      appointment_date: '2025-11-05',
      appointment_time: '00:00',
      appointment_duration: 30,
      appointment_timezone: 'UTC',
      appointment_meeting_url: 'https://test.com',
      appointment_created_at: Date.now().toString(),
      tokenId
    };

    console.log('  Writing:', Object.keys(appointmentUpdates));
    const appointmentResult = await redis.hset(testKey, appointmentUpdates);
    console.log('  HSET result:', appointmentResult);
    console.log('✅ Appointment save completed');

    // STEP 5: Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 6: Final verification
    console.log('\n🔍 STEP 4: Final verification...');
    const final = await redis.hgetall(testKey);
    console.log('  All fields:', Object.keys(final));

    const finalHasEmail = final && (final.email_plain || final.email_encrypted);
    const finalHasAppointment = final && final.appointment_date;

    console.log('\n📊 FINAL RESULTS:');
    console.log('='.repeat(80));
    console.log(`  Email data: ${finalHasEmail ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`  Appointment data: ${finalHasAppointment ? '✅ PRESENT' : '❌ MISSING'}`);

    if (finalHasEmail && finalHasAppointment) {
      console.log('\n✅ TEST PASSED: Data persists correctly');
    } else {
      console.log('\n❌ TEST FAILED: Data was lost');
      console.log('\nDEBUG INFO:');
      console.log('After email save:', afterEmail ? Object.keys(afterEmail) : 'null');
      console.log('After appointment save:', final ? Object.keys(final) : 'null');
    }

    // STEP 7: Check actual production key gift:detail:387
    console.log('\n\n📊 CHECKING ACTUAL PRODUCTION KEY gift:detail:387...');
    const prodData = await redis.hgetall('gift:detail:387');
    console.log('Fields present:', prodData ? Object.keys(prodData) : 'NO DATA');

    if (prodData) {
      const prodHasEmail = prodData.email_plain || prodData.email_encrypted;
      const prodHasAppointment = prodData.appointment_date;
      console.log(`  Email: ${prodHasEmail ? '✅ PRESENT' : '❌ MISSING'}`);
      console.log(`  Appointment: ${prodHasAppointment ? '✅ PRESENT' : '❌ MISSING'}`);
    }

    // Cleanup test key
    console.log('\n🧹 Cleaning up...');
    await redis.del(testKey);
    console.log('✅ Test key deleted');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error('Stack:', error.stack);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST COMPLETE\n');
}

main().catch(console.error);

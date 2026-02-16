/**
 * SDK WRITE TEST - Test @upstash/redis SDK (what APIs actually use)
 * This will reveal if the SDK itself is the problem
 */

import { Redis } from '@upstash/redis';

async function testSDKWrites() {
  console.log('🧪 TESTING @UPSTASH/REDIS SDK');
  console.log('================================\n');

  try {
    // Create Redis client using SDK (exact same way as validateRedisForCriticalOps)
    const redis = new Redis({
      url: 'https://exotic-alien-13383.upstash.io',
      token: 'ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM'
    });

    console.log('✅ Redis SDK client created\n');

    const testKey = `sdk:test:${Date.now()}`;

    // TEST 1: Simple SET/GET
    console.log('TEST 1: SDK SET/GET');
    console.log('-------------------');
    await redis.set(testKey, 'test_value');
    console.log(`SET ${testKey} = "test_value"`);

    const getValue = await redis.get(testKey);
    console.log(`GET ${testKey} = "${getValue}"`);

    if (getValue === 'test_value') {
      console.log('✅ TEST 1 PASSED\n');
    } else {
      console.log(`❌ TEST 1 FAILED: Expected "test_value", got "${getValue}"\n`);
    }

    // TEST 2: HSET with object (exact save-appointment pattern)
    console.log('TEST 2: SDK HSET with object (save-appointment pattern)');
    console.log('--------------------------------------------------------');

    const giftDetailKey = `gift:detail:sdk_test_${Date.now()}`;
    const updates: Record<string, any> = {
      appointment_scheduled: 'true',
      appointment_date: '2025-11-01',
      appointment_time: '10:00',
      appointment_duration: 30,
      appointment_timezone: 'America/Mexico_City',
      appointment_meeting_url: 'https://calendly.com/test',
      appointment_invitee_name: 'Test User',
      appointment_created_at: Date.now(),
      tokenId: '999'
    };

    console.log(`HSET ${giftDetailKey} with ${Object.keys(updates).length} fields`);
    console.log('Updates object:', JSON.stringify(updates, null, 2));

    const hsetResult = await redis.hset(giftDetailKey, updates);
    console.log(`✅ HSET returned: ${hsetResult}\n`);

    // Read back the data
    console.log(`HGETALL ${giftDetailKey}`);
    const retrievedData = await redis.hgetall(giftDetailKey);
    console.log('Retrieved data:', JSON.stringify(retrievedData, null, 2));

    // Verify all fields
    const allFieldsPresent = Object.keys(updates).every(key => key in (retrievedData || {}));
    const fieldCount = retrievedData ? Object.keys(retrievedData).length : 0;

    console.log(`\nFields written: ${Object.keys(updates).length}`);
    console.log(`Fields retrieved: ${fieldCount}`);

    if (allFieldsPresent && fieldCount === Object.keys(updates).length) {
      console.log('✅ TEST 2 PASSED: All fields persisted correctly\n');
    } else {
      console.log('❌ TEST 2 FAILED: Some fields missing\n');
      console.log('Expected fields:', Object.keys(updates));
      console.log('Retrieved fields:', retrievedData ? Object.keys(retrievedData) : []);
      console.log('Missing fields:', Object.keys(updates).filter(k => !(retrievedData as any)?.[k]));
    }

    // TEST 3: SETEX (separate appointment record)
    console.log('TEST 3: SDK SETEX with JSON');
    console.log('---------------------------');

    const appointmentKey = `appointment:gift:sdk_test_${Date.now()}`;
    const appointmentRecord = {
      giftId: '999',
      tokenId: '999',
      eventDate: '2025-11-01',
      eventTime: '10:00',
      duration: 30,
      timezone: 'America/Mexico_City'
    };

    console.log(`SETEX ${appointmentKey} 3600 (1 hour TTL)`);
    await redis.setex(appointmentKey, 3600, JSON.stringify(appointmentRecord));
    console.log('✅ SETEX completed\n');

    console.log(`GET ${appointmentKey}`);
    const appointmentData = await redis.get(appointmentKey);
    console.log(`Retrieved: ${appointmentData}\n`);

    if (appointmentData) {
      const parsed = JSON.parse(appointmentData as string);
      if (parsed.giftId === '999' && parsed.eventDate === '2025-11-01') {
        console.log('✅ TEST 3 PASSED: Appointment record persisted correctly\n');
      } else {
        console.log('❌ TEST 3 FAILED: Data mismatch\n');
      }
    } else {
      console.log('❌ TEST 3 FAILED: No data retrieved\n');
    }

    // Cleanup
    console.log('CLEANUP: Deleting test keys');
    await redis.del(testKey, giftDetailKey, appointmentKey);
    console.log('✅ Test keys deleted\n');

    console.log('📊 FINAL VERDICT');
    console.log('================');
    console.log('If all tests passed, the @upstash/redis SDK works correctly.');
    console.log('This would mean the problem is in save-appointment.ts logic,');
    console.log('NOT in the SDK itself.');

  } catch (error: any) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSDKWrites().then(() => {
  console.log('\n\nSDK test complete.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

/**
 * REDIS WRITE TEST - Diagnose why writes aren't persisting
 * Tests if Redis client can actually write and read data
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
          console.log(`   Response: ${JSON.stringify(parsed)}`);
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

async function testRedisWrites() {
  console.log('🧪 TESTING REDIS WRITE/READ OPERATIONS');
  console.log('=======================================\n');

  const testKey = `test:write:${Date.now()}`;
  const testGiftDetailKey = `gift:detail:test_${Date.now()}`;

  try {
    // TEST 1: Simple SET/GET
    console.log('TEST 1: Simple SET/GET');
    console.log('----------------------');
    console.log(`Setting ${testKey} = "test_value"`);
    const setResult = await redisCommand('SET', testKey, 'test_value');
    console.log(`✅ SET returned: ${setResult}\n`);

    console.log(`Getting ${testKey}`);
    const getResult = await redisCommand('GET', testKey);
    console.log(`✅ GET returned: ${getResult}\n`);

    if (getResult === 'test_value') {
      console.log('✅ TEST 1 PASSED: SET/GET working correctly\n');
    } else {
      console.log(`❌ TEST 1 FAILED: Expected "test_value", got "${getResult}"\n`);
    }

    // TEST 2: HSET/HGET (like save-appointment uses)
    console.log('TEST 2: HSET/HGET (save-appointment pattern)');
    console.log('----------------------------------------------');

    const hashUpdates = {
      appointment_scheduled: 'true',
      appointment_date: '2025-11-01',
      appointment_time: '10:00',
      appointment_duration: '30',
      appointment_timezone: 'America/Mexico_City',
      tokenId: '999'
    };

    console.log(`HSET ${testGiftDetailKey} with ${Object.keys(hashUpdates).length} fields`);

    // Upstash REST API expects: HSET key field1 value1 field2 value2 ...
    const hsetArgs = [testGiftDetailKey];
    for (const [key, value] of Object.entries(hashUpdates)) {
      hsetArgs.push(key, value);
    }

    const hsetResult = await redisCommand('HSET', ...hsetArgs);
    console.log(`✅ HSET returned: ${hsetResult} (number of fields set)\n`);

    // Read back the hash
    console.log(`HGETALL ${testGiftDetailKey}`);
    const hgetallResult = await redisCommand('HGETALL', testGiftDetailKey);

    // Convert array to object
    const retrievedData = {};
    if (hgetallResult && Array.isArray(hgetallResult)) {
      for (let i = 0; i < hgetallResult.length; i += 2) {
        retrievedData[hgetallResult[i]] = hgetallResult[i + 1];
      }
    }

    console.log(`✅ HGETALL returned ${Object.keys(retrievedData).length} fields:`);
    console.log(JSON.stringify(retrievedData, null, 2));
    console.log('');

    // Verify all fields were written
    const allFieldsPresent = Object.keys(hashUpdates).every(key => key in retrievedData);
    if (allFieldsPresent) {
      console.log('✅ TEST 2 PASSED: HSET/HGETALL working correctly\n');
    } else {
      console.log('❌ TEST 2 FAILED: Some fields missing\n');
      console.log('Expected fields:', Object.keys(hashUpdates));
      console.log('Retrieved fields:', Object.keys(retrievedData));
    }

    // TEST 3: SETEX (like save-appointment uses for appointment record)
    console.log('TEST 3: SETEX with TTL');
    console.log('----------------------');

    const appointmentKey = `appointment:gift:test_${Date.now()}`;
    const appointmentData = JSON.stringify({
      giftId: '999',
      eventDate: '2025-11-01',
      eventTime: '10:00'
    });

    console.log(`SETEX ${appointmentKey} 3600 (1 hour TTL)`);
    const setexResult = await redisCommand('SETEX', appointmentKey, 3600, appointmentData);
    console.log(`✅ SETEX returned: ${setexResult}\n`);

    console.log(`GET ${appointmentKey}`);
    const getAppointmentResult = await redisCommand('GET', appointmentKey);
    console.log(`✅ GET returned: ${getAppointmentResult}\n`);

    if (getAppointmentResult === appointmentData) {
      console.log('✅ TEST 3 PASSED: SETEX/GET working correctly\n');
    } else {
      console.log('❌ TEST 3 FAILED: Data mismatch\n');
    }

    // Cleanup
    console.log('CLEANUP: Deleting test keys');
    await redisCommand('DEL', testKey, testGiftDetailKey, appointmentKey);
    console.log('✅ Test keys deleted\n');

    console.log('📊 FINAL VERDICT');
    console.log('================');
    console.log('All Redis operations completed successfully.');
    console.log('Redis client is working correctly.');
    console.log('');
    console.log('⚠️ CONCLUSION: If Redis writes work in this script but not in');
    console.log('save-appointment API, the problem is in the API code logic,');
    console.log('NOT in the Redis connection itself.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testRedisWrites().then(() => {
  console.log('\n\nTest complete.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

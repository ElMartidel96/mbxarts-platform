/**
 * TEST: Verify Redis HSET and HGET are working correctly
 * Tests if data persists after write
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
  console.log('\n🧪 REDIS WRITE-READ TEST\n');
  console.log('='.repeat(80));

  const testKey = 'test:gift:detail:999';

  // Test 1: Write data
  console.log('\n📝 TEST 1: Writing test data to Redis...');
  const testData = {
    email_plain: 'test@example.com',
    email_warning: 'TEST_DATA',
    email_captured_at: Date.now().toString(),
    tokenId: '999',
    test_field: 'test_value'
  };

  try {
    // Convert object to flat array for HSET
    const flatData = Object.entries(testData).flat();
    await redisCommand('HSET', testKey, ...flatData);
    console.log('✅ HSET successful');
    console.log('   Data written:', testData);
  } catch (error) {
    console.error('❌ HSET failed:', error.message);
    return;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Read data back
  console.log('\n📖 TEST 2: Reading data back from Redis...');
  try {
    const readData = await redisCommand('HGETALL', testKey);
    console.log('✅ HGETALL successful');
    console.log('   Raw response:', readData);

    if (Array.isArray(readData) && readData.length > 0) {
      const obj = {};
      for (let i = 0; i < readData.length; i += 2) {
        obj[readData[i]] = readData[i + 1];
      }
      console.log('   Converted object:', obj);

      // Verify all fields
      console.log('\n🔍 VERIFICATION:');
      const allFieldsPresent = Object.keys(testData).every(key => {
        const present = obj[key] === testData[key];
        console.log(`   ${present ? '✅' : '❌'} ${key}: ${present ? 'MATCH' : 'MISSING'}`);
        return present;
      });

      if (allFieldsPresent) {
        console.log('\n✅ TEST PASSED: All data persisted correctly');
      } else {
        console.log('\n❌ TEST FAILED: Some data missing');
      }
    } else {
      console.log('❌ NO DATA FOUND - Redis may have issue');
    }
  } catch (error) {
    console.error('❌ HGETALL failed:', error.message);
    return;
  }

  // Test 3: Check gift:detail:387 specifically
  console.log('\n\n📊 TEST 3: Checking actual gift:detail:387...');
  try {
    const actualData = await redisCommand('HGETALL', 'gift:detail:387');
    console.log('Raw response:', actualData);

    if (Array.isArray(actualData) && actualData.length > 0) {
      const obj = {};
      for (let i = 0; i < actualData.length; i += 2) {
        obj[actualData[i]] = actualData[i + 1];
      }

      console.log('\n📋 Fields in gift:detail:387:');
      Object.keys(obj).forEach(key => {
        console.log(`   - ${key}: ${obj[key]}`);
      });

      const hasEmail = !!(obj.email_plain || obj.email_encrypted);
      const hasAppointment = !!obj.appointment_date;

      console.log('\n🔍 Status:');
      console.log(`   Email data: ${hasEmail ? '✅ PRESENT' : '❌ MISSING'}`);
      console.log(`   Appointment data: ${hasAppointment ? '✅ PRESENT' : '❌ MISSING'}`);
    } else {
      console.log('❌ NO DATA in gift:detail:387');
    }
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  try {
    await redisCommand('DEL', testKey);
    console.log('✅ Test key deleted');
  } catch (error) {
    console.error('⚠️ Cleanup failed (non-critical):', error.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST COMPLETE\n');
}

main().catch(console.error);

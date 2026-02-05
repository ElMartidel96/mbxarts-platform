/**
 * LIVE DEBUGGING - Monitor Redis writes in real-time
 * Shows EXACTLY what's being written to Redis when save APIs are called
 */

const https = require('https');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://exotic-alien-13383.upstash.io';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM';

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

async function monitorKey(key) {
  console.log(`\n📊 Monitoring ${key}...`);
  const data = await redisCommand('HGETALL', key);

  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.log('   ❌ NO DATA');
    return null;
  }

  const obj = {};
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i += 2) {
      obj[data[i]] = data[i + 1];
    }
  }

  console.log('   Fields:', Object.keys(obj).join(', '));
  console.log('   lastUpdated:', obj.lastUpdated ? new Date(parseInt(obj.lastUpdated)).toISOString() : 'N/A');
  console.log('   Has email:', !!(obj.email_plain || obj.email_encrypted));
  console.log('   Has appointment:', !!obj.appointment_date);

  return obj;
}

async function main() {
  console.log('\n🔍 LIVE REDIS MONITORING\n');
  console.log('='.repeat(80));
  console.log('Monitoring gift:detail:387 for changes...');
  console.log('Run your email/appointment save test NOW in another window');
  console.log('This script will show you EXACTLY what\'s in Redis every 5 seconds');
  console.log('='.repeat(80));

  let previousState = null;

  // Monitor every 5 seconds
  setInterval(async () => {
    try {
      const currentState = await monitorKey('gift:detail:387');

      // Detect changes
      if (JSON.stringify(currentState) !== JSON.stringify(previousState)) {
        console.log('\n🔥 CHANGE DETECTED AT:', new Date().toISOString());

        if (previousState === null && currentState !== null) {
          console.log('   ✅ KEY CREATED');
        } else if (previousState !== null && currentState === null) {
          console.log('   ❌ KEY DELETED');
        } else {
          // Find what changed
          const prev = previousState || {};
          const curr = currentState || {};

          const added = Object.keys(curr).filter(k => !(k in prev));
          const removed = Object.keys(prev).filter(k => !(k in curr));
          const changed = Object.keys(curr).filter(k => k in prev && curr[k] !== prev[k]);

          if (added.length > 0) console.log('   ➕ ADDED:', added.join(', '));
          if (removed.length > 0) console.log('   ➖ REMOVED:', removed.join(', '));
          if (changed.length > 0) {
            console.log('   ♻️  CHANGED:', changed.join(', '));
            changed.forEach(k => {
              console.log(`      ${k}: "${prev[k]}" → "${curr[k]}"`);
            });
          }
        }

        previousState = currentState;
      }
    } catch (error) {
      console.error('❌ Monitor error:', error.message);
    }
  }, 5000);

  // Initial state
  previousState = await monitorKey('gift:detail:387');

  console.log('\n⏱️  Monitoring started. Press Ctrl+C to stop.\n');
}

main().catch(console.error);

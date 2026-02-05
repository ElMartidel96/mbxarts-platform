/**
 * DIAGNÓSTICO COMPLETO GIFT #357
 * Verifica todos los datos en Redis y blockchain para identificar la fuente del problema
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

async function diagnoseGift357() {
  console.log('🔍 DIAGNÓSTICO COMPLETO GIFT #357');
  console.log('=====================================\n');

  try {
    // Paso 1: Obtener mapping tokenId → giftId
    console.log('PASO 1: Resolución tokenId → giftId');
    console.log('-------------------------------------');
    const reverseMapping = await redisCommand('GET', 'reverse_mapping:357');
    console.log('reverse_mapping:357 =', reverseMapping);

    if (reverseMapping) {
      const giftMapping = await redisCommand('GET', `gift_mapping:${reverseMapping}`);
      if (giftMapping) {
        const parsed = JSON.parse(giftMapping);
        console.log('\ngift_mapping data:', JSON.stringify(parsed, null, 2));
      }
    }

    // Paso 2: Leer gift:detail:{giftId} (PRIMARY KEY)
    console.log('\n\nPASO 2: gift:detail:357 (PRIMARY KEY)');
    console.log('-------------------------------------');
    const giftDetailByGiftId = await redisCommand('HGETALL', 'gift:detail:357');

    const giftData357 = {};
    if (giftDetailByGiftId && Array.isArray(giftDetailByGiftId)) {
      for (let i = 0; i < giftDetailByGiftId.length; i += 2) {
        giftData357[giftDetailByGiftId[i]] = giftDetailByGiftId[i + 1];
      }
    }

    console.log('Total fields:', Object.keys(giftData357).length);
    console.log('\n📊 CAMPOS CRÍTICOS:');
    console.log('  claimer:', giftData357.claimer || 'NOT FOUND');
    console.log('  claimedAt:', giftData357.claimedAt || 'NOT FOUND');
    console.log('  creator:', giftData357.creator || 'NOT FOUND');
    console.log('  createdAt:', giftData357.createdAt || 'NOT FOUND');
    console.log('  tokenId:', giftData357.tokenId || 'NOT FOUND');
    console.log('  status:', giftData357.status || 'NOT FOUND');

    if (giftData357.claimedAt) {
      const claimedDate = new Date(parseInt(giftData357.claimedAt));
      console.log('  claimedAt (formatted):', claimedDate.toLocaleString('es-ES'));
    }

    if (giftData357.createdAt) {
      const createdDate = new Date(parseInt(giftData357.createdAt));
      console.log('  createdAt (formatted):', createdDate.toLocaleString('es-ES'));
    }

    // Paso 3: Buscar en events stream
    console.log('\n\nPASO 3: Events Stream');
    console.log('-------------------------------------');
    const eventsRaw = await redisCommand('XREVRANGE', 'ga:v1:events', '+', '-', 1000);

    // Parse events
    const events = [];
    if (Array.isArray(eventsRaw)) {
      for (const [id, fields] of eventsRaw) {
        const eventObj = {};
        if (Array.isArray(fields)) {
          for (let i = 0; i < fields.length; i += 2) {
            eventObj[fields[i]] = fields[i + 1];
          }
        }
        if (eventObj.giftId === '357' || eventObj.tokenId === '357') {
          events.push({ id, ...eventObj });
        }
      }
    }

    console.log('Events encontrados para gift #357:', events.length);
    events.forEach((event, idx) => {
      console.log(`\nEvento #${idx + 1}:`);
      console.log('  type:', event.type);
      console.log('  giftId:', event.giftId);
      console.log('  tokenId:', event.tokenId);
      console.log('  blockTimestamp:', event.blockTimestamp);

      if (event.blockTimestamp) {
        const eventDate = new Date(parseInt(event.blockTimestamp));
        console.log('  timestamp (formatted):', eventDate.toLocaleString('es-ES'));
      }

      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          console.log('  data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('  data (raw):', event.data);
        }
      }
    });

    // Paso 4: Buscar eventos de claim específicamente
    const claimEvent = events.find(e => e.type === 'GiftClaimed');
    const createEvent = events.find(e => e.type === 'GiftCreated');

    console.log('\n\nPASO 4: Análisis de Eventos Críticos');
    console.log('-------------------------------------');

    if (createEvent) {
      console.log('✅ CREATE EVENT ENCONTRADO:');
      const createDate = new Date(parseInt(createEvent.blockTimestamp));
      console.log('  Fecha creación:', createDate.toLocaleString('es-ES'));
      try {
        const createData = JSON.parse(createEvent.data);
        console.log('  Creator:', createData.creator);
      } catch (e) {}
    } else {
      console.log('❌ CREATE EVENT NO ENCONTRADO');
    }

    if (claimEvent) {
      console.log('\n✅ CLAIM EVENT ENCONTRADO:');
      const claimDate = new Date(parseInt(claimEvent.blockTimestamp));
      console.log('  Fecha claim:', claimDate.toLocaleString('es-ES'));
      try {
        const claimData = JSON.parse(claimEvent.data);
        console.log('  Claimer:', claimData.claimer);
      } catch (e) {}
    } else {
      console.log('\n❌ CLAIM EVENT NO ENCONTRADO');
    }

    // PASO 5: Comparación y diagnóstico
    console.log('\n\nPASO 5: DIAGNÓSTICO FINAL');
    console.log('=====================================');

    console.log('\n📊 COMPARACIÓN DE FECHAS:');
    if (giftData357.createdAt && giftData357.claimedAt) {
      const created = new Date(parseInt(giftData357.createdAt));
      const claimed = new Date(parseInt(giftData357.claimedAt));
      console.log('  Created:', created.toLocaleString('es-ES'));
      console.log('  Claimed:', claimed.toLocaleString('es-ES'));

      const diff = claimed - created;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      console.log(`  Diferencia: ${hours}h ${mins}m`);

      if (diff < 0) {
        console.log('  ⚠️ ERROR: Fecha de claim es ANTERIOR a la creación!');
      }
    }

    console.log('\n📊 COMPARACIÓN DE WALLETS:');
    console.log('  Creator:', giftData357.creator || 'NOT FOUND');
    console.log('  Claimer:', giftData357.claimer || 'NOT FOUND');

    if (giftData357.creator && giftData357.claimer) {
      if (giftData357.creator === giftData357.claimer) {
        console.log('  ⚠️ ERROR: Creator y Claimer son LA MISMA WALLET!');
      } else {
        console.log('  ✅ Creator y Claimer son diferentes');
      }
    }

    console.log('\n📋 DATOS COMPLETOS gift:detail:357:');
    console.log(JSON.stringify(giftData357, null, 2));

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

diagnoseGift357().then(() => {
  console.log('\n\nDiagnóstico completo.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

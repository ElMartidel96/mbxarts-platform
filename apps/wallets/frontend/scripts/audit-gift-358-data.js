/**
 * AUDITORÍA COMPLETA: Gift #358 - Email y Appointment Data
 * Verifica TODOS los lugares donde deberían estar guardados estos datos
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

async function auditGift358() {
  console.log('🔍 AUDITORÍA COMPLETA: Gift #358 (giftId=382, tokenId=358)');
  console.log('=================================================================\n');

  try {
    const tokenId = '358';
    const giftId = '382';

    // PASO 1: Verificar gift:detail:382 (PRIMARY KEY por giftId)
    console.log('PASO 1: Verificar gift:detail:382 (PRIMARY - por giftId)');
    console.log('--------------------------------------------------------');
    const giftDetailByGiftId = await redisCommand('HGETALL', `gift:detail:${giftId}`);

    const giftData382 = {};
    if (giftDetailByGiftId && Array.isArray(giftDetailByGiftId)) {
      for (let i = 0; i < giftDetailByGiftId.length; i += 2) {
        giftData382[giftDetailByGiftId[i]] = giftDetailByGiftId[i + 1];
      }
    }

    console.log(`Total fields in gift:detail:382: ${Object.keys(giftData382).length}`);
    console.log('\n📧 EMAIL FIELDS:');
    console.log('  email_plain:', giftData382.email_plain || 'NOT FOUND');
    console.log('  email_encrypted:', giftData382.email_encrypted ? 'EXISTS' : 'NOT FOUND');
    console.log('  email_hmac:', giftData382.email_hmac ? 'EXISTS' : 'NOT FOUND');
    console.log('  email_warning:', giftData382.email_warning || 'NOT FOUND');
    console.log('  email_captured_at:', giftData382.email_captured_at || 'NOT FOUND');

    console.log('\n📅 APPOINTMENT FIELDS:');
    console.log('  appointment_scheduled:', giftData382.appointment_scheduled || 'NOT FOUND');
    console.log('  appointment_date:', giftData382.appointment_date || 'NOT FOUND');
    console.log('  appointment_time:', giftData382.appointment_time || 'NOT FOUND');
    console.log('  appointment_timezone:', giftData382.appointment_timezone || 'NOT FOUND');
    console.log('  appointment_meeting_url:', giftData382.appointment_meeting_url || 'NOT FOUND');
    console.log('  appointment_invitee_name:', giftData382.appointment_invitee_name || 'NOT FOUND');
    console.log('  appointment_created_at:', giftData382.appointment_created_at || 'NOT FOUND');

    console.log('\n🔑 OTHER CRITICAL FIELDS:');
    console.log('  tokenId:', giftData382.tokenId || 'NOT FOUND');
    console.log('  creator:', giftData382.creator || 'NOT FOUND');
    console.log('  claimer:', giftData382.claimer || 'NOT FOUND');
    console.log('  status:', giftData382.status || 'NOT FOUND');

    // PASO 2: Verificar gift:detail:358 (MIRROR KEY por tokenId)
    console.log('\n\nPASO 2: Verificar gift:detail:358 (MIRROR - por tokenId)');
    console.log('--------------------------------------------------------');
    const giftDetailByTokenId = await redisCommand('HGETALL', `gift:detail:${tokenId}`);

    const giftData358 = {};
    if (giftDetailByTokenId && Array.isArray(giftDetailByTokenId)) {
      for (let i = 0; i < giftDetailByTokenId.length; i += 2) {
        giftData358[giftDetailByTokenId[i]] = giftDetailByTokenId[i + 1];
      }
    }

    console.log(`Total fields in gift:detail:358: ${Object.keys(giftData358).length}`);
    console.log('\n📧 EMAIL FIELDS:');
    console.log('  email_plain:', giftData358.email_plain || 'NOT FOUND');
    console.log('  email_encrypted:', giftData358.email_encrypted ? 'EXISTS' : 'NOT FOUND');
    console.log('  email_hmac:', giftData358.email_hmac ? 'EXISTS' : 'NOT FOUND');

    console.log('\n📅 APPOINTMENT FIELDS:');
    console.log('  appointment_scheduled:', giftData358.appointment_scheduled || 'NOT FOUND');
    console.log('  appointment_date:', giftData358.appointment_date || 'NOT FOUND');
    console.log('  appointment_time:', giftData358.appointment_time || 'NOT FOUND');

    // PASO 3: Verificar appointment:gift:382 (separate key)
    console.log('\n\nPASO 3: Verificar appointment:gift:382 (separate key)');
    console.log('--------------------------------------------------------');
    const appointmentKey = `appointment:gift:${giftId}`;
    const appointmentData = await redisCommand('GET', appointmentKey);

    if (appointmentData) {
      console.log('✅ appointment:gift:382 EXISTS');
      try {
        const parsed = JSON.parse(appointmentData);
        console.log('Appointment data:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw data:', appointmentData);
      }
    } else {
      console.log('❌ appointment:gift:382 NOT FOUND');
    }

    // PASO 4: Verificar education:gift:382
    console.log('\n\nPASO 4: Verificar education:gift:382');
    console.log('--------------------------------------------------------');
    const educationKey = `education:gift:${giftId}`;
    const educationData = await redisCommand('GET', educationKey);

    if (educationData) {
      console.log('✅ education:gift:382 EXISTS');
      try {
        const parsed = JSON.parse(educationData);
        console.log('Education data:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw data:', educationData);
      }
    } else {
      console.log('❌ education:gift:382 NOT FOUND');
    }

    // PASO 5: Buscar en events stream
    console.log('\n\nPASO 5: Buscar eventos relacionados en events stream');
    console.log('--------------------------------------------------------');
    const eventsRaw = await redisCommand('XREVRANGE', 'ga:v1:events', '+', '-', 500);

    const events = [];
    if (Array.isArray(eventsRaw)) {
      for (const [id, fields] of eventsRaw) {
        const eventObj = {};
        if (Array.isArray(fields)) {
          for (let i = 0; i < fields.length; i += 2) {
            eventObj[fields[i]] = fields[i + 1];
          }
        }
        if (eventObj.giftId === giftId || eventObj.tokenId === tokenId) {
          events.push({ id, ...eventObj });
        }
      }
    }

    console.log(`Found ${events.length} events for gift #358/382`);
    events.forEach((event, idx) => {
      console.log(`\nEvent #${idx + 1}:`);
      console.log('  type:', event.type);
      console.log('  giftId:', event.giftId);
      console.log('  tokenId:', event.tokenId);

      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          console.log('  data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('  data (raw):', event.data);
        }
      }
    });

    // DIAGNÓSTICO FINAL
    console.log('\n\n📊 DIAGNÓSTICO FINAL');
    console.log('====================');

    const hasEmailInGiftId = !!(giftData382.email_plain || giftData382.email_encrypted);
    const hasEmailInTokenId = !!(giftData358.email_plain || giftData358.email_encrypted);
    const hasAppointmentInGiftId = !!(giftData382.appointment_date);
    const hasAppointmentInTokenId = !!(giftData358.appointment_date);
    const hasAppointmentSeparate = !!appointmentData;

    console.log('\n✅ DATOS ENCONTRADOS:');
    console.log('  Email en gift:detail:382 (PRIMARY):', hasEmailInGiftId ? 'SÍ' : 'NO');
    console.log('  Email en gift:detail:358 (MIRROR):', hasEmailInTokenId ? 'SÍ' : 'NO');
    console.log('  Appointment en gift:detail:382 (PRIMARY):', hasAppointmentInGiftId ? 'SÍ' : 'NO');
    console.log('  Appointment en gift:detail:358 (MIRROR):', hasAppointmentInTokenId ? 'SÍ' : 'NO');
    console.log('  Appointment en appointment:gift:382:', hasAppointmentSeparate ? 'SÍ' : 'NO');

    console.log('\n❌ PROBLEMAS DETECTADOS:');
    if (!hasEmailInGiftId && !hasEmailInTokenId) {
      console.log('  🚨 CRÍTICO: NO HAY DATOS DE EMAIL en ninguna key');
      console.log('     Posibles causas:');
      console.log('     1. save-email-manual.ts no se ejecutó');
      console.log('     2. API falló silenciosamente');
      console.log('     3. Frontend no envió la petición');
    }

    if (!hasAppointmentInGiftId && !hasAppointmentInTokenId && !hasAppointmentSeparate) {
      console.log('  🚨 CRÍTICO: NO HAY DATOS DE APPOINTMENT en ninguna key');
      console.log('     Posibles causas:');
      console.log('     1. save-appointment.ts no se ejecutó');
      console.log('     2. Calendly webhook no llegó');
      console.log('     3. Frontend no envió la petición');
    }

    console.log('\n📋 CAMPOS COMPLETOS gift:detail:382:');
    console.log(JSON.stringify(giftData382, null, 2));

    if (Object.keys(giftData358).length > 0) {
      console.log('\n📋 CAMPOS COMPLETOS gift:detail:358:');
      console.log(JSON.stringify(giftData358, null, 2));
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

auditGift358().then(() => {
  console.log('\n\nAuditoría completa.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

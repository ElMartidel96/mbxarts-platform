/**
 * VERIFICACIÓN DIRECTA DE EMAIL EN REDIS - GIFT #383 (tokenId=359)
 *
 * Purpose: Verificar qué campos de email existen en Redis para diagnosticar
 * por qué el analytics API reporta "NO EMAIL DATA" a pesar de que los logs
 * muestran que se guardó correctamente.
 */

const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function verifyGift383Email() {
  const redis = new Redis(process.env.KV_REST_API_URL?.replace('https://', 'rediss://'), {
    password: process.env.KV_REST_API_TOKEN,
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('\n🔍 VERIFICACIÓN DIRECTA DE EMAIL - GIFT #383 (tokenId=359)\n');
  console.log('=' .repeat(80));

  try {
    // 1. Verificar gift:detail:383 (giftId key)
    console.log('\n📊 VERIFICANDO: gift:detail:383 (giftId key)');
    console.log('-'.repeat(80));
    const giftIdData = await redis.hgetall('gift:detail:383');
    console.log('Campos encontrados:', Object.keys(giftIdData).length);

    if (Object.keys(giftIdData).length > 0) {
      console.log('\n✅ CAMPOS DE EMAIL:');
      console.log('  - email_plain:', giftIdData.email_plain || '❌ NO EXISTE');
      console.log('  - email_encrypted:', giftIdData.email_encrypted ? `✅ EXISTE (${giftIdData.email_encrypted.substring(0, 20)}...)` : '❌ NO EXISTE');
      console.log('  - email_hmac:', giftIdData.email_hmac ? `✅ EXISTE (${giftIdData.email_hmac.substring(0, 20)}...)` : '❌ NO EXISTE');
      console.log('  - email_captured_at:', giftIdData.email_captured_at || '❌ NO EXISTE');
      console.log('  - email_warning:', giftIdData.email_warning || '❌ NO EXISTE');

      console.log('\n📋 TODOS LOS CAMPOS:');
      Object.entries(giftIdData).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value;
        console.log(`  - ${key}: ${displayValue}`);
      });
    } else {
      console.log('❌ NO HAY DATOS en gift:detail:383');
    }

    // 2. Verificar gift:detail:359 (tokenId key - MIRROR)
    console.log('\n\n📊 VERIFICANDO: gift:detail:359 (tokenId mirror key)');
    console.log('-'.repeat(80));
    const tokenIdData = await redis.hgetall('gift:detail:359');
    console.log('Campos encontrados:', Object.keys(tokenIdData).length);

    if (Object.keys(tokenIdData).length > 0) {
      console.log('\n✅ CAMPOS DE EMAIL:');
      console.log('  - email_plain:', tokenIdData.email_plain || '❌ NO EXISTE');
      console.log('  - email_encrypted:', tokenIdData.email_encrypted ? `✅ EXISTE (${tokenIdData.email_encrypted.substring(0, 20)}...)` : '❌ NO EXISTE');
      console.log('  - email_hmac:', tokenIdData.email_hmac ? `✅ EXISTE (${tokenIdData.email_hmac.substring(0, 20)}...)` : '❌ NO EXISTE');
      console.log('  - email_captured_at:', tokenIdData.email_captured_at || '❌ NO EXISTE');

      console.log('\n📋 TODOS LOS CAMPOS:');
      Object.entries(tokenIdData).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value;
        console.log(`  - ${key}: ${displayValue}`);
      });
    } else {
      console.log('❌ NO HAY DATOS en gift:detail:359');
    }

    // 3. Comparación
    console.log('\n\n📊 COMPARACIÓN DE KEYS');
    console.log('='.repeat(80));
    console.log('gift:detail:383 (giftId)   - Total campos:', Object.keys(giftIdData).length);
    console.log('gift:detail:359 (tokenId)  - Total campos:', Object.keys(tokenIdData).length);

    // 4. DIAGNÓSTICO
    console.log('\n\n🔍 DIAGNÓSTICO');
    console.log('='.repeat(80));

    const hasEmailInGiftId = !!(giftIdData.email_plain || giftIdData.email_encrypted);
    const hasEmailInTokenId = !!(tokenIdData.email_plain || tokenIdData.email_encrypted);

    if (hasEmailInGiftId || hasEmailInTokenId) {
      console.log('✅ EMAIL ENCONTRADO en Redis');

      if (giftIdData.email_plain) {
        console.log(`\n📧 EMAIL PLAIN (giftId key): ${giftIdData.email_plain}`);
      }
      if (tokenIdData.email_plain) {
        console.log(`\n📧 EMAIL PLAIN (tokenId key): ${tokenIdData.email_plain}`);
      }

      if (giftIdData.email_encrypted) {
        console.log('\n🔐 EMAIL ENCRYPTED existe en giftId key');
        console.log('   - Intentando decrypt...');
        try {
          const { decryptEmail } = require('../src/lib/piiEncryption');
          const decrypted = decryptEmail(giftIdData.email_encrypted);
          if (decrypted) {
            console.log(`   ✅ DECRYPTED: ${decrypted}`);
          } else {
            console.log('   ❌ Decryption returned null/empty');
          }
        } catch (error) {
          console.log(`   ❌ Decryption error: ${error.message}`);
        }
      }
    } else {
      console.log('❌ NO SE ENCONTRÓ EMAIL en ninguna key');
      console.log('\n⚠️ POSIBLES CAUSAS:');
      console.log('   1. Los datos nunca se guardaron realmente');
      console.log('   2. Se guardaron pero Redis los perdió');
      console.log('   3. Se guardaron en keys diferentes');
      console.log('   4. Hay un problema de timing (se leen antes de escribirse)');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ VERIFICACIÓN COMPLETA\n');

  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await redis.quit();
  }
}

verifyGift383Email().catch(console.error);

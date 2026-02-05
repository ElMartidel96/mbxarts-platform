# REDIS EMAIL DATA MISSING - INVESTIGATION REPORT
**Gift #364 (giftId=387, tokenId=364)**
**Date**: November 5, 2025
**Status**: 🔴 CRITICAL DATA LOSS CONFIRMED

---

## 📊 PROBLEMA CONFIRMADO

### Evidencia
- ✅ **Vercel logs** muestran saves exitosos:
  - Email saved: `02:37:08` → Status `200` → "✅ PRIMARY STORAGE: Saved to gift:detail:387"
  - Appointment saved: `02:37:49` → Status `200` → "✅ PRIMARY STORAGE: Saved to gift:detail:387"

- ❌ **Redis verification** muestra datos ausentes:
  - `gift:detail:387` NO contiene `email_plain` ni `email_encrypted`
  - `gift:detail:387` NO contiene `appointment_date` ni `appointment_time`
  - `lastUpdated`: `1762330926162` (Nov 5, 02:35:26) - **ANTES de los saves**

### Conclusión Clave
**Los datos fueron guardados con éxito (logs confirmados) pero NO están en Redis actualmente.**

---

## 🕵️ ANÁLISIS DE ROOT CAUSE

### Hipótesis Investigadas

#### ✅ DESCARTADO: Multiple Redis instances
- Redis singleton configurado correctamente en `redisConfig.ts`
- Todas las APIs usan la misma URL/token de Redis
- Test scripts confirman conexión al mismo Redis

#### ✅ DESCARTADO: Background cleanup processes
- No existen CRON jobs
- No existen scheduled functions limpiando gift:detail keys
- No se encontró código DEL en gift:detail

#### ✅ DESCARTADO: TTL (Time-To-Live)
- Test script confirmó que datos de prueba persisten correctamente
- HSET/HGETALL operations funcionan normalmente

#### ✅ DESCARTADO: claim-nft.ts overwriting
- Ya fue corregido con READ-BEFORE-WRITE pattern (commit `7ea178a`)
- Usuario NO completó claim para Gift #364, así que este código no se ejecutó

#### 🔴 HIPÓTESIS PRINCIPAL: **update-gift-reference.ts sobrescribiendo datos**

**Archivo sospechoso**: `/src/pages/api/analytics/update-gift-reference.ts`

**Código problemático** (líneas 42-49):
```typescript
// Check if gift exists
const exists = await redis.exists(giftKey);
if (!exists) {
  // Create minimal entry if doesn't exist
  await redis.hset(giftKey, {
    giftId,
    tokenId: giftId,
    recipientReference: reference || '',
    lastUpdated: Date.now()
  });
}
```

**PROBLEMA**:
1. Si `redis.exists(giftKey)` retorna `0` por timing issue o race condition
2. El código crea una entrada NUEVA con solo 4 campos
3. Esto **SOBRESCRIBE** todos los datos existentes (email, appointment, etc.)

**Evidencia que lo sustenta**:
- `lastUpdated` en Redis es `1762330926162` (02:35:26) - ANTES de los saves
- Si este API se ejecutó DESPUÉS de los saves pero `exists` falló, explicaría todo

---

## 🧪 TESTING REALIZADO

### Scripts Creados

1. **`verify-gift-364.js`** ✅
   - Confirma NO hay email/appointment data en `gift:detail:387`

2. **`deep-verify-gift-364.js`** ✅
   - Verifica TODOS los keys posibles
   - Confirma data NO está en ningún key mirror

3. **`test-redis-write-read.js`** ✅
   - Confirma Redis HSET/HGETALL funcionan correctamente
   - Test data persiste sin problemas

4. **`live-debug-redis-write.js`** 🆕
   - Monitorea cambios en Redis en tiempo real
   - Muestra EXACTAMENTE qué se escribe a Redis

### Resultados
- ✅ Redis funciona correctamente
- ✅ HSET/HGETALL operations OK
- ❌ Data específicamente missing para Gift #387

---

## 🔧 PLAN DE ACCIÓN INMEDIATO

### Fase 1: Verificación (URGENTE)
1. **Revisar logs de Vercel** para `/api/analytics/update-gift-reference`
   - Buscar llamadas cerca de `02:37:08` - `02:37:49`
   - Verificar si se ejecutó para giftId=387

2. **Reproducir el problema**:
   - Crear nuevo gift de prueba
   - Guardar email
   - Guardar appointment
   - Monitorear con `live-debug-redis-write.js`
   - Ver si algún API sobrescribe los datos

### Fase 2: Fixes (SI SE CONFIRMA)

#### Fix 1: update-gift-reference.ts - READ-BEFORE-WRITE
**Archivo**: `/src/pages/api/analytics/update-gift-reference.ts`

**ANTES** (líneas 40-56):
```typescript
// Check if gift exists
const exists = await redis.exists(giftKey);
if (!exists) {
  // Create minimal entry if doesn't exist
  await redis.hset(giftKey, {
    giftId,
    tokenId: giftId,
    recipientReference: reference || '',
    lastUpdated: Date.now()
  });
} else {
  // Update existing entry
  await redis.hset(giftKey, {
    recipientReference: reference || '',
    lastUpdated: Date.now()
  });
}
```

**DESPUÉS** (solución propuesta):
```typescript
// CRITICAL FIX: READ-BEFORE-WRITE to preserve email/education/appointment fields
const existingData = await redis.hgetall(giftKey);

const updates = {
  ...existingData,  // Preserve ALL existing fields
  recipientReference: reference || '',
  lastUpdated: Date.now()
};

// If this is a new gift, add minimal required fields
if (!existingData || Object.keys(existingData).length === 0) {
  updates.giftId = giftId;
  updates.tokenId = giftId;
}

await redis.hset(giftKey, updates);
```

**Tipo de Fix**: TIPO B (1 archivo, no refactoring, preserva funcionalidad)

#### Fix 2: Auditar TODOS los endpoints que usan redis.hset

**Archivos a revisar**:
- ✅ `claim-nft.ts` - Ya corregido
- ✅ `save-email-manual.ts` - Correcto (usa partial updates)
- ✅ `save-appointment.ts` - Correcto (usa partial updates)
- 🔴 `update-gift-reference.ts` - **REQUIERE FIX**
- ⚠️  `education/approve.ts` - Por revisar
- ⚠️  `education/complete-module.ts` - Por revisar
- ⚠️  `analytics/fix-gift-data.ts` - Por revisar
- ✅ `mint-escrow.ts` - Correcto (crea inicial, no sobrescribe)

### Fase 3: Prevención

1. **Documentar patrón obligatorio**:
   - SIEMPRE usar READ-BEFORE-WRITE cuando actualices `gift:detail:*`
   - NUNCA asumir que un key está vacío

2. **Test suite**:
   - Crear test automatizado que simula saves concurrentes
   - Verificar que datos no se pierden

3. **Monitoring**:
   - Añadir alertas cuando `lastUpdated` retrocede en el tiempo
   - Log comprehensivo de TODAS las writes a gift:detail

---

## 📋 INFORMACIÓN PARA DEBUGGING

### Gift #364 Details
- **tokenId**: 364
- **giftId**: 387
- **Email verified**: 02:37:08 (ra***@gmail.com)
- **Appointment saved**: 02:37:49
- **Usuario**: NO completó claim (solo pre-claim flow)

### Redis Keys Verificados
- `gift:detail:387` - ❌ NO email/appointment data
- `gift:detail:364` - ❌ NO data found
- `appointment:gift:387` - ❌ NO data found
- `appointment:gift:364` - ❌ NO data found

### Current Redis State (gift:detail:387)
```json
{
  "transactionHash": "0xec9ce14f7e1aa1c7951d099faa11fbd90117f9faa0ccb1b97f4a4ade8249b638",
  "campaignId": "campaign_0xA362a2",
  "createdAt": "1762330926102",
  "creator": "0xA362a26F6100Ff5f8157C0ed1c2bcC0a1919Df4a",
  "giftId": "387",
  "lastUpdated": "1762330926162",
  "status": "created",
  "tokenId": "364"
}
```

**Campos ausentes**:
- `email_plain` / `email_encrypted`
- `email_captured_at`
- `appointment_date`
- `appointment_time`
- `appointment_meeting_url`

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Usuario debe proporcionar**:
   - Logs completos de Vercel para `/api/analytics/update-gift-reference` cerca de 02:37
   - Confirmar si Analytics page se abrió/refrescó durante el pre-claim flow

2. **Claude debe hacer**:
   - Revisar los otros 3 archivos que usan redis.hset
   - Implementar fix en `update-gift-reference.ts` si se confirma
   - Crear test automatizado de regression

3. **Testing con nuevo gift**:
   - Correr `live-debug-redis-write.js` en paralelo
   - Completar flujo completo (email → appointment → education)
   - Observar EXACTAMENTE qué APIs se ejecutan y cuándo

---

**CONCLUSIÓN**: Altamente probable que `update-gift-reference.ts` esté sobrescribiendo datos. Requiere fix inmediato tipo READ-BEFORE-WRITE similar a claim-nft.ts.

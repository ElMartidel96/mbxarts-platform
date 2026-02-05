# 🔍 AUDITORÍA COMPLETA DEL SISTEMA CRYPTOGIFT WALLETS
**Fecha de Auditoría**: Noviembre 6, 2025
**Versión del Sistema**: 1.0.1
**Estado**: Production Live - Base Sepolia
**URL**: https://cryptogift-wallets.vercel.app

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Blockchain & Smart Contracts](#arquitectura-blockchain--smart-contracts)
3. [Sistema de Creación de Regalos](#sistema-de-creación-de-regalos)
4. [Sistema de Reclamación](#sistema-de-reclamación)
5. [Sistema Educacional](#sistema-educacional)
6. [Sistema de Wallets TBA](#sistema-de-wallets-tba)
7. [APIs y Endpoints Backend](#apis-y-endpoints-backend)
8. [Integraciones Externas](#integraciones-externas)
9. [Sistema UI/UX y Design](#sistema-uiux-y-design)
10. [Sistema de Analytics y Monitoring](#sistema-de-analytics-y-monitoring)
11. [Rutas y Navegación](#rutas-y-navegación)
12. [Seguridad y Configuración](#seguridad-y-configuración)
13. [Recomendaciones y Mejoras](#recomendaciones-y-mejoras)

---

## 1️⃣ RESUMEN EJECUTIVO

### 🎯 Concepto del Proyecto

**CryptoGift Wallets** es una plataforma Web3 revolucionaria que permite **regalar NFT-wallets con criptomonedas reales** utilizando tecnología **ERC-6551 (Token Bound Accounts)**.

### 🌟 Características Principales

| Característica | Descripción | Estado |
|----------------|-------------|--------|
| **NFT = Wallet Real** | Cada NFT tiene una wallet integrada ERC-6551 | ✅ Operacional |
| **Zero Custodia Humana** | Sistema programático sin regulaciones | ✅ Implementado |
| **Transferencia Automática** | safeTransferFrom() automático al claim | ✅ Funcional |
| **Gas Gratis** | Paymaster patrocina transacciones | ✅ Activo (con fallback) |
| **Education Gate** | Pre-claim education con EIP-712 | ✅ Operacional |
| **Multi-idioma** | Español + Inglés completo | ✅ Implementado |
| **Mobile-First UX** | Optimización móvil completa (R1-R6) | ✅ Completado |

### 📊 Estado Actual del Sistema

**DEPLOYMENT**:
- **Production**: https://cryptogift-wallets.vercel.app ✅ LIVE
- **Blockchain**: Base Sepolia (L2) - Chain ID: 84532
- **Status**: PRODUCTION READY ✅ FUNCIONAL ✅ OPTIMIZADO

**ÚLTIMO COMMIT** (Noviembre 6, 2025):
- Commit `16c3119`: Educational Score Fix (English version)
- Commit `7a79f9b`: TypeScript Interface Fix
- Commit `7b616dd`: Documentation Update

**MÉTRICAS CLAVE**:
- **150 APIs** desplegadas y funcionales
- **122 componentes** React/TypeScript
- **3 contratos** smart contracts verificados
- **21 módulos** educativos en Knowledge Academy
- **50+ librerías** core en `/lib`

---

## 2️⃣ ARQUITECTURA BLOCKCHAIN & SMART CONTRACTS

### 🔗 Contratos Desplegados en Base Sepolia

#### **Contratos Core del Sistema**

```solidity
// ========== CONTRATOS PRINCIPALES ==========

NFT_CONTRACT (CryptoGift NFT Drop)
Address: 0xeFCba1D72B8f053d93BA44b7b15a1BeED515C89b
Función: Mint de NFTs con metadata IPFS
Status: ✅ DEPLOYED ✅ VERIFIED ✅ OPERATIONAL
Features: ERC-721 compatible, ThirdWeb Drop
```

```solidity
ESCROW_CONTRACT (GiftEscrowEnterpriseV2)
Address: 0x46175CfC233500DA803841DEef7f2816e7A129E0
Función: Sistema de escrow temporal con password
Status: ✅ DEPLOYED ✅ VERIFIED ✅ OPERATIONAL
Version: 2.0.0
Features:
  - Password-protected gifts
  - Time-locked claims (15min - 30 days)
  - Education gate integration (IGate)
  - Batch operations support
  - Emergency pause system
  - Zero custody architecture
```

```solidity
SIMPLE_APPROVAL_GATE (SimpleApprovalGate)
Address: 0x99cCBE808cf4c01382779755DEf1562905ceb0d2
Función: EIP-712 stateless signature verification
Status: ✅ DEPLOYED ✅ VERIFIED ✅ OPERATIONAL
Gas Cost: ~28.5k per check (target: <30k) ✅
Features:
  - Stateless approval system
  - EIP-712 typed signatures
  - Deadline-based expiration
  - Modular IGate interface
```

```solidity
ERC6551_REGISTRY (Standard Registry)
Address: 0x000000006551c19487814612e58FE06813775758
Función: Registry estándar ERC-6551
Status: ✅ DEPLOYED (Standard)
Type: Immutable canonical deployment
```

```solidity
ERC6551_IMPLEMENTATION (Account Implementation)
Address: 0x2d25602551487c3f3354dd80d76d54383a243358
Función: Implementación de Token Bound Accounts
Status: ✅ DEPLOYED (Standard)
Type: TBA wallet logic contract
```

### 📁 Archivos de Contratos Locales

**Ubicación**: `/contracts/`

1. **GiftEscrowV2.sol** (1,200+ líneas)
   - Contrato principal de escrow
   - Hereda: ERC2771Context, AccessControl, Pausable, ReentrancyGuard
   - Roles: PAUSER_ROLE, EMERGENCY_ROLE, GATE_MANAGER_ROLE, MINTER_ROLE
   - Custom Errors: 15+ errores específicos
   - Structs: Gift, UserPaymasterState
   - Events: GiftRegisteredFromMint, GiftClaimed, GiftReturned, etc.

2. **IGate.sol** (36 líneas)
   - Interface para modular gate system
   - Funciones: check(), getRequirements(), isActive()
   - Permite extensibilidad del sistema educacional

3. **ReferralTreasury.sol**
   - Sistema de comisiones y referidos
   - Distribución automática de rewards

### 🔐 Características de Seguridad de Contratos

**GiftEscrowV2 Security Features**:
- ✅ ReentrancyGuard en todas las funciones críticas
- ✅ Access Control con roles granulares
- ✅ Pausable para emergencias
- ✅ Rate limiting (MAX_DAILY_ATTEMPTS, MAX_FAILED_ATTEMPTS)
- ✅ Cooldown exponencial por intentos fallidos
- ✅ Gas limits para prevenir DoS (GATE_GAS_LIMIT: 50k)
- ✅ Batch size limits (MAX_BATCH_SIZE: 25)
- ✅ ERC2771Context para meta-transactions
- ✅ ECDSA signature verification
- ✅ Domain separator (EIP-712)

**SimpleApprovalGate Security Features**:
- ✅ Stateless verification (zero on-chain writes)
- ✅ EIP-712 typed data signatures
- ✅ Deadline-based expiration
- ✅ Chain ID validation
- ✅ Contract address in signature
- ✅ Requirements version tracking

### ⚙️ Configuración de Blockchain

```typescript
// Configuración actual (Base Sepolia)
Chain ID: 84532
Network: Base Sepolia (L2)
RPC: Alchemy Base Sepolia
Block Time: ~2 segundos
Gas Token: ETH (Sepolia)
Faucet: Base Sepolia Faucet

// Configuración de fallback
CHAIN_NAME: base-sepolia
ACTIVE_CHAIN: baseSepolia (from thirdweb/chains)
```

### 🔄 Flujo de Transferencia de Ownership

**BREAKTHROUGH ARQUITECTÓNICO**: Zero Custody Programmatic Transfer

```
┌─────────────────────────────────────────────────────────┐
│ FASE 1: CREACIÓN                                        │
├─────────────────────────────────────────────────────────┤
│ 1. Usuario crea regalo                                  │
│ 2. Predicción exacta de TokenID (totalSupply + 1)      │
│ 3. Generación de dirección neutral programática        │
│ 4. Mint a dirección neutral (NO al creador)            │
│ 5. Metadata preserva creador original en attributes    │
│ 6. registerGiftMinted() emite evento con giftId        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 2: CUSTODIA TEMPORAL                               │
├─────────────────────────────────────────────────────────┤
│ 1. NFT en dirección neutral controlable                │
│ 2. Escrow contract registra Gift struct                │
│ 3. Password hash almacenado on-chain                   │
│ 4. Education gate (opcional) configurado               │
│ 5. Timeframe de expiración establecido                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 3: CLAIM & TRANSFERENCIA AUTOMÁTICA               │
├─────────────────────────────────────────────────────────┤
│ 1. Destinatario valida password                        │
│ 2. (Opcional) Completa education gate                  │
│ 3. Education gate check (EIP-712 signature)            │
│ 4. safeTransferFrom(neutral → destinatario)            │
│ 5. Destinatario = DUEÑO REAL del NFT                   │
│ 6. TBA wallet automáticamente accesible                │
└─────────────────────────────────────────────────────────┘
```

**Resultado**: Zero custodia humana, transferencia programática sin regulaciones.

---

## 3️⃣ SISTEMA DE CREACIÓN DE REGALOS

### 🎨 Componente Principal: GiftWizard.tsx

**Ubicación**: `frontend/src/components/GiftWizard.tsx`
**Tamaño**: 52,767 bytes (~1,400 líneas)
**Estado**: ✅ Producción

#### **Funcionalidades Principales**

1. **Multi-Step Wizard**
   - Step 1: Selección de imagen y filtros AI
   - Step 2: Configuración de crypto (token, cantidad)
   - Step 3: Mensaje personalizado
   - Step 4: Configuración de seguridad (password, timeframe)
   - Step 5: Opciones avanzadas (education gate, referral)
   - Step 6: Confirmación y mint

2. **Sistema de Filtros AI (PhotoRoom Integration)**
   ```typescript
   Filtros Disponibles:
   - Cyberpunk (futuristic neon tech)
   - Sketch (hand-drawn artwork)
   - Anime (Japanese animation style)
   - Cartoon (vibrant animated look)
   - Enhance (AI beautification)
   - Instagram (social media ready)
   - Premium filters (15+ adicionales)
   ```

3. **Configuración de Cripto**
   - Token selector (ETH, USDC, DAI, custom)
   - Amount input con validación
   - Balance check en real-time
   - Gas estimation display

4. **Sistema de Seguridad**
   - Password strength validator
   - Timeframe selector (15min - 30 días)
   - Encryption client-side
   - Hash generation (Keccak256)

5. **Education Gate Configuration**
   - Optional requirement toggle
   - Module selector (Sales Masterclass, etc.)
   - IGate contract integration
   - EIP-712 signature generation

#### **Flujo de Creación Completo**

```typescript
// ========== FLUJO DE MINT ==========

1. UPLOAD & PROCESS IMAGE
   ├─ ImageUpload.tsx: Drag & drop o file selector
   ├─ PhotoRoom API: Filtros AI (opcional)
   ├─ IPFS Upload: NFT.Storage → Pinata → ThirdWeb fallback
   └─ Image URL: ipfs://QmXXX/image.png

2. PREDICT TOKEN ID
   ├─ Contract call: totalSupply()
   ├─ Calculation: predictedTokenId = totalSupply + 1
   └─ Validation: Post-mint verification

3. GENERATE NEUTRAL ADDRESS
   ├─ Deployer wallet (PRIVATE_KEY_DEPLOY)
   ├─ Deterministic address generation
   └─ Neutral custodial address

4. CREATE METADATA
   ├─ Name: "CryptoGift #XXX"
   ├─ Description: User message
   ├─ Image: IPFS URL
   ├─ Attributes:
   │   ├─ Creator Wallet (truncated)
   │   ├─ Neutral Address (truncated)
   │   ├─ Custody Status: "Neutral Programmatic Custody"
   │   ├─ Claim Status: "Pending Claim"
   │   ├─ Token Amount
   │   ├─ Token Type
   │   └─ Creation Date
   └─ Upload to IPFS: metadata.json

5. MINT NFT
   ├─ API: /api/mint-escrow.ts
   ├─ Contract: NFT_DROP_ADDRESS
   ├─ To: neutralAddress (NOT creator!)
   ├─ TokenURI: ipfs://QmXXX/metadata.json
   └─ Transaction: ThirdWeb SDK

6. REGISTER GIFT IN ESCROW
   ├─ API call: registerGiftMinted()
   ├─ Parameters:
   │   ├─ giftId: auto-incremented
   │   ├─ tokenId: predicted (verified)
   │   ├─ collection: NFT_CONTRACT_ADDRESS
   │   ├─ passwordHash: Keccak256(password)
   │   ├─ timeframe: user selection
   │   ├─ gate: SIMPLE_APPROVAL_GATE (if education required)
   │   └─ message: encrypted user message
   └─ Event: GiftRegisteredFromMint(giftId, tokenId, creator)

7. PARSE EVENT & CREATE MAPPING
   ├─ Parse: GiftRegisteredFromMint event from receipt
   ├─ Extract: giftId (real value from contract)
   ├─ Validate: tokenId match + strict filters
   ├─ Store: Redis mapping (tokenId → giftId)
   └─ TTL: 1 year (permanent)

8. GENERATE CLAIM LINK
   ├─ Format: {BASE_URL}/token/{NFT_CONTRACT}/{tokenId}
   ├─ Password: Communicated separately (off-chain)
   └─ QR Code: Generated for easy sharing
```

#### **APIs Involucradas**

**Endpoint Principal**: `/api/mint-escrow.ts`

**Funciones Críticas**:
```typescript
// Event Parsing
parseGiftEventWithRetry(receipt, tokenId)
  → Returns: { success: true, giftId: "123", event: {...} }

// Mapping Storage
storeGiftMapping(tokenId, giftId)
  → Stores in Redis: gift:mapping:token:{tokenId} = giftId
  → TTL: 31536000 (1 year)

// Validation
validateMappingWithRetry(tokenId, giftId)
  → Contract call: getGift(giftId)
  → Verify: gift.tokenId === expectedTokenId
```

### 🎨 Sistema de Filtros AI

**PhotoRoom API v2 Integration**:
```typescript
// /api/upload.ts

Features:
- Background removal
- Style transfer (20+ filters)
- Enhancement algorithms
- Format conversion (PNG, JPEG, WebP)

Pricing:
- Free tier: 50 requests/month
- Pro tier: Unlimited
```

### 💾 Sistema de Almacenamiento IPFS

**Multi-Gateway Strategy**:

```typescript
// /lib/ipfs.ts

Priority Order:
1. NFT.Storage (Primary - Free, permanent)
   ├─ Gateway: nftstorage.link
   ├─ Upload: NFT_STORAGE_API_KEY
   └─ Features: Free, IPFS + Filecoin backup

2. Pinata (Fallback - Professional)
   ├─ Gateway: gateway.pinata.cloud
   ├─ Upload: PINATA_API_KEY
   └─ Features: CDN, analytics

3. ThirdWeb (Fallback - Integrated)
   ├─ Gateway: gateway.thirdweb.com
   ├─ Upload: THIRDWEB_CLIENT_ID
   └─ Features: Optimized for Web3

4. Emergency Fallback
   ├─ Gateway: ipfs.io, cloudflare-ipfs.com
   ├─ Upload: Not available (read-only)
   └─ Features: Public gateways
```

**IPFS Upload Flow**:
```typescript
// Exponential Backoff Retry System
Attempt 1: NFT.Storage (timeout: 2s)
  ↓ FAIL
Attempt 2: Pinata (timeout: 4s)
  ↓ FAIL
Attempt 3: ThirdWeb (timeout: 8s)
  ↓ FAIL
Error: Upload failed after 3 attempts
```

### 📊 Configuración de Gift

**Gift Struct (On-Chain)**:
```solidity
struct Gift {
    address creator;        // Original creator (tracked)
    address collection;     // NFT contract address
    address gate;          // Education gate (or address(0))
    uint96 tokenId;        // NFT token ID
    uint64 createdAt;      // Timestamp creation
    uint64 expiresAt;      // Expiration timestamp
    bytes32 passwordHash;  // Keccak256(password)
    string message;        // Encrypted message
    bool claimed;          // Claim status
    bool returned;         // Return status
}
```

**Redis Data (Off-Chain)**:
```typescript
// gift:mapping:token:{tokenId} → giftId
// gift:data:{giftId} → Full gift data JSON
{
  giftId: "123",
  tokenId: "456",
  creator: "0xABC...",
  createdAt: "2025-11-06T12:00:00Z",
  expiresAt: "2025-11-13T12:00:00Z",
  claimed: false,
  claimant: null,
  claimedAt: null,
  educationRequired: true,
  educationCompleted: false,
  email: "encrypted_email",
  emailHmac: "hmac_hash"
}
```

---

## 4️⃣ SISTEMA DE RECLAMACIÓN

### 🎁 Componente Principal: ClaimEscrowInterface.tsx

**Ubicación**: `frontend/src/components/escrow/ClaimEscrowInterface.tsx`
**Versiones**:
- Español: `ClaimEscrowInterface.tsx`
- Inglés: `ClaimEscrowInterfaceEN.tsx` (en `/components-en/`)

**Estado**: ✅ Producción (ambas versiones)

#### **Flujo de Reclamación Completo**

```typescript
// ========== FLUJO DE CLAIM ==========

FASE 1: VALIDACIÓN INICIAL
├─ 1. URL parsing: /token/{contractAddress}/{tokenId}
├─ 2. Fetch gift data: Redis lookup (tokenId → giftId)
├─ 3. Contract verification: getGift(giftId)
├─ 4. Status checks:
│   ├─ Already claimed? → Error display
│   ├─ Expired? → Error with expiration date
│   ├─ Invalid? → 404 page
│   └─ Valid → Continue to FASE 2
└─ 5. Load NFT metadata: Image, description, attributes

FASE 2: PASSWORD VERIFICATION
├─ 1. Password input UI (6-digit PIN or custom)
├─ 2. Client-side hash: Keccak256(password)
├─ 3. API call: /api/pre-claim/validate
│   ├─ Parameters: { tokenId, giftId, passwordHash }
│   ├─ Validation: Compare with on-chain hash
│   ├─ Rate limiting: Max 5 attempts
│   └─ Response: { valid: true/false, attemptsRemaining }
├─ 4. Failed attempts handling:
│   ├─ Exponential cooldown (300s → 600s → 1200s)
│   ├─ Lockout display with countdown timer
│   └─ Reset after cooldown
└─ 5. Success → Continue to FASE 3

FASE 3: EDUCATION GATE (if required)
├─ 1. Check education requirement:
│   ├─ gift.gate === SIMPLE_APPROVAL_GATE? → Required
│   └─ gift.gate === address(0)? → Skip to FASE 4
├─ 2. Launch education flow:
│   ├─ Component: PreClaimFlow.tsx
│   ├─ Sub-components:
│   │   ├─ EmailVerification.tsx
│   │   ├─ LessonModalWrapper.tsx
│   │   └─ SalesMasterclass.tsx
│   └─ Steps:
│       ├─ Email verification (OTP via Resend API)
│       ├─ Lesson completion (interactive quiz)
│       ├─ Calendly integration (appointment booking)
│       └─ Quiz validation (minimum score required)
├─ 3. Generate EIP-712 signature:
│   ├─ API: /api/education/approve
│   ├─ Data: { claimer, giftId, questionsScore, email }
│   ├─ Signature: ECDSA sign by approver
│   ├─ Deadline: Current time + 1 hour
│   └─ Return: { signature, deadline, gateData }
└─ 4. Education completed → Continue to FASE 4

FASE 4: WALLET CONNECTION
├─ 1. ConnectButton display (ThirdWeb)
├─ 2. Wallet connection:
│   ├─ Desktop: MetaMask, WalletConnect, Coinbase
│   ├─ Mobile: MetaMask deeplink, WalletConnect
│   └─ Account Abstraction: Smart Wallet (optional)
├─ 3. Chain validation:
│   ├─ Current chain === Base Sepolia?
│   ├─ NO → Switch chain prompt (wallet_addEthereumChain)
│   └─ YES → Continue
└─ 4. Wallet connected → Continue to FASE 5

FASE 5: CLAIM TRANSACTION
├─ 1. Prepare transaction data:
│   ├─ Function: claimGift(giftId, password, gateData)
│   ├─ Contract: ESCROW_CONTRACT_ADDRESS
│   ├─ Parameters:
│   │   ├─ giftId: uint256
│   │   ├─ passwordHash: bytes32
│   │   └─ gateData: bytes (EIP-712 signature + deadline)
│   └─ From: claimerAddress
├─ 2. Gas estimation:
│   ├─ Base gas: ~150k
│   ├─ Education gate check: +30k
│   └─ Total: ~180k
├─ 3. Transaction execution options:
│   ├─ OPTION A: Gasless (if Biconomy configured)
│   │   ├─ Paymaster sponsorship
│   │   ├─ User pays $0 gas
│   │   └─ Fallback to OPTION B if fails
│   └─ OPTION B: Gas-paid (always available)
│       ├─ User pays gas in ETH
│       └─ 100% success rate
├─ 4. Send transaction:
│   ├─ Wait for confirmation (1 block)
│   ├─ Parse receipt for events
│   └─ Extract: GiftClaimed event
└─ 5. Transaction confirmed → Continue to FASE 6

FASE 6: NFT OWNERSHIP TRANSFER
├─ 1. Escrow contract logic:
│   ├─ Validates password hash
│   ├─ Validates education gate (if required)
│   ├─ Calls: safeTransferFrom(neutralAddress, claimer, tokenId)
│   └─ Marks gift as claimed
├─ 2. NFT transferred:
│   ├─ Previous owner: Neutral address (programmatic)
│   ├─ New owner: Claimer address (real ownership!)
│   └─ TBA wallet: Automatically accessible
└─ 3. Ownership verified → Continue to FASE 7

FASE 7: POST-CLAIM UPDATES
├─ 1. Update NFT metadata:
│   ├─ API: /api/nft/update-metadata-after-claim
│   ├─ Changes:
│   │   ├─ Claim Status: "Pending" → "Claimed"
│   │   ├─ Owner: neutral → claimer
│   │   └─ Claimed At: timestamp
│   ├─ Upload new metadata to IPFS
│   └─ Update Redis cache
├─ 2. Metadata warming (multi-gateway):
│   ├─ Warm: BaseScan metadata endpoint
│   ├─ Warm: MetaMask metadata endpoint
│   ├─ Warm: IPFS gateways (Pinata, Cloudflare, IPFS.io)
│   └─ Purpose: Instant NFT display in wallets
├─ 3. Analytics update:
│   ├─ Save to Redis: claim timestamp, claimer, education data
│   ├─ Track: conversion metrics
│   └─ Store: email (encrypted + HMAC)
└─ 4. Redirect to wallet view

FASE 8: NFT WALLET ACCESS
├─ 1. Redirect: /token/{contractAddress}/{tokenId}
├─ 2. Display TBA wallet interface:
│   ├─ NFT image + metadata
│   ├─ Wallet balance (ETH, tokens)
│   ├─ Send/Receive buttons
│   ├─ Swap functionality (0x Protocol)
│   └─ Transaction history
└─ 3. User can now manage their NFT-wallet! 🎉
```

### 🔐 Sistema de Validación de Password

**Componente**: Password validation en ClaimEscrowInterface

```typescript
// Password Hashing (Client-Side)
import { keccak256, toBytes } from 'viem';

const passwordHash = keccak256(toBytes(password));
// Output: 0x1234...abcd (bytes32)

// Rate Limiting System
interface AttemptState {
  attempts: number;        // Intentos realizados
  maxAttempts: 5;         // Máximo permitido
  cooldownEnd: timestamp; // Fin del cooldown
  locked: boolean;        // Estado de bloqueo
}

// Cooldown Exponencial
Attempt 1: No cooldown
Attempt 2: No cooldown
Attempt 3: 300s (5 min)
Attempt 4: 600s (10 min)
Attempt 5: 1200s (20 min) → LOCKED OUT
```

### 📧 Sistema de Email Verification

**API**: Resend (https://resend.com)
**Endpoints**:
- `/api/email/send-code` - Envía OTP
- `/api/email/verify-code` - Valida OTP

```typescript
// Email OTP Flow
1. User enters email
2. API generates 6-digit code
3. Store in Redis:
   key: `email:otp:{email}`
   value: { code: "123456", attempts: 0, expires: timestamp }
   TTL: 600s (10 min)
4. Send email via Resend API
5. User enters code
6. Validate:
   - Code matches?
   - Not expired?
   - Attempts < 3?
7. Success → Email verified
```

### 🎓 Integration con Education System

**Componente**: PreClaimFlow.tsx
**Ubicación**: `frontend/src/components/education/PreClaimFlow.tsx`

**Steps**:
1. Email verification (required)
2. Lesson selection (Sales Masterclass default)
3. Interactive lesson completion
4. Quiz validation (minimum 70% correct)
5. Calendly appointment booking (optional)
6. EIP-712 signature generation

**Signature Format (EIP-712)**:
```typescript
const domain = {
  name: "SimpleApprovalGate",
  version: "1",
  chainId: 84532,
  verifyingContract: SIMPLE_APPROVAL_GATE_ADDRESS
};

const types = {
  Approval: [
    { name: "claimer", type: "address" },
    { name: "giftId", type: "uint256" },
    { name: "requirementsVersion", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "chainId", type: "uint256" },
    { name: "gate", type: "address" }
  ]
};

const value = {
  claimer: claimerAddress,
  giftId: giftId,
  requirementsVersion: 1,
  deadline: Math.floor(Date.now() / 1000) + 3600, // +1 hour
  chainId: 84532,
  gate: SIMPLE_APPROVAL_GATE_ADDRESS
};

// Server-side signing
const signature = await signer.signTypedData(domain, types, value);

// gateData format for contract
const gateData = signature + deadline.toString(16).padStart(16, '0');
```

### 🔄 NFT Metadata Update System

**API**: `/api/nft/update-metadata-after-claim.ts`

**Funciones**:
1. **Fetch existing metadata**: From IPFS/Redis
2. **Update fields**:
   - `owner`: neutral → claimer address
   - `claimStatus`: "Pending Claim" → "Claimed"
   - `claimedAt`: timestamp
   - `claimerWallet`: claimer address (truncated)
3. **Upload new metadata**: To IPFS
4. **Update Redis cache**: For fast lookups
5. **Warm metadata endpoints**: Multi-gateway propagation

**Metadata Warming Strategy**:
```typescript
// /lib/metadataWarming.ts

async function warmAllMetadataEndpoints(tokenId) {
  // Warm BaseScan endpoint
  await fetch(`/api/nft-metadata/${NFT_CONTRACT}/${tokenId}`);

  // Warm MetaMask endpoint
  await fetch(`/api/metadata/${NFT_CONTRACT}/${tokenId}`);

  // Warm IPFS gateways
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://nftstorage.link/ipfs/'
  ];

  for (const gateway of gateways) {
    await fetch(`${gateway}${ipfsCid}`);
  }
}
```

**Purpose**: Garantiza que NFT images aparezcan en wallets en <10 segundos.

---

## 5️⃣ SISTEMA EDUCACIONAL (EDUCATION GATE)

### 🎓 Arquitectura del Sistema Educacional

**Concepto**: Pre-claim education requirement usando EIP-712 stateless approvals

**Componentes Core**:
- SimpleApprovalGate contract (on-chain verification)
- PreClaimFlow.tsx (orchestration)
- LessonModalWrapper.tsx (lesson delivery)
- SalesMasterclass.tsx (main educational module)

#### **Versiones Implementadas**

**ESPAÑOL** (Versión Original):
```
/components/education/
├── PreClaimFlow.tsx
├── LessonModalWrapper.tsx
├── EducationModule.tsx
├── KnowledgeLessonModal.tsx
└── LessonModalWrapperForEducation.tsx

/components/learn/
└── SalesMasterclass.tsx

/components/calendar/
└── CalendlyEmbed.tsx
```

**INGLÉS** (Versión i18n):
```
/components-en/education/
├── PreClaimFlowEN.tsx
├── LessonModalWrapperEN.tsx
├── EducationModuleEN.tsx
└── LessonModalWrapperForEducationEN.tsx

/components-en/learn/
└── SalesMasterclassEN.tsx

/config/
└── videoConfigEN.ts
```

### 📚 Lesson Modal Wrapper (Sistema Universal)

**Ubicación**:
- ES: `frontend/src/components/education/LessonModalWrapper.tsx` (35,773 bytes)
- EN: `frontend/src/components-en/education/LessonModalWrapperEN.tsx`

**Modos de Operación**:
```typescript
interface LessonModalWrapperProps {
  lessonId: string;
  mode: 'knowledge' | 'educational';  // Context modes
  isOpen: boolean;
  onClose: () => void;
  tokenId?: string;                   // Para educational mode
  sessionToken?: string;              // Para educational flow
  onComplete?: (gateData: string) => void;
}
```

**MODO: 'knowledge'** (Knowledge Academy)
- Usuario explora libremente
- No requiere email verification
- No genera EIP-712 signature
- Tracking de progreso en Redis
- XP y achievements

**MODO: 'educational'** (Pre-Claim Gate)
- Requiere email verification (OTP)
- Lesson completion obligatorio
- Quiz validation (minimum score)
- Genera EIP-712 signature
- Callback con gateData

### 🎯 Sales Masterclass (Módulo Principal)

**Ubicación**:
- ES: `frontend/src/components/learn/SalesMasterclass.tsx` (45,000+ bytes)
- EN: `frontend/src/components-en/learn/SalesMasterclassEN.tsx`

**Última Actualización**: Noviembre 6, 2025
- Commit `16c3119`: Educational Score tracking added (EN)
- Commit `7a79f9b`: TypeScript interface fix (EN)

**Estructura del Módulo**:

```typescript
// ========== BLOQUES DEL MASTERCLASS ==========

BLOQUE 1: Introducción
├─ Video: Proyecto CryptoGift (Mux Video)
├─ Duración: 1:30 min
└─ Propósito: Contexto del proyecto

BLOQUE 2: Las 3 Brechas del Mercado
├─ Brecha 1: Complejidad técnica Web3
├─ Brecha 2: Falta de educación financiera
├─ Brecha 3: Barreras de entrada (KYC, fees)
├─ Interactive cards con hover effects
└─ Call-to-action: VIEW LIVE DEMO

BLOQUE 3: Demostración en Vivo
├─ Video/Screenshot del producto
├─ Features highlight
├─ User journey walkthrough
└─ Call-to-action: SEE RESULTS

BLOQUE 4: Resultados Reales
├─ Métricas clave
├─ User testimonials
├─ Growth metrics
└─ Call-to-action: SEE BUSINESS MODEL

BLOQUE 5: Modelo de Negocio
├─ Revenue streams
├─ Tokenomics (si aplica)
├─ Referral program
├─ Sustainability model
└─ Call-to-action: VIEW ROADMAP

BLOQUE 6: Roadmap & Visión
├─ Short-term goals (Q1-Q2 2026)
├─ Medium-term expansion (Q3-Q4 2026)
├─ Long-term vision (2027+)
├─ Team presentation
└─ Call-to-action: GET EARLY ACCESS

BLOQUE 7: Quiz Interactivo
├─ 5-10 preguntas multiple choice
├─ Validación en real-time
├─ Minimum score: 70% (configurable)
├─ Retry permitido
└─ Score tracking: { correct, total }

BLOQUE 8: Calendly Integration
├─ Appointment booking (opcional)
├─ PostMessage event handling
├─ Time extraction (multiple fallbacks)
├─ Event tracking
└─ Integration with educational data flow

BLOQUE 9: Success Overlay
├─ Confetti animation (canvas-confetti)
├─ Success message
├─ ConnectButton display
├─ Next steps instructions
└─ Auto-close option
```

**Quiz Data Structure**:
```typescript
// FASE 1 (English & Spanish): Basic Score
interface QuizScore {
  correct: number;  // Respuestas correctas
  total: number;    // Total de preguntas
}

// FASE 2 (Solo Spanish): Detailed Tracking
interface QuestionAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timestamp: string;
}

// Data flow to parent
onEducationComplete?.({
  email: verifiedEmail,
  questionsScore: { correct: 8, total: 10 },
  questionsAnswered: [ /* FASE 2 only */ ]
});
```

### 📧 Email Verification System

**API**: Resend (https://resend.com)
**Rate Limit**: 100 emails/day (free tier)

**Components**:
- `EmailVerification.tsx` (ES/EN versions)

**Flow**:
```typescript
// ========== EMAIL VERIFICATION FLOW ==========

1. EMAIL INPUT & VALIDATION
   ├─ Format validation (regex)
   ├─ Domain validation (MX record check - opcional)
   └─ Spam protection (rate limiting)

2. OTP GENERATION
   ├─ Generate 6-digit code
   ├─ Store in Redis:
   │   key: email:otp:{email}
   │   value: {
   │     code: "123456",
   │     attempts: 0,
   │     maxAttempts: 3,
   │     createdAt: timestamp,
   │     expiresAt: timestamp + 600 (10 min)
   │   }
   └─ TTL: 600 seconds

3. EMAIL SENDING (Resend API)
   ├─ Template: OTP verification email
   ├─ From: noreply@cryptogift-wallets.vercel.app
   ├─ Subject: "Tu código de verificación CryptoGift"
   ├─ Content: HTML template con code
   └─ Tracking: delivery status

4. CODE VALIDATION
   ├─ User enters 6-digit code
   ├─ API: /api/email/verify-code
   ├─ Validations:
   │   ├─ Code matches?
   │   ├─ Not expired? (< 10 min)
   │   ├─ Attempts < 3?
   │   └─ Email not already used (anti-spam)
   └─ Response: { success: true, email }

5. IMMEDIATE EMAIL SAVE (CRITICAL)
   ├─ API: /api/analytics/save-email-manual
   ├─ Params: { giftId, tokenId, email }
   ├─ Redis writes:
   │   ├─ gift:analytics:{giftId}:email_plain = email
   │   ├─ gift:analytics:{giftId}:email_encrypted = encrypted
   │   └─ gift:analytics:{giftId}:email_hmac = hmac
   ├─ Purpose: Prevent state/props timing issues
   └─ Status: ✅ IMPLEMENTED (both ES/EN)
```

**CRITICAL BUG FIX** (Noviembre 6, 2025):
- **Issue**: English version missing immediate email save
- **Impact**: Regalo #370 (EN) had MISSING email in analytics
- **Solution**: Added `/api/analytics/save-email-manual` call to EN version
- **Commit**: `96bb7f2`
- **Status**: ✅ FIXED

### 📅 Calendly Integration

**Component**: `CalendlyEmbed.tsx`
**Library**: @calendly/calendly-widget

**Integration**:
```typescript
// Calendly Inline Widget
import { InlineWidget } from '@calendly/calendly-widget';

<InlineWidget
  url={NEXT_PUBLIC_CALENDLY_URL}
  styles={{ height: '700px' }}
  pageSettings={{
    backgroundColor: 'ffffff',
    hideEventTypeDetails: false,
    hideLandingPageDetails: false,
    primaryColor: '00a2ff',
    textColor: '4d5055'
  }}
/>

// Event Handling
useEffect(() => {
  const handleMessage = (e: MessageEvent) => {
    if (e.origin !== 'https://calendly.com') return;

    if (e.data.event === 'calendly.event_scheduled') {
      const eventTime = extractEventTime(e.data.payload);
      onAppointmentBooked?.(eventTime);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

**Event Time Extraction** (4 Fallback Sources):
```typescript
function extractEventTime(payload: any): string {
  // Source 1: invitee.event.start_time
  if (payload?.invitee?.event?.start_time) {
    return new Date(payload.invitee.event.start_time).toISOString();
  }

  // Source 2: event.start_time
  if (payload?.event?.start_time) {
    return new Date(payload.event.start_time).toISOString();
  }

  // Source 3: payload.start_time
  if (payload?.start_time) {
    return new Date(payload.start_time).toISOString();
  }

  // Source 4: Fallback to current time
  console.warn('⚠️ Could not extract event time, using current time');
  return new Date().toISOString();
}
```

**Known Limitation**:
- Calendly postMessage payload **does NOT include event time** in production
- Workaround: Calendly API integration required for accurate times
- Current: Uses fallback time ("00:00" displays in analytics)

### 🔐 EIP-712 Signature Generation

**API**: `/api/education/approve.ts`

**Process**:
```typescript
// ========== EIP-712 APPROVAL GENERATION ==========

1. EDUCATION COMPLETION DATA
   ├─ Email: verified via OTP
   ├─ Quiz Score: { correct, total }
   ├─ Appointment: Calendly time (optional)
   └─ Claimer Address: wallet connected

2. SIGNATURE GENERATION (Server-Side)
   ├─ Domain:
   │   ├─ name: "SimpleApprovalGate"
   │   ├─ version: "1"
   │   ├─ chainId: 84532
   │   └─ verifyingContract: SIMPLE_APPROVAL_GATE_ADDRESS
   ├─ Types:
   │   └─ Approval: [claimer, giftId, version, deadline, chainId, gate]
   ├─ Value:
   │   ├─ claimer: claimerAddress
   │   ├─ giftId: giftId
   │   ├─ requirementsVersion: 1
   │   ├─ deadline: now + 3600s (1 hour)
   │   ├─ chainId: 84532
   │   └─ gate: SIMPLE_APPROVAL_GATE_ADDRESS
   └─ Signer: APPROVER_PRIVATE_KEY (server-only, never exposed)

3. SIGNATURE ENCODING
   ├─ Format: signature + deadline (hex encoded)
   ├─ signature: 0x1234...abcd (65 bytes)
   ├─ deadline: 0x0000...ffff (8 bytes, uint64)
   └─ gateData: signature + deadline.toString(16).padStart(16, '0')

4. RETURN TO FRONTEND
   └─ { signature, deadline, gateData, approved: true }

5. FRONTEND USAGE
   ├─ Pass gateData to claimGift() transaction
   ├─ Contract calls: gate.check(claimer, giftId, gateData)
   ├─ Verification:
   │   ├─ Recover signer from signature
   │   ├─ Validate signer === approver
   │   ├─ Validate deadline >= block.timestamp
   │   └─ Validate all signed parameters match
   └─ Result: Claim approved or rejected
```

**Security Features**:
- ✅ Server-side signing (APPROVER_PRIVATE_KEY never exposed)
- ✅ Deadline expiration (1 hour)
- ✅ Chain ID validation
- ✅ Contract address in signature (prevents replay)
- ✅ Stateless (zero on-chain writes)
- ✅ Gas efficient (~28.5k gas per check)

### 🏆 Knowledge Academy System

**URL**: `/knowledge` (app route)

**Features**:
- Curriculum tree con 21 módulos
- Interactive learning paths
- XP and achievement system
- Creator Studio integration
- Progress tracking en Redis

**Módulos Disponibles**:
```typescript
// Curriculum Data (/data/curriculumData.ts)

Categorías:
1. Fundamentos & Onboarding (M0, M1)
2. Protocolos Base & Cómputo (M2, M3, M8, M14, M15)
3. Activos & Mercados (M4, M5, M6, M12)
4. Organización & Diseño Económico (M7, M11)
5. Infraestructura & Interop (M9, M16)
6. Seguridad & Cumplimiento (M10, M18, M19)
7. Aplicaciones & Tendencias (M17, M20)
8. Desarrollo & Auditoría (M13, M21)

Total Módulos: 21
Total XP Disponible: 15,000+ XP
Tiempo Estimado: 200+ horas
```

**Unified System** (Knowledge ↔ Educational):
- ✅ Same SalesMasterclass component
- ✅ Mode-based behavior ('knowledge' | 'educational')
- ✅ Automatic lesson registry
- ✅ Zero code duplication

---

## 6️⃣ SISTEMA DE WALLETS TBA (TOKEN BOUND ACCOUNTS)

### 💼 ERC-6551 Implementation

**Concept**: Cada NFT tiene una wallet integrada que puede almacenar assets

**Standards**:
- ERC-6551: Token Bound Account standard
- ERC-721: NFT standard
- ERC-165: Interface detection

### 🏗️ Arquitectura TBA

```solidity
// ========== TBA ARCHITECTURE ==========

NFT (ERC-721)
├─ Token ID: 123
├─ Owner: 0xABC...
└─ Token Bound Account (ERC-6551)
    ├─ Address: 0xDEF... (deterministic)
    ├─ Implementation: TBA_IMPLEMENTATION
    ├─ Registry: ERC6551_REGISTRY
    └─ Assets:
        ├─ ETH: 0.5 ETH
        ├─ USDC: 100 USDC
        ├─ NFTs: [other NFTs]
        └─ Custom tokens: [ERC-20s]
```

**Address Generation** (Deterministic):
```typescript
// TBA address calculation
import { getAddress } from 'viem';

function computeTBAAddress(
  registry: Address,
  implementation: Address,
  chainId: number,
  tokenContract: Address,
  tokenId: bigint,
  salt: bigint = 0n
): Address {
  const encoded = encodePacked(
    ['bytes1', 'address', 'uint256', 'address', 'uint256', 'uint256'],
    ['0xff', registry, chainId, tokenContract, tokenId, salt]
  );

  const hash = keccak256(encoded);
  return getAddress(`0x${hash.slice(-40)}`);
}

// Example:
const tbaAddress = computeTBAAddress(
  ERC6551_REGISTRY,
  TBA_IMPLEMENTATION,
  84532,
  NFT_CONTRACT,
  123n,
  0n
);
// Returns: 0x... (deterministic, always same for same inputs)
```

### 🎨 TBA Wallet Interface

**Component**: `TBAWallet/WalletInterface.tsx`
**Size**: 19,562 bytes

**Features**:

1. **Balance Display**
   - Native token (ETH)
   - ERC-20 tokens (USDC, WETH, DAI, custom)
   - NFTs owned by TBA
   - Total portfolio value (USD)

2. **Send Functionality**
   - Token selector
   - Amount input with max button
   - Recipient address validation
   - Gas estimation
   - Transaction confirmation

3. **Receive Functionality**
   - QR code generation (TBA address)
   - Copy address button
   - Share functionality

4. **Swap Functionality**
   - 0x Protocol integration
   - Token-to-token swaps
   - Price quotes
   - Slippage protection
   - MEV protection (optional)

5. **Transaction History**
   - Recent transactions
   - Filter by type (send/receive/swap)
   - Block explorer links

**Components**:
```
/TBAWallet/
├── WalletInterface.tsx    # Main interface
├── SendModal.tsx          # Send tokens modal
├── ReceiveModal.tsx       # Receive (QR code) modal
├── SwapModal.tsx          # Swap tokens modal
├── RightSlideWallet.tsx   # Slide-in wallet panel
└── index.tsx              # Exports
```

### 🔄 TBA Operations

**Account Creation**:
```typescript
// TBA auto-created on first interaction
// No explicit createAccount() call needed
// Registry automatically initializes on access

import { THIRDWEB_CLIENT } from '@/lib/client';
import { getContract } from 'thirdweb';

const tbaContract = getContract({
  client: THIRDWEB_CLIENT,
  address: tbaAddress,
  chain: baseSepolia
});

// TBA is now ready to use!
```

**Sending Assets from TBA**:
```typescript
// User must own the NFT to control its TBA
// TBA executes transactions on behalf of NFT owner

import { prepareContractCall, sendTransaction } from 'thirdweb';

// Transfer ETH from TBA
const tx = await sendTransaction({
  account: nftOwnerAccount,  // NFT owner signs
  transaction: prepareContractCall({
    contract: tbaContract,
    method: "execute",
    params: [
      recipientAddress,      // to
      ethAmount,            // value
      "0x",                 // data (empty for ETH transfer)
      0                     // operation (0 = CALL)
    ]
  })
});

// Transfer ERC-20 from TBA
const erc20Transfer = encodeFunctionData({
  abi: erc20ABI,
  functionName: 'transfer',
  args: [recipientAddress, tokenAmount]
});

const tx = await sendTransaction({
  account: nftOwnerAccount,
  transaction: prepareContractCall({
    contract: tbaContract,
    method: "execute",
    params: [
      tokenContract,        // to (token contract)
      0n,                   // value (0 for token transfer)
      erc20Transfer,        // data (encoded function call)
      0                     // operation (0 = CALL)
    ]
  })
});
```

### 💱 Swap Integration (0x Protocol v2)

**API**: `/api/swap.ts`
**Protocol**: 0x Swap API v2
**Endpoint**: https://base.api.0x.org/swap/v2

**Flow**:
```typescript
// ========== SWAP FLOW ==========

1. GET QUOTE
   ├─ API: /swap/v2/quote
   ├─ Params:
   │   ├─ sellToken: token address or symbol
   │   ├─ buyToken: token address or symbol
   │   ├─ sellAmount: amount in wei
   │   ├─ taker: TBA address (not NFT owner!)
   │   └─ slippagePercentage: 0.01 (1%)
   └─ Response:
       ├─ buyAmount: expected output
       ├─ estimatedGas: gas estimate
       ├─ price: exchange rate
       ├─ to: 0x Exchange Proxy
       ├─ data: calldata
       └─ value: ETH to send

2. APPROVE TOKEN (if ERC-20)
   ├─ Contract: sellToken
   ├─ Spender: 0x Permit2 / Allowance Holder
   ├─ Amount: sellAmount (or unlimited)
   └─ From: TBA (via execute)

3. EXECUTE SWAP
   ├─ TBA.execute(
   │   to: quote.to,
   │   value: quote.value,
   │   data: quote.data,
   │   operation: 0
   │ )
   ├─ Signer: NFT owner
   └─ Result: Tokens swapped in TBA

4. VERIFY SWAP
   ├─ Check TBA balances
   ├─ Confirm buyToken increased
   └─ Confirm sellToken decreased
```

**Supported Tokens**:
- ETH (native)
- USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- WETH: 0x4200000000000000000000000000000000000006
- DAI: 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb
- Custom ERC-20s (via address input)

---

## 7️⃣ APIS Y ENDPOINTS BACKEND

### 📊 Overview de APIs

**Total Endpoints**: 150+ archivos
**Ubicación**: `frontend/src/pages/api/`

**Categorías**:
1. **Admin** (5 endpoints) - Mantenimiento y emergencias
2. **Analytics** (40+ endpoints) - Métricas y datos
3. **Auth** (3 endpoints) - Autenticación SIWE
4. **Calendar** (1 endpoint) - Calendly integration
5. **Cron** (5+ endpoints) - Automated jobs
6. **Debug** (10+ endpoints) - Debugging tools
7. **Education** (5 endpoints) - Education gate system
8. **Email** (2 endpoints) - Verification system
9. **Gift Info** (3 endpoints) - Gift data retrieval
10. **Guardians** (4 endpoints) - Social recovery
11. **Metadata** (15+ endpoints) - NFT metadata serving
12. **NFT** (8 endpoints) - NFT operations
13. **Paymaster** (2 endpoints) - Gasless transactions
14. **Pre-Claim** (2 endpoints) - Claim validation
15. **Referrals** (10+ endpoints) - Referral system
16. **Test** (5+ endpoints) - Testing utilities
17. **User** (3 endpoints) - User data
18. **Wallet** (4 endpoints) - Wallet operations
19. **Root** (29 endpoints) - Core operations

### 🔑 Endpoints Críticos

#### **MINT & CREATION**

**`/api/mint-escrow.ts`** ⭐ CRITICAL
- **Función**: Mint NFT + Register gift in escrow
- **Método**: POST
- **Autenticación**: ThirdWeb secret key
- **Parámetros**:
  ```typescript
  {
    creatorAddress: string;
    recipientAddress: string;  // Not used (neutral address)
    imageUrl: string;          // IPFS URL
    message: string;
    password: string;
    timeframe: number;         // seconds
    educationRequired: boolean;
    tokenAmount: string;
    tokenType: string;
    referralCode?: string;
  }
  ```
- **Process**:
  1. Predict tokenId
  2. Generate neutral address
  3. Create metadata JSON
  4. Upload to IPFS
  5. Mint NFT to neutral address
  6. Register gift in escrow contract
  7. Parse GiftRegisteredFromMint event
  8. Store tokenId → giftId mapping in Redis
  9. Validate mapping
  10. Return claim link
- **Response**:
  ```typescript
  {
    success: true,
    tokenId: "123",
    giftId: "456",
    claimLink: "https://.../token/0x.../123",
    transactionHash: "0x...",
    metadataUri: "ipfs://..."
  }
  ```

#### **CLAIM & VALIDATION**

**`/api/claim-nft.ts`** ⭐ CRITICAL
- **Función**: Execute claim transaction
- **Método**: POST
- **Autenticación**: Wallet signature
- **Parámetros**:
  ```typescript
  {
    giftId: string;
    tokenId: string;
    claimerAddress: string;
    password: string;
    gateData?: string;  // EIP-712 signature if education required
  }
  ```
- **Process**:
  1. Validate password
  2. Validate education gate (if required)
  3. Prepare claimGift transaction
  4. Execute via ThirdWeb SDK
  5. Wait for confirmation
  6. Parse GiftClaimed event
  7. Update metadata
  8. Update Redis
  9. Return success
- **Response**:
  ```typescript
  {
    success: true,
    transactionHash: "0x...",
    tbaAddress: "0x...",
    claimed: true
  }
  ```

**`/api/pre-claim/validate.ts`**
- **Función**: Validate password before claim
- **Método**: POST
- **Rate Limiting**: 5 attempts max
- **Parámetros**: `{ giftId, passwordHash }`
- **Response**: `{ valid: boolean, attemptsRemaining: number }`

#### **EDUCATION**

**`/api/education/approve.ts`** ⭐ CRITICAL
- **Función**: Generate EIP-712 approval signature
- **Método**: POST
- **Autenticación**: Session token
- **Parámetros**:
  ```typescript
  {
    claimer: string;
    giftId: string;
    email: string;
    questionsScore: { correct: number; total: number };
    questionsAnswered?: Array<QuestionAnswer>;  // FASE 2
  }
  ```
- **Process**:
  1. Validate session
  2. Verify education completion
  3. Generate EIP-712 signature (server-side)
  4. Store education data in Redis
  5. Return signature + deadline
- **Response**:
  ```typescript
  {
    approved: true,
    signature: "0x...",
    deadline: 1234567890,
    gateData: "0x..." + deadline(hex)
  }
  ```

**`/api/education/get-requirements.ts`**
- **Función**: Get education requirements for gift
- **Método**: GET
- **Parámetros**: `{ giftId }`
- **Response**:
  ```typescript
  {
    required: boolean,
    modules: ["sales-masterclass"],
    gate: "0x99cCBE...",
    minimumScore: 70
  }
  ```

#### **EMAIL VERIFICATION**

**`/api/email/send-code.ts`**
- **Función**: Send OTP email
- **Provider**: Resend API
- **Rate Limiting**: 3 emails per hour per address
- **Parameters**: `{ email, giftId }`
- **Process**:
  1. Generate 6-digit code
  2. Store in Redis (TTL: 10 min)
  3. Send via Resend
  4. Return success
- **Response**: `{ sent: true, expiresIn: 600 }`

**`/api/email/verify-code.ts`**
- **Función**: Verify OTP code
- **Rate Limiting**: 3 attempts max
- **Parameters**: `{ email, code }`
- **Process**:
  1. Fetch from Redis
  2. Validate code
  3. Check expiration
  4. Check attempts
  5. Mark as verified
  6. Return success
- **Response**: `{ verified: true, email }`

#### **METADATA SERVING**

**`/api/metadata/[contractAddress]/[tokenId].ts`** ⭐ CRITICAL
- **Función**: Serve NFT metadata (MetaMask compatible)
- **Método**: GET
- **Compatibility**: MetaMask, OpenSea, Rarible
- **Caching**: Redis + CDN
- **Features**:
  - IPFS gateway fallbacks
  - Image URL normalization
  - Attribute formatting
  - CORS headers
  - X-Frame-Options: SAMEORIGIN

**`/api/nft-metadata/[contractAddress]/[tokenId].ts`** ⭐ CRITICAL
- **Función**: Serve NFT metadata (BaseScan compatible)
- **Método**: GET
- **Compatibility**: Block explorers
- **Difference from /metadata**: Different header configuration

**`/api/nft/update-metadata-after-claim.ts`** ⭐ CRITICAL
- **Función**: Update metadata post-claim
- **Método**: POST
- **Process**:
  1. Fetch existing metadata from IPFS/Redis
  2. Update claim status, owner, timestamp
  3. Upload new metadata to IPFS
  4. Update Redis cache
  5. Warm all metadata endpoints
  6. Return new metadata URI

#### **ANALYTICS**

**`/api/analytics/save-email-manual.ts`** ⭐ CRITICAL (New!)
- **Función**: Immediate email save to Redis
- **Purpose**: Prevent state/timing issues
- **Método**: POST
- **Parameters**: `{ giftId, tokenId, email }`
- **Process**:
  1. Encrypt email (AES-256-GCM)
  2. Generate HMAC
  3. Write to Redis:
     - `gift:analytics:{giftId}:email_plain`
     - `gift:analytics:{giftId}:email_encrypted`
     - `gift:analytics:{giftId}:email_hmac`
  4. Return success
- **Status**: ✅ Deployed (both ES/EN)
- **Commit**: `96bb7f2`

**`/api/analytics/stats.ts`**
- **Función**: Platform statistics
- **Métricas**:
  - Total gifts created
  - Total gifts claimed
  - Total value locked
  - Claim rate
  - Average education score
  - Top referrers

**`/api/analytics/gift-profile/[giftId].ts`**
- **Función**: Detailed gift analytics
- **Data**:
  - Creation timestamp
  - Claim timestamp (if claimed)
  - Creator address
  - Claimer address (if claimed)
  - Education data (if completed)
  - Email (encrypted)
  - Referral source

#### **CRON JOBS**

**`/api/cron/fix-mappings.ts`**
- **Función**: Auto-repair orphaned mappings
- **Schedule**: Every 6 hours (Vercel Cron)
- **Authentication**: CRON_SECRET header
- **Process**:
  1. Scan last 50 gifts
  2. Check for missing mappings
  3. Fetch events from blockchain
  4. Recreate mappings
  5. Validate with contract
  6. Report results

**`/api/cron/return-expired-gifts.ts`**
- **Función**: Return expired unclaimed gifts
- **Schedule**: Daily
- **Process**:
  1. Query expired gifts from contract
  2. Call returnGift() for each
  3. Transfer NFT back to creator
  4. Update gift status
  5. Send notifications

### 🔒 API Security

**Authentication Methods**:
1. **SIWE** (Sign-In with Ethereum) - User authentication
2. **JWT Tokens** - Session management
3. **API Keys** - Admin/cron endpoints
4. **Wallet Signatures** - Transaction authorization

**Rate Limiting**:
```typescript
// /lib/rateLimit.ts
const rateLimit = {
  maxRequests: 100,      // requests per window
  windowMs: 900000,      // 15 minutes
  keyPrefix: 'rl:',
  storage: 'redis'
};

// Applied to sensitive endpoints:
- /api/email/send-code: 3 per hour per email
- /api/pre-claim/validate: 5 attempts per gift
- /api/mint-escrow: 10 per hour per wallet
```

**Security Headers**:
```typescript
// Standard headers en todas las APIs
res.setHeader('X-Frame-Options', 'SAMEORIGIN');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
res.setHeader('X-XSS-Protection', '1; mode=block');

// CORS (cuando requerido)
res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

**Input Validation**:
```typescript
// Todas las APIs validan inputs
import { z } from 'zod';

const MintSchema = z.object({
  creatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  imageUrl: z.string().url(),
  message: z.string().max(500),
  password: z.string().min(6).max(100),
  timeframe: z.number().min(900).max(2592000),
  tokenAmount: z.string(),
  tokenType: z.string()
});

const validated = MintSchema.parse(req.body);
```

---

*Continuación en siguiente sección...*

# ARQUITECTURA COMPLETA: SISTEMA DE COMPETENCIAS CRYPTOGIFT

## INVESTIGACION ULTRADETALLADA - Manifold + Gnosis Safe

**Fecha**: Enero 2026
**Autor**: CryptoGift Development Team
**Version**: 1.0

---

## TABLA DE CONTENIDOS

1. [Vision General](#1-vision-general)
2. [Manifold Markets - Analisis Profundo](#2-manifold-markets---analisis-profundo)
3. [Gnosis Safe - Analisis Profundo](#3-gnosis-safe---analisis-profundo)
4. [Arquitectura Unificada CryptoGift](#4-arquitectura-unificada-cryptogift)
5. [Casos de Uso Detallados](#5-casos-de-uso-detallados)
6. [Sistema de Jueces y Arbitraje](#6-sistema-de-jueces-y-arbitraje)
7. [Transparencia en Tiempo Real](#7-transparencia-en-tiempo-real)
8. [Implementacion Tecnica](#8-implementacion-tecnica)
9. [Roadmap de Desarrollo](#9-roadmap-de-desarrollo)

---

## 1. VISION GENERAL

### 1.1 Concepto Core

CryptoGift Competencias es un **sistema universal de apuestas y competencias** que combina:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRYPTOGIFT COMPETENCIAS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MANIFOLD MARKETS          +         GNOSIS SAFE               │
│   ┌──────────────┐               ┌──────────────────┐           │
│   │ Logica de    │               │ Custodia de      │           │
│   │ Probabilidad │               │ Fondos           │           │
│   │              │               │                  │           │
│   │ - CPMM       │      ═══>     │ - Multifirmas    │           │
│   │ - Mercados   │               │ - Modulos        │           │
│   │ - Trading    │               │ - Guards         │           │
│   │ - Resolution │               │ - Roles          │           │
│   └──────────────┘               └──────────────────┘           │
│                                                                  │
│                         ▼                                        │
│              ┌─────────────────────┐                             │
│              │ ESCROW CRYPTOGIFT   │                             │
│              │ (Ya existente)      │                             │
│              │                     │                             │
│              │ - ERC-6551 Wallets  │                             │
│              │ - Education Gate    │                             │
│              │ - Gasless TX        │                             │
│              └─────────────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Filosofia de Diseno

- **Manifold**: Proporciona TODA la logica matematica de probabilidades
- **Safe**: Proporciona TODA la logica de custodia y gobernanza
- **CryptoGift Escrow**: Une ambos mundos con UX sin fricciones
- **Transparencia Total**: Cada movimiento visible y auditable en tiempo real

---

## 2. MANIFOLD MARKETS - ANALISIS PROFUNDO

### 2.1 Arquitectura de Manifold

```
┌──────────────────────────────────────────────────────────────┐
│                    MANIFOLD ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   Frontend (Vercel)                                          │
│        │                                                      │
│        ▼                                                      │
│   ┌──────────┐      ┌──────────────┐      ┌──────────┐       │
│   │ Public   │ ──── │   Supabase   │ ──── │ Internal │       │
│   │ API      │      │   (SQL DB)   │      │ API (GCP)│       │
│   └──────────┘      └──────────────┘      └──────────┘       │
│        │                    │                   │             │
│        └────────────────────┼───────────────────┘             │
│                             ▼                                 │
│                    ┌──────────────┐                           │
│                    │    Common    │                           │
│                    │   Library    │                           │
│                    │              │                           │
│                    │ - CPMM Math  │                           │
│                    │ - Bet Calc   │                           │
│                    │ - Resolution │                           │
│                    └──────────────┘                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 CPMM (Constant Product Market Maker)

**Formula Central**:
```
k = y^p × n^(1-p)

Donde:
- y = Reservas de tokens YES
- n = Reservas de tokens NO
- p = Parametro de probabilidad inicial
- k = Invariante constante
```

**Calculo de Probabilidad**:
```typescript
probability = (p * NO) / ((1 - p) * YES + p * NO)
```

**Calculo de Shares al Apostar**:
```typescript
// Para apuesta YES:
shares = y + betAmount - (k * (betAmount + n) ** (p - 1)) ** (1 / p)

// Para apuesta NO:
shares = n + betAmount - (k * (betAmount + y) ** p) ** (1 / (1-p))
```

**Estructura de Fees**:
```
Fee = 10% × (1 - post-bet probability) × bet amount
```

### 2.3 Tipos de Mercado

| Tipo | outcomeType | Descripcion | Uso en CryptoGift |
|------|-------------|-------------|-------------------|
| **Binary** | `BINARY` | SI/NO, 2 outcomes | Apuestas simples |
| **Multiple Choice** | `MULTIPLE_CHOICE` | N opciones | Quien gana torneo |
| **Numeric** | `PSEUDO_NUMERIC` | Rango numerico | Pronostico scores |
| **Poll** | `POLL` | Encuesta sin dinero | Votaciones previas |
| **Bounty** | `BOUNTIED_QUESTION` | Recompensa por info | Investigacion |

### 2.4 API Endpoints Criticos

```typescript
// BASE URL: https://api.manifold.markets

// === MERCADOS ===
GET  /v0/markets                    // Listar mercados
GET  /v0/market/{id}                // Obtener mercado
POST /v0/market                     // Crear mercado (AUTH)

// === TRADING ===
POST /v0/bet                        // Colocar apuesta (AUTH)
POST /v0/bet/cancel/{id}            // Cancelar limit order (AUTH)
POST /v0/market/{id}/sell           // Vender shares (AUTH)

// === RESOLUCION ===
POST /v0/market/{id}/resolve        // Resolver mercado (AUTH)

// === USERS ===
GET  /v0/me                         // Usuario actual (AUTH)
GET  /v0/user/{username}            // Info de usuario
```

### 2.5 Autenticacion

```typescript
// Header requerido para endpoints AUTH:
Authorization: Key {API_KEY}

// Generar en: https://manifold.markets/profile
// Un key por cuenta
```

### 2.6 Rate Limits

```
500 requests / minuto / IP
```

### 2.7 Modelo de Datos: Market

```typescript
interface ManifoldMarket {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  createdTime: number;           // Unix ms
  closeTime?: number;            // Cuando cierra trading
  question: string;
  description?: string;          // Markdown

  // Mecanismo
  mechanism: 'cpmm-1' | 'cpmm-2' | 'dpm-2';
  outcomeType: 'BINARY' | 'MULTIPLE_CHOICE' | 'PSEUDO_NUMERIC' | 'POLL';

  // Estado
  isResolved: boolean;
  resolution?: string;           // 'YES' | 'NO' | answer id
  resolutionTime?: number;

  // Probabilidades (BINARY)
  probability?: number;          // 0-1
  p?: number;                    // Parametro CPMM

  // Pool
  pool?: {
    YES: number;
    NO: number;
  };
  totalLiquidity?: number;
  volume: number;
  volume24Hours: number;

  // Multiple choice
  answers?: {
    id: string;
    text: string;
    probability: number;
  }[];
}
```

### 2.8 Modelo de Datos: Bet

```typescript
interface ManifoldBet {
  id: string;
  userId: string;
  contractId: string;            // Market ID
  createdTime: number;

  amount: number;                // Mana gastado
  shares: number;                // Shares recibidos
  outcome: 'YES' | 'NO' | string;
  probBefore: number;
  probAfter: number;

  // Limit orders
  limitProb?: number;
  isFilled?: boolean;
  isCancelled?: boolean;

  // Fees
  fees: {
    creatorFee: number;
    platformFee: number;
    liquidityFee: number;
  };
}
```

---

## 3. GNOSIS SAFE - ANALISIS PROFUNDO

### 3.1 Arquitectura de Safe

```
┌──────────────────────────────────────────────────────────────┐
│                    SAFE ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│                    ┌─────────────┐                            │
│                    │  Safe Proxy │ (Minimal - EIP1167)        │
│                    │  (Storage)  │                            │
│                    └──────┬──────┘                            │
│                           │ delegatecall                      │
│                           ▼                                   │
│                    ┌─────────────┐                            │
│                    │    Safe     │ (Singleton Implementation) │
│                    │  Mastercopy │                            │
│                    └──────┬──────┘                            │
│                           │                                   │
│         ┌─────────────────┼─────────────────┐                │
│         ▼                 ▼                 ▼                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │OwnerManager│  │ModuleManager│  │FallbackMgr  │          │
│  │             │  │             │  │             │          │
│  │- Owners[]   │  │- Modules[]  │  │- ERC721     │          │
│  │- Threshold  │  │- Enable/    │  │  Handler    │          │
│  │- Add/Remove │  │  Disable    │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Almacenamiento de Owners (Linked List)

```solidity
// Estructura: Lista circular enlazada
mapping(address => address) internal owners;

// Ejemplo: 3 owners (a, b, c)
owners[SENTINEL] = a    // SENTINEL = 0x1
owners[a] = b
owners[b] = c
owners[c] = SENTINEL

// Verificar owner: O(1)
function isOwner(address owner) public view returns (bool) {
    return owner != SENTINEL && owners[owner] != address(0);
}
```

### 3.3 Flujo de Transaccion

```
┌──────────────────────────────────────────────────────────────┐
│               SAFE TRANSACTION FLOW                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. ENCODE                                                    │
│     encodeTransactionData()                                   │
│         │                                                     │
│         ▼                                                     │
│  2. SIGN (Coleccionar firmas off-chain)                       │
│     EIP-712 typed data                                        │
│         │                                                     │
│         ▼                                                     │
│  3. CHECK SIGNATURES                                          │
│     checkSignatures(dataHash, signatures)                     │
│         │                                                     │
│         ▼                                                     │
│  4. PRE-CHECK (Guard)                                         │
│     guard.checkTransaction(...)                               │
│         │                                                     │
│         ▼                                                     │
│  5. EXECUTE                                                   │
│     execute(to, value, data, operation)                       │
│         │                                                     │
│         ▼                                                     │
│  6. POST-CHECK (Guard)                                        │
│     guard.checkAfterExecution(...)                            │
│         │                                                     │
│         ▼                                                     │
│  7. PAYMENT (Opcional)                                        │
│     handlePayment(gasUsed, ...)                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.4 Tipos de Firma Soportados

| v value | Tipo | Descripcion |
|---------|------|-------------|
| 27, 28 | ECDSA Standard | Firma normal |
| 0 | Contract Signature | Smart contract verifica |
| 1 | Approved Hash | Pre-aprobado on-chain |
| >30 | eth_sign | Formato legacy |

### 3.5 Modulos Criticos para Competencias

#### A) **Allowance Module** (Spending Limits)
```solidity
// Permite gastos sin multifirma hasta un limite
struct Allowance {
    uint96 amount;       // Limite
    uint96 spent;        // Gastado
    uint16 resetTimeMin; // Reset cada X minutos (0 = one-time)
    uint32 lastReset;    // Ultimo reset
    uint16 nonce;
}
```

**Uso en Competencias**: Permitir que el sistema de resolucion distribuya premios automaticamente hasta cierto monto sin requerir todas las firmas.

#### B) **Delay Modifier** (Zodiac)
```
Permite ejecutar TX despues de un tiempo de espera
Durante el cual pueden ser canceladas

COOLDOWN ─────────────────► EXECUTION
   │                            │
   └── Cancel window ──────────┘
```

**Uso en Competencias**: Dar tiempo para disputar resultados antes de distribuir fondos.

#### C) **Roles Modifier** (Zodiac)
```solidity
// Control granular de permisos por rol
struct Role {
    address[] allowedTargets;
    bytes4[] allowedFunctions;
    bool allowDelegateCall;
    bool sendValue;
}
```

**Uso en Competencias**:
- Rol "JUDGE" solo puede llamar `resolveCompetition()`
- Rol "PARTICIPANT" solo puede llamar `submitResult()`
- Rol "ADMIN" full control

#### D) **Reality Module** (Zodiac)
```
Ejecuta TX basado en oracle Realitio

SNAPSHOT VOTE ──► REALITIO ORACLE ──► SAFE EXECUTION
                        │
                        ▼
                 KLEROS (disputes)
```

**Uso en Competencias**: Resoluciones automaticas basadas en datos externos (deportes, etc.)

### 3.6 Guards para Competencias

```solidity
// Guard Interface
interface Guard {
    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external;

    function checkAfterExecution(
        bytes32 txHash,
        bool success
    ) external;
}
```

**Guards Personalizados para CryptoGift**:

```solidity
// CompetitionGuard.sol
contract CompetitionGuard is Guard {

    // PRE-CHECK: Verificar que la competencia esta cerrada
    function checkTransaction(...) external {
        // 1. Solo permitir distribucion si competencia cerrada
        require(competition.status == Status.RESOLVED);

        // 2. Verificar que el monto no excede el pool
        require(value <= competition.totalPool);

        // 3. Verificar que el destinatario es participante
        require(competition.isParticipant(to));
    }

    // POST-CHECK: Registrar distribucion
    function checkAfterExecution(...) external {
        emit PrizeDistributed(txHash, success);
    }
}
```

### 3.7 SDK Integration

```typescript
import Safe from '@safe-global/protocol-kit';
import { SafeFactory } from '@safe-global/protocol-kit';

// Crear Safe para competencia
const safeFactory = await SafeFactory.create({
  provider,
  signer
});

const safeAccountConfig = {
  owners: [judge1, judge2, judge3],
  threshold: 2  // 2-of-3 para resolver
};

const competitionSafe = await safeFactory.deploySafe({ safeAccountConfig });

// Crear transaccion de distribucion
const safeTransaction = await competitionSafe.createTransaction({
  transactions: [
    {
      to: winner1,
      value: prize1,
      data: '0x'
    },
    {
      to: winner2,
      value: prize2,
      data: '0x'
    }
  ]
});

// Firmar
await competitionSafe.signTransaction(safeTransaction);

// Ejecutar cuando hay suficientes firmas
await competitionSafe.executeTransaction(safeTransaction);
```

---

## 4. ARQUITECTURA UNIFICADA CRYPTOGIFT

### 4.1 Modelo Conceptual

```
┌────────────────────────────────────────────────────────────────────┐
│                 CRYPTOGIFT COMPETENCIAS ARCHITECTURE                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐                          ┌─────────────────────┐  │
│  │   USUARIO   │                          │   USUARIO           │  │
│  │  Creador    │                          │   Participante      │  │
│  └──────┬──────┘                          └──────────┬──────────┘  │
│         │                                            │              │
│         │ 1. Crea competencia                        │ 4. Apuesta  │
│         ▼                                            ▼              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CRYPTOGIFT BACKEND                         │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │  │
│  │  │ Competition    │  │ Manifold       │  │ Safe           │  │  │
│  │  │ Manager        │──│ Integration    │──│ Integration    │  │  │
│  │  │                │  │                │  │                │  │  │
│  │  │ - Create       │  │ - Sync Probs   │  │ - Deploy Safe  │  │  │
│  │  │ - Rules        │  │ - Create Mkt   │  │ - Manage Sigs  │  │  │
│  │  │ - States       │  │ - Trading      │  │ - Execute TX   │  │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  │  │
│  └───────────────────────────────┬──────────────────────────────┘  │
│                                  │                                  │
│                                  ▼                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     BLOCKCHAIN LAYER                          │  │
│  │                                                                │  │
│  │   ┌────────────┐    ┌────────────┐    ┌────────────────────┐  │  │
│  │   │ CryptoGift │    │ Competition│    │ Safe + Modules     │  │  │
│  │   │ Escrow     │    │ Safe       │    │                    │  │  │
│  │   │ (Existing) │    │ (New)      │    │ - Roles Modifier   │  │  │
│  │   │            │    │            │    │ - Delay Modifier   │  │  │
│  │   │ - Deposits │    │ - Prize    │    │ - Competition Guard│  │  │
│  │   │ - Claims   │    │   Pool     │    │                    │  │  │
│  │   └────────────┘    └────────────┘    └────────────────────┘  │  │
│  │                                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   TRANSPARENCY LAYER                          │  │
│  │                                                                │  │
│  │   - Real-time event streaming                                 │  │
│  │   - Every TX explained                                        │  │
│  │   - Full audit trail                                          │  │
│  │   - Public verification                                       │  │
│  │                                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo Completo de una Competencia

```
FASE 1: CREACION
═══════════════

Usuario ──► Create Competition
              │
              ├── 1. Deploy Competition Safe (multisig judges)
              ├── 2. Configure Modules (Roles, Delay, Guard)
              ├── 3. Create Manifold Market (mirror)
              ├── 4. Store rules in Redis
              └── 5. Emit CompetitionCreated event


FASE 2: PARTICIPACION
═════════════════════

Participante ──► Join Competition
                    │
                    ├── 1. Deposit to Safe (ETH/ERC20)
                    ├── 2. Record position in Manifold (probs)
                    ├── 3. Update pool stats
                    └── 4. Emit ParticipantJoined event


FASE 3: TRADING (si aplica)
═══════════════════════════

Participante ──► Trade Position
                    │
                    ├── 1. Calculate new probs (Manifold CPMM)
                    ├── 2. Execute swap in Safe
                    ├── 3. Update positions
                    └── 4. Emit PositionChanged event


FASE 4: RESOLUCION
══════════════════

Jueces ──► Resolve Competition
              │
              ├── 1. Collect judge signatures
              ├── 2. Verify threshold (2/3, 3/5, etc.)
              ├── 3. Check Delay period (contestar?)
              ├── 4. Execute prize distribution
              └── 5. Emit CompetitionResolved event


FASE 5: DISTRIBUCION
════════════════════

Safe ──► Distribute Prizes
            │
            ├── 1. Guard validates distribution
            ├── 2. MultiSend to all winners
            ├── 3. Record on-chain
            └── 4. Emit PrizesDistributed event
```

### 4.3 Estructura de Datos

```typescript
// Competition principal
interface Competition {
  id: string;
  type: CompetitionType;

  // Configuracion
  title: string;
  description: string;
  rules: CompetitionRules;

  // Safe
  safeAddress: string;
  judges: Judge[];
  judgeThreshold: number;

  // Manifold (opcional)
  manifoldMarketId?: string;
  useProbabilities: boolean;

  // Pool
  totalPool: bigint;
  participants: Participant[];

  // Estado
  status: CompetitionStatus;
  createdAt: number;
  closesAt: number;
  resolvedAt?: number;

  // Resultados
  outcomes: Outcome[];
  resolution?: Resolution;
}

type CompetitionType =
  | 'P2P_BET'           // 2 personas, 1 arbitro
  | 'PREDICTION_MARKET' // N personas, probabilidades
  | 'TOURNAMENT'        // Brackets
  | 'BETTING_POOL'      // Pool compartido
  | 'DAILY_CHALLENGE'   // Retos diarios
  | 'SKILL_COMPETITION' // Habilidades
  | 'SPORTS_BET'        // Deportes
  | 'CUSTOM';           // Reglas custom

interface CompetitionRules {
  // Entrada
  minDeposit: bigint;
  maxDeposit?: bigint;
  maxParticipants?: number;

  // Tiempo
  registrationEnds: number;
  competitionEnds: number;
  disputePeriod: number;      // ms para disputar

  // Distribucion
  prizeDistribution: PrizeDistribution;

  // Jueces
  judgeType: 'HUMAN' | 'ORACLE' | 'AI' | 'MULTISIG';

  // Reglas especificas
  customRules?: Record<string, any>;
}

interface Judge {
  address: string;
  name: string;
  role: 'ARBITRATOR' | 'REFEREE' | 'ORACLE';
  weight: number;            // Para weighted voting
}

interface Participant {
  address: string;
  deposit: bigint;
  outcome: string;           // Su prediccion/posicion
  joinedAt: number;
}

interface Resolution {
  outcome: string;
  resolvedBy: string[];      // Addresses de jueces
  signatures: string[];
  timestamp: number;
  evidence?: string;         // IPFS hash de evidencia
}
```

---

## 5. CASOS DE USO DETALLADOS

### 5.1 Apuesta P2P con Arbitro

```
┌─────────────────────────────────────────────────────────────┐
│              P2P BET WITH ARBITER                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ESCENARIO: Alice y Bob apuestan sobre el partido           │
│             Charlie es el arbitro                            │
│                                                              │
│  CONFIGURACION:                                              │
│  - Safe: [Alice, Bob, Charlie] threshold: 1 (Charlie)       │
│  - Delay: 24h (para disputas)                                │
│  - Pool: 100 USDC (50 + 50)                                 │
│                                                              │
│  FLUJO:                                                      │
│                                                              │
│  Alice ─────► Deposit 50 USDC ─────────┐                    │
│                                          │                   │
│  Bob ───────► Deposit 50 USDC ─────────┼──► Safe (100 USDC) │
│                                          │                   │
│                                          │                   │
│  [EVENTO OCURRE]                         │                   │
│                                          │                   │
│  Charlie ───► Sign Resolution ──────────┼──► DELAY 24h      │
│               (Alice wins)               │                   │
│                                          │                   │
│  [NO DISPUTE]                            │                   │
│                                          ▼                   │
│  Safe ──────► Transfer 100 USDC ──────► Alice               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Codigo de Implementacion**:

```typescript
// POST /api/competitions/create-p2p
async function createP2PBet(req: Request) {
  const {
    participant1,
    participant2,
    arbiter,
    amount,
    eventDescription,
    deadline
  } = req.body;

  // 1. Deploy Safe con 1-of-1 (arbiter decide)
  const safe = await deploySafe({
    owners: [arbiter],
    threshold: 1
  });

  // 2. Enable Delay Module (24h)
  await enableModule(safe, DELAY_MODULE, {
    cooldown: 24 * 60 * 60  // 24 hours
  });

  // 3. Crear competencia en DB
  const competition = await db.competitions.create({
    type: 'P2P_BET',
    safeAddress: safe.address,
    judges: [{ address: arbiter, role: 'ARBITRATOR' }],
    judgeThreshold: 1,
    rules: {
      minDeposit: amount,
      maxDeposit: amount,
      maxParticipants: 2,
      disputePeriod: 24 * 60 * 60 * 1000
    }
  });

  return { competitionId: competition.id, safeAddress: safe.address };
}
```

### 5.2 Prediction Market con Manifold

```
┌─────────────────────────────────────────────────────────────┐
│              PREDICTION MARKET                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ESCENARIO: Quien gana las elecciones?                       │
│             Opciones: [Alice, Bob, Carol]                    │
│                                                              │
│  INTEGRACION MANIFOLD:                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Manifold Market ID: abc123                             │  │
│  │ outcomeType: MULTIPLE_CHOICE                           │  │
│  │ answers: [Alice: 40%, Bob: 35%, Carol: 25%]            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  FLUJO DE TRADING:                                           │
│                                                              │
│  Usuario ──► Buy Alice Shares                               │
│              │                                               │
│              ├── 1. Calculate via Manifold CPMM             │
│              ├── 2. Deposit USDC to Safe                    │
│              ├── 3. Update probabilities                    │
│              └── 4. Mint position NFT (opcional)            │
│                                                              │
│  RESOLUCION:                                                 │
│  - Oracle reporta resultado                                 │
│  - O jueces votan                                           │
│  - Winners reciben proporcional a shares                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Sincronizacion con Manifold**:

```typescript
// Sync probabilities from Manifold
async function syncManifoldProbabilities(competitionId: string) {
  const competition = await getCompetition(competitionId);

  if (!competition.manifoldMarketId) return;

  // Fetch from Manifold
  const market = await fetch(
    `https://api.manifold.markets/v0/market/${competition.manifoldMarketId}`
  ).then(r => r.json());

  // Update local state
  for (const answer of market.answers) {
    await db.outcomes.update({
      competitionId,
      outcomeId: answer.id,
      probability: answer.probability
    });
  }

  // Emit event for real-time updates
  await emit('probabilities_updated', {
    competitionId,
    probabilities: market.answers
  });
}
```

### 5.3 Tournament Brackets

```
┌─────────────────────────────────────────────────────────────┐
│              TOURNAMENT BRACKETS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ESTRUCTURA: 8 participantes, eliminacion directa           │
│                                                              │
│       Round 1         Round 2         Final                 │
│                                                              │
│     ┌────────┐                                              │
│     │ P1     │                                              │
│     │   vs   │────┐                                         │
│     │ P2     │    │    ┌────────┐                          │
│     └────────┘    │    │ Winner │                          │
│                   ├────│   vs   │────┐                      │
│     ┌────────┐    │    │ Winner │    │    ┌────────┐       │
│     │ P3     │    │    └────────┘    │    │        │       │
│     │   vs   │────┘                  ├────│ FINAL  │       │
│     │ P4     │                       │    │ WINNER │       │
│     └────────┘                       │    │        │       │
│                                      │    └────────┘       │
│     ┌────────┐                       │                      │
│     │ P5     │                       │                      │
│     │   vs   │────┐                  │                      │
│     │ P6     │    │    ┌────────┐    │                      │
│     └────────┘    │    │ Winner │    │                      │
│                   ├────│   vs   │────┘                      │
│     ┌────────┐    │    │ Winner │                          │
│     │ P7     │    │    └────────┘                          │
│     │   vs   │────┘                                         │
│     │ P8     │                                              │
│     └────────┘                                              │
│                                                              │
│  SAFE CONFIG:                                                │
│  - Multisig de jueces: 2-of-3 por match                     │
│  - Prize pool total en Safe principal                       │
│  - Distribucion: 50% winner, 25% 2nd, 15% 3rd, 10% 4th     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Betting Pool (Super Bowl Style)

```
┌─────────────────────────────────────────────────────────────┐
│              BETTING POOL                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ESCENARIO: Quien gana el Super Bowl?                        │
│             Pool compartido, winners dividen                 │
│                                                              │
│  POOL MECHANICS:                                             │
│                                                              │
│  Total Pool: $10,000                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Team A: $6,000 (60%)                                   │ │
│  │   - User1: $2,000                                      │ │
│  │   - User2: $3,000                                      │ │
│  │   - User3: $1,000                                      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Team B: $4,000 (40%)                                   │ │
│  │   - User4: $2,500                                      │ │
│  │   - User5: $1,500                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  SI GANA TEAM B:                                            │
│  - Pool total: $10,000                                      │
│  - Winners (Team B): $4,000 apostado                        │
│  - Cada winner recibe: (su_apuesta / total_B) * total_pool  │
│  - User4: (2500/4000) * 10000 = $6,250                      │
│  - User5: (1500/4000) * 10000 = $3,750                      │
│                                                              │
│  MANIFOLD INTEGRATION:                                       │
│  - Probabilidades reflejan distribucion del pool            │
│  - Team A: 60% probabilidad implicita                       │
│  - Team B: 40% probabilidad implicita                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Daily Challenges (Retos Cotidianos)

```
┌─────────────────────────────────────────────────────────────┐
│              DAILY CHALLENGES                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CATEGORIAS:                                                 │
│                                                              │
│  1. DEPORTES                                                 │
│     - Quien mete el primer gol?                             │
│     - Resultado final del partido                           │
│     - MVP del juego                                         │
│                                                              │
│  2. ENTRETENIMIENTO                                          │
│     - Quien gana el reality show?                           │
│     - Prediccion de ratings                                 │
│     - Resultado de competencia de talentos                  │
│                                                              │
│  3. FINANZAS                                                 │
│     - Bitcoin arriba/abajo manana?                          │
│     - S&P 500 closing price range                           │
│     - Crypto market cap prediction                          │
│                                                              │
│  4. WEATHER                                                  │
│     - Temperatura manana en Madrid                          │
│     - Llueve o no llueve?                                   │
│     - Nivel de contaminacion                                │
│                                                              │
│  5. SOCIAL                                                   │
│     - Viral tweet del dia                                   │
│     - Trending topic prediction                             │
│     - YouTube views en 24h                                  │
│                                                              │
│  RESOLUCION:                                                 │
│  - Oracles automaticos (Chainlink, API3)                    │
│  - Data feeds verificables                                  │
│  - Resolucion automatica sin jueces humanos                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Skill Competitions

```
┌─────────────────────────────────────────────────────────────┐
│              SKILL COMPETITIONS                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ESCENARIO: Competencia de diseño grafico                   │
│             Jurado de 5 expertos                            │
│                                                              │
│  SAFE CONFIG:                                                │
│  - Owners: [Judge1, Judge2, Judge3, Judge4, Judge5]         │
│  - Threshold: 3 (3-of-5 para resolver)                      │
│                                                              │
│  FLUJO:                                                      │
│                                                              │
│  1. SUBMISION                                                │
│     Participantes ──► Upload trabajo ──► IPFS              │
│                                                              │
│  2. EVALUACION                                               │
│     Jueces ──► Review submissions                           │
│             ──► Score each (1-10)                           │
│             ──► Sign ranking                                 │
│                                                              │
│  3. RESOLUCION                                               │
│     - Average scores calculado                              │
│     - 3/5 jueces firman el resultado                        │
│     - Delay period (disputas)                               │
│                                                              │
│  4. DISTRIBUCION                                             │
│     Safe ──► MultiSend prizes                               │
│                                                              │
│  SCORING ON-CHAIN:                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ struct Score {                                          │ │
│  │   bytes32 submissionHash;                               │ │
│  │   uint8 score;            // 1-10                       │ │
│  │   address judge;                                        │ │
│  │   bytes signature;                                      │ │
│  │ }                                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. SISTEMA DE JUECES Y ARBITRAJE

### 6.1 Tipos de Jueces

```
┌─────────────────────────────────────────────────────────────┐
│              JUDGE TYPES                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. HUMAN ARBITRATOR                                         │
│     - Single trusted party                                  │
│     - 1-of-1 Safe                                           │
│     - Use: P2P bets, simple disputes                        │
│                                                              │
│  2. MULTISIG PANEL                                          │
│     - Multiple judges                                       │
│     - M-of-N threshold                                      │
│     - Use: Skill competitions, tournaments                  │
│                                                              │
│  3. ORACLE-BASED                                            │
│     - Chainlink, API3, UMA                                  │
│     - Automated resolution                                  │
│     - Use: Sports scores, prices, weather                   │
│                                                              │
│  4. KLEROS COURT                                            │
│     - Decentralized arbitration                             │
│     - For disputes                                          │
│     - Use: Complex cases, appeals                           │
│                                                              │
│  5. AI JUDGE (FUTURO)                                       │
│     - LLM-based evaluation                                  │
│     - For subjective content                                │
│     - Use: Creative competitions                            │
│                                                              │
│  6. COMMUNITY VOTE                                          │
│     - Token-weighted voting                                 │
│     - Snapshot integration                                  │
│     - Use: Community decisions                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Configuraciones de Threshold

```
┌─────────────────────────────────────────────────────────────┐
│              THRESHOLD CONFIGURATIONS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CASO 1: Apuesta simple (1 arbitro)                         │
│  ─────────────────────────────────────                      │
│  threshold: 1 of 1                                          │
│  delay: 24h                                                 │
│  dispute: Kleros escalation                                 │
│                                                              │
│  CASO 2: Competencia mediana (3 jueces)                     │
│  ───────────────────────────────────────                    │
│  threshold: 2 of 3                                          │
│  delay: 48h                                                 │
│  dispute: Majority override                                 │
│                                                              │
│  CASO 3: Torneo grande (5 jueces)                           │
│  ──────────────────────────────────                         │
│  threshold: 3 of 5                                          │
│  delay: 72h                                                 │
│  dispute: Full panel review                                 │
│                                                              │
│  CASO 4: Evento masivo (11 jueces)                          │
│  ──────────────────────────────────                         │
│  threshold: 6 of 11                                         │
│  delay: 1 week                                              │
│  dispute: Kleros + community vote                           │
│                                                              │
│  WEIGHTED VOTING:                                            │
│  ────────────────                                            │
│  - Senior judges: 2x weight                                 │
│  - Standard judges: 1x weight                               │
│  - threshold: >50% weighted                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Dispute Resolution Flow

```
┌─────────────────────────────────────────────────────────────┐
│              DISPUTE RESOLUTION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                       RESOLUTION                             │
│                           │                                  │
│                           ▼                                  │
│                    ┌─────────────┐                          │
│                    │ DELAY PERIOD│                          │
│                    │  (24-168h)  │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│           ┌───────────────┼───────────────┐                 │
│           │               │               │                 │
│           ▼               ▼               ▼                 │
│     NO DISPUTE      DISPUTE FILED    TIMEOUT               │
│           │               │               │                 │
│           ▼               ▼               ▼                 │
│      EXECUTE        ESCALATION       EXECUTE               │
│                          │                                  │
│                          ▼                                  │
│              ┌─────────────────────┐                        │
│              │   DISPUTE HANDLER   │                        │
│              ├─────────────────────┤                        │
│              │ 1. Additional judges│                        │
│              │ 2. Evidence review  │                        │
│              │ 3. Kleros court     │                        │
│              │ 4. Community vote   │                        │
│              └──────────┬──────────┘                        │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │  FINAL RESOLUTION   │                        │
│              │                     │                        │
│              │ - Original upheld   │                        │
│              │ - Original reversed │                        │
│              │ - Partial adjustment│                        │
│              └─────────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Roles Modifier Configuration

```solidity
// Configuration for Competition Roles
contract CompetitionRolesConfig {

    bytes32 constant PARTICIPANT_ROLE = keccak256("PARTICIPANT");
    bytes32 constant JUDGE_ROLE = keccak256("JUDGE");
    bytes32 constant ADMIN_ROLE = keccak256("ADMIN");

    // PARTICIPANT can only:
    // - deposit()
    // - withdraw() (if not locked)
    // - submitResult()

    // JUDGE can only:
    // - submitScore()
    // - signResolution()

    // ADMIN can:
    // - cancelCompetition()
    // - addJudge()
    // - removeJudge()
    // - updateRules()
}
```

---

## 7. TRANSPARENCIA EN TIEMPO REAL

### 7.1 Event System

```typescript
// Todos los eventos emitidos durante una competencia

// CREACION
event CompetitionCreated(
  bytes32 indexed competitionId,
  address indexed creator,
  CompetitionType competitionType,
  address safeAddress,
  uint256 timestamp
);

// PARTICIPACION
event ParticipantJoined(
  bytes32 indexed competitionId,
  address indexed participant,
  uint256 amount,
  bytes32 outcome,
  uint256 timestamp
);

event ParticipantWithdrew(
  bytes32 indexed competitionId,
  address indexed participant,
  uint256 amount,
  uint256 timestamp
);

// TRADING
event PositionChanged(
  bytes32 indexed competitionId,
  address indexed participant,
  bytes32 fromOutcome,
  bytes32 toOutcome,
  uint256 amount,
  uint256 newProbability,
  uint256 timestamp
);

// JUECES
event JudgeAdded(
  bytes32 indexed competitionId,
  address indexed judge,
  uint256 weight,
  uint256 timestamp
);

event ScoreSubmitted(
  bytes32 indexed competitionId,
  address indexed judge,
  bytes32 indexed submissionId,
  uint8 score,
  uint256 timestamp
);

event ResolutionSigned(
  bytes32 indexed competitionId,
  address indexed judge,
  bytes32 outcome,
  bytes signature,
  uint256 timestamp
);

// RESOLUCION
event CompetitionResolved(
  bytes32 indexed competitionId,
  bytes32 winningOutcome,
  uint256 totalPool,
  uint256 timestamp
);

event DisputeRaised(
  bytes32 indexed competitionId,
  address indexed disputant,
  string reason,
  uint256 bond,
  uint256 timestamp
);

event DisputeResolved(
  bytes32 indexed competitionId,
  bool originalUpheld,
  uint256 timestamp
);

// DISTRIBUCION
event PrizeDistributed(
  bytes32 indexed competitionId,
  address indexed recipient,
  uint256 amount,
  uint256 timestamp
);

event CompetitionFinalized(
  bytes32 indexed competitionId,
  uint256 totalDistributed,
  uint256 timestamp
);
```

### 7.2 Real-Time Dashboard

```typescript
// WebSocket subscription para updates en tiempo real

interface RealtimeSubscription {
  competitionId: string;
  events: CompetitionEventType[];
}

// Cliente se subscribe
const subscription = await subscribe({
  competitionId: 'comp_123',
  events: [
    'PARTICIPANT_JOINED',
    'POSITION_CHANGED',
    'PROBABILITY_UPDATED',
    'SCORE_SUBMITTED',
    'RESOLUTION_SIGNED'
  ]
});

// Recibe updates
subscription.on('event', (event) => {
  switch (event.type) {
    case 'PARTICIPANT_JOINED':
      updateParticipantList(event.data);
      updatePoolSize(event.data.newTotal);
      break;

    case 'PROBABILITY_UPDATED':
      updateProbabilityChart(event.data.probabilities);
      break;

    case 'SCORE_SUBMITTED':
      updateLeaderboard(event.data);
      updateJudgeProgress(event.data.judgeProgress);
      break;
  }
});
```

### 7.3 Transaction Explanation System

```typescript
// Cada transaccion se explica en tiempo real

interface TransactionExplanation {
  txHash: string;
  type: TransactionType;

  // Explicacion en lenguaje natural
  summary: string;
  details: string;

  // Datos estructurados
  from: string;
  to: string;
  value: bigint;

  // Estado
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;

  // Links
  explorerUrl: string;
  safeUrl: string;
}

// Ejemplo de explicacion
const explanation: TransactionExplanation = {
  txHash: '0x123...',
  type: 'PRIZE_DISTRIBUTION',

  summary: 'Distribucion de premios a los ganadores',
  details: `
    La competencia "Torneo de Ajedrez Q1" ha finalizado.

    El jurado (3 de 5 jueces) ha firmado la resolucion:
    - Juez Maria Garcia: firmado
    - Juez Pedro Lopez: firmado
    - Juez Ana Martinez: firmado

    Distribucion de premios ($10,000 total):
    - 1er lugar: Juan Perez - $5,000 (50%)
    - 2do lugar: Sofia Ruiz - $3,000 (30%)
    - 3er lugar: Carlos Vega - $2,000 (20%)

    El periodo de disputa de 48h ha expirado sin objeciones.
    La transaccion se ejecutara en el siguiente bloque.
  `,

  from: '0xSafe...',
  to: '0xMultiSend...',
  value: 10000n * 10n**6n, // 10,000 USDC

  status: 'confirmed',
  confirmations: 12,

  explorerUrl: 'https://basescan.org/tx/0x123...',
  safeUrl: 'https://app.safe.global/transactions/0x123...'
};
```

### 7.4 Audit Trail

```typescript
// Registro completo y auditable de cada competencia

interface AuditEntry {
  id: string;
  competitionId: string;
  timestamp: number;

  action: AuditAction;
  actor: string;

  // Datos antes/despues
  previousState: any;
  newState: any;

  // Verificacion
  txHash?: string;
  signature?: string;
  ipfsHash?: string;  // Evidence
}

type AuditAction =
  | 'COMPETITION_CREATED'
  | 'RULES_UPDATED'
  | 'PARTICIPANT_JOINED'
  | 'PARTICIPANT_WITHDREW'
  | 'POSITION_TRADED'
  | 'JUDGE_ADDED'
  | 'JUDGE_REMOVED'
  | 'SCORE_SUBMITTED'
  | 'RESOLUTION_PROPOSED'
  | 'RESOLUTION_SIGNED'
  | 'DISPUTE_RAISED'
  | 'DISPUTE_RESOLVED'
  | 'PRIZE_DISTRIBUTED'
  | 'COMPETITION_FINALIZED';

// API para consultar audit trail
GET /api/competitions/{id}/audit
GET /api/competitions/{id}/audit?action=RESOLUTION_SIGNED
GET /api/competitions/{id}/audit?actor=0x123...
```

---

## 8. IMPLEMENTACION TECNICA

### 8.1 Smart Contracts Necesarios

```
┌─────────────────────────────────────────────────────────────┐
│              SMART CONTRACTS REQUIRED                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CORE CONTRACTS (Nuevos):                                    │
│  ──────────────────────                                      │
│                                                              │
│  1. CompetitionFactory.sol                                   │
│     - Deploy competition Safes                               │
│     - Configure modules                                      │
│     - Register competitions                                  │
│                                                              │
│  2. CompetitionGuard.sol                                     │
│     - Pre/post execution checks                              │
│     - Validate prize distributions                           │
│     - Enforce competition rules                              │
│                                                              │
│  3. CompetitionModule.sol                                    │
│     - Execute resolutions                                    │
│     - Handle disputes                                        │
│     - Automate distributions                                 │
│                                                              │
│  4. ProbabilityOracle.sol                                    │
│     - Sync with Manifold                                     │
│     - Calculate payouts                                      │
│     - CPMM implementation on-chain                           │
│                                                              │
│  EXISTING CONTRACTS (Reusar):                                │
│  ────────────────────────                                    │
│                                                              │
│  5. CryptoGift Escrow                                        │
│     - Deposit handling                                       │
│     - ERC-6551 integration                                   │
│                                                              │
│  6. SimpleApprovalGate                                       │
│     - EIP-712 signatures                                     │
│     - Judge authentication                                   │
│                                                              │
│  EXTERNAL CONTRACTS (Integrar):                              │
│  ──────────────────────────                                  │
│                                                              │
│  7. Safe Singleton + ProxyFactory                            │
│  8. Zodiac Delay Modifier                                    │
│  9. Zodiac Roles Modifier                                    │
│  10. Kleros Arbitration Proxy (opcional)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 API Endpoints Requeridos

```typescript
// ═══════════════════════════════════════════════════════════
//                  COMPETITION APIs
// ═══════════════════════════════════════════════════════════

// CRUD
POST   /api/competitions                    // Create
GET    /api/competitions                    // List
GET    /api/competitions/{id}               // Get one
PATCH  /api/competitions/{id}               // Update
DELETE /api/competitions/{id}               // Cancel

// Participation
POST   /api/competitions/{id}/join          // Join
POST   /api/competitions/{id}/withdraw      // Withdraw
GET    /api/competitions/{id}/participants  // List participants

// Trading (Prediction Markets)
POST   /api/competitions/{id}/trade         // Buy/sell position
GET    /api/competitions/{id}/positions     // My positions
GET    /api/competitions/{id}/orderbook     // Current orders

// Judging
POST   /api/competitions/{id}/scores        // Submit score
POST   /api/competitions/{id}/sign          // Sign resolution
GET    /api/competitions/{id}/judges        // Judge status

// Resolution
POST   /api/competitions/{id}/resolve       // Trigger resolution
POST   /api/competitions/{id}/dispute       // Raise dispute
GET    /api/competitions/{id}/resolution    // Resolution status

// Transparency
GET    /api/competitions/{id}/events        // Event stream
GET    /api/competitions/{id}/audit         // Audit trail
GET    /api/competitions/{id}/transactions  // TX history

// ═══════════════════════════════════════════════════════════
//                  MANIFOLD SYNC APIs
// ═══════════════════════════════════════════════════════════

POST   /api/manifold/create-market          // Mirror to Manifold
GET    /api/manifold/market/{id}            // Get market
POST   /api/manifold/sync/{competitionId}   // Sync probabilities

// ═══════════════════════════════════════════════════════════
//                  SAFE MANAGEMENT APIs
// ═══════════════════════════════════════════════════════════

POST   /api/safe/deploy                     // Deploy competition Safe
GET    /api/safe/{address}                  // Safe info
POST   /api/safe/{address}/transaction      // Propose TX
POST   /api/safe/{address}/sign             // Sign TX
POST   /api/safe/{address}/execute          // Execute TX
```

### 8.3 Database Schema

```sql
-- Competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Safe
  safe_address VARCHAR(42) NOT NULL,
  judge_threshold INTEGER NOT NULL,

  -- Manifold
  manifold_market_id VARCHAR(100),
  use_probabilities BOOLEAN DEFAULT false,

  -- Pool
  total_pool NUMERIC(78, 0) DEFAULT 0,
  token_address VARCHAR(42),

  -- Timing
  registration_ends_at TIMESTAMP,
  competition_ends_at TIMESTAMP,
  dispute_period_ms INTEGER DEFAULT 86400000,

  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,

  -- Rules
  rules JSONB
);

-- Participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  address VARCHAR(42) NOT NULL,

  deposit NUMERIC(78, 0) NOT NULL,
  outcome VARCHAR(100),

  joined_at TIMESTAMP DEFAULT NOW(),
  withdrawn_at TIMESTAMP,

  UNIQUE(competition_id, address)
);

-- Judges table
CREATE TABLE judges (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  address VARCHAR(42) NOT NULL,

  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'JUDGE',
  weight INTEGER DEFAULT 1,

  has_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMP,
  signature TEXT,

  UNIQUE(competition_id, address)
);

-- Outcomes table
CREATE TABLE outcomes (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),

  outcome_id VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  probability DECIMAL(5, 4) DEFAULT 0,

  is_winner BOOLEAN DEFAULT false,

  UNIQUE(competition_id, outcome_id)
);

-- Scores table (for skill competitions)
CREATE TABLE scores (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  judge_id UUID REFERENCES judges(id),
  participant_id UUID REFERENCES participants(id),

  score INTEGER CHECK (score >= 1 AND score <= 10),
  comments TEXT,

  submitted_at TIMESTAMP DEFAULT NOW(),
  signature TEXT
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),

  action VARCHAR(50) NOT NULL,
  actor VARCHAR(42),

  previous_state JSONB,
  new_state JSONB,

  tx_hash VARCHAR(66),
  signature TEXT,
  ipfs_hash VARCHAR(100),

  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_type ON competitions(type);
CREATE INDEX idx_participants_competition ON participants(competition_id);
CREATE INDEX idx_audit_competition ON audit_log(competition_id);
CREATE INDEX idx_audit_action ON audit_log(action);
```

### 8.4 Component Architecture (Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND COMPONENTS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PAGES:                                                      │
│  ──────                                                      │
│  src/app/[locale]/competencias/                              │
│    ├── page.tsx              // Lista de competencias       │
│    ├── create/page.tsx       // Wizard creacion             │
│    └── [id]/page.tsx         // Detalle competencia         │
│                                                              │
│  COMPONENTS:                                                 │
│  ───────────                                                 │
│  src/components/competitions/                                │
│    ├── CompetitionWizard.tsx       // Multi-step creation   │
│    ├── CompetitionCard.tsx         // Card en lista         │
│    ├── CompetitionDetail.tsx       // Vista completa        │
│    ├── ParticipantList.tsx         // Lista participantes   │
│    ├── JudgePanel.tsx              // Panel de jueces       │
│    ├── ProbabilityChart.tsx        // Grafico probabilidad  │
│    ├── TradingInterface.tsx        // Compra/venta          │
│    ├── ResolutionPanel.tsx         // Panel resolucion      │
│    ├── DisputeForm.tsx             // Formulario disputa    │
│    ├── AuditTimeline.tsx           // Timeline de eventos   │
│    ├── TransactionExplainer.tsx    // Explicador de TX      │
│    └── BracketViewer.tsx           // Vista de brackets     │
│                                                              │
│  HOOKS:                                                      │
│  ──────                                                      │
│  src/hooks/competitions/                                     │
│    ├── useCompetition.ts           // Fetch & cache         │
│    ├── useParticipate.ts           // Join/withdraw         │
│    ├── useTrade.ts                 // Trading logic         │
│    ├── useJudge.ts                 // Judge actions         │
│    ├── useRealtime.ts              // WebSocket updates     │
│    └── useSafe.ts                  // Safe interactions     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. ROADMAP DE DESARROLLO

### Fase 1: Foundation (4-6 semanas)

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: FOUNDATION                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SEMANA 1-2: Smart Contracts                                │
│  ─────────────────────────────                              │
│  □ CompetitionFactory.sol                                   │
│  □ CompetitionGuard.sol                                     │
│  □ Deploy to Base Sepolia                                   │
│  □ Integration tests                                        │
│                                                              │
│  SEMANA 3-4: Backend APIs                                   │
│  ─────────────────────────                                  │
│  □ Competition CRUD endpoints                               │
│  □ Safe integration service                                 │
│  □ Database migrations                                      │
│  □ Event emission system                                    │
│                                                              │
│  SEMANA 5-6: Frontend Foundation                            │
│  ─────────────────────────────                              │
│  □ Competition listing page                                 │
│  □ Basic creation wizard                                    │
│  □ Detail view                                              │
│  □ Real-time updates (WebSocket)                            │
│                                                              │
│  DELIVERABLE: P2P Betting funcional                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fase 2: Manifold Integration (3-4 semanas)

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 2: MANIFOLD INTEGRATION                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SEMANA 7-8: API Integration                                │
│  ───────────────────────────                                │
│  □ Manifold API client                                      │
│  □ Market creation/sync                                     │
│  □ Probability calculations                                 │
│  □ CPMM implementation                                      │
│                                                              │
│  SEMANA 9-10: Trading UI                                    │
│  ─────────────────────────                                  │
│  □ Trading interface                                        │
│  □ Position management                                      │
│  □ Probability charts                                       │
│  □ Order book display                                       │
│                                                              │
│  DELIVERABLE: Prediction Markets funcional                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fase 3: Advanced Features (4-5 semanas)

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 3: ADVANCED FEATURES                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SEMANA 11-12: Tournament System                            │
│  ─────────────────────────────                              │
│  □ Bracket generation                                       │
│  □ Match management                                         │
│  □ Progressive prize distribution                           │
│  □ Bracket UI component                                     │
│                                                              │
│  SEMANA 13-14: Dispute Resolution                           │
│  ────────────────────────────                               │
│  □ Delay module integration                                 │
│  □ Dispute workflow                                         │
│  □ Kleros integration (optional)                            │
│  □ Appeals process                                          │
│                                                              │
│  SEMANA 15: Transparency Dashboard                          │
│  ────────────────────────────────                           │
│  □ Real-time event stream                                   │
│  □ Transaction explainer                                    │
│  □ Full audit trail                                         │
│  □ Public verification                                      │
│                                                              │
│  DELIVERABLE: Sistema completo con tournaments y disputes   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fase 4: AI & Scale (Ongoing)

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 4: AI & SCALE                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  □ AI Judge implementation                                  │
│  □ Natural language rules                                   │
│  □ Automated categories                                     │
│  □ Community-created judges                                 │
│  □ Cross-chain competitions                                 │
│  □ Enterprise white-label                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. REFERENCIAS Y RECURSOS

### Documentacion Oficial

- **Manifold Markets**
  - Docs: https://docs.manifold.markets/api
  - GitHub: https://github.com/manifoldmarkets/manifold
  - Blog: https://news.manifold.markets

- **Safe (Gnosis Safe)**
  - Docs: https://docs.safe.global
  - SDK: https://docs.safe.global/sdk/overview
  - GitHub: https://github.com/safe-global/safe-core-sdk

- **Zodiac**
  - Wiki: https://www.zodiac.wiki
  - Delay Module: https://github.com/gnosisguild/zodiac-modifier-delay
  - Roles Module: https://github.com/gnosisguild/zodiac-modifier-roles

- **Kleros**
  - Docs: https://docs.kleros.io
  - Zodiac Integration: https://docs.kleros.io/integrations/zodiac-integration

### Contratos Desplegados (Base Sepolia)

```solidity
// EXISTING CRYPTOGIFT
NFT_CONTRACT           = "0xeFCba1D72B8f053d93BA44b7b15a1BeED515C89b"
ESCROW_CONTRACT        = "0x46175CfC233500DA803841DEef7f2816e7A129E0"
SIMPLE_APPROVAL_GATE   = "0x99cCBE908cf4c01382779755DEf1562905ceb0d2"
ERC6551_REGISTRY       = "0x000000006551c19487814612e58FE06813775758"

// SAFE ECOSYSTEM (Standard)
SAFE_SINGLETON         = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552"
SAFE_PROXY_FACTORY     = "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2"
MULTI_SEND             = "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761"

// ZODIAC (To be deployed)
DELAY_MODIFIER         = "TBD"
ROLES_MODIFIER         = "TBD"

// COMPETITION (To be deployed)
COMPETITION_FACTORY    = "TBD"
COMPETITION_GUARD      = "TBD"
```

---

**Este documento representa la investigacion completa y arquitectura del sistema de competencias de CryptoGift. Cada componente ha sido analizado en detalle para asegurar una implementacion solida, robusta, auditable y transparente.**

---

*Made by mbxarts.com The Moon in a Box property*
*Co-Author: Godez22*

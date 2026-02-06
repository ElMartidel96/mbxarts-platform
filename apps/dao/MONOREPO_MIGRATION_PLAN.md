# MBXarts Monorepo Migration Plan
## CryptoGift DAO + CryptoGift Wallets → Unified Platform

**Version**: 1.0.0
**Date**: 2026-02-05
**Status**: COMPLETED - Migration executed successfully (Feb 6, 2026)
**Author**: Claude Code (Co-Author: Godez22)

---

## Executive Summary

This document outlines the complete strategy for merging two separate codebases into a unified Turborepo monorepo while ensuring **ZERO data loss** and **immediate functionality** post-migration.

### Current State
| Project | Path | Next.js | Files | Lines | API Endpoints |
|---------|------|---------|-------|-------|---------------|
| DAO | cryptogift-wallets-DAO | 14.2.35 | 385+ TS | ~120k | 89 |
| Wallets | cryptogift-wallets | 15.3.6 | 593 TS | ~179k | 170+ |

### Target State
```
mbxarts-platform/
├── apps/
│   ├── dao/          # mbxarts.com (Next.js 14.2.35)
│   └── wallets/      # gifts.mbxarts.com (Next.js 15.3.6)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── hooks/        # Shared React hooks
│   ├── api-client/   # Cross-platform API client
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configuration
│   └── contracts/    # Shared smart contract ABIs
└── tooling/
    ├── eslint/       # Shared ESLint config
    ├── typescript/   # Shared TS config
    └── tailwind/     # Shared Tailwind config
```

---

## Phase 0: Pre-Migration Verification

### 0.1 Critical Compatibility Analysis

#### Next.js Version Strategy
**Decision**: Keep both versions initially, then gradually align.

| Feature | Next.js 14 (DAO) | Next.js 15 (Wallets) | Compatibility |
|---------|------------------|----------------------|---------------|
| App Router | ✅ Full | ✅ Full | ✅ Compatible |
| Pages Router | ❌ Not used | ✅ Used (APIs) | ⚠️ Wallets-only |
| Server Actions | ✅ Used | ✅ Used | ✅ Compatible |
| Turbopack | ❌ Optional | ✅ Default | ⚠️ Config needed |
| React | 18.x | 19.x | ⚠️ Separate configs |

**Solution**: Turborepo allows different Next.js versions per app. Each app maintains its own package.json with specific Next.js version.

#### Web3 Stack Compatibility
| Library | DAO | Wallets | Resolution |
|---------|-----|---------|------------|
| ThirdWeb | v5.68.0 | v5.68.0 | ✅ Same version |
| Viem | 2.21.54 | 2.31.1 | ⚠️ Align to 2.31.1 |
| Wagmi | Not used | v2.14.16 | ✅ Wallets-only |
| Biconomy | Not used | v4.5.7 | ✅ Wallets-only |
| Safe Protocol | Not used | v4.1.1 | ✅ Wallets-only |
| Aragon SDK | v1.x | Not used | ✅ DAO-only |

#### Database & Auth
| Service | DAO | Wallets | Resolution |
|---------|-----|---------|------------|
| Supabase | ✅ Primary DB | ✅ Auth only | ✅ Share client |
| SIWE | ✅ Auth | ✅ Auth | ✅ Share implementation |
| Iron Session | ✅ Sessions | ✅ Sessions | ✅ Share config |

### 0.2 Pre-Migration Checklist COMPLETO (360°)

#### A. Backups y Seguridad (CRÍTICO)
- [ ] **Git bundle de DAO**: `cd cryptogift-wallets-DAO && git bundle create ../dao-backup.bundle --all`
- [ ] **Git bundle de Wallets**: `cd cryptogift-wallets && git bundle create ../wallets-backup.bundle --all`
- [ ] **Backup de Vercel Project Settings** (export JSON desde dashboard)
- [ ] **Screenshot de todas las env vars en Vercel** (DAO y Wallets por separado)
- [ ] **Copia de .env.local de ambos proyectos** en ubicación segura

#### B. Verificación de Estado Actual
- [ ] **DAO builds localmente**: `cd cryptogift-wallets-DAO && pnpm build` → Success
- [ ] **Wallets builds localmente**: `cd cryptogift-wallets/frontend && pnpm build` → Success
- [ ] **DAO production funciona**: Verificar https://mbxarts.com → 200 OK
- [ ] **Wallets production funciona**: Verificar https://gifts.mbxarts.com → 200 OK
- [ ] **Tests pasan** (si existen): `pnpm test`

#### C. Documentación de Configuración Vercel
- [ ] **DAO Vercel Project**:
  - Project Name: _______________
  - Root Directory: _______________
  - Framework: Next.js _______________
  - Node Version: _______________
  - Build Command actual: _______________
  - Output Directory: _______________
  - Número de env vars: _______________

- [ ] **Wallets Vercel Project**:
  - Project Name: _______________
  - Root Directory: _______________
  - Framework: Next.js _______________
  - Node Version: _______________
  - Build Command actual: _______________
  - Output Directory: _______________
  - Número de env vars: _______________

#### D. Verificación de Dominios y DNS
- [ ] **mbxarts.com**: Registrar → Vercel (no debe cambiar)
- [ ] **gifts.mbxarts.com**: Registrar → Vercel (no debe cambiar)
- [ ] **DNS TTL**: Verificar que es manejable si hay problemas

#### E. Integraciones Externas (Verificar que funcionan)
- [ ] **DAO**:
  - [ ] Supabase conectado
  - [ ] Discord Bot activo
  - [ ] Aragon DAO accesible
  - [ ] CGC Token funcional
  - [ ] Sentry/monitoring activo

- [ ] **Wallets**:
  - [ ] Upstash KV conectado
  - [ ] Biconomy Paymaster activo
  - [ ] IPFS gateways funcionando
  - [ ] ThirdWeb configurado
  - [ ] Supabase Auth funcional

#### F. Criterio de DONE para Phase 0
```
✅ DONE cuando:
1. Todos los backups creados y verificados
2. Ambos proyectos buildan localmente
3. Ambos deployments en producción funcionan
4. Toda la configuración documentada
5. Screenshots/exports de Vercel guardados
```

### 0.3 Riesgos Identificados y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Env vars se pierden | Baja | CRÍTICO | Screenshots + export antes de cambiar repo |
| Build falla post-migración | Media | Alto | Verificar build local ANTES de conectar Vercel |
| Cache de Turborepo incorrecto | Media | Medio | Configurar env wildcards en turbo.json |
| Vercel no detecta monorepo | Baja | Medio | Configurar explícitamente Root Directory |
| Dependencies conflictan | Media | Alto | Mantener package.json separados por app |
| Dominios dejan de funcionar | Muy Baja | CRÍTICO | No tocar DNS, solo cambiar repo en Vercel |

---

## Phase 1: Foundation Setup

### 1.1 Create Monorepo Structure

```bash
# Create new monorepo root
mkdir mbxarts-platform
cd mbxarts-platform

# Initialize with pnpm (required for Turborepo)
pnpm init

# Create directory structure
mkdir -p apps packages tooling
mkdir -p packages/{ui,hooks,api-client,types,config,contracts}
mkdir -p tooling/{eslint,typescript,tailwind}
```

### 1.2 Turborepo Configuration

**File: `turbo.json`**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NODE_ENV",
    "NEXT_PUBLIC_THIRDWEB_CLIENT_ID",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_DAO_API_URL",
    "NEXT_PUBLIC_WALLETS_API_URL"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

**File: `pnpm-workspace.yaml`**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### 1.3 Root Package.json

```json
{
  "name": "mbxarts-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "dev:dao": "turbo run dev --filter=@mbxarts/dao",
    "dev:wallets": "turbo run dev --filter=@mbxarts/wallets",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.0"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

---

## Phase 2: Migrate Existing Projects

### 2.1 Migrate DAO (cryptogift-wallets-DAO)

**Critical**: This migration preserves 100% of existing code.

```bash
# From monorepo root
cd apps

# Clone existing repo as 'dao' directory
git clone /path/to/cryptogift-wallets-DAO dao

# Remove .git to integrate with monorepo
cd dao
rm -rf .git

# Update package.json name
# Change: "name": "cryptogift-dao" → "name": "@mbxarts/dao"
```

**Modified files in DAO:**

1. `apps/dao/package.json` - Update name and add workspace dependencies
2. `apps/dao/tsconfig.json` - Extend from tooling
3. `apps/dao/tailwind.config.ts` - Import shared preset
4. `apps/dao/next.config.mjs` - Add transpilePackages

### 2.2 Migrate Wallets (cryptogift-wallets)

```bash
# From apps directory
git clone /path/to/cryptogift-wallets wallets
cd wallets
rm -rf .git

# Update package.json name
# Change: "name": "cryptogift-wallets" → "name": "@mbxarts/wallets"
```

**Modified files in Wallets:**

1. `apps/wallets/package.json` - Update name and workspace deps
2. `apps/wallets/tsconfig.json` - Extend from tooling
3. `apps/wallets/tailwind.config.ts` - Import shared preset
4. `apps/wallets/next.config.ts` - Add transpilePackages

---

## Phase 3: Create Shared Packages

### 3.1 @mbxarts/types - Shared TypeScript Types

**Path**: `packages/types/`

```typescript
// packages/types/src/profile.ts
export interface UserProfile {
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: ProfileTier;
  tier_color: string;
  total_cgc_earned: number;
  total_tasks_completed: number;
  reputation_score: number;
  twitter_handle: string | null;
  discord_handle: string | null;
  telegram_handle: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileTier =
  | 'newcomer'
  | 'contributor'
  | 'builder'
  | 'expert'
  | 'master'
  | 'legend';

// packages/types/src/wallet.ts
export interface NFTWallet {
  tokenId: number;
  tbaAddress: string;
  owner: string;
  metadata: NFTMetadata;
  balance: WalletBalance;
}

export interface WalletBalance {
  native: string;
  tokens: TokenBalance[];
}

// ... (complete type definitions from both projects)
```

### 3.2 @mbxarts/api-client - Cross-Platform API

**Path**: `packages/api-client/`

```typescript
// packages/api-client/src/client.ts
import { UserProfile, NFTWallet } from '@mbxarts/types';

export class MBXartsClient {
  private daoUrl: string;
  private walletsUrl: string;

  constructor(config: ClientConfig) {
    this.daoUrl = config.daoUrl || 'https://mbxarts.com';
    this.walletsUrl = config.walletsUrl || 'https://gifts.mbxarts.com';
  }

  // Profile methods (uses DAO)
  async getProfile(wallet: string): Promise<UserProfile | null> {
    const res = await fetch(`${this.daoUrl}/api/cross-platform/profile?wallet=${wallet}`);
    const data = await res.json();
    return data.success ? data.data : null;
  }

  async createProfile(wallet: string): Promise<UserProfile> {
    const res = await fetch(`${this.daoUrl}/api/cross-platform/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }

  // Wallet methods (uses Wallets service)
  async getNFTWallets(owner: string): Promise<NFTWallet[]> {
    const res = await fetch(`${this.walletsUrl}/api/user/nft-wallets?owner=${owner}`);
    const data = await res.json();
    return data.wallets || [];
  }

  async getActiveWallet(owner: string): Promise<NFTWallet | null> {
    const res = await fetch(`${this.walletsUrl}/api/user/active-wallet?owner=${owner}`);
    const data = await res.json();
    return data.wallet || null;
  }
}

export const createClient = (config?: Partial<ClientConfig>) =>
  new MBXartsClient({
    daoUrl: process.env.NEXT_PUBLIC_DAO_API_URL || config?.daoUrl,
    walletsUrl: process.env.NEXT_PUBLIC_WALLETS_API_URL || config?.walletsUrl,
  });
```

### 3.3 @mbxarts/hooks - Shared React Hooks

**Path**: `packages/hooks/`

```typescript
// packages/hooks/src/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@mbxarts/api-client';
import type { UserProfile } from '@mbxarts/types';

const client = createClient();

export function useProfile(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['profile', walletAddress],
    queryFn: () => walletAddress ? client.getProfile(walletAddress) : null,
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wallet: string) => client.createProfile(wallet),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.wallet_address], data);
    },
  });
}

// packages/hooks/src/useNFTWallets.ts
export function useNFTWallets(owner: string | undefined) {
  return useQuery({
    queryKey: ['nft-wallets', owner],
    queryFn: () => owner ? client.getNFTWallets(owner) : [],
    enabled: !!owner,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useActiveWallet(owner: string | undefined) {
  return useQuery({
    queryKey: ['active-wallet', owner],
    queryFn: () => owner ? client.getActiveWallet(owner) : null,
    enabled: !!owner,
    staleTime: 10 * 1000, // 10 seconds
  });
}
```

### 3.4 @mbxarts/ui - Shared UI Components

**Path**: `packages/ui/`

This package will contain components shared between both apps:

```typescript
// packages/ui/src/ProfileCard/index.tsx
'use client';

import { UserProfile, ProfileTier } from '@mbxarts/types';
import { cn } from '../utils';

interface ProfileCardProps {
  profile: UserProfile | null;
  variant?: 'full' | 'compact' | 'mini';
  showBalance?: boolean;
  className?: string;
}

export function ProfileCard({
  profile,
  variant = 'compact',
  showBalance = true,
  className
}: ProfileCardProps) {
  if (!profile) {
    return <ProfileCardSkeleton variant={variant} />;
  }

  return (
    <div className={cn(
      'rounded-xl border border-border-primary bg-bg-secondary',
      variant === 'full' && 'p-6',
      variant === 'compact' && 'p-4',
      variant === 'mini' && 'p-2',
      className
    )}>
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <Avatar
          src={profile.avatar_url}
          fallback={profile.display_name?.[0] || profile.wallet_address.slice(2, 4)}
          size={variant === 'mini' ? 'sm' : 'md'}
        />

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text-primary truncate">
            {profile.display_name || shortenAddress(profile.wallet_address)}
          </div>
          {profile.username && (
            <div className="text-sm text-text-secondary">@{profile.username}</div>
          )}
        </div>

        {/* Tier Badge */}
        <TierBadge tier={profile.tier} color={profile.tier_color} />
      </div>

      {/* Stats - only show in full/compact variants */}
      {variant !== 'mini' && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {showBalance && (
            <Stat label="CGC" value={formatNumber(profile.total_cgc_earned)} />
          )}
          <Stat label="Tasks" value={profile.total_tasks_completed} />
          <Stat label="Rep" value={profile.reputation_score} />
        </div>
      )}
    </div>
  );
}
```

### 3.5 @mbxarts/config - Shared Configuration

**Path**: `packages/config/`

```typescript
// packages/config/src/chains.ts
import { base, baseSepolia, polygon, mainnet } from 'viem/chains';

export const SUPPORTED_CHAINS = {
  production: [base, polygon, mainnet],
  development: [baseSepolia],
} as const;

export const DEFAULT_CHAIN = base;

// packages/config/src/contracts.ts
export const CONTRACTS = {
  // DAO Contracts
  dao: {
    cgcToken: '0x...',
    governance: '0x...',
    treasury: '0x...',
  },
  // Wallets Contracts
  wallets: {
    nftWallet: '0xbA16f458944E5cdB26F2a3cA7C8c2bf0FaA9d9Be',
    registry: '0x000000006551c19487814612e58FE06813775758',
    implementation: '0x...',
  },
} as const;

// packages/config/src/api.ts
export const API_CONFIG = {
  dao: {
    baseUrl: process.env.NEXT_PUBLIC_DAO_API_URL || 'https://mbxarts.com',
    version: 'v1',
  },
  wallets: {
    baseUrl: process.env.NEXT_PUBLIC_WALLETS_API_URL || 'https://gifts.mbxarts.com',
    version: 'v1',
  },
} as const;
```

---

## Phase 4: Integration Points

### 4.1 Unified Profile System

The profile system will be managed by DAO but accessible from both platforms:

```
┌─────────────────┐         ┌─────────────────┐
│   DAO App       │         │  Wallets App    │
│  (mbxarts.com)  │         │ (gifts.mbxarts) │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│           @mbxarts/api-client               │
│     (Shared cross-platform API client)      │
└─────────────────────┬───────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  DAO API        │       │  Wallets API    │
│  /api/profiles  │       │  /api/wallets   │
└────────┬────────┘       └────────┬────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│    Supabase     │       │   Blockchain    │
│   (Profiles)    │       │   (NFT Data)    │
└─────────────────┘       └─────────────────┘
```

### 4.2 Cross-Platform Navigation

Both apps will share navigation awareness:

```typescript
// packages/config/src/navigation.ts
export const PLATFORM_LINKS = {
  dao: {
    home: 'https://mbxarts.com',
    profile: 'https://mbxarts.com/profile',
    tasks: 'https://mbxarts.com/tasks',
    governance: 'https://mbxarts.com/governance',
  },
  wallets: {
    home: 'https://gifts.mbxarts.com',
    create: 'https://gifts.mbxarts.com/create',
    gallery: 'https://gifts.mbxarts.com/gallery',
    nexus: 'https://gifts.mbxarts.com/nexuswallet',
  },
} as const;
```

### 4.3 Shared Authentication Flow

```typescript
// packages/hooks/src/useAuth.ts
export function useUnifiedAuth() {
  const daoAuth = useDAOAuth();
  const walletsAuth = useWalletsAuth();

  // Sync authentication state between platforms
  useEffect(() => {
    if (daoAuth.isConnected && !walletsAuth.isConnected) {
      // Propagate auth to wallets
    }
  }, [daoAuth.isConnected]);

  return {
    isConnected: daoAuth.isConnected || walletsAuth.isConnected,
    address: daoAuth.address || walletsAuth.address,
    profile: daoAuth.profile,
    wallets: walletsAuth.wallets,
  };
}
```

---

## Phase 5: Migration Execution Steps

### Step 1: Create Monorepo (Day 1)

```bash
# 1. Create new repository
mkdir mbxarts-platform && cd mbxarts-platform
git init

# 2. Setup Turborepo structure
pnpm init
# Add turbo.json, pnpm-workspace.yaml, root package.json

# 3. Create directory structure
mkdir -p apps packages/{ui,hooks,api-client,types,config,contracts} tooling/{eslint,typescript,tailwind}

# 4. Initial commit
git add .
git commit -m "chore: initialize monorepo structure"
```

### Step 2: Migrate DAO App (Day 1-2)

```bash
# 1. Copy DAO project (preserving all files)
cp -r /path/to/cryptogift-wallets-DAO/* apps/dao/

# 2. Remove DAO's git history (will be part of monorepo)
rm -rf apps/dao/.git

# 3. Update package.json
# - Change name to "@mbxarts/dao"
# - Update paths for shared packages

# 4. Verify DAO builds
cd apps/dao && pnpm install && pnpm build

# 5. Commit
git add apps/dao
git commit -m "feat: add DAO application"
```

### Step 3: Migrate Wallets App (Day 2-3)

```bash
# 1. Copy Wallets project
cp -r /path/to/cryptogift-wallets/* apps/wallets/

# 2. Remove git history
rm -rf apps/wallets/.git

# 3. Update package.json
# - Change name to "@mbxarts/wallets"

# 4. Verify Wallets builds
cd apps/wallets && pnpm install && pnpm build

# 5. Commit
git add apps/wallets
git commit -m "feat: add Wallets application"
```

### Step 4: Create Shared Packages (Day 3-4)

```bash
# 1. Create @mbxarts/types
cd packages/types
# Add package.json, tsconfig.json, src/index.ts
# Extract common types from both projects

# 2. Create @mbxarts/config
cd packages/config
# Add shared configuration

# 3. Create @mbxarts/api-client
cd packages/api-client
# Add cross-platform API client

# 4. Create @mbxarts/hooks
cd packages/hooks
# Add shared React hooks

# 5. Create @mbxarts/ui
cd packages/ui
# Add shared UI components (start with ProfileCard)

# 6. Commit all packages
git add packages
git commit -m "feat: add shared packages"
```

### Step 5: Update Apps to Use Shared Packages (Day 4-5)

```bash
# 1. Update DAO imports
# Replace local types with @mbxarts/types
# Replace local API calls with @mbxarts/api-client
# Replace duplicated hooks with @mbxarts/hooks

# 2. Update Wallets imports
# Same process

# 3. Verify both apps still work
turbo run build
turbo run dev

# 4. Commit updates
git commit -m "refactor: integrate shared packages"
```

### Step 6: Configure CI/CD (Day 5)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: turbo run build lint type-check
```

### Step 7: Deploy Configuration (Day 5-6)

**Vercel Configuration** for each app:

```json
// apps/dao/vercel.json
{
  "buildCommand": "cd ../.. && turbo run build --filter=@mbxarts/dao",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

```json
// apps/wallets/vercel.json
{
  "buildCommand": "cd ../.. && turbo run build --filter=@mbxarts/wallets",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## ⚠️ CRITICAL: Environment Variables Policy (SECCION A, B, C)

### REGLA FUNDAMENTAL: LAS VARIABLES DE ENTORNO NO SE TOCAN

Los dos proyectos tienen **stacks completamente diferentes**:

| Aspecto | DAO (~150 variables) | Wallets (~400+ variables) |
|---------|----------------------|---------------------------|
| Tamaño .env.local | 16,320 bytes | 14,039 bytes |
| Web3 Stack | Aragon SDK, EAS | ThirdWeb, Biconomy, Safe |
| Auth | Discord Bot, SIWE | SIWE, JWT, OTP |
| Storage | Supabase, Redis | Upstash KV, Redis, IPFS |
| Payments | Superfluid Streams | Biconomy Paymaster |
| Integrations | Quest platforms | PhotoRoom, Bridges, On-ramp |

### 🔒 GARANTÍA ABSOLUTA: Los archivos .env.local NUNCA se modifican

```
apps/
├── dao/
│   └── .env.local          # ❌ NUNCA TOCAR - 150+ variables DAO
└── wallets/
    └── frontend/
        └── .env.local      # ❌ NUNCA TOCAR - 400+ variables Wallets
```

---

## SECCION A: Vercel 2-Project Setup (EXPLÍCITO)

### Arquitectura de Deployment en Vercel

**Vercel soporta monorepos con MÚLTIPLES Projects apuntando al MISMO repositorio.**

Cada Vercel Project:
- ✅ Mantiene SUS propias Environment Variables (completamente separadas)
- ✅ Tiene su propio dominio (mbxarts.com vs gifts.mbxarts.com)
- ✅ Tiene su propia configuración de build
- ✅ Tiene sus propias integraciones (Upstash, etc.)

### Configuración Exacta en Vercel Dashboard

#### Project 1: MBXarts DAO
```
Vercel Dashboard > Settings

Project Name: mbxarts-dao
Root Directory: apps/dao
Framework Preset: Next.js
Build Command: cd ../.. && turbo run build --filter=@mbxarts/dao
Output Directory: .next
Install Command: pnpm install
Node.js Version: 20.x

✅ Include source files outside Root Directory: ENABLED
   (Necesario para acceder a packages/*)
```

#### Project 2: CryptoGift Wallets
```
Vercel Dashboard > Settings

Project Name: cryptogift-wallets
Root Directory: apps/wallets/frontend
Framework Preset: Next.js
Build Command: cd ../../.. && turbo run build --filter=@mbxarts/wallets
Output Directory: .next
Install Command: pnpm install
Node.js Version: 20.x

✅ Include source files outside Root Directory: ENABLED
```

### Paso a Paso para Configurar en Vercel

#### Para cada proyecto existente (mbxarts.com y gifts.mbxarts.com):

1. **Ir a Vercel Dashboard** → Project Settings → General
2. **Root Directory**: Cambiar al path dentro del monorepo
3. **Build & Development Settings**:
   - Framework Preset: Next.js
   - Build Command: (ver arriba - IMPORTANTE el cd hacia raíz)
   - Output Directory: `.next`
4. **Environment Variables**: ⚠️ YA ESTÁN CONFIGURADAS - NO TOCAR
5. **Git**: Cambiar el repo conectado al nuevo monorepo

### Migración de Environment Variables (CERO CAMBIOS)

```
PROCESO DE MIGRACIÓN ENV VARS:
1. Las env vars YA ESTÁN en cada Vercel Project
2. Cuando conectamos el nuevo repo, las vars SE MANTIENEN
3. NO se copian, NO se mueven, NO se tocan
4. Cada Project sigue usando SUS propias variables

ANTES (repos separados):
├── cryptogift-wallets-DAO (GitHub) → mbxarts-dao (Vercel) → ENV VARS A
└── cryptogift-wallets (GitHub) → cryptogift-wallets (Vercel) → ENV VARS B

DESPUÉS (monorepo):
└── mbxarts-platform (GitHub)
    ├── mbxarts-dao (Vercel) → ENV VARS A (sin cambios)
    └── cryptogift-wallets (Vercel) → ENV VARS B (sin cambios)
```

---

## SECCION B: Build Command Correcto (Patrón Oficial)

### El Problema con el Build Command Original

```json
// ❌ INCORRECTO (puede fallar)
{
  "buildCommand": "turbo run build --filter=@mbxarts/dao"
}
```

Cuando Root Directory es `apps/dao`, Vercel ejecuta comandos DESDE ese directorio.
`turbo` no está instalado ahí - está en la raíz del monorepo.

### Solución Oficial: Navegar a la Raíz

```json
// ✅ CORRECTO (patrón oficial Vercel + Turborepo)
{
  "buildCommand": "cd ../.. && turbo run build --filter=@mbxarts/dao"
}
```

### Build Commands Finales por App

#### DAO (Root: `apps/dao`)
```bash
# Build Command en Vercel:
cd ../.. && turbo run build --filter=@mbxarts/dao

# Explicación:
# apps/dao → .. → apps → .. → raíz del monorepo
# Desde raíz: turbo run build --filter=@mbxarts/dao
```

#### Wallets (Root: `apps/wallets/frontend`)
```bash
# Build Command en Vercel:
cd ../../.. && turbo run build --filter=@mbxarts/wallets

# Explicación:
# apps/wallets/frontend → .. → wallets → .. → apps → .. → raíz
# Desde raíz: turbo run build --filter=@mbxarts/wallets
```

### Alternativa: Vercel Turborepo Integration (Automático)

Vercel puede detectar Turborepo automáticamente si:
1. Existe `turbo.json` en la raíz
2. El proyecto usa pnpm workspaces
3. Se activa "Include source files outside Root Directory"

En este caso, Vercel infiere el comando correcto. Sin embargo, **recomiendo ser explícito** para evitar sorpresas.

### Archivo vercel.json Final (NO en cada app, en la RAÍZ)

```json
// mbxarts-platform/vercel.json (RAÍZ del monorepo)
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "turbo run build",
  "ignoreCommand": "npx turbo-ignore"
}
```

**NOTA**: Con este enfoque, Vercel usa `turbo-ignore` para determinar si necesita rebuilder cada app basándose en qué archivos cambiaron. Esto optimiza los deployments.

---

## SECCION C: Política de Environment Variables con Turborepo

### Modo Estricto de Turborepo (ENV Mode)

Turborepo puede operar en modo estricto donde:
- Si una env var afecta el build pero no está declarada, el cache puede ser incorrecto
- Variables no declaradas pueden causar builds que parecen funcionar pero tienen valores incorrectos

### Configuración turbo.json Actualizada (SIN globalEnv compartido)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NODE_ENV"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": [
        "NEXT_PUBLIC_*"
      ]
    },
    "build#@mbxarts/dao": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": [
        "NEXT_PUBLIC_*",
        "ARAGON_*",
        "DAO_*",
        "CGC_*",
        "EAS_*",
        "DISCORD_*",
        "SUPABASE_*"
      ]
    },
    "build#@mbxarts/wallets": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": [
        "NEXT_PUBLIC_*",
        "BICONOMY_*",
        "PINATA_*",
        "NFT_STORAGE_*",
        "PHOTOROOM_*",
        "KV_*",
        "REDIS_*",
        "RESEND_*",
        "SUPABASE_*"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Reglas de Oro para Environment Variables

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REGLAS INVIOLABLES ENV VARS                          │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. NUNCA compartir variables entre apps si son diferentes               │
│    → DAO tiene su SUPABASE_URL, Wallets tiene el suyo                   │
│                                                                         │
│ 2. NUNCA copiar .env.local al monorepo                                  │
│    → Los .env.local se quedan en sus ubicaciones originales             │
│    → Vercel tiene las variables en sus Project Settings                 │
│                                                                         │
│ 3. NUNCA poner secretos en turbo.json                                   │
│    → turbo.json solo lista PREFIJOS para cache invalidation             │
│    → Los valores reales están en Vercel/local .env files                │
│                                                                         │
│ 4. SIEMPRE usar wildcards en turbo.json                                 │
│    → NEXT_PUBLIC_* en lugar de listar cada variable                     │
│    → Evita tener que actualizar turbo.json cada vez que añades una var  │
│                                                                         │
│ 5. SIEMPRE mantener las variables en Vercel Project Settings            │
│    → Es la fuente de verdad para producción                             │
│    → Local .env.local es solo para desarrollo                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Desarrollo Local: Cómo Manejar .env.local

```
mbxarts-platform/
├── apps/
│   ├── dao/
│   │   └── .env.local     # Copia de tu .env.local actual de DAO
│   └── wallets/
│       └── frontend/
│           └── .env.local # Copia de tu .env.local actual de Wallets
└── .gitignore             # Incluye **/.env.local
```

**Proceso de migración local:**
```bash
# 1. Después de copiar los proyectos, los .env.local ya estarán ahí
# 2. NO se modifican - solo se copian con el resto del proyecto
# 3. El .gitignore de la raíz asegura que nunca se commiteen

# Verificar que .gitignore tiene:
echo "**/.env.local" >> .gitignore
echo "**/.env*.local" >> .gitignore
```

---

## Inventario Completo de Variables por Proyecto

### DAO: Variables Únicas (~150)
```
CATEGORÍA               | EJEMPLOS
------------------------|------------------------------------------
Aragon/DAO              | DAO_ADDRESS, TOKEN_VOTING_ADDRESS, ADMIN_PLUGIN_ADDRESS
CGC Token               | CGC_TOKEN_ADDRESS, CGC_TOKEN_SYMBOL, CGC_TOTAL_SUPPLY
EAS (Attestation)       | EAS_CONTRACT_ADDRESS, SCHEMA_REGISTRY_ADDRESS, SCHEMA_UID
Discord Bot             | DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_CLIENT_ID
Quest Platforms         | WONDERVERSE_API_KEY, DEWORK_API_KEY, ZEALY_API_KEY
Superfluid              | SUPERFLUID_HOST, SUPERFLUID_CFA_FORWARDER
Deployment Keys         | DEPLOYER_PRIVATE_KEY, ATTESTOR_PRIVATE_KEY, BOT_PRIVATE_KEY
Aragon IPFS             | ARAGON_IPFS_GATEWAY
Telegram Bot            | TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
Email (SMTP)            | SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
```

### Wallets: Variables Únicas (~400+)
```
CATEGORÍA               | EJEMPLOS
------------------------|------------------------------------------
ThirdWeb                | NEXT_PUBLIC_TW_CLIENT_ID, TW_SECRET_KEY
WalletConnect           | NEXT_PUBLIC_WC_PROJECT_ID
ERC-6551                | NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS, ERC6551_IMPLEMENTATION
Escrow                  | NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS
Education System        | NEXT_PUBLIC_SIMPLE_APPROVAL_GATE_ADDRESS, APPROVER_ADDRESS
MEV Protection          | NEXT_PUBLIC_MEV_PROTECT_MODE, MEV_PROTECT_RPC_*
Biconomy (Gasless)      | BICONOMY_MEE_API_KEY, BICONOMY_PAYMASTER_URL, BICONOMY_BUNDLER_URL
IPFS Storage            | NFT_STORAGE_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY
PhotoRoom AI            | PHOTOROOM_API_KEY
Upstash/KV              | KV_REST_API_URL, KV_REST_API_TOKEN, REDIS_URL
Resend (Email)          | RESEND_API_KEY
Web Push                | NEXT_PUBLIC_WEBPUSH_PUBLIC_KEY, WEBPUSH_PRIVATE_KEY
Push Protocol           | PUSH_ENV, PUSH_CHANNEL_ALIAS, PUSH_CHANNEL_SIGNER_KMS
Account Abstraction     | NEXT_PUBLIC_PIMLICO_API_KEY, SESSION_*
Bridges                 | NEXT_PUBLIC_BRIDGE_PROVIDER, BRIDGE_ALLOWED_TOKENS
On-Ramp                 | NEXT_PUBLIC_TRANSAK_API_KEY, MOONPAY_API_KEY, COINBASE_PAY_APP_ID
Security                | ADMIN_API_TOKEN, JWT_SECRET, CRON_SECRET, EMERGENCY_ADMIN_KEY
```

### Variables Compartidas (SOLO ESTAS ~6)
```
VARIABLE                        | DAO | WALLETS | VALOR
--------------------------------|-----|---------|---------------------------
NEXT_PUBLIC_DAO_API_URL         | ✅  | ✅      | https://mbxarts.com
NEXT_PUBLIC_WALLETS_API_URL     | ✅  | ✅      | https://gifts.mbxarts.com
NEXT_PUBLIC_SUPABASE_URL        | ✅  | ✅      | (pueden ser diferentes DBs)
NEXT_PUBLIC_SUPABASE_ANON_KEY   | ✅  | ✅      | (pueden ser diferentes keys)
INTERNAL_API_KEY                | ✅  | ✅      | (debe ser el mismo para auth)
NODE_ENV                        | ✅  | ✅      | production/development
```

---

## Phase 6: Verification Checkpoints

### Checkpoint 1: Structure Verification
- [ ] All 385+ DAO TypeScript files present in apps/dao
- [ ] All 593 Wallets TypeScript files present in apps/wallets
- [ ] All 89 DAO API endpoints accessible
- [ ] All 170+ Wallets API endpoints accessible

### Checkpoint 2: Build Verification
- [ ] `turbo run build` completes without errors
- [ ] DAO app builds successfully
- [ ] Wallets app builds successfully
- [ ] All shared packages build

### Checkpoint 3: Runtime Verification
- [ ] DAO dev server starts (`turbo run dev --filter=@mbxarts/dao`)
- [ ] Wallets dev server starts (`turbo run dev --filter=@mbxarts/wallets`)
- [ ] Both apps can run simultaneously
- [ ] Hot reload works in both apps

### Checkpoint 4: Feature Verification
- [ ] DAO: User can connect wallet and see profile
- [ ] DAO: Task system works
- [ ] DAO: Referral system works
- [ ] DAO: Governance features work
- [ ] Wallets: User can connect wallet
- [ ] Wallets: NFT creation works
- [ ] Wallets: TBA deployment works
- [ ] Wallets: Wallet switching works

### Checkpoint 5: Integration Verification
- [ ] Cross-platform profile fetch works
- [ ] Shared hooks work in both apps
- [ ] Shared UI components render correctly
- [ ] API client works from both platforms

---

## Phase 7: Rollback Procedures

### If Migration Fails at Any Point:

```bash
# 1. Both original repositories remain untouched
# They were COPIED, not moved

# 2. If monorepo has issues, simply continue using original repos

# 3. Git history preserved in original repos
cd /path/to/cryptogift-wallets-DAO
git status  # Original intact

cd /path/to/cryptogift-wallets
git status  # Original intact
```

### Rollback Strategy:
1. **No destructive operations** - Original repos are copied, not moved
2. **Incremental commits** - Each step has its own commit
3. **Branch-based development** - Work on feature branches
4. **Deployment separation** - Keep original Vercel projects until verified

---

## Environment Variables: NO Consolidation (Separación Total)

### ⚠️ IMPORTANTE: NO SE CONSOLIDAN LAS VARIABLES

A diferencia de otros monorepos donde se unifican las env vars, en este caso:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     STACKS COMPLETAMENTE DIFERENTES                      │
│                                                                          │
│  DAO:                           │  WALLETS:                              │
│  ├── Aragon SDK                 │  ├── ThirdWeb v5                       │
│  ├── EAS (Attestations)         │  ├── Biconomy (Account Abstraction)    │
│  ├── Discord Bot                │  ├── ERC-6551 Token Bound Accounts     │
│  ├── Quest Platforms            │  ├── Push Protocol                     │
│  ├── Superfluid Streams         │  ├── Bridge Aggregation                │
│  └── SMTP Email                 │  └── On-Ramp (Transak/MoonPay)         │
│                                 │                                        │
│  → 150+ variables únicas        │  → 400+ variables únicas               │
└──────────────────────────────────────────────────────────────────────────┘
```

### Estructura de .env Files Post-Migración

```
mbxarts-platform/
├── .gitignore                          # Contiene **/.env*.local
├── apps/
│   ├── dao/
│   │   ├── .env.local                  # COPIADO íntegro del proyecto original
│   │   ├── .env.example                # COPIADO íntegro del proyecto original
│   │   ├── .env.dao                    # COPIADO íntegro del proyecto original
│   │   ├── .env.deployment             # COPIADO íntegro del proyecto original
│   │   └── .env.production             # COPIADO íntegro del proyecto original
│   └── wallets/
│       └── frontend/
│           ├── .env.local              # COPIADO íntegro del proyecto original
│           ├── .env.example            # COPIADO íntegro del proyecto original
│           ├── .env.production         # COPIADO íntegro del proyecto original
│           └── .env.production.local   # COPIADO íntegro del proyecto original
└── packages/
    └── (NO tienen .env - usan variables de las apps)
```

### Vercel: Dos Projects = Dos Sets de Variables

```
VERCEL PROJECT: mbxarts-dao
├── Environment Variables (Settings > Environment Variables)
│   ├── DAO_ADDRESS=0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
│   ├── CGC_TOKEN_ADDRESS=0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
│   ├── DISCORD_BOT_TOKEN=****
│   ├── ARAGON_IPFS_GATEWAY=https://ipfs.aragon.network/ipfs/
│   └── ... (~150 variables más)
│
└── Domains
    └── mbxarts.com

VERCEL PROJECT: cryptogift-wallets
├── Environment Variables (Settings > Environment Variables)
│   ├── NEXT_PUBLIC_TW_CLIENT_ID=****
│   ├── BICONOMY_PAYMASTER_API_KEY=****
│   ├── NFT_STORAGE_API_KEY=****
│   ├── PHOTOROOM_API_KEY=****
│   └── ... (~400 variables más)
│
└── Domains
    └── gifts.mbxarts.com
```

### Proceso de Migración de Variables (CERO CAMBIOS)

```bash
# PASO 1: NO TOCAR las variables en Vercel
# Las variables YA ESTÁN en cada Vercel Project
# Al cambiar el repo conectado, las variables SE MANTIENEN

# PASO 2: Verificar que las variables siguen funcionando
# Después de conectar el monorepo, hacer un deploy de prueba
# Si el deploy funciona, las variables están correctas

# PASO 3: NO crear archivos .env compartidos
# Cada app tiene sus propios archivos .env
# Los packages NO necesitan variables propias
```

---

## Optimization: NFT Wallets Query

As part of this migration, we'll optimize the slow endpoint:

**Current** (`/api/user/nft-wallets`): Iterates ALL NFTs (O(n))

**Optimized** (add `/api/user/active-wallet`): Direct query for active wallet (O(1))

```typescript
// apps/wallets/src/pages/api/user/active-wallet.ts
export default async function handler(req, res) {
  const { owner, tbaAddress } = req.query;

  if (tbaAddress) {
    // Direct lookup by TBA address
    const wallet = await getWalletByTBA(tbaAddress);
    return res.json({ wallet });
  }

  if (owner) {
    // Get user's preferred/active wallet from session/storage
    const activeTokenId = await getActiveWalletForUser(owner);
    if (activeTokenId) {
      const wallet = await getWalletByTokenId(activeTokenId);
      return res.json({ wallet });
    }
  }

  return res.json({ wallet: null });
}
```

---

## Timeline Summary

| Day | Phase | Tasks |
|-----|-------|-------|
| 1 | Setup | Create monorepo, Turborepo config |
| 1-2 | Migrate | Copy DAO app, verify build |
| 2-3 | Migrate | Copy Wallets app, verify build |
| 3-4 | Packages | Create shared packages |
| 4-5 | Integrate | Update apps to use shared code |
| 5-6 | Deploy | Configure CI/CD, Vercel |
| 6+ | Iterate | Add more shared components |

---

## Guarantees

### ZERO Data Loss Guarantee
1. Original repositories are **COPIED**, never deleted
2. Every file is preserved in the monorepo
3. Git history can be imported if needed
4. All environment configurations documented

### Immediate Functionality Guarantee
1. Both apps work independently after migration
2. Existing deployments continue working
3. No breaking changes to public APIs
4. Gradual integration, not big-bang migration

### Rollback Guarantee
1. Original repos remain functional
2. Each migration step is reversible
3. Feature flags for new integrations
4. Separate deployment projects initially

---

## Approval Required

### Resumen de Garantías del Plan

| Garantía | Cómo se Cumple |
|----------|----------------|
| **CERO pérdida de datos** | Repos originales se COPIAN, nunca se eliminan |
| **CERO cambio en env vars** | Cada Vercel Project mantiene SUS variables |
| **CERO downtime** | Deployments originales funcionan hasta verificar monorepo |
| **Rollback inmediato** | Repos originales intactos, solo reconectar en Vercel |
| **Apps independientes** | Cada app tiene su package.json, Next.js version, y .env.local |

### Checklist de Aprobación

Antes de proceder, confirma:

#### Entendimiento del Plan
- [ ] He leído las secciones A, B, C sobre Environment Variables
- [ ] Entiendo que habrá DOS Vercel Projects apuntando al MISMO repo
- [ ] Entiendo que las env vars NO se tocan ni consolidan
- [ ] Entiendo el build command: `cd ../.. && turbo run build --filter=...`

#### Acceso y Permisos
- [ ] Tengo acceso de escritura a ambos repos originales
- [ ] Tengo acceso admin a ambos Vercel Projects
- [ ] Tengo acceso a crear nuevo repo (para el monorepo)
- [ ] Tengo copias de los .env.local de ambos proyectos

#### Disponibilidad
- [ ] Puedo dedicar tiempo a la migración (5-6 días estimados)
- [ ] Tengo forma de comunicarme si algo sale mal
- [ ] Acepto que haremos backups antes de cualquier cambio

### Próximo Paso Después de Aprobación

```
1. APROBACIÓN → Usuario confirma checklist ✓

2. PHASE 0 → Verificación Pre-Migración
   - Crear backups de ambos repos
   - Documentar configuración actual de Vercel
   - Verificar que ambos proyectos buildan y funcionan
   - Tomar screenshots de env vars en Vercel

3. PHASE 1 → Crear Monorepo (solo después de Phase 0 completo)
   - Crear nuevo repo mbxarts-platform
   - Configurar Turborepo
   - NO tocar los proyectos originales todavía

4. CONTINUAR → Una fase a la vez, con verificación entre cada una
```

### Declaración Final

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   Este plan ha sido diseñado siguiendo el protocolo PERFECTO Y ROBUSTO:  │
│                                                                          │
│   ✅ Define "DONE" para cada fase                                        │
│   ✅ Identifica riesgos y mitigaciones (tabla en 0.3)                    │
│   ✅ Implementación completa (no parches parciales)                      │
│   ✅ Verificación con evidencia (checkpoints en Phase 6)                 │
│   ✅ No ignora deuda técnica (rollback documentado)                      │
│   ✅ Guardia anti-duplicación (usa código existente)                     │
│   ✅ Seguridad inviolable (env vars separadas, sin secretos en código)   │
│                                                                          │
│   Los archivos .env.local de ambos proyectos NO SE TOCARÁN.              │
│   Las variables de entorno en Vercel NO SE MODIFICARÁN.                  │
│   Los proyectos originales NO SE ELIMINARÁN hasta verificar el monorepo. │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Cuando estés listo para proceder, responde: "APROBADO - Comenzar Phase 0"**

---

*Made by mbxarts.com - The Moon in a Box property*
*Co-Author: Godez22*

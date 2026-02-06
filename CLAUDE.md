# CLAUDE.md - MBXarts Platform (Monorepo Root)

## Project Overview

**MBXarts Platform** is a Turborepo monorepo hosting two complementary Web3 platforms on Base Mainnet (Chain ID: 8453).

| App | Domain | Path | Next.js | Description |
|-----|--------|------|---------|-------------|
| **DAO** | mbxarts.com | `apps/dao/` | 14.2.35 | Governance, tasks, referrals, token management |
| **Wallets** | gifts.mbxarts.com | `apps/wallets/` | 15.3.6 | NFT-Wallets (ERC-6551), education, gifting |

### Monorepo Structure
```
mbxarts-platform/
├── apps/
│   ├── dao/              # mbxarts.com - See apps/dao/CLAUDE.md for details
│   └── wallets/          # gifts.mbxarts.com - See apps/wallets/CLAUDE.md for details
├── packages/
│   ├── api-client/       # Cross-platform API client
│   ├── config/           # Shared config (chains, contracts, URLs)
│   ├── contracts/        # Shared smart contract ABIs
│   ├── hooks/            # Shared React hooks
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI components
├── tooling/              # Shared ESLint, Tailwind, TypeScript configs
├── turbo.json            # Turborepo pipeline config
├── pnpm-workspace.yaml   # Workspace definition
└── vercel.json           # Root Vercel config (turbo-ignore)
```

### App-Specific Documentation
**ALWAYS** read the app-specific CLAUDE.md when working on a particular app:
- **DAO details**: `apps/dao/CLAUDE.md` (893 lines - contracts, RBAC, tasks, referrals, i18n)
- **Wallets details**: `apps/wallets/CLAUDE.md` (818 lines - ERC-6551, education, mobile UX, glass UI)

---

## Critical Addresses (Base Mainnet - 8453)

### CGC Token & Governance
| Contract | Address |
|----------|---------|
| CGC Token (ERC20Votes) | `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175` |
| DAO Aragon | `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31` |
| MinterGateway v3.3 | `0xdd10540847a4495e21f01230a0d39C7c6785598F` |
| TimelockController | `0x9753d772C632e2d117b81d96939B878D74fB5166` |
| Safe Owner (3/5) | `0x11323672b5f9bB899Fa332D5d464CC4e66637b42` |
| Safe Guardian (2/3) | `0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc` |
| Deployer | `0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6` |

### Wallets Contracts (Base Sepolia - 84532)
| Contract | Address |
|----------|---------|
| NFT Contract | `0xeFCba1D72B8f053d93BA44b7b15a1BeED515C89b` |
| Escrow | `0x46175CfC233500DA803841DEef7f2816e7A129E0` |
| SimpleApprovalGate (EIP-712) | `0x99cCBE808cf4c01382779755DEf1562905ceb0d2` |
| ERC6551 Registry | `0x000000006551c19487814612e58FE06813775758` |

### Token Supply Model
- Initial: 2,000,000 CGC (circulating)
- Max via Gateway: 20,000,000 CGC
- Total Max: 22,000,000 CGC
- Governance: Aragon DAO → TimelockController (7-day delay) → CGC Token

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run both apps simultaneously
pnpm dev

# Run specific app
pnpm dev:dao      # DAO at localhost:3000
pnpm dev:wallets  # Wallets at localhost:3001

# Build all
pnpm build

# Build specific app
turbo run build --filter=@mbxarts/dao
turbo run build --filter=@mbxarts/wallets

# Lint & Type check
pnpm lint
pnpm type-check
```

### Package Manager Rules
- **pnpm** for EVERYTHING in the project
- **npm** ONLY for Claude CLI installation (`npm install -g @anthropic-ai/claude-code`)
- **NEVER** mix package managers

---

## Deployment (Vercel)

Two separate Vercel Projects pointing to this single GitHub repo:

| Vercel Project | Root Directory | Domain | Build Command |
|----------------|---------------|--------|---------------|
| mbxarts-dao | `apps/dao` | mbxarts.com | `cd ../.. && turbo run build --filter=@mbxarts/dao` |
| cryptogift-wallets | `apps/wallets/frontend` | gifts.mbxarts.com | `cd ../../.. && turbo run build --filter=@mbxarts/wallets` |

**Environment Variables**: Each Vercel Project maintains its own env vars. NEVER consolidate.

---

## Communication & Attribution Rules

### Language
- **ALWAYS respond in Spanish** to the user
- Code, commits, documentation: in English
- Code comments: English

### Commit Attribution (MANDATORY)
```
<type>: <description>

<detailed changes>

Made by mbxarts.com The Moon in a Box property

Co-Author: Godez22
```

### PROHIBITED in commits and code:
- Any reference to AI tools (Claude, GPT, Copilot, etc.)
- `Co-Authored-By: Claude` or similar
- Comments mentioning AI assistance

### Commit workflow
- Claude ALWAYS creates the commit
- User ALWAYS pushes to remote
- Follow conventional commits: feat, fix, docs, refactor, chore, etc.

---

## Absolute Rules

### NEVER:
1. Write to `.env.local` files - READ ONLY (both apps have 150-400+ critical variables)
2. Write without reading the complete file first
3. Create files without verifying they don't already exist
4. Reference AI tools in code or commits
5. Mix package managers (pnpm ↔ npm)

### Behavior Protocol
1. **MINIMAL SCOPE**: One problem = one surgical fix
2. **CONSULT FIRST**: If change affects >5 lines or changes tools → ASK
3. **VERIFY EACH STEP**: Test each change before the next
4. **PRESERVE FUNCTIONALITY**: Never break working features for optimization

### Red Flags - STOP and CONSULT:
- Changes across multiple tools (npm ↔ pnpm)
- Cascade solutions (fixing 3+ things together)
- Timeouts / network errors (wait for stable connection)
- Reverting and retrying >2 times
- Any "temporary" or "workaround" solution

### Verification - NEVER mark as complete without:
- Reproducible test (automated or manual)
- Screenshot/log/hash proving correct result
- Original functionality preserved

### Change Classification
| Type | Scope | Action |
|------|-------|--------|
| **A - Surgical** | ≤3 lines, 1 file | Proceed |
| **B - Intermediate** | ≤3 files, no refactoring | Proceed with caution |
| **C - Complex** | >3 files or refactoring | **MANDATORY consultation** |

---

## Key Technology Stack

| Layer | DAO | Wallets |
|-------|-----|---------|
| Framework | Next.js 14 (App Router) | Next.js 15 (App + Pages Router) |
| React | 18.x | 19.x |
| Web3 SDK | ThirdWeb v5 | ThirdWeb v5 + Wagmi v2 |
| Account Abstraction | - | Biconomy v4.5.7 |
| DAO | Aragon OSx v1.4.0 | - |
| Token Standard | ERC20Votes (CGC) | ERC-6551 (TBA) |
| Multisig | Gnosis Safe | Safe Protocol v4.1.1 |
| Auth | SIWE + Iron Session | SIWE + JWT + OTP |
| Database | Supabase | Supabase + Upstash KV |
| i18n | next-intl (EN/ES) | Component duplication (EN/ES) |
| Styling | Tailwind CSS | Tailwind + Framer Motion |
| Monitoring | Sentry | Sentry |
| Storage | - | IPFS (Pinata + fallbacks) |

---

## Session Startup Checklist

When starting a new session:
1. Read this file (root CLAUDE.md) for monorepo context
2. Read the app-specific CLAUDE.md for the area you'll work on
3. Check `git log --oneline -5` for recent changes
4. Verify working directory and git status

---

*Made by mbxarts.com The Moon in a Box property*
*Co-Author: Godez22*

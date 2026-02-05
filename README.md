# MBXarts Platform

Monorepo for CryptoGift DAO and CryptoGift Wallets platforms.

## Structure

```
mbxarts-platform/
├── apps/
│   ├── dao/          # mbxarts.com - DAO Platform (Next.js 14)
│   └── wallets/      # gifts.mbxarts.com - NFT Wallets (Next.js 15)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── hooks/        # Shared React hooks
│   ├── api-client/   # Cross-platform API client
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configuration
│   └── contracts/    # Smart contract ABIs
└── tooling/          # Shared dev configs
```

## Development

```bash
# Install dependencies
pnpm install

# Run both apps
pnpm dev

# Run specific app
pnpm dev:dao      # DAO at localhost:3000
pnpm dev:wallets  # Wallets at localhost:3001

# Build all
pnpm build

# Lint
pnpm lint
```

## Deployment

Each app deploys independently via Vercel:
- **DAO**: Connected to `apps/dao` with its own env vars
- **Wallets**: Connected to `apps/wallets` with its own env vars

---

Made by mbxarts.com - The Moon in a Box property

Co-Author: Godez22

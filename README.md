# MBXarts Platform

> **Source-Available | Noncommercial Use Only**
> This software is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).
> Commercial use requires a separate license. See [COMMERCIAL.md](COMMERCIAL.md) for details.

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

## License

This project is **source-available** under the [PolyForm Noncommercial License 1.0.0](LICENSE).

- **Permitted**: Personal use, research, evaluation, educational use, nonprofit use
- **Requires commercial license**: Production deployment, SaaS offering, revenue generation, resale
- **Contact**: [contact@mbxarts.com](mailto:contact@mbxarts.com) for commercial licensing

See [COMMERCIAL.md](COMMERCIAL.md) for full commercial terms and [NOTICE](NOTICE) for third-party attributions.

---

Copyright (c) 2024-2026 MBXarts - The Moon in a Box. All rights reserved.

Co-Author: Godez22

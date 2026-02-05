# 🔍 AUDITORÍA COMPLETA DEL SISTEMA CRYPTOGIFT WALLETS - PARTE 2

**Continuación de AUDITORIA_COMPLETA_SISTEMA.md**

---

## 8️⃣ INTEGRACIONES EXTERNAS

### 🌐 IPFS & Storage Solutions

#### **NFT.Storage** (Primary)
- **Provider**: Protocol Labs
- **URL**: https://nft.storage
- **API Key**: NFT_STORAGE_API_KEY
- **Features**:
  - Free, permanent storage
  - IPFS + Filecoin backup
  - Metadata standards compliant
  - Public gateway: nftstorage.link
- **Usage**:
  ```typescript
  // /lib/ipfs.ts
  import { NFTStorage, File } from 'nft.storage';

  const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

  const metadata = await client.store({
    name: 'CryptoGift #123',
    description: userMessage,
    image: new File([imageBlob], 'image.png', { type: 'image/png' }),
    attributes: [...]
  });

  // Returns: ipfs://QmXXX/metadata.json
  ```
- **Rate Limits**: Generous (no strict limits)
- **Status**: ✅ Primary upload method

#### **Pinata** (Fallback)
- **Provider**: Pinata Cloud
- **URL**: https://pinata.cloud
- **API Key**: PINATA_API_KEY + PINATA_SECRET_API_KEY
- **Features**:
  - Professional CDN
  - Analytics dashboard
  - Dedicated gateways
  - Public gateway: gateway.pinata.cloud
- **Usage**:
  ```typescript
  // Fallback when NFT.Storage fails
  const pinataSDK = new pinataSDK(PINATA_API_KEY, PINATA_SECRET);

  const result = await pinataSDK.pinFileToIPFS(imageBuffer, {
    pinataMetadata: {
      name: 'CryptoGift #123',
    }
  });

  // Returns: { IpfsHash: 'QmXXX', ... }
  ```
- **Rate Limits**: 100 pins/month (free tier)
- **Status**: ✅ Fallback upload method

#### **ThirdWeb Storage** (Tertiary Fallback)
- **Provider**: ThirdWeb
- **Integration**: Built-in SDK
- **Features**:
  - Integrated with ThirdWeb SDK
  - Optimized for NFT metadata
  - Gateway: gateway.thirdweb.com
- **Usage**:
  ```typescript
  import { ThirdwebStorage } from '@thirdweb-dev/storage';

  const storage = new ThirdwebStorage({ clientId: THIRDWEB_CLIENT_ID });
  const uri = await storage.upload(metadata);
  ```
- **Status**: ✅ Tertiary fallback

#### **IPFS Gateway Strategy**

**Multi-Gateway Fallback System**:
```typescript
// /lib/ipfs.ts

const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',        // Primary
  'https://gateway.pinata.cloud/ipfs/',   // Secondary
  'https://cloudflare-ipfs.com/ipfs/',    // Tertiary
  'https://ipfs.io/ipfs/',                 // Fallback
  'https://gateway.thirdweb.com/ipfs/'    // Emergency
];

async function fetchFromIPFS(cid: string): Promise<Response> {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json, image/*' }
      });

      if (response.ok) return response;
    } catch (error) {
      console.warn(`Gateway ${gateway} failed, trying next...`);
      continue;
    }
  }

  throw new Error('All IPFS gateways failed');
}
```

**Gateway Selection Logic**:
1. **Primary**: nftstorage.link (fastest, most reliable)
2. **Secondary**: Pinata (professional, CDN)
3. **Tertiary**: Cloudflare (global CDN)
4. **Fallback**: ipfs.io (public, slower)
5. **Emergency**: ThirdWeb (last resort)

**R6 Optimization** (Mobile UX):
- Exponential backoff: 5s → 7s → 9s timeouts
- HEAD requests for availability check
- Telemetry: `gtag('event', 'ipfs_retry', { gateway, attempt })`

---

### 📧 Email Services

#### **Resend** (Email Verification)
- **Provider**: Resend (https://resend.com)
- **API Key**: RESEND_API_KEY
- **Features**:
  - Modern API design
  - React Email templates
  - Delivery tracking
  - Free tier: 100 emails/day
- **Usage**:
  ```typescript
  // /api/email/send-code.ts
  import { Resend } from 'resend';

  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: 'CryptoGift <noreply@cryptogift-wallets.vercel.app>',
    to: userEmail,
    subject: 'Tu código de verificación CryptoGift',
    html: `
      <h1>Código de Verificación</h1>
      <p>Tu código es: <strong>${otpCode}</strong></p>
      <p>Válido por 10 minutos.</p>
    `
  });
  ```
- **Rate Limits**: 100/day (free), 1000/day (paid)
- **Deliverability**: ~99% inbox rate
- **Status**: ✅ Production active

---

### 📅 Calendar Integration

#### **Calendly** (Appointment Booking)
- **Provider**: Calendly
- **URL**: Configured via NEXT_PUBLIC_CALENDLY_URL
- **Integration**: @calendly/calendly-widget (React component)
- **Features**:
  - Embedded inline widget
  - PostMessage API for events
  - Customizable styling
  - Free tier available
- **Usage**:
  ```typescript
  // /components/calendar/CalendlyEmbed.tsx
  import { InlineWidget } from '@calendly/calendly-widget';

  <InlineWidget
    url={NEXT_PUBLIC_CALENDLY_URL}
    styles={{ height: '700px' }}
    pageSettings={{
      backgroundColor: 'ffffff',
      primaryColor: '00a2ff',
      textColor: '4d5055'
    }}
  />

  // Event handling
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://calendly.com') return;

      if (e.data.event === 'calendly.event_scheduled') {
        onAppointmentBooked?.(e.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  ```
- **Known Limitation**: PostMessage payload does NOT include event time
- **Workaround Required**: Calendly API integration for accurate scheduling
- **Status**: ✅ Active (with limitations)

---

### 🎨 AI Image Processing

#### **PhotoRoom API v2** (Image Filters)
- **Provider**: PhotoRoom (https://photoroom.com/api)
- **API Key**: PHOTOROOM_API_KEY
- **Features**:
  - Background removal
  - Style transfer (20+ filters)
  - AI enhancement
  - Format conversion
- **Available Filters** (from constants.ts):
  ```typescript
  PHOTO_FILTERS = [
    { id: 'cyberpunk', name: 'Cyberpunk', category: 'futuristic' },
    { id: 'sketch', name: 'Sketch', category: 'artistic' },
    { id: 'anime', name: 'Anime', category: 'animated' },
    { id: 'cartoon', name: 'Cartoon', category: 'animated' },
    { id: 'enhance', name: 'Enhance', category: 'enhancement' },
    { id: 'instagram', name: 'Instagram', category: 'social' },
    // ... 15+ more premium filters
  ];
  ```
- **Usage**:
  ```typescript
  // /api/upload.ts
  const formData = new FormData();
  formData.append('image_file', imageBlob);
  formData.append('bg.color', '#ffffff');
  formData.append('format', 'PNG');
  formData.append('filter', filterId);

  const response = await fetch('https://api.photoroom.com/v2/edit', {
    method: 'POST',
    headers: { 'X-Api-Key': PHOTOROOM_API_KEY },
    body: formData
  });

  const processedImage = await response.blob();
  ```
- **Rate Limits**: 50 requests/month (free tier)
- **Status**: ✅ Optional feature

---

### 💱 DEX Aggregation

#### **0x Protocol v2** (Token Swaps)
- **Provider**: 0x Labs
- **API**: https://base.api.0x.org/swap/v2
- **Endpoint**: ZEROX_ENDPOINT
- **Features**:
  - Multi-DEX aggregation
  - Best price routing
  - Gas optimization
  - MEV protection support
- **Usage**:
  ```typescript
  // /api/swap.ts
  const quoteUrl = new URL('/swap/v2/quote', ZEROX_ENDPOINT);
  quoteUrl.searchParams.set('sellToken', sellTokenAddress);
  quoteUrl.searchParams.set('buyToken', buyTokenAddress);
  quoteUrl.searchParams.set('sellAmount', amountInWei);
  quoteUrl.searchParams.set('taker', tbaAddress);
  quoteUrl.searchParams.set('slippagePercentage', '0.01');

  const quote = await fetch(quoteUrl).then(r => r.json());

  // Returns:
  {
    buyAmount: '1000000',     // Expected output
    estimatedGas: '150000',   // Gas estimate
    price: '1.0023',          // Exchange rate
    to: '0x...',              // 0x Exchange Proxy
    data: '0x...',            // Calldata
    value: '0'                // ETH to send
  }
  ```
- **Supported Chains**: Base, Base Sepolia
- **Rate Limits**: Generous (no strict public limits)
- **Status**: ✅ Production active

**Permit2 Integration**:
```typescript
// Allowance Holder for gasless approvals
PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

// User signs typed data instead of on-chain approval
// Saves gas and improves UX
```

---

### 💾 Database & Caching

#### **Upstash Redis** (Primary Database)
- **Provider**: Upstash (https://upstash.com)
- **Connection**: REST API (serverless-optimized)
- **Features**:
  - Serverless Redis
  - REST API (no connection pooling needed)
  - Global replication
  - Free tier: 10k commands/day
- **Configuration**:
  ```bash
  KV_REST_API_URL=https://exotic-alien-13383.upstash.io
  KV_REST_API_TOKEN=ATRHAAIncDE...
  REDIS_URL=rediss://default:token@...
  ```
- **Usage**:
  ```typescript
  // /lib/redisConfig.ts
  import { Redis } from '@upstash/redis';

  const redis = new Redis({
    url: KV_REST_API_URL,
    token: KV_REST_API_TOKEN
  });

  // Example operations
  await redis.set('key', 'value');
  await redis.get('key');
  await redis.expire('key', 3600);
  await redis.del('key');
  ```
- **Data Stored**:
  - Gift mappings (tokenId → giftId)
  - Gift analytics data
  - Email verification OTPs
  - Session tokens
  - Education progress
  - Rate limiting counters
  - Referral tracking
- **Status**: ✅ Production critical

**Key Patterns**:
```typescript
// Gift Mapping
gift:mapping:token:{tokenId} → giftId
TTL: 31536000 (1 year)

// Analytics
gift:analytics:{giftId}:email_plain → email
gift:analytics:{giftId}:email_encrypted → encrypted_email
gift:analytics:{giftId}:email_hmac → hmac_hash
gift:analytics:{giftId}:education_score → { correct, total }
gift:analytics:{giftId}:claimed_at → timestamp

// OTP
email:otp:{email} → { code, attempts, expiresAt }
TTL: 600 (10 minutes)

// Rate Limiting
rl:mint:{walletAddress} → count
TTL: 3600 (1 hour)
```

---

### 🔗 Blockchain Infrastructure

#### **ThirdWeb SDK v5**
- **Provider**: ThirdWeb (https://thirdweb.com)
- **Version**: 5.x
- **Client ID**: NEXT_PUBLIC_TW_CLIENT_ID
- **Secret Key**: TW_SECRET_KEY (server-only)
- **Features**:
  - Unified Web3 SDK
  - Account Abstraction support
  - Multi-chain compatibility
  - React hooks
  - Gasless transactions (Paymaster)
- **Core Usage**:
  ```typescript
  // Client initialization
  import { createThirdwebClient } from 'thirdweb';

  export const THIRDWEB_CLIENT = createThirdwebClient({
    clientId: NEXT_PUBLIC_TW_CLIENT_ID
  });

  // Contract interaction
  import { getContract } from 'thirdweb';

  const contract = getContract({
    client: THIRDWEB_CLIENT,
    address: NFT_CONTRACT_ADDRESS,
    chain: baseSepolia
  });

  // Read contract
  import { readContract } from 'thirdweb';
  const totalSupply = await readContract({
    contract,
    method: 'totalSupply',
    params: []
  });

  // Write contract
  import { prepareContractCall, sendTransaction } from 'thirdweb';
  const transaction = prepareContractCall({
    contract,
    method: 'mint',
    params: [to, tokenURI]
  });
  await sendTransaction({ transaction, account });
  ```
- **Status**: ✅ Core dependency

#### **Biconomy Account Abstraction v4.5.7**
- **Provider**: Biconomy
- **Version**: 4.5.7 (from package.json: "@biconomy/account": "^4.5.7")
- **Features**:
  - Gasless transactions via Paymaster
  - Bundler for UserOps
  - ERC-4337 compliant
- **Configuration**:
  ```bash
  BICONOMY_PAYMASTER_API_KEY=...
  BICONOMY_BUNDLER_URL=https://bundler.biconomy.io/api/v2/84532/...
  BICONOMY_PAYMASTER_URL=https://paymaster.biconomy.io/api/v1/84532/...
  ```
- **Fallback System** (NEW):
  ```typescript
  // /lib/gaslessValidation.ts
  function validateBiconomyConfig(): boolean {
    try {
      // Check if SDK installed
      require.resolve('@biconomy/account');

      // Check if configured
      if (!BICONOMY_PAYMASTER_API_KEY) return false;
      if (!BICONOMY_BUNDLER_URL) return false;

      return true;
    } catch {
      return false;
    }
  }

  // Dynamic disable
  const gaslessTemporarilyDisabled = !validateBiconomyConfig();

  // Fallback wrapper
  if (gaslessTemporarilyDisabled) {
    return mockSmartAccount(); // Returns gas-paid account
  }
  ```
- **Status**:
  - ✅ Gasless: Bonus feature (when configured)
  - ✅ Gas-Paid: Always available (100% fallback)

#### **Alchemy RPC** (Recommended)
- **Provider**: Alchemy
- **URL**: NEXT_PUBLIC_RPC_URL
- **Features**:
  - Enhanced APIs
  - Faster sync
  - Better reliability
  - Generous free tier
- **Configuration**:
  ```bash
  NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
  ```
- **Status**: ✅ Recommended (fallback to public RPC)

---

### 📊 Analytics & Monitoring

#### **Amplitude** (Product Analytics)
- **Package**: @amplitude/analytics-browser + @amplitude/plugin-session-replay-browser
- **Features**:
  - User behavior tracking
  - Session replay
  - Funnel analysis
  - Cohort tracking
- **Events Tracked**:
  - Gift creation
  - Gift claim
  - Education completion
  - Wallet connections
  - Transaction errors
  - IPFS retries
- **Usage**:
  ```typescript
  // /lib/analyticsIntegration.ts
  import * as amplitude from '@amplitude/analytics-browser';

  amplitude.init(AMPLITUDE_API_KEY);

  amplitude.track('gift_created', {
    giftId: '123',
    hasEducation: true,
    tokenType: 'ETH',
    amount: '0.1'
  });
  ```
- **Status**: ✅ Configured

#### **Sentry** (Error Tracking)
- **Package**: @sentry/nextjs
- **Features**:
  - Error monitoring
  - Performance tracking
  - Release tracking
  - Source maps
- **Configuration**:
  ```typescript
  // sentry.client.config.ts
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ]
  });
  ```
- **Status**: ✅ Configured

#### **PostHog** (Product Analytics Alternative)
- **Packages**: posthog-js + posthog-node
- **Features**:
  - Feature flags
  - A/B testing
  - Session recording
  - Heatmaps
- **Status**: ✅ Installed (package.json)

---

### 🌐 Web3 Infrastructure

#### **WalletConnect**
- **Version**: Integrated via ThirdWeb
- **Project ID**: NEXT_PUBLIC_WC_PROJECT_ID
- **Features**:
  - Mobile wallet connections
  - QR code scanning
  - Deep linking
- **Status**: ✅ Active

#### **SIWE** (Sign-In with Ethereum)
- **Implementation**: Custom (/lib/siweAuth.ts, /lib/siweClient.ts)
- **Features**:
  - Wallet-based authentication
  - Message signing
  - Session management
- **Flow**:
  ```typescript
  // 1. Request nonce
  const nonce = await fetch('/api/auth/nonce').then(r => r.json());

  // 2. Create SIWE message
  const message = createSiweMessage({
    domain: window.location.host,
    address: walletAddress,
    statement: 'Sign in to CryptoGift Wallets',
    uri: window.location.origin,
    version: '1',
    chainId: 84532,
    nonce: nonce
  });

  // 3. Sign message
  const signature = await wallet.signMessage(message);

  // 4. Verify signature
  const session = await fetch('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ message, signature })
  }).then(r => r.json());

  // 5. Receive JWT token
  // session.token → Store in localStorage/cookies
  ```
- **Status**: ✅ Implemented

---

## 9️⃣ SISTEMA UI/UX Y DESIGN

### 🎨 Design System Architecture

**Filosofía**: **Glass Morphism Premium Aesthetic**

**Características Clave**:
- Backdrop blur effects intensos
- Transparencias sofisticadas
- Colores tenues premium
- Shadow system con colores temáticos
- Border elegance con opacidad

#### **ThemeSystem.tsx** (Componente Core)
**Ubicación**: `frontend/src/components/ui/ThemeSystem.tsx` (11,380 bytes)

**Componentes Exportados**:
```typescript
export const CryptoGiftTheme = {
  // Core Components
  Card: ThemeCard,           // Content containers
  Section: ThemeSection,     // Page layout sections
  Button: ThemeButton,       // Consistent button styling
  Input: ThemeInput,         // Form inputs
  Layout: ThemeLayout,       // Page layouts

  // Advanced Panels
  Panel: AdaptivePanel,      // Base panel system
  GlassPanel,                // Glassmorphism variant
  LuxuryPanel                // Premium effects
};
```

**Variants System**:
```typescript
type ThemeVariant =
  | 'default'      // Standard styling
  | 'highlighted'  // Emphasized content
  | 'interactive'  // Hover/click states
  | 'warning'      // Alert states
  | 'success'      // Completion states
  | 'muted';       // De-emphasized content

// Example usage:
<ThemeCard variant="highlighted">
  Premium content here
</ThemeCard>
```

**Glass Morphism Classes**:
```css
/* Core glass effect */
.glass-panel {
  backdrop-filter: blur(20px) saturate(150%);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

/* Dark mode variant */
.dark .glass-panel {
  background: rgba(17, 25, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Premium luxury variant */
.luxury-panel {
  backdrop-filter: blur(30px) saturate(180%);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.5) 100%
  );
  box-shadow:
    0 10px 40px 0 rgba(31, 38, 135, 0.2),
    0 2px 16px 0 rgba(255, 255, 255, 0.4) inset;
}
```

---

### 🖼️ Component Library

#### **Glass Panel Header System**

**GlassPanelHeader.tsx** (10,147 bytes):
- Navigation headers
- Dashboard headers
- Modal headers
- Scroll detection
- Blur intensity adjustments

**Variants**:
```typescript
<GlassPanelHeader
  variant="navigation"    // Main navigation bar
  scrolled={isScrolled}   // Dynamic blur on scroll
  transparent={false}
/>

<GlassPanelHeader
  variant="dashboard"     // Dashboard page header
  title="Analytics"
  subtitle="Real-time metrics"
/>

<GlassPanelHeader
  variant="modal"         // Modal dialog header
  onClose={handleClose}
/>
```

**Features**:
- Auto blur intensity based on scroll
- Sticky positioning
- Mobile-responsive
- Dark mode support
- Animation transitions

---

#### **Notification System**

**NotificationSystem.tsx** (12,758 bytes):
- Toast notifications
- Transaction updates
- Wallet events
- Block explorer links
- Auto-dismiss timers

**Usage**:
```typescript
import { useNotifications } from '@/components/ui/NotificationSystem';

const { showNotification } = useNotifications();

showNotification({
  type: 'success',
  title: 'Transaction Confirmed',
  message: 'Your gift has been created!',
  duration: 5000,
  action: {
    label: 'View on Explorer',
    onClick: () => window.open(explorerUrl)
  }
});
```

**Types**:
- `success` - Green, checkmark icon
- `error` - Red, X icon
- `warning` - Yellow, alert icon
- `info` - Blue, info icon
- `transaction` - Special with block explorer link

---

#### **Chain Switching System**

**ChainSwitchingSystem.tsx** (12,775 bytes):
- Auto-detection of wrong chain
- One-click switching
- wallet_addEthereumChain support
- Context-aware prompts

**Features**:
```typescript
<QuickChainSwitch
  requiredChain={baseSepolia}
  onChainMatch={() => console.log('Ready!')}
  autoSwitch={true}
/>
```

**Contexts**:
- Wallet viewing (view-only mode)
- Claim interface (required for transactions)
- Mint interface (required for creation)
- Education (optional for progress tracking)

---

#### **Modal Components**

**NFTImageModal.tsx** (42,241 bytes):
- Full-screen NFT viewer
- Image zoom/pan
- Metadata display
- Share functionality
- Download option

**Features**:
- Touch gestures (pinch-to-zoom)
- Keyboard navigation (ESC to close, arrows)
- Click outside to close
- Framer Motion animations
- Mobile-optimized

---

### 🎭 Animation Standards

**Library**: Framer Motion (v12.23.6)

**Standard Spring Physics**:
```typescript
const standardSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 25
};

// Usage:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={standardSpring}
>
  Content
</motion.div>
```

**Variants**:
- **Fast**: stiffness 400, damping 30 (buttons, small elements)
- **Standard**: stiffness 300, damping 25 (most animations)
- **Smooth**: stiffness 200, damping 20 (modals, large panels)
- **Slow**: stiffness 150, damping 18 (page transitions)

**Accessibility**:
```typescript
// Respects prefers-reduced-motion
const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
  transition={shouldReduceMotion ? { duration: 0 } : standardSpring}
/>
```

---

### 🌈 Color System

**Tailwind Configuration** (globals.css + tailwind.config.js):

**Primary Colors**:
```css
--primary: 217 91% 60%;        /* Blue #3B82F6 */
--primary-foreground: 0 0% 100%;

--secondary: 142 76% 36%;      /* Green #059669 */
--secondary-foreground: 0 0% 100%;

--accent: 38 92% 50%;          /* Orange #F59E0B */
--accent-foreground: 0 0% 100%;
```

**Semantic Colors**:
```css
--success: 142 71% 45%;        /* Green */
--warning: 38 92% 50%;         /* Orange */
--error: 0 72% 51%;            /* Red */
--info: 199 89% 48%;           /* Cyan */
```

**Glass Morphism Palette**:
```css
--glass-bg-light: rgba(255, 255, 255, 0.6);
--glass-bg-dark: rgba(17, 25, 40, 0.6);
--glass-border-light: rgba(255, 255, 255, 0.3);
--glass-border-dark: rgba(255, 255, 255, 0.1);
--glass-shadow: rgba(31, 38, 135, 0.15);
```

---

### 📱 Responsive Design

**Breakpoints** (Tailwind default):
```typescript
const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
};
```

**Mobile-First Approach**:
```tsx
// Base styles are mobile
<div className="
  w-full          /* Mobile: full width */
  md:w-2/3        /* Tablet: 2/3 width */
  lg:w-1/2        /* Desktop: 1/2 width */
  p-4             /* Mobile: 1rem padding */
  md:p-6          /* Tablet: 1.5rem */
  lg:p-8          /* Desktop: 2rem */
">
```

**R5: Desktop Zoom Compensation**:
```css
/* Desktop only: Scale 1.12 to compensate global zoom 0.88 */
@media (min-width: 1024px) {
  .desktop-compensate {
    transform: scale(1.12);
  }
}
```

---

### 🎨 Icon System

**Current**: Lucide React (v0.525.0)
**Future**: Custom SVG icon system (roadmap)

**Usage**:
```tsx
import { Wallet, Send, ArrowRight, Check, X } from 'lucide-react';

<Wallet className="w-5 h-5" />
<Send className="w-4 h-4 text-blue-500" />
```

**Icon Categories**:
- Navigation: Menu, ChevronDown, ArrowLeft
- Actions: Send, Receive, Swap, Download
- Status: Check, X, AlertCircle, Info
- Web3: Wallet, Key, Shield, Lock
- Social: Share, Link, Mail, Calendar

**Dynamic Icons** (SmartIcon.tsx):
```tsx
import { SmartIcon } from '@/components/ui/SmartIcon';

<SmartIcon
  name="wallet"           // Lucide name
  size={20}
  color="currentColor"
  animate={true}          // Hover animation
  variant="outline"       // outline | filled | duotone
/>
```

---

### 🎯 UX Patterns

**Mandatory Patterns** (from UX_DESIGN_STANDARDS.md):

1. **Hover/Touch System**:
   - No ugly buttons
   - Natural premium interaction
   - Consistent across mobile/desktop
   - Touch events = Mouse events

2. **Click Outside to Close**:
   - All modals/dropdowns
   - No interruptions
   - Elegant dismissal

3. **Loading States**:
   - Skeleton screens
   - Shimmer effects
   - Progress indicators
   - Never blank screens

4. **Error Handling**:
   - User-friendly messages
   - Recovery options
   - Support links
   - No technical jargon

5. **Feedback**:
   - Immediate visual response
   - Success confirmations
   - Error notifications
   - Progress updates

**Reference Component**: `LearningPath.tsx` (Componente Patrón UX Maestro)

---

## 🔟 SISTEMA DE ANALYTICS Y MONITORING

### 📊 Analytics Architecture

#### **Data Storage**

**Redis Keys Structure**:
```
gift:analytics:{giftId}:created_at          → ISO timestamp
gift:analytics:{giftId}:claimed_at          → ISO timestamp
gift:analytics:{giftId}:creator             → Wallet address
gift:analytics:{giftId}:claimer             → Wallet address
gift:analytics:{giftId}:token_type          → ETH/USDC/etc
gift:analytics:{giftId}:token_amount        → Amount string
gift:analytics:{giftId}:education_required  → boolean
gift:analytics:{giftId}:education_completed → boolean
gift:analytics:{giftId}:education_score     → { correct, total }
gift:analytics:{giftId}:email_plain         → Decrypted email
gift:analytics:{giftId}:email_encrypted     → AES-256-GCM
gift:analytics:{giftId}:email_hmac          → HMAC-SHA256
gift:analytics:{giftId}:appointment_time    → ISO timestamp
gift:analytics:{giftId}:referral_code       → Referral code used
gift:analytics:{giftId}:claim_tx_hash       → Transaction hash
```

#### **Metrics Tracked**

**Platform Metrics**:
- Total gifts created
- Total gifts claimed
- Claim rate (%)
- Total value locked (TVL)
- Average gift value
- Most popular tokens
- Education completion rate
- Average education score
- Referral conversion rate

**User Metrics**:
- New vs returning creators
- Mobile vs desktop usage
- Geographic distribution
- Time to claim
- Bounce rate
- Session duration

**Technical Metrics**:
- IPFS upload success rate
- IPFS gateway performance
- Transaction success rate
- Gasless vs gas-paid ratio
- API response times
- Error rates by endpoint

---

### 📈 Analytics Endpoints

**`/api/analytics/stats.ts`**:
```typescript
{
  totalGifts: 450,
  totalClaimed: 320,
  claimRate: 71.1,
  totalValueUSD: 45000,
  averageValueUSD: 100,
  educationCompletionRate: 85.2,
  averageEducationScore: 82.5,
  topTokens: [
    { token: 'ETH', count: 200, percentage: 44.4 },
    { token: 'USDC', count: 150, percentage: 33.3 }
  ],
  recentActivity: [...]
}
```

**`/api/analytics/gift-profile/[giftId].ts`**:
```typescript
{
  giftId: "123",
  tokenId: "456",
  created: "2025-11-01T12:00:00Z",
  claimed: "2025-11-02T14:30:00Z",
  creator: "0xABC...",
  claimer: "0xDEF...",
  tokenType: "ETH",
  tokenAmount: "0.1",
  educationRequired: true,
  educationCompleted: true,
  educationScore: { correct: 8, total: 10 },
  email: "user@example.com",  // Decrypted server-side
  appointmentTime: "2025-11-05T10:00:00Z",
  referralCode: "REF123",
  claimTxHash: "0x123..."
}
```

**`/api/analytics/real-time-stats.ts`**:
- Server-Sent Events (SSE)
- Real-time updates
- Live gift creation/claiming
- Active users count

---

### 🔍 Debug & Monitoring Tools

**Debug Endpoints** (Require ADMIN_API_TOKEN):

**`/api/debug/gift-[giftId].ts`** (Multiple versions):
- Deep inspection of gift data
- Redis vs contract comparison
- Event history
- Metadata validation
- IPFS availability check

**`/api/analytics/deep-audit-exotic.ts`**:
- Cross-reference all data sources
- Detect inconsistencies
- Validate mappings
- Check metadata integrity

**`/api/admin/` Tools**:
- `cleanup-transactions.ts` - Remove stale data
- `clear-cache.ts` - Flush Redis caches
- `fix-metamask-nft-display.ts` - Metadata repair
- `migrate-metadata.ts` - Bulk updates
- `return-expired-gifts.ts` - Auto-return expired

---

### 🚨 Error Tracking

**Sentry Integration**:
```typescript
// Automatic error capture
Sentry.captureException(error, {
  tags: {
    component: 'ClaimInterface',
    giftId: giftId,
    tokenId: tokenId
  },
  extra: {
    claimerAddress: account?.address,
    educationRequired: gift.educationRequired
  }
});

// Custom breadcrumbs
Sentry.addBreadcrumb({
  category: 'gift',
  message: 'Starting claim process',
  level: 'info',
  data: { giftId, tokenId }
});
```

**Error Handler** (/lib/errorHandler.ts - 15,793 bytes):
- Centralized error processing
- User-friendly messages
- Automatic retries
- Fallback strategies
- Logging and reporting

---

### 📊 Monitoring Dashboard

**Location**: `/app/authenticated/page.tsx` (Dashboard)

**Widgets**:
1. **Live Stats**
   - Real-time gift creation
   - Real-time claims
   - Active users
   - TVL ticker

2. **Charts**
   - Gift creation over time
   - Claim rate trends
   - Token distribution pie chart
   - Education completion funnel

3. **Recent Activity**
   - Latest gifts created
   - Latest claims
   - Failed transactions
   - System alerts

4. **Performance Metrics**
   - API response times
   - IPFS upload latency
   - Transaction success rate
   - Gasless usage %

---

*Continúa en PARTE 3...*
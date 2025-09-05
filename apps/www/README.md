# Web Frontend - Challenge Platform

A modern Next.js application showcasing Coinbase Developer Platform (CDP) integration through a challenge-based escrow platform. This frontend demonstrates how to build Web3 applications with seamless user onboarding, powerful wallet functionality, and integrated fiat onramps for any type of creative or professional challenges.

## 🎯 CDP Integration Highlights

This application showcases key CDP capabilities:

- **🔐 Embedded Wallets**: Email/SMS authentication with automatic wallet creation
- **💳 Seamless Onboarding**: Zero-friction user experience with familiar authentication
- **💰 Fiat Onramps**: Direct fiat-to-crypto funding through trusted Coinbase infrastructure
- **⛽ Gas Sponsorship**: Sponsored transactions using Coinbase Smart Wallets
- **🔗 Smart Contract Integration**: Type-safe contract interactions with automatic gas management
- **📱 Mobile-First**: Responsive design optimized for all devices
- **⚡ Base Network**: Lightning-fast transactions on Base Sepolia testnet

## 🏗️ Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── [challenger]/       # Challenger-specific pages
│   │   └── challenges/     # Challenge management
│   ├── api/               # API routes (session tokens)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── account-manager.tsx # Wallet & account management
│   ├── challenge-card.tsx  # Challenge display
│   └── ...               # Feature-specific components
├── hooks/                # Custom React hooks
│   ├── challenges.tsx    # Challenge operations
│   ├── submissions.tsx   # Submission management
│   └── balance.tsx       # Token balance & transfers
├── lib/                  # Utilities
│   ├── cdp-session.ts    # CDP API authentication
│   ├── queries.ts        # Query key factory
│   └── utils.ts          # General utilities
├── providers/            # React context providers
│   ├── cdp.tsx          # CDP React provider setup
│   ├── query.tsx        # TanStack Query provider
│   └── index.tsx        # Combined providers
└── config.ts             # App configuration
```

## 🚀 Getting Started

### Prerequisites

1. **CDP Project Setup**:
   ```bash
   # Sign up at CDP Portal
   https://portal.cdp.coinbase.com
   
   # Create new project and copy Project ID
   # Configure CORS origins for your domain
   ```

2. **Environment Configuration**:
   ```bash
   # Create .env.local in the www directory
   cat > .env.local << EOF
   NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id
   CDP_API_KEY=your_api_key          # Optional, for advanced features
   CDP_API_SECRET=your_api_secret    # Optional, for advanced features
   EOF
   ```

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 💡 Core Features

### 🎨 Landing Page
- **Hero Section**: Dynamic typing animation showcasing platform versatility
- **Feature Highlights**: Visual representation of key capabilities
- **CDP Branding**: Clear attribution to Coinbase Developer Platform

### 👤 User Authentication & Profiles
```typescript
// CDP authentication configuration
const CDP_CONFIG: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
  createAccountOnLogin: "evm-smart", // Smart account creation
};

const APP_CONFIG: AppConfig = {
  name: "Challenge Platform",
  logoUrl: "/favicon.ico",
  authMethods: ["email", "sms"], // Multiple auth options
};
```

**Features**:
- One-click signup with email/phone
- Automatic wallet creation
- Profile management (name, description, website)
- Address sharing with QR codes

### 🏆 Challenge Management

**Browse Challenges**:
- Infinite scroll pagination
- Filter by challenger or view all
- Real-time status updates
- Responsive card layout for any challenge type (design, video, development, writing, etc.)

**Create Challenges**:
```typescript
// Challenge creation with form validation
const createChallenge = async (data: CreateChallengeFormData) => {
  const metadata = await uploadToIPFS(data);
  await escrowService.createChallenge({
    metadataURI: metadata.uri,
    poolSize: parseEther(data.poolSize),
    deadline: data.endDate.getTime(),
  });
};
```

**Challenge Details**:
- Markdown rendering for descriptions
- Submission timeline
- Real-time participant count
- Admin resolution interface

### 📋 Submission System

**Submit to Challenges**:
- Rich text editor with Markdown preview
- Contact information capture
- IPFS metadata storage
- Transaction confirmation

**Review Submissions**:
- Admin interface for challenge owners
- Mark submissions as awarded/accepted/ineligible
- Bulk selection for efficient processing
- Real-time updates

### 💰 Wallet & Token Management

The account manager provides comprehensive wallet functionality:

```typescript
// Balance tracking
const { data: balance } = useBalance();

// Token operations
const { mutateAsync: withdraw } = useWithdraw();
const { mutateAsync: deposit } = useDeposit();
```

**Features**:
- **Real-time Balance**: Automatic updates on transaction completion
- **Deposit/Withdraw**: Seamless token transfers
- **Trusted Onramps**: Fiat-to-crypto conversion via Coinbase's secure infrastructure
- **Gas Sponsorship**: Sponsored transactions for better user experience  
- **QR Code Sharing**: Easy address sharing
- **Transaction History**: Complete audit trail

## 🔧 CDP Integration Deep Dive

### Authentication Flow

```typescript
// 1. CDP Provider wraps the entire app
<CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={theme}>
  <App />
</CDPReactProvider>

// 2. Components use CDP hooks
const { evmAddress } = useEvmAddress();
const { currentUser } = useCurrentUser();
const { sendUserOperation } = useSendUserOperation();
```

### Smart Contract Interactions

```typescript
// Type-safe contract calls
const { mutateAsync: createChallenge } = useMutation({
  mutationFn: async (params: CreateChallengeParams) => {
    const smartAccount = currentUser?.evmSmartAccounts?.[0];
    const call = escrowService.buildCreateChallengeCall(params);
    
    return sendUserOperation({
      account: smartAccount,
      calls: [call],
    });
  },
});
```

### Session Token Generation

For advanced features requiring API access:

```typescript
// API route for CDP session tokens
export async function POST(request: NextRequest) {
  const jwtToken = await generateJWT(keyName, keySecret);
  
  const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ addresses, assets }),
  });
  
  return NextResponse.json(await response.json());
}
```

## 🎨 UI/UX Design

### Design System
- **Framework**: Tailwind CSS with custom theme
- **Components**: Radix UI primitives with custom styling
- **Typography**: Clean, modern font stack
- **Colors**: CDP-aligned color palette
- **Responsive**: Mobile-first design approach

### Key Components

```typescript
// Reusable UI components
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Feature-specific components
import { AccountManager } from "@/components/account-manager";
import { ChallengeCard } from "@/components/challenge-card";
import { SubmissionCard } from "@/components/submission-card";
```

### Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## 🔄 State Management

### TanStack Query Integration

```typescript
// Query key factory for consistent caching
export const QueryKeyFactory = {
  challenge: (id: number) => ["challenge", id] as const,
  challenges: (challenger?: Address) => ["challenges", challenger] as const,
  submissions: (challengeId: number) => ["submissions", challengeId] as const,
  balance: () => ["balance"] as const,
};

// Infinite queries for pagination
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: QueryKeyFactory.challenges(challenger),
  queryFn: ({ pageParam = 0 }) => 
    escrowService.getChallenges({ startIndex: pageParam, count: 10 }),
  getNextPageParam: (lastPage, pages) => 
    lastPage.challenges.length === 10 ? pages.length * 10 : undefined,
});
```

### Real-time Updates
- Automatic query invalidation on transactions
- Optimistic updates for better UX
- Background refetching for fresh data
- Error boundaries for resilient UI

## 📱 Mobile Experience

The application is optimized for mobile devices:

- **Responsive Design**: Adapts seamlessly to all screen sizes
- **Touch Interactions**: Optimized for touch interfaces
- **Performance**: Fast loading with code splitting
- **PWA Ready**: Service worker support for offline functionality

## 🧪 Development & Testing

### Development Tools
```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing (when tests are added)
pnpm test
```

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality gates

## 🚀 Deployment

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_CDP_PROJECT_ID
vercel env add CDP_API_KEY
vercel env add CDP_API_SECRET
```

### Environment Variables
```bash
# Required
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id

# Optional (for advanced features)
CDP_API_KEY=organizations/{org_id}/apiKeys/{key_id}
CDP_API_SECRET=your_private_key

# Optional (for IPFS uploads)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
```

## 🔒 Security Considerations

### Client-Side Security
- Environment variables properly scoped (NEXT_PUBLIC_ prefix)
- Secure handling of private keys (server-side only)
- Input validation and sanitization
- XSS protection through React's built-in safeguards

### CDP Security
- Project-specific API keys
- CORS origin restrictions
- Embedded wallet security model
- Transaction signing through secure enclaves

## 📊 Performance Optimization

### Core Web Vitals
- **Largest Contentful Paint**: Optimized with Next.js Image component
- **First Input Delay**: Minimized with code splitting
- **Cumulative Layout Shift**: Prevented with proper sizing

### Bundle Optimization
- Dynamic imports for large components
- Tree shaking for unused code
- Compressed assets and images
- CDN delivery through Vercel

## 🔗 API Integration

### IPFS Storage
```typescript
// Metadata storage for challenges and submissions
const uploadMetadata = async (data: ChallengeMetadata) => {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json(); // Returns IPFS hash
};
```

### Error Handling
- Graceful degradation for network failures
- User-friendly error messages
- Retry mechanisms for failed operations
- Fallback UI states

## 🔮 Future Enhancements

Potential areas for extension:

- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Filtering**: Search and filter capabilities
- **Social Features**: Comments, ratings, and reputation systems
- **Cross-chain Support**: Multi-network functionality
- **Advanced Analytics**: Dashboard for challenge performance
- **Mobile App**: React Native version using same CDP integration

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [CDP React Documentation](https://docs.cloud.coinbase.com/cdp/docs/react-components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com/docs)

## 🤝 Contributing

When extending this application:

1. Follow the established patterns for CDP integration
2. Maintain type safety throughout
3. Add proper error handling and loading states
4. Test responsive design on multiple devices
5. Consider accessibility in all new features
6. Update documentation for new capabilities

This frontend serves as a comprehensive example of building modern Web3 applications with CDP, demonstrating best practices for user experience, security, and performance.

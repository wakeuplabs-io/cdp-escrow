
# Coinbase CDP Challenge Escrow

A comprehensive example project showcasing Coinbase Developer Platform (CDP) capabilities through a challenge-based escrow system. This platform enables users to create any kind of challenges with reward pools, receive submissions, and distribute prizes in a decentralized manner.

## 🎯 What This Demonstrates

This project showcases key CDP features:

- **📧 Embedded Wallets**: Seamless wallet creation and recovery using email/SMS authentication
- **Gas sponsorship**: Sponsor gas for users with coinbase smart wallets.
- **Onramps**: Fund users wallets with usdc using the onramp feature.
- **🔗 Smart Contract Integration**: Deployed on Base Sepolia, interact using Coinbase wallets and it's user operations bundler.

## 🏗️ Architecture Overview

The project consists of three main components:

```
cdp-escrow/
├── apps/
│   ├── contracts/         # Smart contracts (Hardhat)
│   └── www/               # Next.js frontend with CDP integration
└── packages/
    └── common/            # Shared utilities and type definitions
```

## 🚀 Quick Start

### Prerequisites

1. **CDP Project Setup**:
   - Sign up at [CDP Portal](https://portal.cdp.coinbase.com)
   - Create a new project and copy your Project ID
   - Generate API credentials 
   - Configure CORS origins for your domain for embedded wallets
   - Adjust gas sponsorships limits as desired

2. **Environment Setup**:
   ```bash
   # Clone and install dependencies
   git clone https://github.com/wakeuplabs-io/cdp-escrow
   cd cdp-escrow
   pnpm install
   ```

3. **Configure Environment Variables**:
   - In both `apps/www` and `apps/contracts` copy `.env.example` to `.env` and configure with your values.

### Running the Application

```bash
# Start the web interface
cd apps/www
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to interact with the application.

## 💡 Core Features

### Challenge Management
- **Create Challenges**: Set up challenges with token reward pools
- **Browse Challenges**: Discover active challenges from the community
- **Submit Solutions**: Upload your work and compete for rewards
- **Resolve & Award**: Challenge creators can evaluate and distribute prizes, winners split 70% of the pool, the rest is for valid submissions.

### CDP Integration Highlights
- **Zero-Friction Onboarding**: Users sign up with just email/phone
- **Embedded Wallet**: CDP handles wallet creation and management
- **Trustful Onramp**: Provide your users with a onramp they can trust.


## 🔧 Smart Contract Usage

The project includes a comprehensive test suite and a CLI for interacting with deployed contracts:

### Deployment

```bash
cd apps/contracts

# Deploy mock ERC20 token
pnpm run deploy-erc20:base-sepolia

# Deploy escrow contract  
pnpm run deploy:base-sepolia
```

### Profile Management

```bash
# Set your challenger profile
tsx ./scripts/index.ts set-profile \
  --network base-sepolia \
  --name "Acme Corp" \
  --description "We build amazing software"

# View any user's profile
tsx ./scripts/index.ts find-profile \
  --network base-sepolia \
  --address 0x1234...
```

### Challenge Operations

```bash
# Create a new challenge
tsx ./scripts/index.ts create-challenge \
  --network base-sepolia \
  --title "Build a DeFi Protocol" \
  --description "Create an innovative lending protocol" \
  --pool-size 1000 \
  --end-date '2025-08-30T23:50:00.000Z'

# Browse active challenges
tsx ./scripts/index.ts find-challenges \
  --network base-sepolia \
  --start-index 0 \
  --count 10

# Resolve challenge and award prizes
tsx ./scripts/index.ts resolve-challenge \
  --network base-sepolia \
  --challenge-id 0 \
  --winners 0,1 \
  --invalid 2,3
```

### Submission Workflow

```bash
# Submit to a challenge
tsx ./scripts/index.ts create-submission \
  --network base-sepolia \
  --challenge-id 1 \
  --contact user@example.com \
  --body "Link to my solution..."

# View challenge submissions
tsx ./scripts/index.ts find-submissions \
  --network base-sepolia \
  --challenge-id 0 \
  --start-index 0 \
  --count 5

# Check your rewards
tsx ./scripts/index.ts get-claimable \
  --network base-sepolia \
  --challenge-id 0 \
  --address 0x1234...

# Claim your earnings
tsx ./scripts/index.ts claim \
  --network base-sepolia \
  --challenge-id 0
```

### Token Management

```bash
# Mint test tokens
tsx ./scripts/index.ts mint \
  --network base-sepolia \
  --to 0x634A6c396D72e03C5a919Df40d12158770f08e06 \
  --amount 1000
```

## 🌐 Deployed Contracts

**Base Sepolia Testnet**: 
- Escrow:`0x6bDCf4334AD44F2341A5cAd9a3169f4482f3bE73`
- Mock ERC20: `0xa44e1a19B9334d7FfF8AF0D0783041a83aEb5a49`


## 🔍 Technical Deep Dive

### Smart Contract Architecture

The escrow system consists of:

- **Escrow.sol**: Main contract managing challenges, submissions, and token distribution
- **Modular Interfaces**: Separated concerns with dedicated interfaces for events, errors, and structs
- **ERC-20 Integration**: Compatible with any ERC-20 token for rewards
- **Profile System**: On-chain challenger profiles with verification capabilities

### CDP Integration Points

1. **Authentication**: Email/SMS login creates embedded wallets automatically
2. **Transaction Management**: CDP handles gas estimation and transaction broadcasting
3. **Gas Sponsorship**: Sponsor transaction fees for users using Coinbase Smart Wallets
4. **Onramp Integration**: Enable users to fund wallets directly with fiat currency
5. **Network Abstraction**: Seamless Base network integration with low fees

### Reward Distribution Logic

- **Awarded Submissions**: Receive 70% of the total pool (split equally)
- **Accepted Submissions**: Share 30% of the pool (split equally)  
- **Ineligible Submissions**: Receive no rewards
- **No Submissions**: Pool returns to challenge creator

## 🛠️ Development & Extension

This project serves as a foundation for building CDP-powered applications. Key areas for extension:

- **Custom Token Standards**: Implement NFT rewards or custom token mechanics
- **Advanced Voting**: Add community voting for submission evaluation
- **Cross-Chain**: Extend to other CDP-supported networks
- **Enhanced Profiles**: Add reputation systems and achievement badges
- **Integration APIs**: Connect with GitHub, portfolio sites, or other developer tools

## 📚 Resources

- [CDP Documentation](https://docs.cdp.coinbase.com/)
- [Base Network](https://base.org/)
- [Hardhat Documentation](https://hardhat.org/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

This is an example project to demonstrate CDP capabilities. Feel free to fork, modify, and build upon it for your own use cases.

## 📄 License

This project is provided as-is for educational and demonstration purposes.

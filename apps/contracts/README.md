# Smart Contracts - Challenge Escrow System

This directory contains the Solidity smart contracts that power the challenge-based escrow platform, designed to showcase Coinbase Developer Platform (CDP) capabilities for any type of creative or professional challenges.

## 🏗️ Contract Architecture

The smart contract system is built with modularity and gas efficiency in mind:

```
contracts/
├── Escrow.sol              # Main escrow contract
├── interfaces/
│   ├── IEscrow.sol         # Main interface
│   ├── IEscrow.errors.sol  # Error definitions
│   ├── IEscrow.events.sol  # Event definitions
│   └── IEscrow.structs.sol # Data structures
└── mocks/
    └── MockERC20.sol       # Test token for development
```

## 📋 Core Contracts

### Escrow.sol

The main contract managing the entire challenge lifecycle:

**Key Features:**
- 🏆 **Challenge Management**: Create, manage, and resolve any type of challenges (design, video, development, writing, etc.)
- 💰 **Token Escrow**: Secure ERC-20 token deposits for reward pools  
- 📝 **Submission Tracking**: Record and manage challenge submissions
- 🎯 **Reward Distribution**: Automated prize distribution (80% to winners, 20% to accepted submissions)
- 👤 **Profile System**: On-chain challenger profiles with verification

**Core Functions:**

```solidity
// Challenge lifecycle
function createChallenge(string metadataURI, uint256 poolSize, uint256 deadline) external;
function createSubmission(uint256 challengeId, string contact, string submissionURI) external;
function resolveChallenge(uint256 challengeId, uint256[] awardedSubmissions, uint256[] ineligibleSubmissions) external;

// Profile management  
function setProfile(string name, string description, string website) external;
function getProfile(address user) external view returns (ChallengerProfile memory);

// Reward claims
function getClaimable(uint256 challengeId, address account) external view returns (uint256);
function claim(uint256 challengeId) external;
```

### Data Structures

#### Challenge
```solidity
struct Challenge {
    string metadataUri;      // IPFS link to challenge details
    address admin;           // Challenge creator
    uint256 poolSize;        // Total reward pool in tokens
    uint256 endsAt;         // Submission deadline (timestamp)
    uint256 createdAt;      // Creation timestamp
    ChallengeStatus status; // Active/PendingReview/Completed
}
```

#### Submission
```solidity
struct Submission {
    string metadataUri;        // IPFS link to submission content
    address creator;           // Submission author
    string creatorContact;     // Contact information
    SubmissionStatus status;   // Pending/Ineligible/Accepted/Awarded
    uint256 createdAt;        // Submission timestamp
}
```

#### ChallengerProfile
```solidity
struct ChallengerProfile {
    string name;        // Display name
    string description; // Profile description
    string website;     // Website URL
    bool verified;      // Verification status
}
```

## 💰 Reward Distribution Logic

The escrow system implements a fair reward distribution mechanism:

### Distribution Rules

1. **Awarded Submissions (70% of pool)**:
   - Submissions marked as "winning" by the challenge admin
   - Share 70% of the total reward pool equally
   - Status: `SubmissionStatus.Awarded`

2. **Accepted Submissions (30% of pool)**:
   - Valid submissions that didn't win but met requirements
   - Share 30% of the total reward pool equally  
   - Status: `SubmissionStatus.Accepted`

3. **Ineligible Submissions (0% of pool)**:
   - Submissions that didn't meet requirements
   - Receive no rewards
   - Status: `SubmissionStatus.Ineligible`

### Edge Cases

- **No Submissions**: Entire pool returns to challenge creator
- **All Awarded**: Pool distributed equally among all submissions
- **All Ineligible**: Entire pool returns to challenge creator

## 🚀 Deployment & Development

### Prerequisites

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
```

### Network Configuration

The contracts are configured for Base Sepolia testnet in `hardhat.config.ts`:

```javascript
networks: {
  "base-sepolia": {
    url: "https://sepolia.base.org",
    chainId: 84532,
    // Add your private key for deployment
  }
}
```

### Deployment Scripts

```bash
# Deploy mock ERC20 (for testing)
npm run deploy-erc20:base-sepolia

# Deploy main escrow contract
npm run deploy:base-sepolia

# Clean deployment (if needed)
npm run wipe:base-sepolia
```

### Contract Verification

Contracts are automatically verified on Basescan during deployment using Hardhat Ignition.

## 🛠️ CLI Usage

The project includes a comprehensive command-line interface for contract interaction:

### Token Operations
```bash
# Mint test tokens
tsx ./scripts/index.ts mint --network base-sepolia --to <address> --amount 1000
```

### Profile Management
```bash
# Set challenger profile
tsx ./scripts/index.ts set-profile \
  --network base-sepolia \
  --name "Your Name" \
  --description "Your description" \
  --website "https://yoursite.com"

# Get profile information
tsx ./scripts/index.ts find-profile --network base-sepolia --address <address>
```

### Challenge Lifecycle
```bash
# Create challenge
tsx ./scripts/index.ts create-challenge \
  --network base-sepolia \
  --title "Challenge Title" \
  --description "Challenge description" \
  --pool-size 100 \
  --end-date '2025-12-31T23:59:00.000Z'

# List challenges
tsx ./scripts/index.ts find-challenges \
  --network base-sepolia \
  --start-index 0 \
  --count 10

# Submit to challenge
tsx ./scripts/index.ts create-submission \
  --network base-sepolia \
  --challenge-id 0 \
  --contact "user@example.com" \
  --body "Link to solution"

# View submissions
tsx ./scripts/index.ts find-submissions \
  --network base-sepolia \
  --challenge-id 0 \
  --start-index 0 \
  --count 5

# Resolve challenge (admin only)
tsx ./scripts/index.ts resolve-challenge \
  --network base-sepolia \
  --challenge-id 0 \
  --winners 0,1 \
  --invalid 2

# Check claimable rewards
tsx ./scripts/index.ts get-claimable \
  --network base-sepolia \
  --challenge-id 0 \
  --address <address>

# Claim rewards
tsx ./scripts/index.ts claim --network base-sepolia --challenge-id 0
```

## 🧪 Testing

Comprehensive test suite covering all contract functionality:

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test
npx hardhat test test/Escrow.ts
```

### Test Coverage

- ✅ Challenge creation and management
- ✅ Submission workflow
- ✅ Reward distribution logic
- ✅ Profile management
- ✅ Access control and security
- ✅ Edge cases and error handling

## 🔒 Security Considerations

### Access Control
- **Challenge Admin**: Only challenge creators can resolve their challenges
- **Submission Limits**: One submission per user per challenge
- **Deadline Enforcement**: No submissions accepted after challenge deadline

### Token Safety
- **Approval Required**: Users must approve token transfers before creating challenges
- **Escrow Protection**: Tokens are securely held in contract until resolution
- **Claim Protection**: Users can only claim their earned rewards

### Input Validation
- **Metadata URIs**: Validated for proper format
- **Submission Counts**: Verified against actual submission count
- **Timestamp Checks**: Ensures challenges haven't expired

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:

- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Resolve multiple submissions in single transaction
- **Minimal External Calls**: Reduced gas costs
- **Storage Access Patterns**: Optimized for common operations

## 🔄 Integration with CDP

These contracts are designed to work seamlessly with CDP:

1. **Type Safety**: Full TypeScript types generated for frontend integration
2. **Base Network**: Deployed on Base Sepolia for low gas costs
3. **Event Indexing**: Rich event emissions for frontend state management
4. **Error Handling**: Descriptive custom errors for better UX

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Base Network Documentation](https://docs.base.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🤝 Contributing

When extending these contracts:

1. Follow the existing interface pattern
2. Add comprehensive tests for new functionality  
3. Update CLI scripts for new features
4. Document gas implications
5. Consider upgrade patterns for production use

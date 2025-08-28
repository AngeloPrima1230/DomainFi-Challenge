# Getting Started with Doma Protocol

Welcome to the Doma Protocol! This guide will help you get started with building applications on the most advanced domain tokenization platform.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Testnet ETH for gas fees

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd domainfi-auction-marketplace

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Start the development server
npm run dev
```

### 3. Environment Setup

Edit your `.env.local` file with the following configuration:

```env
# Doma Protocol Configuration
NEXT_PUBLIC_DOMA_SUBGRAPH_URL=https://api-testnet.doma.xyz/graphql
NEXT_PUBLIC_DOMA_API_URL=https://api-testnet.doma.xyz

# Supported Networks (Sepolia, Mumbai, Base Sepolia)
NEXT_PUBLIC_SUPPORTED_CHAINS=11155111,80001,84532
```

### 4. Connect Your Wallet

1. Open the application in your browser
2. Click "Connect Wallet" 
3. Switch to a supported testnet:
   - **Ethereum Sepolia** (Chain ID: 11155111)
   - **Polygon Mumbai** (Chain ID: 80001) 
   - **Base Sepolia** (Chain ID: 84532)

## 🏗️ Architecture Overview

### Core Components

1. **Doma Subgraph** - GraphQL API for querying tokenized domains
2. **Doma Marketplace** - REST API for trading domains
3. **Smart Contracts** - On-chain domain management
4. **Frontend** - Next.js application with RainbowKit

### Data Flow

```
User Action → Frontend → Doma API → Smart Contracts → Blockchain
     ↓
Doma Subgraph ← Blockchain Events ← Smart Contracts
     ↓
Frontend ← GraphQL Query ← Doma Subgraph
```

## 📚 Key Concepts

### Tokenized Domains

Domains on Doma Protocol are represented as NFTs with additional functionality:

- **Ownership Tokens** - ERC-721 NFTs representing domain ownership
- **Expiration Management** - Automatic expiry handling
- **Cross-chain Support** - Bridge domains between networks
- **ICANN Compliance** - Full regulatory compliance

### Marketplace Features

- **Instant Settlement** - No escrow needed
- **Multiple Currencies** - ETH, USDC, and more
- **Fee Transparency** - Clear fee structure
- **Cross-chain Trading** - Trade across networks

## 🔧 Development Guide

### Using the Doma Subgraph

```typescript
import { useDomaSubgraph } from './hooks/useDomaSubgraph';

function MyComponent() {
  const { names, listings, loading } = useDomaSubgraph();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {names.map(name => (
        <div key={name.name}>
          <h3>{name.name}</h3>
          <p>Registrar: {name.registrar.name}</p>
          <p>Expires: {new Date(name.expiresAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Using the Marketplace API

```typescript
import { useDomaMarketplace } from './hooks/useDomaMarketplace';

function MarketplaceComponent() {
  const { createListing, createOffer, loading } = useDomaMarketplace();
  
  const handleListDomain = async () => {
    try {
      const order = await createListing({
        tokenId: "123",
        price: "1000000000000000000", // 1 ETH in wei
        currency: "0x0000000000000000000000000000000000000000", // ETH
        orderbook: "DOMA",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      console.log('Listing created:', order);
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };
  
  return (
    <button onClick={handleListDomain} disabled={loading}>
      {loading ? 'Creating...' : 'List Domain'}
    </button>
  );
}
```

### Smart Contract Integration

```typescript
import { useContract, useProvider, useSigner } from 'wagmi';
import { DOMA_RECORD_ABI } from './abis/doma-record';

function ContractComponent() {
  const { data: signer } = useSigner();
  const provider = useProvider();
  
  const domaRecord = useContract({
    address: process.env.NEXT_PUBLIC_DOMA_RECORD_ADDRESS,
    abi: DOMA_RECORD_ABI,
    signerOrProvider: signer || provider,
  });
  
  const claimDomain = async (tokenId: string) => {
    if (!domaRecord || !signer) return;
    
    try {
      const tx = await domaRecord.claimOwnership(tokenId, false, proofVoucher, signature);
      await tx.wait();
      console.log('Domain claimed successfully!');
    } catch (error) {
      console.error('Failed to claim domain:', error);
    }
  };
  
  return (
    <button onClick={() => claimDomain("123")}>
      Claim Domain
    </button>
  );
}
```

## 🌐 Supported Networks

### Testnets

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Ethereum Sepolia | 11155111 | https://rpc.sepolia.org | https://sepolia.etherscan.io |
| Polygon Mumbai | 80001 | https://rpc-mumbai.maticvigil.com | https://mumbai.polygonscan.com |
| Base Sepolia | 84532 | https://sepolia.base.org | https://sepolia.basescan.org |

### Mainnets (Coming Soon)

- Ethereum Mainnet
- Polygon
- Base
- Arbitrum
- Optimism

## 💰 Fee Structure

### Doma Protocol Fees

- **Protocol Fee**: 0.5% of transaction value
- **Receiver**: `0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532`
- **Royalties**: ERC-2981 compliant domain royalties
- **Gas Fees**: Standard network gas fees

### Supported Currencies

#### Testnet Currencies

**Sepolia:**
- ETH (Native)
- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- WETH: `0x7b79995e5f793a07bc00c21412e50ecae098e7f9`

**Base Sepolia:**
- ETH (Native)
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- WETH: `0x4200000000000000000000000000000000000006`

## 🔍 API Reference

### GraphQL Queries

#### Get Tokenized Names

```graphql
query GetTokenizedNames($skip: Int = 0, $take: Int = 100) {
  names(skip: $skip, take: $take, sortOrder: DESC) {
    items {
      name
      expiresAt
      tokenizedAt
      registrar {
        name
        ianaId
      }
      tokens {
        tokenId
        networkId
        ownerAddress
        type
      }
    }
    totalCount
    hasNextPage
  }
}
```

#### Get Listings

```graphql
query GetListings($skip: Int = 0, $take: Int = 100) {
  listings(skip: $skip, take: $take) {
    items {
      id
      price
      currency
      expiresAt
      token {
        tokenId
        name
        ownerAddress
      }
    }
  }
}
```

### REST API Endpoints

#### Marketplace Operations

```bash
# Get supported currencies
GET /v1/orderbook/currencies/{chainId}/{contractAddress}/{orderbook}

# Get fee information
GET /v1/orderbook/fee/{orderbook}/{chainId}/{contractAddress}

# Create listing
POST /v1/orderbook/listings
{
  "tokenId": "123",
  "price": "1000000000000000000",
  "currency": "0x0000000000000000000000000000000000000000",
  "orderbook": "DOMA",
  "expiresAt": "2024-01-01T00:00:00Z"
}

# Create offer
POST /v1/orderbook/offers
{
  "tokenId": "123",
  "price": "900000000000000000",
  "currency": "0x0000000000000000000000000000000000000000",
  "orderbook": "DOMA",
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

## 🛠️ Development Tools

### SDK Integration

For easier integration, use the official Doma SDK:

```bash
npm install @doma-protocol/orderbook-sdk
```

```typescript
import { DomaOrderbookSDK } from '@doma-protocol/orderbook-sdk';

const sdk = new DomaOrderbookSDK({
  chainId: 11155111, // Sepolia
  rpcUrl: 'https://rpc.sepolia.org',
});

// Create listing with automatic fee calculation
const listing = await sdk.createListing({
  tokenId: "123",
  price: "1000000000000000000",
  currency: "ETH",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=marketplace.test.ts
```

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

### Smart Contract Deployment

```bash
# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```

## 📖 Examples

### Complete Marketplace Example

See the `examples/` directory for complete working examples:

- `examples/marketplace/` - Full marketplace implementation
- `examples/domain-manager/` - Domain management interface
- `examples/analytics/` - Trading analytics dashboard

### Integration Examples

- **React Hook**: `hooks/useDomaSubgraph.ts`
- **Marketplace Hook**: `hooks/useDomaMarketplace.ts`
- **Contract Integration**: `hooks/useDomaContracts.ts`

## 🆘 Support

### Documentation

- [Doma Protocol Documentation](./DOMA_DOCUMENTATION.md)
- [API Reference](https://docs.doma.xyz)
- [Smart Contract Docs](https://docs.doma.xyz/contracts)

### Community

- **Discord**: [Join our Discord](https://discord.gg/doma)
- **Twitter**: [@DomaProtocol](https://twitter.com/DomaProtocol)
- **GitHub**: [Doma Protocol](https://github.com/doma-protocol)

### Issues

- **Bug Reports**: [GitHub Issues](https://github.com/doma-protocol/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/doma-protocol/discussions)

## 🎯 Next Steps

1. **Explore the Codebase** - Familiarize yourself with the project structure
2. **Run the Application** - Start the development server and explore the UI
3. **Connect Your Wallet** - Test with a supported testnet
4. **Build Your First Feature** - Add new functionality to the marketplace
5. **Deploy Your Application** - Share your creation with the community

Happy building! 🚀

